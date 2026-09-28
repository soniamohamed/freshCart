import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ProductsDataResponse } from '../../models/productdata.interface';
import { ProductDetailsDataResponse } from '../../models/product-details-data.interface';

@Service()
export class ProductsService {
    private readonly httpClient=inject(HttpClient);

getAllProducts(brandId?:string, page?:number):Observable<ProductsDataResponse> {
const params: Record<string, string | number> = {};
if (brandId) params['brand'] = brandId;
if (page) params['page'] = page;
return this.httpClient.get<ProductsDataResponse>(`${environment.base_url}/api/v1/products`, { params });
}

getSpecificProduct(productId:string):Observable<ProductDetailsDataResponse> {
return this.httpClient.get<ProductDetailsDataResponse>(`${environment.base_url}/api/v1/products/${productId}`);
}


}
