import { Router, RouterLink } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl,FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/services/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
@Component({
  imports: [RouterLink,ReactiveFormsModule],
  selector: 'app-register',
  styleUrl: './register.component.css',
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {

  private readonly fb=inject(FormBuilder);
  private readonly authService=inject(AuthService);
  private readonly router=inject(Router);
 registerSub$ : Subscription=new Subscription();
 private loading:boolean=false;
 registerForm !: FormGroup;


 ngOnInit(): void {
    this.registerFormInit();
  }

  
 registerFormInit():void{ 
   this.registerForm=this.fb.group({
   name: ['',  [Validators.required,Validators.minLength(3)]],
   email: ['',[Validators.required,Validators.email]],
   password: ['',[Validators.required
  ,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
  rePassword: ['',[Validators.required]],
 phone: ['',[Validators.required,Validators.pattern(/^01[0125][0-9]{8}$/)]],
}, { updateOn :'submit',
  validators:[this.confirmPassword]}
);
}
  
//AbstractControl is base class inside it groupform,controleform,arrayform
confirmPassword(group:AbstractControl)

{
// check pass !== rePass set error in repass controle called[mismatch]
//else return nll or do nothing
const password=group.get('password')?.value;
const rePassword=group.get('rePassword')?.value;
if (password !== rePassword && rePassword!='')
{
  group.get('rePassword')?.setErrors({mismatch:true});
  return {mismatch:true};
}
else 
{
  return null;
}
}

submitForm(): void{
  
   if (this.registerForm.valid)
   {
     this.loading=true;
    this.registerSub$.unsubscribe();
   this.registerSub$= this.authService.signUp(this.registerForm.value).subscribe({
    next: (res) => {
          console.log('SUCCESS RESPONSE:', res);

          if (res.message=='success') {
            console.log('Registration successful');
            this.registerForm.reset();
           this.loading=false;
          //  console.log(res);
         // redirect to login
          setTimeout(() => {
            this.router.navigate(['/login']);
          },500); }
       },
 
    });
 // console.log(this.registerForm.value);

 }
  else
     {
     this.loading=false;
      //show all errors to user
      this.registerForm.markAllAsTouched();
     
     }
  
}
}


