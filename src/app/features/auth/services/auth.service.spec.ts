import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
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

  it('clears the session on logout', () => {
    localStorage.setItem('auth_token', 'token');
    localStorage.setItem('auth_user', 'admin');

    service.logout();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.usuario).toBe('');
  });
});
