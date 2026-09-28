import { HttpClient } from '@angular/common/http';
import { inject, Service, signal, WritableSignal } from '@angular/core';
import { defer, finalize, Observable, shareReplay, Subject, takeUntil, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CartData, CartDataResponse } from '../../models/cart-data.interface';

@Service()
export class CartService {
private readonly httpClient=inject(HttpClient)
private readonly resetCount$=new Subject<void>();
private countRevision=0;
private cartRequest:Observable<CartDataResponse> | null=null;
cartCount:WritableSignal<number>=signal<number>(0);
cartDetailsData:WritableSignal<CartData | null>=signal<CartData | null>(null);
    addProductToCart(productId:string):Observable<CartDataResponse> 
    {
         return this.httpClient.post<CartDataResponse>(`${environment.base_url}/api/v2/cart`,
            {
                productId:productId
            }
         ).pipe(takeUntil(this.resetCount$), tap(res => this.updateCartCount(res)));
    }
    getLoggedUserCart():Observable<CartDataResponse> 
    {
         if (this.cartRequest) return this.cartRequest;
         this.cartRequest = defer(() => {
           const revision = this.countRevision;
           return this.httpClient.get<CartDataResponse>(`${environment.base_url}/api/v2/cart`).pipe(
             takeUntil(this.resetCount$),
             tap(res => {
               if (revision === this.countRevision) this.updateCartCount(res);
             })
           );
         }).pipe(
           finalize(() => this.cartRequest = null),
           shareReplay({ bufferSize: 1, refCount: true })
         );
         return this.cartRequest;
    }
    updateCartProductQuentity(productId:string,productCount:number):Observable<CartDataResponse> 
    {
         return this.httpClient.put<CartDataResponse>(`${environment.base_url}/api/v2/cart/${productId}`,
           {
                count: productCount
           }
         ).pipe(takeUntil(this.resetCount$), tap(res => this.updateCartCount(res)));
    }
    removeProductFromCart(productId:string):Observable<CartDataResponse> 
    {
         return this.httpClient.delete<CartDataResponse>(`${environment.base_url}/api/v2/cart/${productId}`).pipe(
           takeUntil(this.resetCount$), tap(res => this.updateCartCount(res))
         );
    }
    clearUserCart():Observable<CartDataResponse> 
    {
         return this.httpClient.delete<CartDataResponse>(`${environment.base_url}/api/v2/cart`).pipe(
           takeUntil(this.resetCount$),
           tap(res => {
             if (res.status === 'success') {
               this.countRevision++;
               this.cartCount.set(0);
               this.cartDetailsData.set(null);
             }
           })
         );
    }

    resetCartCount():void {
      this.countRevision++;
      this.resetCount$.next();
      this.cartCount.set(0);
      this.cartDetailsData.set(null);
    }

    private updateCartCount(res:CartDataResponse):void {
      if (res.status === 'success') {
        this.countRevision++;
        this.cartCount.set(res.numOfCartItems ?? res.data?.products?.length ?? 0);
        this.cartDetailsData.set(res.data ?? null);
      }
    }

}
