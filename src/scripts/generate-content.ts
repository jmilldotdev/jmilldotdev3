import fs from "fs";
import path from "path";
import { CONTENT_DIR } from "../config";

const sourceDir = "/Users/jmill/Documents/obsidian/nhx3b";
const attachmentsDir = path.join(sourceDir, "Extras/Attachments");
const destDir = CONTENT_DIR;

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
  generatedPages: string[] = []
) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      copyPublishedFiles(fullPath, baseDir, generatedPages);
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
        generatedPages.push(`/brain/${slugifiedFileName}`);
      }
    }
  }

  return generatedPages;
}

// Ensure the destination directory exists
fs.mkdirSync(destDir, { recursive: true });

// Start the recursive search and copy process
const generatedPages = copyPublishedFiles(sourceDir, sourceDir);

// Add the home page
generatedPages.push("/");

// Ensure config directory exists
const configDir = path.join(process.cwd(), "src", "config");
fs.mkdirSync(configDir, { recursive: true });

// Write the pages list to a JSON file
const pagesPath = path.join(configDir, "pages.json");
fs.writeFileSync(pagesPath, JSON.stringify(generatedPages, null, 2));
console.log(`Generated pages list at: ${pagesPath}`);

console.log("Finished copying and modifying published files.");
