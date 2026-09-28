import { Component } from '@angular/core';
import { MainSliderComponent } from "./components/main-slider/main-slider.component";
import { PopularCategoriesComponent } from "./components/popular-categories/popular-categories.component";
import { PopularProductsComponent } from "./components/popular-products/popular-products.component";

@Component({
  imports: [MainSliderComponent, PopularCategoriesComponent, PopularProductsComponent],
  selector: 'app-home',
  styleUrl: './home.component.css',
  templateUrl: './home.component.html',
})
export class HomeComponent {}
