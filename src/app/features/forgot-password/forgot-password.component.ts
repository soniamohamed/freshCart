import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  imports: [ReactiveFormsModule,RouterLink],
  selector: 'app-forgot-password',
  styleUrl: './forgot-password.component.css',
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  step: WritableSignal<number> = signal<number>(1);
  private readonly authService=inject(AuthService);
  private readonly router=inject(Router);
  // التصحيح: القيمة الأولى '' وحدها، ثم الـ Validators في مصفوفة مستقلة
  emailControle: WritableSignal<FormControl> = signal<FormControl>(
    new FormControl('', [Validators.required, Validators.email])
  );
  
  newPasswordControle: WritableSignal<FormControl> = signal<FormControl>(
    new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ])
  );
    
  resetCodeControle: WritableSignal<FormControl> = signal<FormControl>(
    new FormControl('', [Validators.required])
  );

  submitEmaile(e: SubmitEvent): void {
    e.preventDefault();
    if (this.emailControle().valid) {
      const data = { email: this.emailControle().value };
      // call Api
        this.authService.forgotPassword(data).subscribe({
        next:(res)=>{
          if(res.statusMsg=='success')
          {
            this.step.set(2);
          }
        },
         error:(err)=>
          {
            console.log(err);
          },
      });
    }
  }

  submitResetCode(e: SubmitEvent): void {
    e.preventDefault();
    if (this.resetCodeControle().valid) {
      const data = { resetCode: this.resetCodeControle().value };
      // call Api
         this.authService.verifyResetCode(data).subscribe({
        next:(res)=>{
          if(res.status=='Success')
          {
            this.step.set(3);
          }
        },
         error:(err)=>
          {
            console.log(err);
          },
      });
    }
  }
  
  submitNewPassword(e: SubmitEvent): void {
    e.preventDefault();
    if (this.newPasswordControle().valid) {
      const data = { 
        email: this.emailControle().value,
        newPassword: this.newPasswordControle().value 
      };
      // call Api
       this.authService.resetPassword(data).subscribe({
        next:(res)=>{
        
       setTimeout(() => {
            this.router.navigate(['/login']);
          }, 500);
        
        },
         error:(err)=>
          {
            console.log(err);
          },
      });
    }    
  }
}