import React from "react";
import { MDXRemote } from "next-mdx-remote";
import { MDXRemoteSerializeResult } from "next-mdx-remote/dist/types";

interface PostProps {
  source: MDXRemoteSerializeResult;
  title: string;
}

const Post: React.FC<PostProps> = ({ source, title }) => {
  return (
    <article className="prose lg:prose-xl mx-auto my-8">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <MDXRemote {...source} />
    </article>
  );
};

export default Post;
