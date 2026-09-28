import { afterNextRender, Component, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';
import { ProductData } from '../../core/models/productdata.interface';

@Component({
  imports: [CurrencyPipe, RouterLink],
  selector: 'app-wishlist',
  styleUrl: './wishlist.component.css',
  templateUrl: './wishlist.component.html',
})
export class WishlistComponent {
  private readonly wishlistService=inject(WishlistService);
  private readonly toastrService=inject(ToastrService);
  private readonly destroyRef=inject(DestroyRef);
  productsList:WritableSignal<ProductData[]>=signal<ProductData[]>([]);
  isLoading=signal(true);
  removingProductId=signal('');
  errorMessage=signal('');
  removeErrorMessage=signal('');

  constructor() {
    // User-specific requests run after hydration, when the token interceptor is available.
    afterNextRender(() => this.getProductsInWishlist());
  }

  getProductsInWishlist():void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.wishlistService.getLoggedUserWishlist().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: res => this.productsList.set(res.data),
      error: () => this.errorMessage.set('Unable to load your wishlist. Please try again.')
    });
  }

  deleteProductFromWishlist(productId:string):void {
    if (this.removingProductId()) return;
    this.removingProductId.set(productId);
    this.removeErrorMessage.set('');
    this.wishlistService.removeProductFromWishlist(productId).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.removingProductId.set(''))
    ).subscribe({
      next: res => {
        if (res.status === 'success') {
          this.productsList.update(products => products.filter(product => product._id !== productId));
          this.toastrService.success(res.message, 'Fresh Cart', {
            closeButton: true, timeOut: 2000, progressBar: true, progressAnimation: 'increasing'
          });
        }
      },
      error: () => this.removeErrorMessage.set('Unable to remove this product. Please try again.')
    });
  }
}
