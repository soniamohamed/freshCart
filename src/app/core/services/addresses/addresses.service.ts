import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AddressRequest, AddressResponse, AddressesResponse, addressListFromResponse, isAddress } from '../../models/address-data.interface';

@Service()
export class AddressesService {
  private readonly httpClient = inject(HttpClient);
  private readonly url = `${environment.base_url}/api/v1/addresses`;

  getLoggedUserAddresses(): Observable<AddressesResponse> {
    return this.httpClient.get<unknown>(this.url).pipe(map(response => {
      const data = addressListFromResponse(response);
      if (!data) throw new Error('The addresses response was unexpected. Please try again.');
      return { data };
    }));
  }

  addAddress(address: AddressRequest): Observable<unknown> {
    const { name, details, phone, city } = address;
    return this.httpClient.post<unknown>(this.url, { name, details, phone, city });
  }

  getSpecificAddress(addressId: string): Observable<AddressResponse> {
    return this.httpClient.get<unknown>(`${this.url}/${encodeURIComponent(addressId)}`).pipe(map(response => {
      if (!response || typeof response !== 'object' || !('data' in response) || !isAddress(response.data)) {
        throw new Error('The address response was unexpected. Please try again.');
      }
      return { data: response.data };
    }));
  }

  removeAddress(addressId: string): Observable<unknown> {
    return this.httpClient.delete<unknown>(`${this.url}/${encodeURIComponent(addressId)}`);
  }
}
