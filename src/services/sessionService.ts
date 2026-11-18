import { StudentSession } from '../types';

const STUDENT_SESSION_KEY = 'pencilfx_student_session';
const ADMIN_SESSION_KEY = 'pencilfx_admin_session';

/**
 * Generate unique IDs:
 * Student ID format: STU-XXXXXXXX (8 hex chars)
 * Tracking Token format: tok_xxxxxxxxxxxx (12 hex chars)
 * Order ID format: PFX-YYYY-XXXXX (5 digit random)
 */
export function generateStudentId(): string {
  const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
  return `STU-${randomHex}`;
}

export function generateTrackingToken(): string {
  const randomHex = Math.random().toString(16).substring(2, 14);
  return `tok_${randomHex}`;
}

export function generateOrderId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `PFX-${year}-${randomNum}`;
}

/**
 * Student Session Management (localStorage)
 */
export function getOrCreateStudentSession(): StudentSession {
  try {
    const raw = localStorage.getItem(STUDENT_SESSION_KEY);
    if (raw) {
      const parsed: StudentSession = JSON.parse(raw);
      parsed.lastActiveAt = new Date().toISOString();
      localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(parsed));
      return parsed;
    }
  } catch (err) {
    console.warn('Could not read student session, creating new one', err);
  }

  const newSession: StudentSession = {
    studentId: generateStudentId(),
    displayName: '',
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    sessionOrderIds: [],
  };

  try {
    localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(newSession));
  } catch (err) {
    console.error('Failed to save student session', err);
  }

  return newSession;
}

export function updateStudentSession(updates: Partial<StudentSession>): StudentSession {
  const current = getOrCreateStudentSession();
  const updated: StudentSession = {
    ...current,
    ...updates,
    lastActiveAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update student session', err);
  }

  return updated;
}

export function recordOrderInSession(orderId: string): void {
  const session = getOrCreateStudentSession();
  if (!session.sessionOrderIds.includes(orderId)) {
    session.sessionOrderIds = [orderId, ...session.sessionOrderIds];
    updateStudentSession({ sessionOrderIds: session.sessionOrderIds });
  }
}

export function clearStudentSession(): StudentSession {
  try {
    localStorage.removeItem(STUDENT_SESSION_KEY);
  } catch (err) {
    console.error('Failed to clear student session', err);
  }
  return getOrCreateStudentSession();
}

/**
 * Shopkeeper Admin Session Management (sessionStorage with TTL)
 */
interface AdminSessionData {
  authenticated: boolean;
  loginTime: number; // ms timestamp
  expiresAt: number; // ms timestamp
}

// In-memory fallback for environments without browser storage (e.g. Node / Vitest)
let memoryAdminSession: AdminSessionData | null = null;

export function isAdminAuthenticated(_sessionExpiryMinutes = 30): boolean {
  try {
    if (typeof sessionStorage !== 'undefined') {
      const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
      if (!raw) return false;
      const session: AdminSessionData = JSON.parse(raw);
      if (Date.now() > session.expiresAt) {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        return false;
      }
      return session.authenticated;
    } else if (memoryAdminSession) {
      if (Date.now() > memoryAdminSession.expiresAt) {
        memoryAdminSession = null;
        return false;
      }
      return memoryAdminSession.authenticated;
    }
    return false;
  } catch {
    return false;
  }
}

export function loginAdmin(pin: string, validPin: string, sessionExpiryMinutes = 30): boolean {
  if (pin === validPin) {
    const sessionData: AdminSessionData = {
      authenticated: true,
      loginTime: Date.now(),
      expiresAt: Date.now() + sessionExpiryMinutes * 60 * 1000,
    };
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
      } else {
        memoryAdminSession = sessionData;
      }
      return true;
    } catch (e) {
      console.error('Failed to store admin session', e);
    }
  }
  return false;
}

export function logoutAdmin(): void {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
    memoryAdminSession = null;
  } catch (e) {
    console.error('Failed to clear admin session', e);
  }
}
