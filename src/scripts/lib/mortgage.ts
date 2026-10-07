/**
 * Mortgage maths (DESIGN.md 10.14). Pure functions, shared by the server-rendered default and the live script.
 * M = P·r·(1+r)^n / ((1+r)^n − 1), r = rate/12/100, n = years·12, P = price − down; r = 0 gives M = P/n.
 * Principal and interest only: no tax, insurance or HOA.
 */

/** priceMax: the dearest home this site would list is far below it; above it the figures stop meaning anything. */
export const LIMITS = { priceMax: 100_000_000, downMin: 0, downMax: 60, rateMin: 0, rateMax: 15, rateStep: 0.05 } as const;
export const TERMS = [15, 20, 30] as const;

export interface MortgageInput {
  price: number;
  downPercent: number;
  rate: number;
  years: number;
}

export interface MortgageResult {
  loan: number;
  down: number;
  monthly: number;
  totalPaid: number;
  totalInterest: number;
}

export type MortgageError = 'price' | 'priceMax' | 'rate' | null;

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const SUFFIX = { k: 1e3, m: 1e6 } as const;

/** "1,250,000", "$1,250,000", "$1.25m" or "950k" to whole dollars; NaN for anything else (shows the price error). */
export function parseMoney(text: string): number {
  const match = /^\$?\s*(\d[\d,]*(?:\.\d+)?|\.\d+)\s*([km])?$/i.exec(text.trim());
  if (!match) return Number.NaN;
  const [, digits, suffix] = match;
  const scale = suffix ? SUFFIX[suffix.toLowerCase() as keyof typeof SUFFIX] : 1;
  return Math.round(Number.parseFloat(digits.replace(/,/g, '')) * scale);
}

export function validate(input: MortgageInput): MortgageError {
  if (!Number.isFinite(input.price) || input.price <= 0) return 'price';
  if (input.price > LIMITS.priceMax) return 'priceMax';
  if (!Number.isFinite(input.rate) || input.rate < LIMITS.rateMin || input.rate > LIMITS.rateMax) return 'rate';
  return null;
}

export function monthlyPayment(principal: number, rate: number, years: number): number {
  const n = years * 12;
  if (principal <= 0 || n <= 0) return 0;
  const r = rate / 12 / 100;
  if (r === 0) return principal / n;
  const growth = (1 + r) ** n;
  return (principal * r * growth) / (growth - 1);
}

export function calculate(input: MortgageInput): MortgageResult {
  const downPercent = clamp(input.downPercent, LIMITS.downMin, LIMITS.downMax);
  const down = Math.round((input.price * downPercent) / 100);
  const loan = Math.max(0, input.price - down);
  const monthly = monthlyPayment(loan, input.rate, input.years);
  const totalPaid = monthly * input.years * 12;
  return { loan, down, monthly, totalPaid, totalInterest: Math.max(0, totalPaid - loan) };
}

export const money = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export const plainNumber = (value: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
