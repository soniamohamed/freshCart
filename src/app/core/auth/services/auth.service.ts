import { HttpClient } from '@angular/common/http';
import { Service ,WritableSignal,inject, signal} from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProfileUpdateRequest, ProfileUpdateResponse, ProfileUserData, parseProfileUpdateResponse, UserDataResponse } from '../../models/user-data.interface';
import { ForgotPasswordDataResponse } from '../../models/forgot-password-data.interface';
import { ResetPasswordDataResponse } from '../../models/reset-password-data.interface';
import { VerifyResetCodeDataResponse } from '../../models/verify-reset-code-data.interface';
import { CartService } from '../../services/cart/cart.service';
import { WishlistService } from '../../services/wishlist/wishlist.service';
import { VerifyTokenDataResponse } from '../../models/verify-token-data.interface';

@Service()
export class AuthService {
  readonly profileUser = signal<ProfileUserData | null>(null);

  updateLoggedUserData(data: ProfileUpdateRequest): Observable<ProfileUpdateResponse> {
    const { name, email, phone } = data;
    return this.httpClient.put<unknown>(`${environment.base_url}/api/v1/users/updateMe`, {
      name, email, phone,
    }).pipe(map(parseProfileUpdateResponse));
  }
     private readonly httpClient=inject(HttpClient);
   private readonly router=inject(Router);
   private readonly cartService=inject(CartService);
   private readonly wishlistService=inject(WishlistService);
   isLogged:WritableSignal <boolean>=signal<boolean>(false);
  signUp(data:object) : Observable<UserDataResponse>{
    return this.httpClient.post<UserDataResponse>(  `${environment.base_url}/api/v1/auth/signup`,data);
  }
  verifyToken():Observable<VerifyTokenDataResponse> {
    return this.httpClient.get<VerifyTokenDataResponse>(`${environment.base_url}/api/v1/auth/verifyToken`);
  }
  signIn(data:object) : Observable<UserDataResponse>{
    return this.httpClient.post<UserDataResponse>(`${environment.base_url}/api/v1/auth/signin`,data);
  }
  forgotPassword(data:object):Observable<ForgotPasswordDataResponse>
  {
     return this.httpClient.post<ForgotPasswordDataResponse>(`${environment.base_url}/api/v1/auth/forgotPasswords`,data);
  }
  verifyResetCode(data:object):Observable<VerifyResetCodeDataResponse>
  {
     return this.httpClient.post<VerifyResetCodeDataResponse>(`${environment.base_url}/api/v1/auth/verifyResetCode`,data);
  }
  resetPassword(data:object):Observable<ResetPasswordDataResponse>
  {
     return this.httpClient.put<ResetPasswordDataResponse>(`${environment.base_url}/api/v1/auth/resetPassword`,data);
  }
   updateLoggedUserPassword(
  currentPassword: string,
  newPassword: string
): Observable<UserDataResponse> {

  return this.httpClient.put<UserDataResponse>(
    `${environment.base_url}/api/v1/users/changeMyPassword`,
    {
      currentPassword: currentPassword,
      password: newPassword,
      rePassword: newPassword
    }
  );
}
  
  signOut() :void{
    this.profileUser.set(null);
    this.cartService.resetCartCount();
    this.wishlistService.resetWishlistCount();
    // delete token && userData
    localStorage.removeItem('freshToken');
    localStorage.removeItem('userData');
    // redirect to login
    this.router.navigate(['/login']);
    this.isLogged.set(false);
  }
  
}
