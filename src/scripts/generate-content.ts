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

function copyAttachment(
  content: string,
  sourceDir: string,
  destDir: string
): string {
  const regex = /!\[\[(.*?)\]\]/g;
  let match;
  const modifiedContent = content;

  while ((match = regex.exec(content)) !== null) {
    const fileName = match[1];
    const sourcePath = path.join(attachmentsDir, fileName);
    const destPath = path.join(destDir, "Images", fileName);

    if (fs.existsSync(sourcePath)) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied attachment: ${sourcePath} to ${destPath}`);
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
  tagMap: Map<string, PageMetadata[]> = new Map()
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
        tagMap
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
        if (hasFrontmatter) {
          // Extract existing frontmatter
          const frontmatterEnd = modifiedContent.indexOf("---", 3);
          const existingFrontmatter = modifiedContent.slice(
            0,
            frontmatterEnd + 3
          );
          const contentAfterFrontmatter = modifiedContent.slice(
            frontmatterEnd + 3
          );

          // Add/update title in frontmatter
          const updatedFrontmatter = existingFrontmatter
            .replace(/title:.*\n/, `title: "${title}"\n`)
            .replace(/---\n/, `---\ntitle: "${title}"\n`);

          modifiedContent = updatedFrontmatter + contentAfterFrontmatter;
        } else {
          // Add new frontmatter if none exists
          modifiedContent = `---
title: "${title}"
---

${modifiedContent}`;
        }

        // Copy attachments and update links
        modifiedContent = copyAttachment(modifiedContent, sourceDir, destDir);

        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, modifiedContent);
        console.log(`Copied and modified: ${fullPath} to ${destPath}`);

        // Add the page to our list
        generatedPages.push(`/c/${slugifiedFileName}`);

        // Create page metadata
        const pageData: PageMetadata = {
          slug: slugifiedFileName,
          title: data.title || title,
          created: data.created,
          date: data.date,
          tags: data.tags || [],
          url: data.URL,
          path: `/c/${slugifiedFileName}`,
        };

        pageMetadata.push(pageData);

        // Add to tag map
        if (pageData.tags && pageData.tags.length > 0) {
          pageData.tags.forEach((tag: string) => {
            // Clean up tag format (remove sources/, etc.)
            const cleanTag = tag
              .replace(/^sources\//, "")
              .replace(/^[^\w]*/, "");
            if (cleanTag) {
              if (!tagMap.has(cleanTag)) {
                tagMap.set(cleanTag, []);
              }
              tagMap.get(cleanTag)!.push(pageData);
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

// Start the recursive search and copy process
const result = copyPublishedFiles(sourceDir, sourceDir);
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

// Generate entities index (for c/entity tagged content)
const entityPages = tagMap.get("c/entity") || [];
const entitiesIndexPath = path.join(configDir, "entities.json");
fs.writeFileSync(entitiesIndexPath, JSON.stringify(entityPages, null, 2));
console.log(`Generated entities index at: ${entitiesIndexPath}`);

console.log("Finished copying and modifying published files.");
