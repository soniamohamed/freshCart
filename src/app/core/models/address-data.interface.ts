import { ShippingAddress } from './order-data.interface';

export interface AddressRequest extends Pick<ShippingAddress, 'details' | 'phone' | 'city'> {
  name: string;
}

export interface Address extends AddressRequest {
  _id: string;
}

export interface AddressesResponse {
  data: Address[];
}

export interface AddressResponse {
  data: Address;
}

export function isAddress(value: unknown): value is Address {
  if (!value || typeof value !== 'object') return false;
  const address = value as Record<string, unknown>;
  return ['_id', 'name', 'details', 'phone', 'city'].every(key => typeof address[key] === 'string')
    && !!address['_id'];
}

export function addressListFromResponse(value: unknown): Address[] | null {
  if (!value || typeof value !== 'object' || !('data' in value)) return null;
  return Array.isArray(value.data) && value.data.every(isAddress) ? value.data : null;
}
