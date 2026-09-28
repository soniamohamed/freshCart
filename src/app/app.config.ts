import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorsInterceptor } from './core/interceptors/errors/errors-interceptor';
import { provideToastr } from 'ngx-toastr';
import { headersInterceptor } from './core/interceptors/headers/headers-interceptor';
import { NgxSpinnerModule } from "ngx-spinner";
import { loadingInterceptor } from './core/interceptors/loading/loading-interceptor';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes,
      withViewTransitions({skipInitialTransition:true}),
      withInMemoryScrolling({scrollPositionRestoration: 'top'})),
       provideClientHydration(),
       provideHttpClient(withInterceptors([errorsInterceptor,headersInterceptor,loadingInterceptor])),
       provideToastr(), // Toastr providers
       importProvidersFrom( NgxSpinnerModule)
  ]
};
