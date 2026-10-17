import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  contentType: string;
}

let s3ClientInstance: S3Client | null = null;

function getS3Client(accountId: string, accessKeyId: string, secretAccessKey: string): S3Client {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return s3ClientInstance;
}

/**
 * Upload an asset to Cloudflare R2 object storage (or local fallback).
 */
export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<UploadResult> {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const publicUrlBase = process.env.CLOUDFLARE_R2_PUBLIC_URL;

  const ext = path.extname(fileName) || '.png';
  const cleanBase = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const key = `uploads/${Date.now()}_${cleanBase}${ext}`;

  // If Cloudflare R2 S3 credentials are provided:
  if (accountId && accessKeyId && secretAccessKey && bucketName) {
    try {
      const client = getS3Client(accountId, accessKeyId, secretAccessKey);
      await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: fileBuffer,
          ContentType: contentType,
        })
      );

      // Keep a local copy for local cache/preview
      saveLocalUpload(path.basename(key), fileBuffer);

      const url = publicUrlBase
        ? `${publicUrlBase.replace(/\/$/, '')}/${key}`
        : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;

      return {
        url,
        key,
        size: fileBuffer.length,
        contentType,
      };
    } catch (err) {
      console.error('Error uploading to Cloudflare R2 via S3 client:', err);
    }
  }

  // Local fallback: write to public/uploads
  const localFileName = path.basename(key);
  saveLocalUpload(localFileName, fileBuffer);

  return {
    url: `/uploads/${localFileName}`,
    key,
    size: fileBuffer.length,
    contentType,
  };
}

function saveLocalUpload(filename: string, buffer: Buffer) {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const cleanFileName = path.basename(filename);
    const dest = path.join(uploadDir, cleanFileName);
    fs.writeFileSync(dest, buffer);
  } catch (err) {
    console.error('Failed to save local file upload:', err);
  }
}
