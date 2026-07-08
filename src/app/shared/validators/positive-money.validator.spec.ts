import { FormControl } from '@angular/forms';
import { positiveMoneyValidator } from './positive-money.validator';

describe('positiveMoneyValidator', () => {
  it('accepts pt-BR monetary values greater than zero', () => {
    const control = new FormControl('1.234,56');

    const result = positiveMoneyValidator()(control);

    expect(result).toBeNull();
  });

  it('rejects zero and negative values', () => {
    const zero = new FormControl('0,00');
    const negative = new FormControl('-10,00');

    expect(positiveMoneyValidator()(zero)).toEqual({ positiveMoney: true });
    expect(positiveMoneyValidator()(negative)).toEqual({ positiveMoney: true });
  });
});
