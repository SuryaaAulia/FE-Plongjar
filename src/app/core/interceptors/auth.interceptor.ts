import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private authService = inject(AuthService);
    private notificationService = inject(NotificationService);

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authToken = this.authService.getToken();
        let authReq = req;

        if (authToken) {
            authReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
        } else {
            authReq = req.clone({
                setHeaders: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
        }

        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401 && this.shouldTriggerLogout(req.url)) {
                    this.authService.logout();
                }

                if (error.status === 403 && this.shouldTriggerLogout(req.url)) {
                    this.notificationService.showWarning('Sesi Anda tidak valid atau hak akses telah berubah. Silakan login kembali.');
                    this.authService.logout();
                }
                return throwError(() => error);
            })
        );
    }

    private shouldTriggerLogout(url: string): boolean {
        const excludedEndpoints = [
            '/auth/login',
            '/auth/logout',
            '/auth/register',
            '/auth/refresh',
            '/auth/forgot-password',
            '/auth/reset-password'
        ];
        
        return !excludedEndpoints.some(endpoint => url.includes(endpoint));
    }
}