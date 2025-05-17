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

function copyPublishedFiles(dir: string, baseDir: string) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      copyPublishedFiles(fullPath, baseDir);
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

        // Copy attachments and update links
        modifiedContent = copyAttachment(modifiedContent, sourceDir, destDir);

        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, modifiedContent);
        console.log(`Copied and modified: ${fullPath} to ${destPath}`);
      }
    }
  }
}

// Ensure the destination directory exists
fs.mkdirSync(destDir, { recursive: true });

// Start the recursive search and copy process
copyPublishedFiles(sourceDir, sourceDir);

console.log("Finished copying and modifying published files.");
