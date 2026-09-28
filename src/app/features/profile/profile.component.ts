import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { afterNextRender, Component, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/auth/services/auth.service';
import { ProfileUserData } from '../../core/models/user-data.interface';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastrService = inject(ToastrService);

  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly loadError = signal('');
  readonly storageMessage = signal('');
  readonly userId = signal('');
  readonly role = signal('');
  readonly profileForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3),
      (control) => typeof control.value === 'string' && control.value.trim().length >= 3
        ? null : { minlength: true }]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
  });

  constructor() {
    afterNextRender(() => this.loadProfile());
  }

  loadProfile(): void {
    if (!isPlatformBrowser(this.platformId) || this.isSubmitting()) return;
    this.isLoading.set(true);
    this.loadError.set('');
    this.authService.verifyToken().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isLoading.set(false)),
    ).subscribe({
      next: response => {
        const identity = response.decoded;
        if (typeof identity?.id !== 'string' || !identity.id) {
          this.loadError.set('Unable to verify your account identity. Please sign in again.');
          return;
        }
        this.userId.set(identity.id);
        const cached = this.readCachedUser(identity.id);
        this.role.set(typeof identity.role === 'string' ? identity.role : cached.role ?? '');
        this.profileForm.reset({
          name: cached.name ?? (typeof identity.name === 'string' ? identity.name : ''),
          email: cached.email ?? '',
          phone: cached.phone ?? '',
        });
      },
      error: error => this.loadError.set(this.errorText(error, 'Unable to load your profile. Please try again.')),
    });
  }

  private readCachedUser(userId: string): Partial<ProfileUserData> {
    // Called only after browser-side token verification. No current-user read API is documented.
    if (!isPlatformBrowser(this.platformId)) return {};
    try {
      const value: unknown = this.authService.profileUser()
        ?? JSON.parse(localStorage.getItem('userData') ?? 'null');
      if (!value || typeof value !== 'object') return {};
      const user = value as Record<string, unknown>;
      if (typeof user['_id'] === 'string' && user['_id'] !== userId) return {};
      return {
        name: typeof user['name'] === 'string' ? user['name'] : undefined,
        email: typeof user['email'] === 'string' ? user['email'] : undefined,
        phone: typeof user['phone'] === 'string' ? user['phone'] : undefined,
        role: typeof user['role'] === 'string' ? user['role'] : undefined,
      };
    } catch {
      return {};
    }
  }

  fieldError(field: keyof typeof this.profileForm.controls): string {
    const control = this.profileForm.controls[field];
    if (!control.invalid || !(control.touched || control.dirty)) return '';
    if (control.hasError('required')) return 'This field is required.';
    if (field === 'name') return 'Enter at least 3 characters.';
    if (field === 'email') return 'Enter a valid email address.';
    return 'Enter a valid 11-digit Egyptian mobile number.';
  }

  submit(): void {
    if (!isPlatformBrowser(this.platformId) || this.isSubmitting() || this.isLoading() || this.loadError() || !this.userId()) return;
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) return;
    const form = this.profileForm.getRawValue();
    const request = { name: form.name.trim(), email: form.email.trim(), phone: form.phone };
    this.errorMessage.set('');
    this.storageMessage.set('');
    this.isSubmitting.set(true);
    this.authService.updateLoggedUserData(request).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isSubmitting.set(false)),
    ).subscribe({
      next: response => {
        const user: ProfileUserData = {
          ...response.user,
          _id: this.userId(),
          phone: response.user.phone ?? request.phone,
        };
        this.role.set(user.role);
        this.profileForm.reset({ name: user.name, email: user.email, phone: user.phone ?? '' });
        this.authService.profileUser.set(user);
        try {
          // submit() is browser-guarded; preserve the token unless the API returns a replacement.
          if (response.token) localStorage.setItem('freshToken', response.token);
          localStorage.setItem('userData', JSON.stringify(user));
        } catch {
          this.storageMessage.set('Your profile was saved, but this browser could not refresh your stored session. Please sign in again if needed.');
        }
        this.toastrService.success('Profile updated successfully.', 'Fresh Cart');
      },
      error: error => this.errorMessage.set(this.errorText(error, 'Unable to update your profile. Please try again.')),
    });
  }

  private errorText(error: unknown, fallback: string): string {
    // The shared interceptor already shows HTTP error toasts.
    if (error instanceof HttpErrorResponse) {
      return typeof error.error?.message === 'string' ? error.error.message : fallback;
    }
    const message = error instanceof Error ? error.message : fallback;
    this.toastrService.error(message, 'Fresh Cart');
    return message;
  }
}
