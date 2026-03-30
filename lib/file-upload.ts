import { NextRequest } from 'next/server';
import crypto from 'crypto';

export interface FileUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  maxFiles?: number;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  files?: File[];
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * Validate uploaded file
 */
export function validateFile(
  file: File,
  options: FileUploadOptions = {}
): { valid: boolean; error?: string } {
  const {
    maxSize = DEFAULT_MAX_SIZE,
    allowedTypes = DEFAULT_ALLOWED_TYPES,
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file name for malicious patterns
  const maliciousPatterns = [
    /\.\./, // Path traversal
    /[<>:"|?*]/, // Invalid filename characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(file.name)) {
      return {
        valid: false,
        error: 'Invalid file name',
      };
    }
  }

  return { valid: true };
}

/**
 * Validate multiple files
 */
export function validateFiles(
  files: File[],
  options: FileUploadOptions = {}
): FileValidationResult {
  const { maxFiles = 10 } = options;

  // Check number of files
  if (files.length > maxFiles) {
    return {
      valid: false,
      error: `Maximum ${maxFiles} files allowed`,
    };
  }

  // Validate each file
  for (const file of files) {
    const validation = validateFile(file, options);
    if (!validation.valid) {
      return {
        valid: false,
        error: validation.error,
      };
    }
  }

  return {
    valid: true,
    files,
  };
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\.\./g, '') // Remove path traversal attempts first
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .substring(0, 255); // Limit length
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Generate secure filename
 */
export function generateSecureFilename(originalName: string): string {
  const extension = getFileExtension(originalName);
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${random}.${extension}`;
}

