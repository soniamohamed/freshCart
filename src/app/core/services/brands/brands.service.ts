import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BrandsDataResponse, BrandDetailsDataResponse } from '../../models/brands-data.interface';

@Service()
export class BrandsService {
  private readonly httpClient=inject(HttpClient);

  getAllBrands(page: number = 1): Observable<BrandsDataResponse> {
    return this.httpClient.get<BrandsDataResponse>(`${environment.base_url}/api/v1/brands`, {
      params: { page }
    });
  }

  getSpecificBrand(brandId: string): Observable<BrandDetailsDataResponse> {
    return this.httpClient.get<BrandDetailsDataResponse>(`${environment.base_url}/api/v1/brands/${encodeURIComponent(brandId)}`);
  }
}
