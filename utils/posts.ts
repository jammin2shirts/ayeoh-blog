import { createExtractor, Format, Parser } from "$std/front_matter/mod.ts";
import { join } from "$std/path/mod.ts";
import { parse } from "$std/yaml/parse.ts";

const extract = createExtractor({
  [Format.YAML]: parse as Parser,
});

export interface Post {
  slug: string;
  title: string;
  published_at: Date;
  content: string;
  snippet: string;
}

export async function getPosts(): Promise<Post[]> {
  const files = Deno.readDir("./posts");
  const promises = [];
  for await (const file of files) {
    const slug = file.name.replace(".md", "");
    promises.push(getPost(slug));
  }
  const posts = await Promise.all(promises) as Post[];
  posts.sort((a, b) => b.published_at.getTime() - a.published_at.getTime());
  return posts;
}

export async function getPost(slug: string): Promise<Post | null> {
  const text = await Deno.readTextFile(join("./posts", `${slug}.md`));
  const { attrs, body } = extract<Post>(text);
  return {
    slug,
    title: attrs.title,
    published_at: new Date(attrs.published_at),
    content: body,
    snippet: attrs.snippet,
  };
}
