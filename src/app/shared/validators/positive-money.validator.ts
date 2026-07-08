import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function positiveMoneyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numericValue =
      typeof value === 'number'
        ? value
        : Number(String(value).replace(/\./g, '').replace(',', '.'));

    return Number.isFinite(numericValue) && numericValue > 0 ? null : { positiveMoney: true };
  };
}
