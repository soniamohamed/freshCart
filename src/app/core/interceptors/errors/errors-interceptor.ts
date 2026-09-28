import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError,throwError } from 'rxjs';

export const errorsInterceptor: HttpInterceptorFn = (req, next) => {
  
 
 const toastrService = inject(ToastrService);

  return next(req).pipe(catchError((err: HttpErrorResponse) => {
      // 2. استخدامها مباشرة هنا بدون تكرار inject()
      toastrService.error(err.error.message, 'Fresh Cart', {
        closeButton: true,
         timeOut: 3000,
        progressBar: true
      });
      return throwError(() => err);
    })
  );
};
