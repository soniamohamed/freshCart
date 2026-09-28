import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';

describe('CartService', () => {
  let service: CartService;
  let http: HttpTestingController;
  const url = `${environment.base_url}/api/v2/cart`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CartService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('shares simultaneous cart reads and allows a fresh request after completion', () => {
    let responses = 0;
    service.getLoggedUserCart().subscribe(() => responses++);
    service.getLoggedUserCart().subscribe(() => responses++);
    http.expectOne(url).flush({ status: 'success', numOfCartItems: 0, data: { products: [] } });
    expect(responses).toBe(2);
    service.getLoggedUserCart().subscribe();
    http.expectOne(url).flush({ status: 'success', numOfCartItems: 1, data: { products: [{ count: 1 }] } });
    expect(service.cartCount()).toBe(1);
  });

  it('retains server cart membership and quantity, preserves it on failure, and resets it', () => {
    service.getLoggedUserCart().subscribe();
    http.expectOne(url).flush({ status: 'success', numOfCartItems: 1,
      data: { products: [{ product: { _id: 'product' }, count: 1 }] } });
    expect(service.cartDetailsData()?.products[0].product._id).toBe('product');
    service.addProductToCart('product').subscribe();
    http.expectOne(url).flush({ status: 'success', numOfCartItems: 1,
      data: { products: [{ product: { _id: 'product' }, count: 2 }] } });
    expect(service.cartDetailsData()?.products[0].count).toBe(2);
    expect(service.cartCount()).toBe(1);
    service.removeProductFromCart('product').subscribe({ error: () => {} });
    http.expectOne(`${url}/product`).flush({}, { status: 500, statusText: 'Server Error' });
    expect(service.cartDetailsData()?.products[0].product._id).toBe('product');
    service.resetCartCount();
    expect(service.cartDetailsData()).toBeNull();
    expect(service.cartCount()).toBe(0);
  });

  it('uses server counts for fetch, duplicate additions, quantity changes and removal', () => {
    service.getLoggedUserCart().subscribe();
    http.expectOne(url).flush({ status: 'success', numOfCartItems: 2 });
    expect(service.cartCount()).toBe(2);
    service.addProductToCart('product').subscribe();
    http.expectOne(url).flush({ status: 'success', numOfCartItems: 2 });
    expect(service.cartCount()).toBe(2);
    service.updateCartProductQuentity('product', 5).subscribe();
    http.expectOne(`${url}/product`).flush({ status: 'success', numOfCartItems: 2 });
    expect(service.cartCount()).toBe(2);
    service.removeProductFromCart('product').subscribe();
    http.expectOne(`${url}/product`).flush({ status: 'success', numOfCartItems: 1 });
    expect(service.cartCount()).toBe(1);
  });

  it('falls back to cart lines and clears without requiring a count field', () => {
    service.getLoggedUserCart().subscribe();
    http.expectOne(url).flush({ status: 'success', data: { products: [{ count: 5 }, { count: 2 }] } });
    expect(service.cartCount()).toBe(2);
    service.clearUserCart().subscribe();
    http.expectOne(url).flush({ status: 'success' });
    expect(service.cartCount()).toBe(0);
    expect(service.cartDetailsData()).toBeNull();
  });

  it('does not replace a mutation count with an older fetch response', () => {
    service.getLoggedUserCart().subscribe();
    const initial = http.expectOne(url);
    service.addProductToCart('product').subscribe();
    http.expectOne(url).flush({ status: 'success', numOfCartItems: 3 });
    initial.flush({ status: 'success', numOfCartItems: 1 });
    expect(service.cartCount()).toBe(3);
  });

  it('preserves the count on failure and cancels pending requests on logout reset', () => {
    service.cartCount.set(4);
    service.addProductToCart('product').subscribe({ error: () => {} });
    http.expectOne(url).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(service.cartCount()).toBe(4);
    service.getLoggedUserCart().subscribe();
    const pending = http.expectOne(url);
    service.resetCartCount();
    expect(pending.cancelled).toBe(true);
    expect(service.cartCount()).toBe(0);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
