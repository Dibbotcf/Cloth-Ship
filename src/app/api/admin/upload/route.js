import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');
    await mkdir(uploadDir, { recursive: true });
    
    // Sanitize filename
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
    const filename = `${Date.now()}-${originalName}`;
    const filepath = path.join(uploadDir, filename);
    
    await writeFile(filepath, buffer);
    
    return NextResponse.json({ 
      url: `/images/products/${filename}`,
      message: 'File uploaded successfully' 
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
