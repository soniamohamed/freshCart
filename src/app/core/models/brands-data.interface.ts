import { Brand, Metadata } from './productdata.interface';

export interface BrandsDataResponse {
  results: number;
  metadata: Metadata;
  data: BrandData[];
}

export interface BrandData extends Brand {
  createdAt: string;
  updatedAt: string;
}

export interface BrandDetailsDataResponse {
  data: BrandData & { __v: number };
}
