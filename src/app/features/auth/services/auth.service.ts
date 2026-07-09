import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, tap, throwError } from 'rxjs';
import { APP_SETTINGS } from '../../../shared/app-settings';

const MOCK_DELAY_MS = 200;

export interface LoginPayload {
  usuario: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly settings = inject(APP_SETTINGS);

  get usuario(): string {
    return localStorage.getItem('auth_user') ?? '';
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    const request$ = this.settings.useMock ? this.loginMock(payload) : this.loginBackend(payload);

    return request$.pipe(
      tap((response) => {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', response.usuario);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem('auth_token'));
  }

  private loginBackend(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.settings.apiBaseUrl}/auth/login`, payload);
  }

  private loginMock(payload: LoginPayload): Observable<LoginResponse> {
    if (payload.usuario === 'admin' && payload.senha === 'admin') {
      return of({ token: 'mock-token-admin', usuario: 'admin' }).pipe(delay(MOCK_DELAY_MS));
    }

    return throwError(() => new Error('Usuario ou senha invalidos.')).pipe(delay(MOCK_DELAY_MS));
  }
}
