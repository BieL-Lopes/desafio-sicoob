import { InjectionToken } from '@angular/core';
import { environment } from '../../environments/environment';

export interface AppSettings {
  apiBaseUrl: string;
  useMock: boolean;
}

export const APP_SETTINGS = new InjectionToken<AppSettings>('APP_SETTINGS', {
  providedIn: 'root',
  factory: () => environment
});
