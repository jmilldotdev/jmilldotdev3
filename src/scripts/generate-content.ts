import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { CONTENT_DIR } from "../config";

const vaultRoot = "/Users/jmill/Documents/obsidian/nhx4b";
const sourceDir = path.join(vaultRoot, "me", "publish");
const attachmentsDir = path.join(vaultRoot, "nobody/attachments");
const destDir = CONTENT_DIR;

// Add interface for page metadata
interface PageMetadata {
  slug: string;
  title: string;
  created?: string;
  date?: string;
  tags?: string[];
  url?: string;
  tagline?: string;
  year?: string;
  genre?: string;
  path: string;
  artist?: string;
  category?: string;
}

// Convert backlink text to slug using same logic as filename processing
function textToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ""); // Remove non-alphanumeric characters except hyphens
}

// Convert [[backlinks]] to MDX Link components and handle images
function processBacklinks(content: string, validSlugs: Set<string>): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, (match, linkText) => {
    // Check if this is an image reference
    if (linkText.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
      const imagePath = `/images/${linkText}`;
      return `<img src="${imagePath}" alt="${linkText}" className="max-w-full h-auto border border-gray-700 my-3 rounded" />`;
    }

    // Handle pipe syntax [[link|display text]]
    let actualLinkText = linkText;
    let displayText = linkText;
    if (linkText.includes("|")) {
      const parts = linkText.split("|");
      actualLinkText = parts[0].trim();
      displayText = parts[1].trim();
    }

    // Convert to slug and check if it's valid
    const slug = textToSlug(actualLinkText);

    // If the slug is valid, create a link; otherwise, return plain text
    if (validSlugs.has(slug)) {
      return `<Link href="/c/${slug}" className="text-[var(--color-primary)] hover:underline hover:text-[var(--color-secondary)] transition-colors font-medium">${displayText}</Link>`;
    } else {
      // Return as plain text for invalid links
      console.log(
        `Warning: Invalid link removed: [[${linkText}]] -> slug: ${slug}`
      );
      return displayText;
    }
  });
}

function copyAttachment(
  content: string,
  sourceDir: string,
  destDir: string
): string {
  const regex = /!\[\[(.*?)\]\]/g;
  let match;
  const modifiedContent = content;
  const publicImagesDir = path.join(process.cwd(), "public", "images");

  while ((match = regex.exec(content)) !== null) {
    const fileName = match[1];
    const sourcePath = path.join(attachmentsDir, fileName);
    // Copy to both content/Images and public/images for web serving
    const contentDestPath = path.join(destDir, "Images", fileName);
    const publicDestPath = path.join(publicImagesDir, fileName);

    if (fs.existsSync(sourcePath)) {
      // Copy to content directory
      fs.mkdirSync(path.dirname(contentDestPath), { recursive: true });
      fs.copyFileSync(sourcePath, contentDestPath);
      console.log(
        `Copied attachment to content: ${sourcePath} to ${contentDestPath}`
      );

      // Copy to public directory for web serving
      fs.mkdirSync(path.dirname(publicDestPath), { recursive: true });
      fs.copyFileSync(sourcePath, publicDestPath);
      console.log(
        `Copied attachment to public: ${sourcePath} to ${publicDestPath}`
      );
    } else {
      console.warn(`Attachment not found: ${sourcePath}`);
    }
  }

  return modifiedContent;
}

