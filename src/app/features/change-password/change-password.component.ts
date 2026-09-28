import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  inject,
  PLATFORM_ID
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import { finalize } from 'rxjs';

import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  imports: [
    ReactiveFormsModule
  ],
  selector: 'app-change-password',
  styleUrl: './change-password.component.css',
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {

  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly platformId = inject(PLATFORM_ID);

  readonly CHANGE_PASSWORD = {
    TITLE: 'Change Password',
    DESCRIPTION: 'Update your account password',

    CURRENT_PASSWORD: 'Current Password',
    NEW_PASSWORD: 'New Password',
    CONFIRM_NEW_PASSWORD: 'Confirm New Password',

    CURRENT_PASSWORD_REQUIRED: 'Current password is required.',
    NEW_PASSWORD_REQUIRED: 'New password is required.',
    NEW_PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters.',
    NEW_PASSWORD_PATTERN:
      'Password must contain uppercase, lowercase, number and special character.',

    CONFIRM_PASSWORD_REQUIRED: 'Please confirm your new password.',
    PASSWORD_MISMATCH: 'Passwords do not match.',
    SAME_PASSWORD:
      'New password must be different from your current password.',

    SHOW_CURRENT_PASSWORD: 'Show current password',
    HIDE_CURRENT_PASSWORD: 'Hide current password',

    SHOW_NEW_PASSWORD: 'Show new password',
    HIDE_NEW_PASSWORD: 'Hide new password',

    SHOW_CONFIRM_PASSWORD: 'Show confirm password',
    HIDE_CONFIRM_PASSWORD: 'Hide confirm password',

    UPDATE_PASSWORD: 'Change Password',
    UPDATING: 'Updating...'
  };

  readonly changePasswordForm = this.formBuilder.nonNullable.group(
    {
      currentPassword: [
        '',
        [
          Validators.required
        ]
      ],

      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/[A-Z]/),
          Validators.pattern(/[a-z]/),
          Validators.pattern(/\d/),
          Validators.pattern(/[^A-Za-z0-9]/)
        ]
      ],

      confirmPassword: [
        '',
        [
          Validators.required
        ]
      ]
    },
    {
      validators: this.passwordRelationshipValidator()
    }
  );

  isSubmitting = false;

  successMessage = '';
  errorMessage = '';

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // =====================================================
  // Submit
  // =====================================================

  submit(): void {

    if (this.isSubmitting) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';

    if (this.changePasswordForm.invalid) {

      this.changePasswordForm.markAllAsTouched();

      return;
    }

    const {
      currentPassword,
      newPassword
    } = this.changePasswordForm.getRawValue();

    this.isSubmitting = true;

    this.authService
      .updateLoggedUserPassword(currentPassword, newPassword)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({

        next: (response) => {

          // Freshcart uses freshToken
          if (
            response.token &&
            isPlatformBrowser(this.platformId)
          ) {

            localStorage.setItem(
              'freshToken',
              response.token
            );

          }

          this.successMessage =
            response.message ||
            'Password updated successfully.';

          this.changePasswordForm.reset({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });

          this.showCurrentPassword = false;
          this.showNewPassword = false;
          this.showConfirmPassword = false;
        },

        error: (error: HttpErrorResponse) => {

          this.errorMessage =
            error.error?.message ||
            error.message ||
            'Unable to update password. Please try again.';

        }

      });

  }

  // =====================================================
  // Password Relationship Validator
  // =====================================================

  private passwordRelationshipValidator(): ValidatorFn {

    return (
      control: AbstractControl
    ): ValidationErrors | null => {

      const currentPassword =
        control.get('currentPassword')?.value;

      const newPassword =
        control.get('newPassword')?.value;

      const confirmPassword =
        control.get('confirmPassword')?.value;

      const errors: ValidationErrors = {};

      // New password must be different
      if (
        currentPassword &&
        newPassword &&
        currentPassword === newPassword
      ) {

        errors['samePassword'] = true;

      }

      // Confirm password must match
      if (
        newPassword &&
        confirmPassword &&
        newPassword !== confirmPassword
      ) {

        errors['passwordMismatch'] = true;

      }

      return Object.keys(errors).length
        ? errors
        : null;

    };

  }

}