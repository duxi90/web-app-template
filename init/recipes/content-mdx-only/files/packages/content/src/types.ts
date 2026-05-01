export interface PostFrontmatter {
  title: string;
  summary: string;
  date: string;
  tags: string[];
  draft: boolean;
}

export interface Post extends PostFrontmatter {
  slug: string;
  body: string;
  permalink: string;
}
