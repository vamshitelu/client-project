import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../environments/environment';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const isScorRequest = request.url.startsWith(environment.scorApiUrl)
    || request.url.startsWith('/scor/')
    || request.url.startsWith('scor/');

  if (!isScorRequest) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: {
      userName: 'test-user',
      'X-Auth-Token': 'Ficxnc3nmo-kBdM4t8wC-Mlf1xSa1jbhagnjvQ6PlPo',
    },
  }));
};