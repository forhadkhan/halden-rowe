import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculate, monthlyPayment, parseMoney, validate } from '../src/scripts/lib/mortgage.ts';
test('default case: $1,000,000, 20% down, 6.5%, 30 years', () => {
  const result = calculate({ price: 1_000_000, downPercent: 20, rate: 6.5, years: 30 });
  assert.equal(result.down, 200_000);
  assert.equal(result.loan, 800_000);
  assert.equal(result.monthly.toFixed(2), '5056.54');
  assert.equal(Math.round(result.totalInterest), Math.round(result.monthly * 360 - 800_000));
});

test('0% rate divides the loan evenly over the term', () => {
  assert.equal(monthlyPayment(360_000, 0, 30), 1000);
});

test('down payment is clamped to the slider range', () => {
  assert.equal(calculate({ price: 100_000, downPercent: 90, rate: 5, years: 30 }).down, 60_000);
});

test('parseMoney reads plain, comma and dollar input', () => {
  assert.equal(parseMoney('1250000'), 1_250_000);
  assert.equal(parseMoney('$1,250,000'), 1_250_000);
  assert.equal(parseMoney(' 1,250,000.40 '), 1_250_000);
});

test('parseMoney reads k and m suffixes (SQ-3: "$1.25m" used to parse as 1)', () => {
  assert.equal(parseMoney('$1.25m'), 1_250_000);
  assert.equal(parseMoney('1.25M'), 1_250_000);
  assert.equal(parseMoney('950k'), 950_000);
  assert.equal(parseMoney('$ 875 K'), 875_000);
});

test('parseMoney returns NaN for anything that is not one amount', () => {
  for (const bad of ['', 'abc', '1.2.3', '1m2', '12x', '$', 'k', '1,250,000 dollars']) {
    assert.ok(Number.isNaN(parseMoney(bad)), `expected NaN for ${JSON.stringify(bad)}`);
  }
});

test('validate flags a bad price before a bad rate', () => {
  const ok = { price: 500_000, downPercent: 20, rate: 6, years: 30 };
  assert.equal(validate(ok), null);
  assert.equal(validate({ ...ok, price: parseMoney('abc') }), 'price');
  assert.equal(validate({ ...ok, price: 0 }), 'price');
  assert.equal(validate({ ...ok, rate: 15.5 }), 'rate');
  assert.equal(validate({ ...ok, rate: -1 }), 'rate');
  assert.equal(validate({ ...ok, rate: Number.NaN }), 'rate');
  assert.equal(validate({ ...ok, price: 0, rate: 99 }), 'price');
});

test('price is capped at $100,000,000 with its own error', () => {
  const ok = { price: 100_000_000, downPercent: 20, rate: 6, years: 30 };
  assert.equal(validate(ok), null);
  assert.equal(validate({ ...ok, price: 100_000_001 }), 'priceMax');
  assert.equal(validate({ ...ok, price: parseMoney('1,385,0001.2m') }), 'priceMax', 'typed after the old value');
});

test('"1.2m" reads as $1,200,000; a half-typed "1." is incomplete (NaN), not $0', () => {
  assert.equal(parseMoney('1.2m'), 1_200_000);
  assert.equal(parseMoney('1.2 m'), 1_200_000);
  assert.ok(Number.isNaN(parseMoney('1.')));
});
