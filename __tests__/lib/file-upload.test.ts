import {
  validateFile,
  validateFiles,
  sanitizeFilename,
  getFileExtension,
  isImageFile,
  generateSecureFilename,
} from '@/lib/file-upload';

describe('File Upload Validation', () => {
  describe('validateFile', () => {
    it('should validate file size', () => {
      const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'test.jpg', {
        type: 'image/jpeg',
      });
      const result = validateFile(largeFile, { maxSize: 5 * 1024 * 1024 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });

    it('should validate file type', () => {
      const invalidFile = new File(['content'], 'test.exe', {
        type: 'application/x-msdownload',
      });
      const result = validateFile(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('should accept valid image files', () => {
      const validFile = new File(['content'], 'test.jpg', {
        type: 'image/jpeg',
      });
      const result = validateFile(validFile);
      expect(result.valid).toBe(true);
    });

    it('should reject files with malicious names', () => {
      const maliciousFile = new File(['content'], '../../../etc/passwd', {
        type: 'image/jpeg',
      });
      const result = validateFile(maliciousFile);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateFiles', () => {
    it('should validate multiple files', () => {
      const files = [
        new File(['content1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['content2'], 'test2.png', { type: 'image/png' }),
      ];
      const result = validateFiles(files);
      expect(result.valid).toBe(true);
      expect(result.files).toHaveLength(2);
    });

    it('should enforce max files limit', () => {
      const files = Array.from({ length: 11 }, (_, i) =>
        new File(['content'], `test${i}.jpg`, { type: 'image/jpeg' })
      );
      const result = validateFiles(files, { maxFiles: 10 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Maximum');
    });
  });

  describe('sanitizeFilename', () => {
    it('should sanitize invalid characters', () => {
      const sanitized = sanitizeFilename('test<>file|name?.jpg');
      expect(sanitized).toBe('test_file_name_.jpg');
    });

    it('should remove path traversal attempts', () => {
      const sanitized = sanitizeFilename('../../../etc/passwd');
      expect(sanitized).not.toContain('..');
    });

    it('should limit filename length', () => {
      const longName = 'a'.repeat(300) + '.jpg';
      const sanitized = sanitizeFilename(longName);
      expect(sanitized.length).toBeLessThanOrEqual(255);
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension', () => {
      expect(getFileExtension('test.jpg')).toBe('jpg');
      expect(getFileExtension('test.image.png')).toBe('png');
      expect(getFileExtension('noextension')).toBe('');
    });
  });

  describe('isImageFile', () => {
    it('should identify image files', () => {
      const imageFile = new File(['content'], 'test.jpg', {
        type: 'image/jpeg',
      });
      expect(isImageFile(imageFile)).toBe(true);
    });

    it('should reject non-image files', () => {
      const textFile = new File(['content'], 'test.txt', {
        type: 'text/plain',
      });
      expect(isImageFile(textFile)).toBe(false);
    });
  });

  describe('generateSecureFilename', () => {
    it('should generate unique filenames', () => {
      const name1 = generateSecureFilename('test.jpg');
      const name2 = generateSecureFilename('test.jpg');
      expect(name1).not.toBe(name2);
    });

    it('should preserve file extension', () => {
      const filename = generateSecureFilename('test.jpg');
      expect(filename).toMatch(/\.jpg$/);
    });

    it('should include timestamp and random string', () => {
      const filename = generateSecureFilename('test.jpg');
      expect(filename).toMatch(/^\d+-[a-f0-9]+\.jpg$/);
    });
  });
});

