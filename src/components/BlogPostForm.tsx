
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface BlogPostFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featured_image: '',
    status: 'draft',
    tags: '',
    meta_description: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const dataToSubmit = {
        title: formData.title,
        slug: generateSlug(formData.title),
        content: formData.content,
        excerpt: formData.excerpt || null,
        featured_image: formData.featured_image || null,
        status: formData.status,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : null,
        meta_description: formData.meta_description || null,
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
      };

      const { error } = await supabase
        .from('admin_blog_posts')
        .insert([dataToSubmit]);

      if (error) throw error;

      toast({
        title: "Blog post created",
        description: "The blog post has been created successfully.",
      });

      onSuccess();
    } catch (error) {
      console.error('Blog post creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create blog post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Create Blog Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Featured Image URL
              </label>
              <input
                type="url"
                name="featured_image"
                value={formData.featured_image}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Brief description of the blog post..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Write your blog post content here..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="real estate, property, dubai (comma separated)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <input
                type="text"
                name="meta_description"
                value={formData.meta_description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="SEO meta description..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Blog Post'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogPostForm;
