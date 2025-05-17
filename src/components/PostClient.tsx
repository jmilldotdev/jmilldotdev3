"use client";

import { MDXRemote } from "next-mdx-remote";
import { MDXRemoteSerializeResult } from "next-mdx-remote";

interface PostClientProps {
  source: MDXRemoteSerializeResult;
}

export default function PostClient({ source }: PostClientProps) {
  return (
    <div className="post-content max-w-3xl mx-auto my-8 p-8 rounded-md min-h-[70vh]">
      <MDXRemote {...source} />
    </div>
  );
}
