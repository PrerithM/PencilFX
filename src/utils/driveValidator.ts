/**
 * Google Drive URL Validator & Inspection Utility
 */

export interface DriveValidationResult {
  isValid: boolean;
  fileId?: string;
  isFolder: boolean;
  cleanUrl: string;
  error?: string;
}

// Regex patterns for standard Google Drive share links
const FILE_PATTERN = /https?:\/\/(?:drive|docs)\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]{25,})/;
const FOLDER_PATTERN = /https?:\/\/(?:drive|docs)\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]{25,})/;
const GENERIC_DRIVE = /https?:\/\/(?:drive|docs)\.google\.com\/.+/;

export function validateGoogleDriveUrl(url: string): DriveValidationResult {
  const trimmed = url.trim();
  if (!trimmed) {
    return {
      isValid: false,
      isFolder: false,
      cleanUrl: '',
      error: 'Drive link cannot be empty.',
    };
  }

  // Check file pattern
  const fileMatch = trimmed.match(FILE_PATTERN);
  if (fileMatch && fileMatch[1]) {
    return {
      isValid: true,
      fileId: fileMatch[1],
      isFolder: false,
      cleanUrl: `https://drive.google.com/file/d/${fileMatch[1]}/view?usp=sharing`,
    };
  }

  // Check folder pattern
  const folderMatch = trimmed.match(FOLDER_PATTERN);
  if (folderMatch && folderMatch[1]) {
    return {
      isValid: true,
      fileId: folderMatch[1],
      isFolder: true,
      cleanUrl: `https://drive.google.com/drive/folders/${folderMatch[1]}?usp=sharing`,
    };
  }

  // Check if it's a Drive URL but non-standard format
  if (GENERIC_DRIVE.test(trimmed)) {
    return {
      isValid: true,
      isFolder: false,
      cleanUrl: trimmed,
    };
  }

  return {
    isValid: false,
    isFolder: false,
    cleanUrl: trimmed,
    error: 'Please enter a valid Google Drive link (e.g., https://drive.google.com/file/d/... or folders/...).',
  };
}
