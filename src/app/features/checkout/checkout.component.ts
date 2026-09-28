import { afterNextRender, Component, computed, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, of, switchMap, throwError } from 'rxjs';
import { CartService } from '../../core/services/cart/cart.service';
import { OrdersService } from '../../core/services/orders/orders.service';
import { ToastrService } from 'ngx-toastr';
import { ShippingAddress } from '../../core/models/order-data.interface';

type PaymentMethod = 'cash' | 'online';

@Component({
  imports: [RouterLink, CurrencyPipe, ReactiveFormsModule],
  selector: 'app-checkout',
  styleUrl: './checkout.component.css',
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  readonly cartService=inject(CartService);
  private readonly fb=inject(FormBuilder);
  private readonly destroyRef=inject(DestroyRef);
  private readonly ordersService=inject(OrdersService);
  private readonly toastrService=inject(ToastrService);
  private readonly platformId=inject(PLATFORM_ID);
  private readonly router=inject(Router);
  readonly cartDetailsData=this.cartService.cartDetailsData;
  isLoading=signal(true);
  errorMessage=signal('');
  submitted=signal(false);
  isSubmitting=signal(false);
  isRedirecting=signal(false);
  orderId=signal('');
  orderError=signal('');

  checkoutForm=this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/\S/)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    city: ['', [Validators.required, Validators.pattern(/\S/)]],
    details: ['', [Validators.required, Validators.minLength(10), Validators.pattern(/\S/)]],
    postalCode: [''],
    paymentMethod: this.fb.nonNullable.control<PaymentMethod>('cash', Validators.required)
  });

  subtotal=computed(() => this.cartDetailsData()?.products.reduce(
    (total, item) => total + item.price * item.count, 0
  ) ?? 0);
  total=computed(() => this.cartDetailsData()?.totalCartPrice ?? this.subtotal());
  savings=computed(() => Math.max(0, this.subtotal() - this.total()));
  hasProducts=computed(() => (this.cartDetailsData()?.products.length ?? 0) > 0);

  constructor() {
    afterNextRender(() => {
      if (this.cartDetailsData()) this.isLoading.set(false);
      else this.getProductsInCart();
    });
  }

  getProductsInCart():void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.cartService.getLoggedUserCart().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      error: () => this.errorMessage.set('We could not load your cart. Please try again.')
    });
  }

  showError(field:keyof typeof this.checkoutForm.controls):boolean {
    const control = this.checkoutForm.controls[field];
    return control.invalid && (control.touched || control.dirty || this.submitted());
  }

  submitForm():void {
    if (!isPlatformBrowser(this.platformId) || this.isLoading() || this.isSubmitting() || this.isRedirecting() || this.orderId()) return;
    this.submitted.set(true);
    this.checkoutForm.markAllAsTouched();
    this.orderError.set('');
    if (!this.hasProducts()) {
      this.orderError.set('Your cart is empty. Add products before placing an order.');
      return;
    }
    if (this.checkoutForm.invalid) return;
    const form = this.checkoutForm.getRawValue();
    const cartId = this.cartDetailsData()?._id;
    if (!cartId) {
      this.orderError.set('Your cart could not be identified. Return to your cart and try again.');
      return;
    }
    const shippingAddress:ShippingAddress = {
      details: form.details.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      ...(form.postalCode.trim() ? { postalCode: form.postalCode.trim() } : {})
    };
    if (form.paymentMethod !== 'cash' && form.paymentMethod !== 'online') {
      this.orderError.set('Please select a payment method.');
      return;
    }
    this.isSubmitting.set(true);
    this.checkoutForm.disable({ emitEvent: false });
    if (form.paymentMethod === 'cash') this.createCashOrder(cartId, shippingAddress);
    else this.createCheckoutSession(cartId, shippingAddress);
  }

  private createCashOrder(cartId:string, shippingAddress:ShippingAddress):void {
    this.ordersService.createCashOrder(cartId, shippingAddress).pipe(
      switchMap(res => {
        if (res.status !== 'success' || !res.data?._id) {
          return throwError(() => new Error('Unexpected cash order response'));
        }
        this.orderId.set(res.data._id);
        // Invalidate the purchased cart, then reconcile it with the backend.
        this.cartService.resetCartCount();
        return this.cartService.getLoggedUserCart().pipe(
          // A removed cart can return 404; sync failure must not resubmit a created order.
          catchError(() => of(null))
        );
      }),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.finishSubmission())
    ).subscribe({
      next: () => {
        this.toastrService.success('Your order has been placed.', 'Fresh Cart', {
          closeButton: true, timeOut: 2000, progressBar: true, progressAnimation: 'increasing'
        });
        this.router.navigate(['/orders'], { queryParams: { success: true } });
      },
      error: () => this.orderError.set('We could not confirm your order. Your delivery details have been kept. Check your orders before retrying.')
    });
  }

  private createCheckoutSession(cartId:string, shippingAddress:ShippingAddress):void {
    if (!isPlatformBrowser(this.platformId)) {
      this.finishSubmission();
      return;
    }
    // Route expects a frontend origin, not a hard-coded localhost or Stripe URL.
    this.ordersService.createCheckoutSession(cartId, shippingAddress, window.location.origin).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.finishSubmission())
    ).subscribe({
      next: res => {
        if (res.status !== 'success' || !res.session?.url) {
          this.orderError.set('The payment provider did not return a checkout URL. Please try again.');
          return;
        }
        try {
          const url = new URL(res.session.url);
          if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com' || url.username || url.password) {
            throw new Error('Invalid Stripe checkout URL');
          }
          if (isPlatformBrowser(this.platformId)) {
            this.isRedirecting.set(true);
            window.location.assign(url.href);
          }
        } catch {
          this.isRedirecting.set(false);
          this.orderError.set('The payment checkout URL is invalid or could not be opened. Please try again.');
        }
      },
      error: () => this.orderError.set('Unable to start online payment. Your cart and delivery details have been kept. Please try again.')
    });
  }

  private finishSubmission():void {
    this.isSubmitting.set(false);
    if (!this.isRedirecting()) this.checkoutForm.enable({ emitEvent: false });
  }
}
