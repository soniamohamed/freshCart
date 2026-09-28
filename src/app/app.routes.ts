import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guard/auth-guard';

export const routes: Routes = [

  {
    path: '',
    title: 'Freshcart | Home',
    loadComponent: () =>
      import('./features/home/home.component')
        .then(m => m.HomeComponent)
  },

  {
    path: 'brands',
    title: 'Freshcart | Brands',
    loadComponent: () =>
      import('./features/brands/brands.component')
        .then(m => m.BrandsComponent)
  },

  {
    path: 'products',
    title: 'Freshcart | Products',
    loadComponent: () =>
      import('./features/products/products.component')
        .then(m => m.ProductsComponent)
  },

  {
    path: 'cart',
    title: 'Freshcart | Cart',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/cart/cart.component')
        .then(m => m.CartComponent)
  },

  {
    path: 'categories',
    title: 'Freshcart | Categories',
    loadComponent: () =>
      import('./features/categories/categories.component')
        .then(m => m.CategoriesComponent)
  },

  {
    path: 'checkout',
    title: 'Freshcart | Checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/checkout/checkout.component')
        .then(m => m.CheckoutComponent)
  },

  {
    path: 'details/:slug/:id',
    title: 'Freshcart | Product Details',
    loadComponent: () =>
      import('./features/details/details.component')
        .then(m => m.DetailsComponent)
  },

  {
    path: 'orders',
    title: 'Freshcart | Orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/orders.component')
        .then(m => m.OrdersComponent)
  },

  {
    path: 'allorders',
    pathMatch: 'full',
    redirectTo: 'orders'
  },

  {
    path: 'shop',
    pathMatch: 'full',
    redirectTo: 'products'
  },

  {
    path: 'wishlist',
    title: 'Freshcart | Wishlist',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/wishlist/wishlist.component')
        .then(m => m.WishlistComponent)
  },

  {
    path: 'forgot-password',
    title: 'Freshcart | Forgot Password',
    loadComponent: () =>
      import('./features/forgot-password/forgot-password.component')
        .then(m => m.ForgotPasswordComponent)
  },

  {
    path: 'login',
    title: 'Freshcart | Login',
    loadComponent: () =>
      import('./features/login/login.component')
        .then(m => m.LoginComponent)
  },

  {
    path: 'register',
    title: 'Freshcart | Register',
    loadComponent: () =>
      import('./features/register/register.component')
        .then(m => m.RegisterComponent)
  },

  {
    path: 'change-password',
    title: 'Freshcart | Change Password',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/change-password/change-password.component')
        .then(m => m.ChangePasswordComponent)
  },

  {
    path: '**',
    title: 'Freshcart | Page Not Found',
    loadComponent: () =>
      import('./features/not-found/not-found.component')
        .then(m => m.NotFoundComponent)
  }

];