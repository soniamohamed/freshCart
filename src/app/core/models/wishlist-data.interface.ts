import { ProductData } from './productdata.interface';

export interface WishlistDataResponse {
  status: string;
  count: number;
  data: ProductData[];
}

export interface WishlistUpdateDataResponse {
  status: string;
  message: string;
  data: string[];
}
