import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_SETTINGS } from '../../../../shared/app-settings';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_SETTINGS, useValue: { apiBaseUrl: 'http://127.0.0.1:8000', useMock: false } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('renders login fields and emits after valid authentication', () => {
    const emitted: boolean[] = [];
    fixture.componentInstance.loginSuccess.subscribe(() => emitted.push(true));

    fixture.componentInstance.form.setValue({ usuario: 'admin', senha: 'admin' });
    fixture.componentInstance.submit();

    const request = httpMock.expectOne((req) => req.method === 'POST' && req.url.endsWith('/auth/login'));
    request.flush({ token: 'mock-token-admin', usuario: 'admin' });

    expect(emitted).toEqual([true]);
  });
});
