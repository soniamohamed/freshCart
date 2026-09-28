import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { CategoriesDataResponse, CategoryDataResponse } from '../../models/categories-data.interface';

@Service()
export class CategoriesService {
     private readonly httpClient=inject(HttpClient);

     getAllCategories():Observable<CategoriesDataResponse> {
     return this.httpClient.get<CategoriesDataResponse>(`${environment.base_url}/api/v1/categories`);
     }
     
     getSpecificCategory(categoryId:string):Observable<CategoryDataResponse> {
     return this.httpClient.get<CategoryDataResponse>(`${environment.base_url}/api/v1/categories/${encodeURIComponent(categoryId)}`);
     }

}
