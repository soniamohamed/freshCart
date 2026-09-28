import { CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, catchError, distinctUntilChanged, expand, forkJoin, map, of, reduce, switchMap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ProductData } from '../../core/models/productdata.interface';
import { BrandData } from '../../core/models/brands-data.interface';
import { CategoriesData } from '../../core/models/categories-data.interface';
import { CategoriesService } from '../../core/services/categories/categories.service';
import { ProductsService } from '../../core/services/products/products.service';
import { BrandsService } from '../../core/services/brands/brands.service';
import { CartService } from '../../core/services/cart/cart.service';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  imports: [CurrencyPipe, RouterLink],
  selector: 'app-products',
  styleUrl: './products.component.css',
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {
  private readonly productsService=inject(ProductsService);
  private readonly brandsService=inject(BrandsService);
  private readonly categoriesService=inject(CategoriesService);
  private readonly activatedRoute=inject(ActivatedRoute);
  private readonly router=inject(Router);
  private readonly destroyRef=inject(DestroyRef);
  private readonly cartService=inject(CartService);
  private readonly authService=inject(AuthService);
  private readonly toastrService=inject(ToastrService);
  productsList:WritableSignal<ProductData[]>=signal<ProductData[]>([]);
  brandData:WritableSignal<BrandData | null>=signal<BrandData | null>(null);
  brandId=signal('');
  categoryId=signal('');
  categoryData=signal<CategoriesData | null>(null);
  isLoading=signal(false);
  errorMessage=signal('');

  ngOnInit():void {
    this.activatedRoute.queryParamMap.pipe(
      map(params => ({
        brandId: params.get('brand')?.trim() || '',
        categoryId: params.get('category')?.trim() || '',
      })),
      distinctUntilChanged((previous, current) => previous.brandId === current.brandId && previous.categoryId === current.categoryId),
      switchMap(({ brandId, categoryId }) => {
        this.brandId.set(brandId);
        this.categoryId.set(categoryId);
        this.brandData.set(null);
        this.categoryData.set(null);
        this.productsList.set([]);
        this.errorMessage.set('');
        this.isLoading.set(true);
        return forkJoin({
          brand: brandId ? this.brandsService.getSpecificBrand(brandId).pipe(map(res => res.data)) : of(null),
          category: categoryId ? this.categoriesService.getSpecificCategory(categoryId).pipe(map(res => res.data)) : of(null),
          products: this.productsService.getAllProducts(brandId, undefined, categoryId).pipe(
            expand(res => res.metadata.currentPage < res.metadata.numberOfPages
              ? this.productsService.getAllProducts(brandId, res.metadata.currentPage + 1, categoryId) : EMPTY),
            reduce((products, res) => [...products, ...res.data], [] as ProductData[])
          )
        }).pipe(catchError(() => {
          this.errorMessage.set('Unable to load products or the selected filters. Please try again.');
          return of({ brand: null, category: null, products: [] as ProductData[] });
        }));
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ brand, category, products }) => {
      this.brandData.set(brand);
      this.categoryData.set(category);
      this.productsList.set(products);
      this.isLoading.set(false);
    });
  }

  clearBrandFilter():void {
    this.router.navigate(['/products'], { queryParams: {}, queryParamsHandling: 'replace' });
  }

  clearCategoryFilter():void {
    this.router.navigate(['/products'], { queryParams: {}, queryParamsHandling: 'replace' });
  }

  addItemToCart(productId:string):void {
    const options = { closeButton: true, timeOut: 2000, progressBar: true, progressAnimation: 'increasing' as const };
    if (!this.authService.isLogged()) {
      this.toastrService.warning('Please login to continue', 'Fresh Cart', options);
      return;
    }
    this.cartService.addProductToCart(productId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        if (res.status === 'success') this.toastrService.success(res.message, 'Fresh Cart', options);
      },
      error: () => {} // The existing error interceptor displays cart API errors.
    });
  }
}
