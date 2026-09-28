import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const headersInterceptor: HttpInterceptorFn = (req, next) => {
const platformId = inject(PLATFORM_ID);


  // 1. التأكد أن الكود يعمل داخل المتصفح لتجنب خطأ الـ SSR للـ localStorage
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('freshToken');
    
    if (token) {
      req = req.clone({
        setHeaders: { token: token } // أو { Authorization: `Bearer ${token}` } حسب الـ API عندك
      });

    }
  }
  
 
  return next(req);
};
