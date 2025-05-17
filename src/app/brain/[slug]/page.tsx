import fs from "fs";
import path from "path";
import { serialize } from "next-mdx-remote/serialize";
import PostClient from "@/components/PostClient";

interface PostProps {
  params: { slug: string };
}

export default async function Post({ params }: PostProps) {
  const filePath = path.join(process.cwd(), "content", `${params.slug}.mdx`);
  const source = fs.readFileSync(filePath, "utf8");
  const mdxSource = await serialize(source);

  return <PostClient source={mdxSource} />;
}

export async function generateStaticParams() {
  const files = fs.readdirSync(path.join(process.cwd(), "content"));
  return files.map((file) => ({
    slug: file.replace(/\\.mdx?$/, ""),
  }));
}
