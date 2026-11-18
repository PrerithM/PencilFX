import { describe, it, expect } from 'vitest';
import { calculatePrintCost } from '../pricing';

describe('Print Pricing Calculation', () => {
  it('calculates single-sided B&W correctly', () => {
    const res = calculatePrintCost({
      pageCount: 10,
      colorMode: 'bw',
      sides: 'single',
      paperSize: 'A4',
      finishing: 'staple',
      copies: 1,
    });
    // 10 pages * 2.0 = 20
    expect(res.totalCost).toBe(20.0);
    expect(res.ratePerPage).toBe(2.0);
  });

  it('calculates double-sided B&W discount correctly', () => {
    const res = calculatePrintCost({
      pageCount: 10,
      colorMode: 'bw',
      sides: 'double',
      paperSize: 'A4',
      finishing: 'staple',
      copies: 1,
    });
    // 10 pages * 1.5 = 15
    expect(res.totalCost).toBe(15.0);
    expect(res.ratePerPage).toBe(1.5);
  });

  it('calculates spiral binding and multiple copies correctly', () => {
    const res = calculatePrintCost({
      pageCount: 20,
      colorMode: 'color',
      sides: 'single',
      paperSize: 'A4',
      finishing: 'spiral', // +25
      copies: 2,
    });
    // (20 * 8.0 + 25) * 2 = (160 + 25) * 2 = 370
    expect(res.totalCost).toBe(370.0);
  });

  it('applies 2x multiplier for A3 paper size', () => {
    const res = calculatePrintCost({
      pageCount: 5,
      colorMode: 'bw',
      sides: 'single',
      paperSize: 'A3',
      finishing: 'none',
      copies: 1,
    });
    // 5 * 2.0 * 2.0 = 20
    expect(res.totalCost).toBe(20.0);
    expect(res.sizeMultiplier).toBe(2.0);
  });
});
