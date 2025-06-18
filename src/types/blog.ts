
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  author_id: string;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
  tags: string[] | null;
  meta_description: string | null;
  pdf_attachment: string | null;
}
