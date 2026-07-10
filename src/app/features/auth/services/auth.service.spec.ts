import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { APP_SETTINGS } from '../../../shared/app-settings';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_SETTINGS, useValue: { apiBaseUrl: 'http://127.0.0.1:8000', useMock: false } }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('stores token and user after successful login', () => {
    service.login({ usuario: 'admin', senha: 'admin' }).subscribe((response) => {
      expect(response.token).toBe('mock-token-admin');
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.usuario).toBe('admin');
    });

    const request = httpMock.expectOne((req) => req.method === 'POST' && req.url.endsWith('/auth/login'));
    expect(request.request.body).toEqual({ usuario: 'admin', senha: 'admin' });
    request.flush({ token: 'mock-token-admin', usuario: 'admin' });
  });

  it('authenticates against the local mock when useMock is enabled', fakeAsync(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_SETTINGS, useValue: { apiBaseUrl: 'http://127.0.0.1:8000', useMock: true } }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    service.login({ usuario: 'admin', senha: 'admin' }).subscribe((response) => {
      expect(response).toEqual({ token: 'mock-token-admin', usuario: 'admin' });
      expect(service.isAuthenticated()).toBeTrue();
    });

    tick(200);
    httpMock.expectNone((req) => req.url.endsWith('/auth/login'));
  }));

  it('clears the session on logout', () => {
    localStorage.setItem('auth_token', 'token');
    localStorage.setItem('auth_user', 'admin');

    service.logout();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.usuario).toBe('');
  });
});