function copyPublishedFiles(
  dir: string,
  baseDir: string,
  generatedPages: string[] = [],
  pageMetadata: PageMetadata[] = [],
  tagMap: Map<string, PageMetadata[]> = new Map(),
  validSlugs: Set<string> = new Set()
) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      copyPublishedFiles(
        fullPath,
        baseDir,
        generatedPages,
        pageMetadata,
        tagMap,
        validSlugs
      );
    } else if (path.extname(file).toLowerCase() === ".md") {
      if (file.toLowerCase() === "index.md") {
        continue;
      }
      const content = fs.readFileSync(fullPath, "utf8");

      // Remove emoji and space from the start of the filename
      const destFileName = file.replace(
        /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\s)+/gu,
        ""
      );

      // Remove the .md extension before slugifying
      const baseFileName = path.basename(destFileName, ".md");

      // Extract title from baseFileName (capitalize first letter of each word)
      const title = baseFileName
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Slugify the base file name
      const slugifiedFileName = baseFileName
        .toLowerCase()
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, ""); // Remove non-alphanumeric characters except hyphens

      // Append the .md extension back to the slugified file name
      const finalFileName = `${slugifiedFileName}.mdx`;

      const destPath = path.join(destDir, finalFileName);

      // Parse frontmatter to extract metadata
      const { data } = matter(content);

      const relativeDir = path.relative(baseDir, path.dirname(fullPath));
      const categorySegments = relativeDir
        .split(path.sep)
        .filter((segment) => segment && segment !== ".");
      const category =
        categorySegments[categorySegments.length - 1]?.toLowerCase() ||
        "projects";

      // Remove H1 level headings (lines starting with a single #)
      let modifiedContent = content
        .split("\n")
        .filter((line) => !line.trim().match(/^#\s/))
        .join("\n");

      // Handle frontmatter
      const hasFrontmatter = modifiedContent.startsWith("---");
      let frontmatterPart = "";
      let contentPart = "";

      if (hasFrontmatter) {
        // Extract existing frontmatter
        const frontmatterEnd = modifiedContent.indexOf("---", 3);
        frontmatterPart = modifiedContent.slice(0, frontmatterEnd + 3);
        contentPart = modifiedContent.slice(frontmatterEnd + 3);

        // Add/update title in frontmatter
        frontmatterPart = frontmatterPart
          .replace(/title:.*\n/, `title: "${title}"\n`)
          .replace(/---\n/, `---\ntitle: "${title}"\n`);

        // Clean up tags in frontmatter
        frontmatterPart = frontmatterPart
          .replace(/- c\/entity/g, "- entity")
          .replace(/- sources\//g, "- ");

        // Clean up related field by removing invalid link references
        frontmatterPart = frontmatterPart.replace(
          /related:\s*\n([\s\S]*?)(?=\n\w+:|$)/g,
          (match, relatedContent) => {
            if (!relatedContent) return match;

            const lines = relatedContent.split("\n");
            const validLines = lines.filter((line: string) => {
              // Remove lines that contain [[...]] references that don't correspond to valid pages
              const linkMatch = line.match(/\[\[([^\]]+)\]\]/);
              if (linkMatch) {
                const linkText = linkMatch[1];
                const actualLinkText = linkText.includes("|")
                  ? linkText.split("|")[0].trim()
                  : linkText;
                const slug = textToSlug(actualLinkText);
                const isValid = validSlugs.has(slug);
                if (!isValid) {
                  console.log(
                    `Warning: Removed invalid related link: ${linkText}`
                  );
                  return false;
                }
              }
              return true;
            });

            return validLines.length > 1
              ? `related:\n${validLines.join("\n")}`
              : "";
          }
        );
      } else {
        // Add new frontmatter if none exists
        frontmatterPart = `---
title: "${title}"
---`;
        contentPart = modifiedContent;
      }

      // Copy attachments and update links (only in content part)
      contentPart = copyAttachment(contentPart, sourceDir, destDir);

      // Replace c/entity with entity in content (only in content part)
      contentPart = contentPart.replace(/c\/entity/g, "entity");

      // Process image references first (![[ ]] syntax)
      contentPart = contentPart.replace(
        /!\[\[([^\]]+)\]\]/g,
        (match, linkText) => {
          if (linkText.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
            const imagePath = `/images/${linkText}`;
            return `<img src="${imagePath}" alt="${linkText}" className="max-w-full h-auto border border-gray-700 my-3 rounded" />`;
          }
          return match; // Return unchanged if not an image
        }
      );

      // Process backlinks (only in content part)
      contentPart = processBacklinks(contentPart, validSlugs);

      // Fix iframe properties for React compatibility
      contentPart = contentPart
        .replace(/allowfullscreen/g, "allowFullScreen")
        .replace(/frameborder=/g, "frameBorder=");

      // Check if we need the Link import - only add if there are valid Link components
      const hasLinks = contentPart.includes('<Link href="/c/');
      const importStatement = hasLinks
        ? '\n\nimport Link from "next/link";\n'
        : "\n\n";

      // Reassemble the content
      modifiedContent = frontmatterPart + importStatement + contentPart;

      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, modifiedContent);
      console.log(`Copied and modified: ${fullPath} to ${destPath}`);

      // Add the page to our list
      generatedPages.push(`/c/${slugifiedFileName}`);

      const rawTags = data.tags ?? [];
      const tagList = Array.isArray(rawTags) ? rawTags : [rawTags];

      // Clean tags in the data
      const cleanedTags = tagList
        .map((tag: string) =>
          (tag || "")
            .replace(/^sources\//, "")
            .replace(/^c\/entity$/, "entity")
            .replace(/^[^\w]*/, "")
        )
        .filter((tag: string) => tag);

      const toISODate = (value: unknown, fallback: Date) => {
        if (typeof value === "string") return value;
        if (value instanceof Date) return value.toISOString();
        return fallback.toISOString();
      };

      const createdDate = toISODate(data.created ?? data.date, stat.birthtime);
      const modifiedDate = toISODate(data.date, stat.mtime);
      const resolvedYearValue =
        data.year ?? new Date(createdDate).getFullYear().toString();
      const year =
        typeof resolvedYearValue === "number"
          ? resolvedYearValue.toString()
          : resolvedYearValue ?? new Date(createdDate).getFullYear().toString();

      const urlValue =
        typeof data.URL === "string"
          ? data.URL
          : typeof data.url === "string"
          ? data.url
          : undefined;
      const taglineValue =
        typeof data.tagline === "string" ? data.tagline : undefined;
      const artistValue =
        typeof data.artist === "string" ? data.artist : undefined;

      // Create page metadata
      const pageData: PageMetadata = {
        slug: slugifiedFileName,
        title: data.title || title,
        genre: data.genre,
        created: createdDate,
        date: modifiedDate,
        tags: cleanedTags,
        url: urlValue,
        tagline: taglineValue,
        year,
        path: `/c/${slugifiedFileName}`,
        artist: artistValue,
        category,
      };

      pageMetadata.push(pageData);

      // Add to tag map
      if (pageData.tags && pageData.tags.length > 0) {
        pageData.tags.forEach((tag: string) => {
          if (tag) {
            if (!tagMap.has(tag)) {
              tagMap.set(tag, []);
            }
            tagMap.get(tag)!.push(pageData);
          }
        });
      }
    }
  }

  return { generatedPages, pageMetadata, tagMap };
}

