export class Money {
  private constructor(public readonly cents: number) {}

  static fromCents(cents: number): Money {
    if (!Number.isInteger(cents)) {
      throw new Error(
        'O valor monetário deve ser um número inteiro de centavos',
      );
    }

    if (cents < 0) {
      throw new Error('O valor monetário não pode ser negativo');
    }

    return new Money(cents);
  }

  add(other: Money): Money {
    return Money.fromCents(this.cents + other.cents);
  }

  subtract(other: Money): Money {
    const result = this.cents - other.cents;

    if (result < 0) {
      throw new Error('O resultado monetário não pode ser negativo');
    }

    return Money.fromCents(result);
  }

  multiply(quantity: number): Money {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error('A quantidade deve ser um inteiro não negativo');
    }

    return Money.fromCents(this.cents * quantity);
  }

  isZero(): boolean {
    return this.cents === 0;
  }
}
