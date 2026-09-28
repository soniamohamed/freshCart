import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CheckoutSessionResponse,
  Order,
  OrderDataResponse,
  ShippingAddress
} from '../../models/order-data.interface';

@Service()
export class OrdersService {

  private readonly httpClient = inject(HttpClient);

  createCashOrder(
    cartId: string,
    shippingAddress: ShippingAddress
  ): Observable<OrderDataResponse> {

    const { details, phone, city } = shippingAddress;

    return this.httpClient.post<OrderDataResponse>(
      `${environment.base_url}/api/v1/orders/${encodeURIComponent(cartId)}`,
      {
        shippingAddress: {
          details,
          phone,
          city
        }
      }
    );
  }

  createCheckoutSession(
    cartId: string,
    shippingAddress: ShippingAddress,
    frontendUrl: string
  ): Observable<CheckoutSessionResponse> {

    const { details, phone, city } = shippingAddress;

    return this.httpClient.post<CheckoutSessionResponse>(
      `${environment.base_url}/api/v1/orders/checkout-session/${encodeURIComponent(cartId)}`,
      {
        shippingAddress: {
          details,
          phone,
          city
        }
      },
      {
        params: {
          url: frontendUrl
        }
      }
    );
  }

  getUserOrders(userId: string): Observable<Order[]> {
    return this.httpClient.get<Order[]>(
      `${environment.base_url}/api/v1/orders/user/${encodeURIComponent(userId)}`
    );
  }
}