// Ensure the destination directory exists
fs.mkdirSync(destDir, { recursive: true });

// First pass: collect all valid slugs
const validSlugs = new Set<string>();

function collectValidSlugs(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      collectValidSlugs(fullPath);
    } else if (path.extname(file).toLowerCase() === ".md") {
      if (file.toLowerCase() === "index.md") {
        continue;
      }
      const destFileName = file.replace(
        /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\s)+/gu,
        ""
      );
      const baseFileName = path.basename(destFileName, ".md");
      const slugifiedFileName = baseFileName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      validSlugs.add(slugifiedFileName);
    }
  }
}

collectValidSlugs(sourceDir);

// Second pass: process files with valid slug validation
const result = copyPublishedFiles(
  sourceDir,
  sourceDir,
  [],
  [],
  new Map(),
  validSlugs
);
const { generatedPages, pageMetadata, tagMap } = result;

// Add the home page
generatedPages.push("/");

// Ensure config directory exists
const configDir = path.join(process.cwd(), "src", "config");
fs.mkdirSync(configDir, { recursive: true });

// Write the pages list to a JSON file
const pagesPath = path.join(configDir, "pages.json");
fs.writeFileSync(pagesPath, JSON.stringify(generatedPages, null, 2));
console.log(`Generated pages list at: ${pagesPath}`);

