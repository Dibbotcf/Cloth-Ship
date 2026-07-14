import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Uploads dir is symlinked to a persistent store (~/uploads/products) on the
    // server, so files survive deploys. See .github/workflows/deploy.yml.
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');
    await mkdir(uploadDir, { recursive: true });

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
    const base = `${Date.now()}-${safeName.replace(/\.[^.]+$/, '')}`;

    // Compress + resize to a web-friendly WebP (multi-MB phone photos -> ~100-200KB).
    // Falls back to the original bytes if optimization fails, so uploads never break.
    let filename;
    try {
      filename = `${base}.webp`;
      await sharp(buffer)
        .rotate() // honor EXIF orientation
        .resize({ width: 1400, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(path.join(uploadDir, filename));
    } catch (optErr) {
      console.error('Image optimize failed, saving original:', optErr);
      const ext = (safeName.match(/\.[^.]+$/) || ['.jpg'])[0];
      filename = `${base}${ext}`;
      await writeFile(path.join(uploadDir, filename), buffer);
    }

    return NextResponse.json({
      url: `/images/products/${filename}`,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
