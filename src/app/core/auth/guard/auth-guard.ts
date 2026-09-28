import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn ,Router} from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
   //check if token exist --true else false
  
const platform=inject(PLATFORM_ID);
  const router=inject(Router); // fun ماينفعش استخدم فيه private زي ماباعملها ف الكلاس 
  if(isPlatformBrowser(platform))
  {
    const token =localStorage.getItem('freshToken');
  if(token)
  {
      return true;
  }
  else
  {
    return router.parseUrl('/login');
  }
 
}
else {
       return true;
     }
};
