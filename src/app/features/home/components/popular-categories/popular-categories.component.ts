import { Component, inject, OnInit, WritableSignal, signal } from '@angular/core';
import { CategoriesService } from '../../../../core/services/categories/categories.service';
import { CategoriesData } from '../../../../core/models/categories-data.interface';

@Component({
  imports: [],
  selector: 'app-popular-categories',
  styleUrl: './popular-categories.component.css',
  templateUrl: './popular-categories.component.html',
})
export class PopularCategoriesComponent implements OnInit {
  private readonly categoriesService=inject(CategoriesService);
  categoriesList:WritableSignal<CategoriesData[]> = signal<CategoriesData[]>([]);
  ngOnInit(): void {
   this.getAllCategories();
 }
 getAllCategories():void
 {
     this.categoriesService.getAllCategories().subscribe({
      next:(res)=>
      {
        this.categoriesList.set(res.data);
       //console.log(res);
      },
        error:(err)=>
      {
         console.log(err);
      }
     });
 }


}
