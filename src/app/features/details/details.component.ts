import { CurrencyPipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../core/services/cart/cart.service';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';
import { AuthService } from '../../core/auth/services/auth.service';
import { ProductsService } from '../../core/services/products/products.service';
import { ProductDetailsData } from '../../core/models/product-details-data.interface';

@Component({
  imports: [CurrencyPipe],
  selector: 'app-details',
  styleUrl: './details.component.css',
  templateUrl: './details.component.html',
})
export class DetailsComponent implements OnInit {
  private readonly activatedRoute=inject(ActivatedRoute);
  private readonly productService=inject(ProductsService);
  private readonly cartService=inject(CartService);
  private readonly wishlistService=inject(WishlistService);
  private readonly authService=inject(AuthService);
  private readonly toastrService=inject(ToastrService);
  private readonly destroyRef=inject(DestroyRef);
  isAddingToCart=signal(false);
  isAddingToWishlist=signal(false);
  private readonly toastOptions = { closeButton: true, timeOut: 2000, progressBar: true, progressAnimation: 'increasing' as const };
  productId:WritableSignal<string>=signal<string>('');
  //productData:ProductDetailsData={} as ProductDetailsData;
  productData:WritableSignal<ProductDetailsData>=signal<ProductDetailsData>({} as ProductDetailsData);
  isInCart=computed(() => this.cartService.cartDetailsData()?.products?.some(
    item => item.product._id === this.productData()._id
  ) ?? false);
  isInWishlist=computed(() => this.wishlistService.wishlistProductIds().includes(this.productData()._id));
  ngOnInit(): void {
    this.getProductId();
  }

  addItemToCart():void {
    const productId = this.productData()._id;
    if (!productId || this.isAddingToCart() || this.isAddingToWishlist() || !this.checkAuthentication()) return;
    this.isAddingToCart.set(true);
    this.cartService.addProductToCart(productId).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isAddingToCart.set(false))
    ).subscribe({
      next: res => {
        if (res.status === 'success') {
          this.toastrService.success(res.message, 'Fresh Cart', this.toastOptions);
        }
      },
      error: () => {} // Existing error interceptor handles API errors, including 401.
    });
  }

  toggleWishlist():void {
    const productId = this.productData()._id;
    if (!productId || this.isAddingToWishlist() || this.isAddingToCart() || !this.checkAuthentication()) return;
    this.isAddingToWishlist.set(true);
    const request = this.isInWishlist()
      ? this.wishlistService.removeProductFromWishlist(productId)
      : this.wishlistService.addProductToWishlist(productId);
    request.pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isAddingToWishlist.set(false))
    ).subscribe({
      next: res => {
        if (res.status === 'success') {
          this.toastrService.success(res.message, 'Fresh Cart', this.toastOptions);
        }
      },
      error: () => {} // Existing error interceptor handles API errors, including 401.
    });
  }

  private checkAuthentication():boolean {
    if (this.authService.isLogged()) return true;
    this.toastrService.warning('Please login to continue', 'Fresh Cart', this.toastOptions);
    return false;
  }

  getProductId():void
  {
     this.activatedRoute.paramMap.subscribe((params)=>{
      this.productId.set(params.get('id')!);
      this.getSpecificProductData();
     })
  }
  getSpecificProductData():void
  {
    this.productService.getSpecificProduct(this.productId()).subscribe({
      next:(res)=>
      {
       this.productData.set(res.data);
        //console.log(res);
      },
        error:(err)=>
      {
         console.log(err);
      }
     });
  }
}
