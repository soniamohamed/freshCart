import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WishlistService } from './wishlist.service';
import { environment } from '../../../../environments/environment';

describe('WishlistService', () => {
  let service: WishlistService;
  let http: HttpTestingController;
  const url = `${environment.base_url}/api/v1/wishlist`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(WishlistService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses response array lengths for fetch, duplicate additions and removal', () => {
    service.getLoggedUserWishlist().subscribe();
    http.expectOne(url).flush({ status: 'success', data: [{ _id: 'one' }, { _id: 'two' }] });
    expect(service.wishlistCount()).toBe(2);
    expect(service.wishlistProductIds()).toEqual(['one', 'two']);
    service.addProductToWishlist('one').subscribe();
    http.expectOne(url).flush({ status: 'success', data: ['one', 'two'] });
    expect(service.wishlistCount()).toBe(2);
    service.removeProductFromWishlist('one').subscribe();
    http.expectOne(`${url}/one`).flush({ status: 'success', data: ['two'] });
    expect(service.wishlistCount()).toBe(1);
    expect(service.wishlistProductIds()).toEqual(['two']);
    service.removeProductFromWishlist('two').subscribe();
    http.expectOne(`${url}/two`).flush({ status: 'success', data: [] });
    expect(service.wishlistProductIds()).toEqual([]);
    expect(service.wishlistCount()).toBe(0);
  });

  it('does not replace a mutation count with an older fetch response', () => {
    service.getLoggedUserWishlist().subscribe();
    const initial = http.expectOne(url);
    service.addProductToWishlist('one').subscribe();
    http.expectOne(url).flush({ status: 'success', data: ['one'] });
    initial.flush({ status: 'success', data: [] });
    expect(service.wishlistCount()).toBe(1);
  });

  it('preserves the count on failure and cancels pending requests on logout reset', () => {
    service.wishlistCount.set(2);
    service.wishlistProductIds.set(['one', 'two']);
    service.removeProductFromWishlist('one').subscribe({ error: () => {} });
    http.expectOne(`${url}/one`).flush({}, { status: 500, statusText: 'Server Error' });
    expect(service.wishlistCount()).toBe(2);
    expect(service.wishlistProductIds()).toEqual(['one', 'two']);
    service.getLoggedUserWishlist().subscribe();
    const pending = http.expectOne(url);
    service.resetWishlistCount();
    expect(pending.cancelled).toBe(true);
    expect(service.wishlistCount()).toBe(0);
    expect(service.wishlistProductIds()).toEqual([]);
  });
});
