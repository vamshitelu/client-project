import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../environments/environment';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.scorApiUrl)) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: {
      userName: 'test-user',
      'X-Auth-Token': 'TVj2UnhvaxdS-2KTHaBag4NxL_Cn4cKn1GuCu0Ia39U',
    },
  }));
};