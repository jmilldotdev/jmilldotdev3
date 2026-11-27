import pageMetadata from "@/config/metadata.json";
import tagData from "@/config/tags.json";

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
  return { pageMetadata, tagData };
}
