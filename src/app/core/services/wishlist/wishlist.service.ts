import { HttpClient } from '@angular/common/http';
import { inject, Service, signal, WritableSignal } from '@angular/core';
import { defer, Observable, Subject, takeUntil, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { WishlistDataResponse, WishlistUpdateDataResponse } from '../../models/wishlist-data.interface';

@Service()
export class WishlistService {
  private readonly httpClient=inject(HttpClient);
  private readonly resetCount$=new Subject<void>();
  private countRevision=0;
  wishlistCount:WritableSignal<number>=signal<number>(0);
  wishlistProductIds:WritableSignal<string[]>=signal<string[]>([]);

  addProductToWishlist(productId:string):Observable<WishlistUpdateDataResponse> {
    return this.httpClient.post<WishlistUpdateDataResponse>(`${environment.base_url}/api/v1/wishlist`, { productId }).pipe(
      takeUntil(this.resetCount$), tap(res => this.updateWishlistCount(res))
    );
  }

  getLoggedUserWishlist():Observable<WishlistDataResponse> {
    return defer(() => {
      const revision = this.countRevision;
      return this.httpClient.get<WishlistDataResponse>(`${environment.base_url}/api/v1/wishlist`).pipe(
        takeUntil(this.resetCount$),
        tap(res => {
          if (revision === this.countRevision) this.updateWishlistCount(res);
        })
      );
    });
  }

  removeProductFromWishlist(productId:string):Observable<WishlistUpdateDataResponse> {
    return this.httpClient.delete<WishlistUpdateDataResponse>(`${environment.base_url}/api/v1/wishlist/${encodeURIComponent(productId)}`).pipe(
      takeUntil(this.resetCount$), tap(res => this.updateWishlistCount(res))
    );
  }

  resetWishlistCount():void {
    this.countRevision++;
    this.resetCount$.next();
    this.wishlistCount.set(0);
    this.wishlistProductIds.set([]);
  }

  private updateWishlistCount(res:WishlistDataResponse | WishlistUpdateDataResponse):void {
    if (res.status === 'success') {
      this.countRevision++;
      this.wishlistCount.set(res.data.length);
      this.wishlistProductIds.set(res.data.map(product => typeof product === 'string' ? product : product._id));
    }
  }
}
