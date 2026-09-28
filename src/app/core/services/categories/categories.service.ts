import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { CategoriesDataResponse } from '../../models/categories-data.interface';

@Service()
export class CategoriesService {
     private readonly httpClient=inject(HttpClient);

     getAllCategories():Observable<CategoriesDataResponse> {
     return this.httpClient.get<CategoriesDataResponse>(`${environment.base_url}/api/v1/categories`);
     }
     
     getSpecificCategory(categoryId:string):Observable<any> {
     return this.httpClient.get<any>(`${environment.base_url}/api/v1/categories/${categoryId}`);
     }

}
