import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, DestroyRef, ElementRef, inject, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AddressesService } from '../../core/services/addresses/addresses.service';
import { Address, addressListFromResponse } from '../../core/models/address-data.interface';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Validate trimmed text without modifying the user's input as they type.
const trimmedMinLength = (length: number): ValidatorFn => control =>
  typeof control.value === 'string' && control.value.trim().length >= length
    ? null
    : { trimmedMinLength: true };

@Component({
  selector: 'app-addresses',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './addresses.component.html',
  styleUrl: './addresses.component.css',
})
export class AddressesComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly addressesService = inject(AddressesService);
  private readonly toastrService = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly addressDialog = viewChild<ElementRef<HTMLDialogElement>>('addressDialog');

  readonly isAddressModalOpen = signal(false);
  readonly errorMessage = signal('');
  readonly addressesList = signal<Address[]>([]);
  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly deletingAddressId = signal<string | null>(null);
  readonly loadError = signal('');

  constructor() {
    afterNextRender(() => this.loadAddresses());
  }

  loadAddresses(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.isLoading.set(true);
    this.loadError.set('');
    this.addressesService.getLoggedUserAddresses().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: response => this.addressesList.set(response.data),
      error: error => this.loadError.set(this.apiError(error, 'Unable to load your addresses. Please try again.')),
    });
  }

  readonly addressForm = this.formBuilder.nonNullable.group({
    addressName: ['', [Validators.required, trimmedMinLength(2)]],
    details: ['', [Validators.required, trimmedMinLength(10)]],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    city: ['', [Validators.required, trimmedMinLength(1)]],
  });

  openAddressModal(): void {
    if (!isPlatformBrowser(this.platformId) || this.isAddressModalOpen() || this.isSubmitting() || this.deletingAddressId() || this.isLoading()) return;
    this.addressForm.reset();
    this.errorMessage.set('');
    this.addressDialog()?.nativeElement.showModal();
    this.isAddressModalOpen.set(true);
  }

  closeAddressModal(): void {
    if (!isPlatformBrowser(this.platformId) || this.isSubmitting()) return;
    this.addressDialog()?.nativeElement.close();
    this.onModalClosed();
  }

  onModalClosed(): void {
    this.isAddressModalOpen.set(false);
    this.errorMessage.set('');
  }

  closeOnBackdrop(event: MouseEvent): void {
    if (event.target === this.addressDialog()?.nativeElement) this.closeAddressModal();
  }

  fieldError(field: keyof typeof this.addressForm.controls): string {
    const control = this.addressForm.controls[field];
    if (!control.invalid || !(control.touched || control.dirty)) return '';
    if (control.hasError('required')) return 'This field is required.';
    if (field === 'phone') return 'Enter a valid 11-digit Egyptian mobile number.';
    if (field === 'addressName') return 'Enter at least 2 characters.';
    if (field === 'details') return 'Enter at least 10 characters.';
    return 'Enter a city name.';
  }

  submit(): void {
    if (!isPlatformBrowser(this.platformId) || this.isSubmitting() || this.deletingAddressId() || this.isLoading()) return;
    this.addressForm.markAllAsTouched();
    if (this.addressForm.invalid) return;
    const form = this.addressForm.getRawValue();
    this.errorMessage.set('');
    this.isSubmitting.set(true);
    this.addressesService.addAddress({
      name: form.addressName.trim(), details: form.details.trim(),
      phone: form.phone, city: form.city.trim(),
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: response => {
        this.isSubmitting.set(false);
        this.closeAddressModal();
        this.addressForm.reset();
        const addresses = addressListFromResponse(response);
        if (addresses) {
          this.addressesList.set(addresses);
          this.loadError.set('');
        } else this.loadAddresses();
        this.toastrService.success('Address added successfully.', 'Fresh Cart');
      },
      error: error => this.errorMessage.set(this.apiError(error, 'Unable to add your address. Please try again.')),
    });
  }

  removeAddress(address: Address): void {
    if (!isPlatformBrowser(this.platformId) || this.deletingAddressId() || this.isSubmitting() || this.isLoading()) return;
    this.loadError.set('');
    this.deletingAddressId.set(address._id);
    this.addressesService.removeAddress(address._id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.deletingAddressId.set(null))
    ).subscribe({
      next: () => {
        this.addressesList.update(addresses => addresses.filter(item => item._id !== address._id));
        this.toastrService.success('Address deleted successfully.', 'Fresh Cart');
      },
      error: error => this.loadError.set(this.apiError(error, 'Unable to delete your address. Please try again.')),
    });
  }

  private apiError(error: unknown, fallback: string): string {
    // HTTP errors already produce a toast in the existing errors interceptor.
    if (error instanceof HttpErrorResponse) {
      return typeof error.error?.message === 'string' ? error.error.message : fallback;
    }
    const message = error instanceof Error ? error.message : fallback;
    this.toastrService.error(message, 'Fresh Cart');
    return message;
  }
}
