import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, expand, finalize, reduce } from 'rxjs';
import { BrandsService } from '../../core/services/brands/brands.service';
import { BrandData } from '../../core/models/brands-data.interface';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-brands',
  styleUrl: './brands.component.css',
  templateUrl: './brands.component.html',
})
export class BrandsComponent implements OnInit {
  private readonly brandsService=inject(BrandsService);
  private readonly destroyRef=inject(DestroyRef);
  brandsList:WritableSignal<BrandData[]>=signal<BrandData[]>([]);
  isLoading=signal(false);
  errorMessage=signal('');

  ngOnInit():void {
    this.getAllBrandsData();
  }

  getAllBrandsData():void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.brandsService.getAllBrands().pipe(
      expand(res => res.metadata.currentPage < res.metadata.numberOfPages
        ? this.brandsService.getAllBrands(res.metadata.currentPage + 1) : EMPTY),
      reduce((brands, res) => [...brands, ...res.data], [] as BrandData[]),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: brands => this.brandsList.set(brands),
      error: () => this.errorMessage.set('Unable to load brands. Please try again.')
    });
  }
}
