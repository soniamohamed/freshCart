import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/services/auth.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  imports: [RouterLink,ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.component.css',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  loginForm !: FormGroup;
private readonly authService=inject(AuthService);
private readonly router=inject(Router);
private readonly fb=inject(FormBuilder);
private readonly toastrService = inject(ToastrService);
loginSub$ : Subscription=new Subscription();
errMsg:string='';
//isSubmitted:boolean = false;
loading:boolean = false;
// كل دورها باخد نسخه من loginform وتبدأ تنشا الكنترول
//باخلي الكود شكله مترتب 
//nonNullable عشان لما اعمل reset للفورم ماترجعش ب null ترجع سترنج فاضي

loginFormInit():void{ 
this.loginForm=this.fb.nonNullable.group({
email:['',[Validators.required,Validators.email]],
password :['',[Validators.required
,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
},{ updateOn :'submit'});

}

ngOnInit(): void {
  this.loginFormInit();
}

showPassword(element:HTMLInputElement) :void 
{
  if(element.type==='password')
  {
      element.type='text'
  }
  else
    {
       element.type='password'
    }
}
submitForm(): void{
  //this.isSubmitted=true;
  console.log(this.loginForm.value);
  if (this.loginForm.valid)
  {
    this.loading=true;
    this.loginSub$.unsubscribe();
   this.loginSub$= this.authService.signIn(this.loginForm.value).subscribe({
      next: (res)=>{
       
        if(res.message=='success')
        {
          
          // save token
          localStorage.setItem('freshToken',res.token);
          //save user data
           localStorage.setItem('userData',JSON.stringify(res.user)); //JSON.stringify لان البيانات عباره عن اوبجكت عشان نحولها لسترنج 
           this.loginForm.reset();
           this.loading=false;
          
         
        // redirect to home
          // setTimeout(() => {
          //   this.router.navigate(['/']);
          // }, 500);
         this.toastrService.success(res.message, 'Fresh Cart', {
        closeButton: true,
         timeOut: 3000,
        progressBar: true
      });
         this.authService.isLogged.set(true);
          console.log(this.authService.isLogged());
          this.router.navigate(['/']); 
          
            
        }
       
      }
     // ,
    
      // complete:()=>{
      //      this.loading=false;
      // }
     
    });
  }
  else
    {
       this.loading=false;
      //show all errors to user
      
      this.loginForm.markAllAsTouched();
     
    }
}

}
