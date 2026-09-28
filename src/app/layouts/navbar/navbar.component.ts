import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  PLATFORM_ID,
  Signal,
  signal
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FlowbiteService } from './../../core/services/flowbite/flowbite.service';
import { initFlowbite } from 'flowbite';

import { AuthService } from '../../core/auth/services/auth.service';
import { CartService } from '../../core/services/cart/cart.service';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';
import { CategoriesService } from '../../core/services/categories/categories.service';

interface NavbarUserData {
  name?: string;
  email?: string;
}

@Component({
  imports: [RouterLink],
  selector: 'app-navbar',
  styleUrl: './navbar.component.css',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {

  private readonly flowbiteService = inject(FlowbiteService);
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly categoriesService = inject(CategoriesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly electronicsCategoryId = signal('');

  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);

  private readonly countsReady = signal(false);

  logged: Signal<boolean> = computed(() => this.authService.isLogged());

  profileMenuOpen = signal(false);

  userData = signal<NavbarUserData | null>(null);

  userName = computed(() => {
    return this.userData()?.name || 'My Account';
  });

  constructor() {

    effect(() => {
      const user = this.authService.profileUser();
      if (user) this.userData.set(user);
    });

    afterNextRender(() => {
      this.countsReady.set(true);
      this.loadUserData();
      this.loadElectronicsCategory();
    });

    effect((onCleanup) => {

      if (!this.countsReady()) {
        return;
      }

      if (!this.logged()) {
        this.cartService.resetCartCount();
        this.wishlistService.resetWishlistCount();

        this.profileMenuOpen.set(false);

        return;
      }

      const cartSub = this.cartService
        .getLoggedUserCart()
        .subscribe({
          error: () => {}
        });

      const wishlistSub = this.wishlistService
        .getLoggedUserWishlist()
        .subscribe({
          error: () => {}
        });

      this.loadUserData();

      onCleanup(() => {
        cartSub.unsubscribe();
        wishlistSub.unsubscribe();
      });
    });
  }

  ngOnInit(): void {
    this.checkToken();
    this.flowbiteInit();
  }

  private loadElectronicsCategory(): void {
    this.categoriesService.getAllCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const categories = Array.isArray(response.data) ? response.data : [];
          const electronics = categories.find(category =>
            category.name?.trim().toLowerCase() === 'electronics'
          );
          this.electronicsCategoryId.set(electronics?._id || '');
        },
        // Keep the /categories fallback; the shared interceptor handles API errors.
        error: () => this.electronicsCategoryId.set(''),
      });
  }

  checkToken(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const token = localStorage.getItem('freshToken');

    if (token) {
      this.authService.isLogged.set(true);
      this.loadUserData();
    }
  }

  private loadUserData(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const storedUser = localStorage.getItem('userData');

    if (!storedUser) {
      this.userData.set(null);
      return;
    }

    try {
      const user = JSON.parse(storedUser) as NavbarUserData;

      this.userData.set(user);

    } catch {
      this.userData.set(null);
    }
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen.update(value => !value);
  }

  closeProfileMenu(): void {
    this.profileMenuOpen.set(false);
  }

  flowbiteInit(): void {

    this.flowbiteService.loadFlowbite(() => {
      initFlowbite();
    });

  }

  logOut(): void {

    this.closeProfileMenu();

    this.userData.set(null);

    this.authService.signOut();
  }
}
