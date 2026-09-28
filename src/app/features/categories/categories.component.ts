import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  WritableSignal
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CategoriesService } from '../../core/services/categories/categories.service';
import { CategoriesData } from '../../core/models/categories-data.interface';

@Component({
  imports: [RouterLink],
  selector: 'app-categories',
  styleUrl: './categories.component.css',
  templateUrl: './categories.component.html',
})
export class CategoriesComponent implements OnInit {

  private readonly categoriesService = inject(CategoriesService);

  private readonly destroyRef = inject(DestroyRef);

  categoriesList: WritableSignal<CategoriesData[]> =
    signal<CategoriesData[]>([]);

  isLoading = signal<boolean>(false);

  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.getAllCategories();
  }

  getAllCategories(): void {

    this.isLoading.set(true);

    this.errorMessage.set('');

    this.categoriesService
      .getAllCategories()
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: (response) => {

          this.categoriesList.set(response.data ?? []);

          this.isLoading.set(false);

        },

        error: () => {

          this.categoriesList.set([]);

          this.errorMessage.set(
            'Unable to load categories. Please try again.'
          );

          this.isLoading.set(false);

        }

      });
  }

}