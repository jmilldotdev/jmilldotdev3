import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { CONTENT_DIR } from "../config";

const sourceDir = "/Users/jmill/Documents/obsidian/nhx3b";
const attachmentsDir = path.join(sourceDir, "Extras/Attachments");
const destDir = CONTENT_DIR;

// Add interface for page metadata
interface PageMetadata {
  slug: string;
  title: string;
  created?: string;
  date?: string;
  tags?: string[];
  url?: string;
  path: string;
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
    } else if (path.extname(file) === ".md") {
      const content = fs.readFileSync(fullPath, "utf8");
      if (
        content.includes('publish: "true"') ||
        content.includes("publish: true")
      ) {
        // Calculate the relative path from the base directory
        // const relativePath = path.relative(baseDir, fullPath);
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

        // Reassemble the content
        modifiedContent =
          frontmatterPart + '\n\nimport Link from "next/link";\n' + contentPart;

        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, modifiedContent);
        console.log(`Copied and modified: ${fullPath} to ${destPath}`);

        // Add the page to our list
        generatedPages.push(`/c/${slugifiedFileName}`);

        // Clean tags in the data
        const cleanedTags = (data.tags || [])
          .map((tag: string) =>
            tag
              .replace(/^sources\//, "")
              .replace(/^c\/entity$/, "entity")
              .replace(/^[^\w]*/, "")
          )
          .filter((tag: string) => tag);

        // Create page metadata
        const pageData: PageMetadata = {
          slug: slugifiedFileName,
          title: data.title || title,
          created: data.created,
          date: data.date,
          tags: cleanedTags,
          url: data.URL,
          path: `/c/${slugifiedFileName}`,
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
    } else if (path.extname(file) === ".md") {
      const content = fs.readFileSync(fullPath, "utf8");
      if (
        content.includes('publish: "true"') ||
        content.includes("publish: true")
      ) {
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

console.log("Finished copying and modifying published files.");
