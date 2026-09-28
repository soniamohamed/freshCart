import { Component, inject, OnInit, WritableSignal,signal, PLATFORM_ID } from '@angular/core';
import { CartService } from '../../core/services/cart/cart.service';
import { CartData } from '../../core/models/cart-data.interface';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  imports: [RouterLink,CurrencyPipe],
  selector: 'app-cart',
  styleUrl: './cart.component.css',
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  private readonly cartService=inject(CartService);
  private readonly toastrService=inject(ToastrService);
  private readonly platform=inject(PLATFORM_ID);
  cartDetailsData:WritableSignal<CartData>= signal({} as CartData);
  ngOnInit(): void {
    this.getProductsInCart()
  }
  getProductsInCart():void
  {
    
    if(isPlatformBrowser(this.platform))
    {
      const token=localStorage.getItem('freshToken');
     if(token)
     {
        this.cartService.getLoggedUserCart().subscribe({
        next:(res)=>
        {
          
          if (res.status === 'success') 
          {
            this.cartDetailsData.set(res.data);
          }
        }
        });
     }
 }
  }
  deleteProductFromCart(productId:string):void
  {
    this.cartService.removeProductFromCart(productId).subscribe({
    next:(res)=>
      {
       
         if(res.status==='success')
        {
        //     this.cartDetailsData.update(cart => ({
        //   ...cart,

        //   products: cart.products.filter(
        //     item => item.product._id !== productId
        //   )
        // }));
           this.cartDetailsData.set(res.data);
            this.toastrService.success(res.message, 'Fresh Cart', {
            closeButton: true,
            timeOut: 2000,
            progressBar: true,
            progressAnimation:'increasing'
          });
          
        } 
      }    
      });  
 }

 plusCount(productId:string,itemCount:number):void
 {
    
    if(isPlatformBrowser(this.platform))
    {
      const token=localStorage.getItem('freshToken');
     if(token)
     {
        itemCount=itemCount+1;
        this.cartService.updateCartProductQuentity(productId,itemCount).subscribe({
        next:(res)=>
        {
          
          if (res.status === 'success') 
          {
            this.cartDetailsData.set(res.data);
          }
        }
        });
     }
 }
 }

  minusCount(productId:string,itemCount:number):void
 {
    
    if(isPlatformBrowser(this.platform))
    {
      const token=localStorage.getItem('freshToken');
     if(token)
     {
        itemCount=itemCount-1;
        this.cartService.updateCartProductQuentity(productId,itemCount).subscribe({
        next:(res)=>
        {
          
          if (res.status === 'success') 
          {
            this.cartDetailsData.set(res.data);
          }
        }
        });
     }
 }
 }
 clearAllProducts():void
 {
   if(isPlatformBrowser(this.platform))
    {
      const token=localStorage.getItem('freshToken');
     if(token)
     {
       
        this.cartService.clearUserCart().subscribe({
        next:(res)=>
        {
          
          if (res.status === 'success') 
          {
            this.cartDetailsData.set(res.data);
          }
        }
        });
     }
    }
 }
  
}
