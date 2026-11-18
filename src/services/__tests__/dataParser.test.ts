import { describe, it, expect } from 'vitest';
import {
  generateStudentId,
  generateTrackingToken,
  generateOrderId,
  loginAdmin,
} from '../sessionService';

describe('Session Service Tests', () => {
  it('generates student ID matching STU-XXXXXXXX pattern', () => {
    const studentId = generateStudentId();
    expect(studentId).toMatch(/^STU-[0-9A-F]{8}$/);
  });

  it('generates random tracking token matching tok_xxxxxxxxxxxx pattern', () => {
    const token = generateTrackingToken();
    expect(token).toMatch(/^tok_[0-9a-f]{12}$/);
  });

  it('generates unique order ID matching PFX-YYYY-XXXXX format', () => {
    const currentYear = new Date().getFullYear();
    const orderId = generateOrderId();
    expect(orderId).toMatch(new RegExp(`^PFX-${currentYear}-\\d{5}$`));
  });

  it('authenticates admin with valid PIN and rejects invalid PIN', () => {
    const success = loginAdmin('1234', '1234', 30);
    expect(success).toBe(true);

    const failure = loginAdmin('wrong_pin', '1234', 30);
    expect(failure).toBe(false);
  });
});
