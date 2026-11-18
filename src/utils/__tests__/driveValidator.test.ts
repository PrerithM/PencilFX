import { describe, it, expect } from 'vitest';
import { validateGoogleDriveUrl } from '../driveValidator';

describe('Google Drive URL Validator', () => {
  it('validates standard Google Drive file URL', () => {
    const url = 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing';
    const res = validateGoogleDriveUrl(url);
    expect(res.isValid).toBe(true);
    expect(res.fileId).toBe('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
    expect(res.isFolder).toBe(false);
  });

  it('validates Google Drive folder URL', () => {
    const url = 'https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456?usp=sharing';
    const res = validateGoogleDriveUrl(url);
    expect(res.isValid).toBe(true);
    expect(res.fileId).toBe('1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456');
    expect(res.isFolder).toBe(true);
  });

  it('rejects invalid or non-drive URLs', () => {
    const res1 = validateGoogleDriveUrl('https://example.com/document.pdf');
    expect(res1.isValid).toBe(false);

    const res2 = validateGoogleDriveUrl('');
    expect(res2.isValid).toBe(false);
  });
});
