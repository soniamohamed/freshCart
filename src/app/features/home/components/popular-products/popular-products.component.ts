import { ToastrService } from 'ngx-toastr';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ProductsService } from '../../../../core/services/products/products.service';
import { ProductData} from '../../../../core/models/productdata.interface';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/cart/cart.service';

@Component({
  imports: [CurrencyPipe,RouterLink],
  selector: 'app-popular-products',
  styleUrl: './popular-products.component.css',
  templateUrl: './popular-products.component.html',
})
export class PopularProductsComponent implements OnInit {
  private readonly productsService=inject(ProductsService);
  private readonly cartService=inject(CartService);
  private readonly toastrService=inject(ToastrService);
   productsList:WritableSignal<ProductData[]>=signal<ProductData[]>([]);

  ngOnInit(): void {
   this.getAllProductsData();
  }

  getAllProductsData():void
  {
     this.productsService.getAllProducts().subscribe({
      next:(res)=>
      {
        this.productsList.set(res.data);
      }
      
     });
     
   
  }
  addItemToCart(productId:string):void
  {
     //   console.log(productId);
     //call api
     const token=localStorage.getItem('freshToken');
     if(token)
     {
        this.cartService.addProductToCart(productId).subscribe({
         next:(res)=>
         {
           if(res.status==='success')
           {
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
      else
     {
   
        this.toastrService.warning('Please login to continue', 'Fresh Cart', {
                closeButton: true,
                timeOut: 2000,
                progressBar: true,
                progressAnimation:'increasing'
           });
     }
   }

}