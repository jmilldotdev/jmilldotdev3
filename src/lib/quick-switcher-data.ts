import fs from "fs";
import path from "path";

export interface PageMetadata {
  slug: string;
  title: string;
  created?: string;
  date?: string;
  tags?: string[];
  url?: string;
  path: string;
}

export type TagData = Record<string, PageMetadata[]>;

export function getQuickSwitcherData(): {
  pageMetadata: PageMetadata[];
  tagData: TagData;
} {
  let pageMetadata: PageMetadata[] = [];
  let tagData: TagData = {};

  try {
    // Load page metadata
    const metadataPath = path.join(
      process.cwd(),
      "src",
      "config",
      "metadata.json"
    );
    if (fs.existsSync(metadataPath)) {
      const metadataContent = fs.readFileSync(metadataPath, "utf8");
      pageMetadata = JSON.parse(metadataContent);
    }

    // Load tag data
    const tagDataPath = path.join(process.cwd(), "src", "config", "tags.json");
    if (fs.existsSync(tagDataPath)) {
      const tagDataContent = fs.readFileSync(tagDataPath, "utf8");
      tagData = JSON.parse(tagDataContent);
    }
  } catch (error) {
    console.error("Error loading quick switcher data:", error);
  }

  return { pageMetadata, tagData };
}