// Write page metadata to a JSON file
const metadataPath = path.join(configDir, "metadata.json");
fs.writeFileSync(metadataPath, JSON.stringify(pageMetadata, null, 2));
console.log(`Generated metadata at: ${metadataPath}`);

// Write tag mappings to a JSON file
const tagData = Object.fromEntries(
  Array.from(tagMap.entries()).map(([tag, pages]) => [
    tag,
    pages.sort((a, b) => {
      // Sort by created date (newest first), fallback to date, then title
      const aDate = new Date(a.created || a.date || "1970-01-01");
      const bDate = new Date(b.created || b.date || "1970-01-01");
      return bDate.getTime() - aDate.getTime();
    }),
  ])
);

const tagMapPath = path.join(configDir, "tags.json");
fs.writeFileSync(tagMapPath, JSON.stringify(tagData, null, 2));
console.log(`Generated tag mappings at: ${tagMapPath}`);

// Generate entities index (for entity tagged content)
const entityPages = tagMap.get("entity") || [];
const entitiesIndexPath = path.join(configDir, "entities.json");
fs.writeFileSync(entitiesIndexPath, JSON.stringify(entityPages, null, 2));
console.log(`Generated entities index at: ${entitiesIndexPath}`);

// Copy all existing images from content/Images to public/images for web serving
const contentImagesDir = path.join(destDir, "Images");
const publicImagesDir = path.join(process.cwd(), "public", "images");

if (fs.existsSync(contentImagesDir)) {
  // Ensure public images directory exists
  fs.mkdirSync(publicImagesDir, { recursive: true });

  // Copy all image files
  const imageFiles = fs.readdirSync(contentImagesDir);
  imageFiles.forEach((fileName) => {
    const sourcePath = path.join(contentImagesDir, fileName);
    const destPath = path.join(publicImagesDir, fileName);

    // Only copy if it's a file (not a directory)
    if (fs.statSync(sourcePath).isFile()) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied image for web serving: ${fileName}`);
    }
  });

  console.log(
    `Copied ${imageFiles.length} images to public directory for web serving`
  );
} else {
  console.log("No content/Images directory found");
}

// Generate projects index from project content (exclude templates)
const projectPages = pageMetadata.filter((page) => {
  const title = page.title?.toLowerCase() ?? "";
  return (
    !title.includes("template") &&
    !title.includes("writeup") &&
    !page.slug.includes("t-project")
  );
});

const projects = projectPages.map((page) => {
  const slug = page.slug.replace(".mdx", "");
  // Extract all project type tags from publish/project/type format
  const projectTypes =
    page.tags?.filter((tag) => tag.startsWith("publish/project/")) || [];
  const projectTags = projectTypes
    .map((tag) => tag.replace("publish/project/", ""))
    .filter((tag) => tag !== "");

  if (projectTags.length === 0 && page.category) {
    projectTags.push(page.category);
  }

  const derivedArtist =
    page.artist ||
    page.tags
      ?.find((tag) => tag.startsWith("artist/"))
      ?.replace("artist/", "") ||
    "jmill";

  const derivedYearTag = page.tags?.find((tag) => /^\d{4}$/.test(tag));
  const resolvedYear =
    page.year ||
    derivedYearTag ||
    new Date(page.created || page.date || new Date().toISOString())
      .getFullYear()
      .toString();

  const derivedGenre =
    page.genre ||
    page.tags?.find((tag) => tag.startsWith("genre/"))?.replace("genre/", "");

  return {
    id: slug,
    title: page.title,
    cover: `/project-covers/${slug}.webp`,
    fallbackCover: `/project-covers/${slug}.png`,
    artist: derivedArtist,
    year: resolvedYear,
    genre: derivedGenre,
    project_tags: projectTags,
    tagline: page.tagline ?? null,
    url: page.url ?? null,
  };
});

const projectsIndexPath = path.join(configDir, "projects.json");
fs.writeFileSync(projectsIndexPath, JSON.stringify(projects, null, 2));
console.log(`Generated projects index at: ${projectsIndexPath}`);

console.log("Finished copying and modifying published files.");
