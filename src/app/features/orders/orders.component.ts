import { afterNextRender, Component, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, switchMap, throwError } from 'rxjs';
import { OrdersService } from '../../core/services/orders/orders.service';
import { AuthService } from '../../core/auth/services/auth.service';
import { Order } from '../../core/models/order-data.interface';

@Component({
  imports: [CurrencyPipe, DatePipe, RouterLink],
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent {
  private readonly ordersService=inject(OrdersService);
  private readonly authService=inject(AuthService);
  private readonly activatedRoute=inject(ActivatedRoute);
  private readonly destroyRef=inject(DestroyRef);
  ordersList:WritableSignal<Order[]>=signal<Order[]>([]);
  isLoading=signal(true);
  errorMessage=signal('');
  showSuccess=signal(false);

  constructor() {
    this.activatedRoute.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.showSuccess.set(params.get('success') === 'true');
    });
    // The existing token interceptor can authenticate requests only in the browser.
    afterNextRender(() => this.getUserOrders());
  }

  getUserOrders():void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.authService.verifyToken().pipe(
      switchMap(res => {
        const userId = res.decoded?.id;
        if (typeof userId !== 'string' || !userId) {
          return throwError(() => new Error('No authenticated user ID returned'));
        }
        return this.ordersService.getUserOrders(userId);
      }),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: orders => {
        if (!Array.isArray(orders)) {
          this.errorMessage.set('The orders response was unexpected. Please try again.');
          return;
        }
        this.ordersList.set([...orders].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
      },
      error: () => this.errorMessage.set('Unable to load your orders. Please try again, or sign in again if your session has expired.')
    });
  }
}
