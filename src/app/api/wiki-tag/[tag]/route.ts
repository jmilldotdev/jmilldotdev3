import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { serialize } from 'next-mdx-remote/serialize';

interface PageMetadata {
  slug: string;
  title: string;
  created?: string;
  date?: string;
  tags?: string[];
  url?: string;
  path: string;
}

type TagData = Record<string, PageMetadata[]>;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tag: string }> }
) {
  try {
    const { tag } = await params;
    const decodedTag = decodeURIComponent(tag);
    
    // Load tags.json
    const tagDataPath = path.join(process.cwd(), 'src', 'config', 'tags.json');
    
    if (!fs.existsSync(tagDataPath)) {
      return NextResponse.json({ error: 'Tags data not found' }, { status: 404 });
    }
    
    const tagDataContent = fs.readFileSync(tagDataPath, 'utf8');
    const tagData: TagData = JSON.parse(tagDataContent);
    const posts = tagData[decodedTag] || [];
    
    // Generate MDX content for the tag page
    const escapedTag = decodedTag.replace(/[`${}\\]/g, '\\$&');
    let mdxContent = `# ${escapedTag}\n\n`;
    mdxContent += `${posts.length} ${posts.length === 1 ? 'post' : 'posts'} tagged with **${escapedTag}**\n\n`;
    
    if (posts.length === 0) {
      mdxContent += 'No posts found for this tag.\n\n';
    } else {
      posts.forEach(post => {
        // Convert /c/ paths to wiki-loadable slugs
        const slug = post.path.replace('/c/', '');
        // Escape the title to prevent template literal injection
        const escapedTitle = post.title.replace(/[`${}\\]/g, '\\$&');
        mdxContent += `- <Link href="/c/${slug}" className="text-[var(--color-primary)] hover:underline hover:text-[var(--color-secondary)] transition-colors font-medium">${escapedTitle}</Link>\n`;
        
        // Add other tags if they exist
        if (post.tags && post.tags.length > 1) {
          const otherTags = post.tags
            .filter(t => {
              const cleanTag = t
                .replace(/^sources\//, "")
                .replace(/^c\/entity$/, "entity")
                .replace(/^[^\w]*/, "");
              return cleanTag !== decodedTag;
            })
            .slice(0, 3)
            .map(t => t
              .replace(/^sources\//, "")
              .replace(/^c\/entity$/, "entity")
              .replace(/^[^\w]*/, "")
            );
          
          if (otherTags.length > 0) {
            // Escape tag names to prevent template literal injection
            const escapedTags = otherTags.map(tag => tag.replace(/[`${}\\]/g, '\\$&'));
            mdxContent += `  - *Also tagged:* ${escapedTags.join(', ')}\n`;
          }
        }
        mdxContent += '\n';
      });
    }
    
    // Serialize the generated MDX content
    const serializedContent = await serialize(mdxContent);
    
    return NextResponse.json({ 
      serializedContent,
      frontmatter: { 
        title: decodedTag,
        type: 'tag-page',
        count: posts.length
      }
    });
  } catch (error) {
    console.error(`Error generating tag page for ${(await params).tag}:`, error);
    return NextResponse.json({ 
      error: 'Failed to generate tag page',
      tag: (await params).tag,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}