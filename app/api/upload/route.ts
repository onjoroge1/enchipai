import { NextRequest } from 'next/server';
import { requireAdmin, apiResponse, apiError } from '@/lib/api-utils';
import { validateFiles, sanitizeFilename, generateSecureFilename } from '@/lib/file-upload';

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return apiError('No files provided', 400);
    }

    // Validate files
    const validation = validateFiles(files, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
      ],
      maxFiles: 5,
    });

    if (!validation.valid) {
      return apiError(validation.error || 'File validation failed', 400);
    }

    // Process files (in production, upload to S3/Cloudinary)
    const uploadedFiles = files.map((file) => {
      const secureName = generateSecureFilename(file.name);
      const sanitizedOriginal = sanitizeFilename(file.name);

      return {
        originalName: sanitizedOriginal,
        secureName,
        size: file.size,
        type: file.type,
        // In production, this would be the URL after uploading to storage
        url: `/uploads/${secureName}`,
      };
    });

    // In production, upload files to storage service here
    // For now, return file metadata
    return apiResponse(
      {
        files: uploadedFiles,
        count: uploadedFiles.length,
      },
      201,
      'Files validated successfully'
    );
  } catch (error) {
    console.error('File upload error:', error);
    return apiError('Internal server error', 500);
  }
}

