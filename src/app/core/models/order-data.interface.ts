export interface ShippingAddress {
  details: string;
  phone: string;
  city: string;
  postalCode?: string;
}

export interface OrderDataResponse {
  status: string;
  data: {
    _id: string;
  };
}

export interface OrderProduct {
  _id: string;
  count: number;
  price: number;
  product: Product2 | null;
}

export interface Order {
  _id: string;
  id?: number;
  createdAt: string;
  totalOrderPrice: number;
  paymentMethodType: string;
  isPaid: boolean;
  isDelivered: boolean;
  cartItems: OrderProduct[];
}

export interface StripeSession {
  url: string | null;
}

export interface CheckoutSessionResponse {
  status: string;
  session: StripeSession;
}
import { Product2 } from './cart-data.interface';
