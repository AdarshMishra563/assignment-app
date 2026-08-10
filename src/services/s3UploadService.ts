import { apiClient } from '../api/client';
import { Platform } from 'react-native';

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface UploadResult {
  publicUrl: string;
  fileKey: string;
}

/**
 * Upload a local file (from picker) to AWS S3 via presigned URL.
 * Works with React Native file:// and content:// URIs.
 *
 * Flow:
 *  1. Get presigned PUT URL from backend
 *  2. Read local file as blob via fetch()
 *  3. PUT blob to S3 presigned URL with XMLHttpRequest for progress tracking
 *  4. Return the public S3 URL
 */
export async function uploadMediaToS3(
  localUri: string,
  mimeType: string,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  // 1. Derive a safe filename from the URI
  const uriParts = localUri.split('/');
  const rawName = uriParts[uriParts.length - 1] || `media_${Date.now()}`;
  const fileName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');

  console.log(`📤 [S3Upload] Starting upload: ${fileName} (${mimeType})`);

  // 2. Get presigned URL from backend
  const presignedRes = await apiClient.get('/media/presigned-url', {
    params: { fileName, fileType: mimeType },
  });

  const { uploadUrl, publicUrl, fileKey } = presignedRes.data.data;
  console.log(`📤 [S3Upload] Got presigned URL, uploading to S3...`);

  // 3. Read local file as blob
  const fileResponse = await fetch(localUri);
  const blob = await fileResponse.blob();

  // 4. Upload to S3 with progress tracking via XMLHttpRequest
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && event.total > 0) {
        const percent = Math.min(100, Math.max(0, Math.round((event.loaded / event.total) * 100)));
        onProgress?.(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log(`✅ [S3Upload] Upload complete: ${publicUrl}`);
        resolve();
      } else {
        reject(new Error(`S3 upload failed with status ${xhr.status}: ${xhr.responseText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('S3 upload network error'));
    });

    xhr.addEventListener('timeout', () => {
      reject(new Error('S3 upload timed out'));
    });

    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', mimeType);
    xhr.timeout = 120000; // 2 minute timeout for large videos
    xhr.send(blob);
  });

  return { publicUrl, fileKey };
}

/**
 * Determine MIME type from file extension
 */
export function getMimeFromUri(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.mp4') || lower.endsWith('.m4v')) return 'video/mp4';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  if (lower.endsWith('.avi')) return 'video/x-msvideo';
  if (lower.endsWith('.webm')) return 'video/webm';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic';
  // Default
  return 'application/octet-stream';
}
