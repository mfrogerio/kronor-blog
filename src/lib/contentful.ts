import { createClient } from 'contentful';

export const contentfulClient = createClient({
  space: 'dsxoesejlfbb',
  accessToken: 'laBnH0Qa3IPRNYMmUOc0fh8_eVoFCAz6oFkXZ3OE-w4',
});

export interface BlogPost {
  title: string;
  slug: string;
  content: any;
  quickAnswer: string;
  featuredAffiliate: string;
  subId: string;
  published: string;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const entries = await contentfulClient.getEntries({
    content_type: 'blogPost',
  });
  return entries.items.map((item: any) => item.fields);
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const entries = await contentfulClient.getEntries({
    content_type: 'blogPost',
    'fields.slug': slug,
  });
  return entries.items.length ? entries.items[0].fields : null;
}