import { NextRequest, NextResponse } from 'next/server';
import { contentSlugs, readContent } from "@/lib/content";
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';

export const dynamic = "force-static";

export function generateStaticParams() {
  return contentSlugs().map((slug) => ({ slug }));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const fileContent = readContent(slug);
    
    if (fileContent === undefined) {
      console.log(`Content not found: ${slug}.mdx`);
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }
    
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