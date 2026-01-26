import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection ({ eventCoalescing: true }), provideRouter(routes),

    // Configuramos el cliente HTTP para que use nuestro interceptor
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]), // Registramos el interceptor aquí
    ),

    provideAnimations(), // Habilita las animaciones en el navegador
    provideToastr({ // Esta forma es más moderna que las de proyectos anteriores 2026-01-10
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true
    }),
  ]
};
