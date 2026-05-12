
/**
 * Tunisian Payroll Engine Logic
 * Scale 2024 (approximate)
 */

export interface PayrollResult {
  brut: number;
  net: number;
  cnss: number;
  irpp: number;
  transportBonus: number;
  presenceBonus: number;
}

const CNSS_RATE = 0.0918;

// IRPP Brackets 2024 (Annual)
const IRPP_BRACKETS = [
  { max: 5000, rate: 0 },
  { max: 20000, rate: 0.26 },
  { max: 30000, rate: 0.28 },
  { max: 50000, rate: 0.32 },
  { max: Infinity, rate: 0.35 }
];

export function calculateSalary(
  brut: number, 
  transportBonus = 100, 
  presenceBonus = 50
): PayrollResult {
  // CNSS deduction
  const cnss = brut * CNSS_RATE;
  const netBeforeTax = brut - cnss + transportBonus + presenceBonus;

  // Monthly taxable base (estimated annual)
  const taxableAnnual = (brut - cnss) * 12;
  
  let irppAnnual = 0;
  let remainingTaxable = taxableAnnual;
  let lastThreshold = 0;

  for (const bracket of IRPP_BRACKETS) {
    const range = bracket.max - lastThreshold;
    const taxableInRange = Math.min(range, Math.max(0, taxableAnnual - lastThreshold));
    irppAnnual += taxableInRange * bracket.rate;
    lastThreshold = bracket.max;
  }

  const irppMonthly = irppAnnual / 12;
  const net = netBeforeTax - irppMonthly;

  return {
    brut,
    net: Math.round(net * 1000) / 1000,
    cnss: Math.round(cnss * 1000) / 1000,
    irpp: Math.round(irppMonthly * 1000) / 1000,
    transportBonus,
    presenceBonus
  };
}
