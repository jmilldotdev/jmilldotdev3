import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const contentPath = path.join(process.cwd(), 'content', `${slug}.mdx`);
    
    if (!fs.existsSync(contentPath)) {
      console.log(`Content not found: ${slug}.mdx`);
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }
    
    const fileContent = fs.readFileSync(contentPath, 'utf8');
    const { data, content } = matter(fileContent);
    
    // Serialize the MDX content on the server
    const serializedContent = await serialize(content);
    
    return NextResponse.json({ 
      serializedContent,
      frontmatter: data 
    });
  } catch (error) {
    console.error(`Error reading content for ${(await params).slug}:`, error);
    return NextResponse.json({ 
      error: 'Failed to read content',
      slug: (await params).slug,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}