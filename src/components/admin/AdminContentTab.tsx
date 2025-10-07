
import React, { useState } from 'react';
import { FileText, Newspaper, File, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface AdminContentTabProps {
  blogPosts: any[];
  newsArticles: any[];
  blogLoading: boolean;
  newsLoading: boolean;
  onCreateBlogPost: () => void;
  onCreateNewsArticle: () => void;
}

const AdminContentTab: React.FC<AdminContentTabProps> = ({
  blogPosts,
  newsArticles,
  blogLoading,
  newsLoading,
  onCreateBlogPost,
  onCreateNewsArticle,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'blog' | 'news'; title: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDeleteClick = (id: string, type: 'blog' | 'news', title: string) => {
    setItemToDelete({ id, type, title });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      const table = itemToDelete.type === 'blog' ? 'admin_blog_posts' : 'admin_news_articles';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', itemToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${itemToDelete.type === 'blog' ? 'Blog post' : 'News article'} deleted successfully.`,
      });

      // Invalidate queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-news-articles'] });
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: "Error",
        description: "Failed to delete item.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Button
          onClick={onCreateBlogPost}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Create Blog Post
        </Button>
        <Button
          onClick={onCreateNewsArticle}
          className="flex items-center gap-2"
        >
          <Newspaper className="h-4 w-4" />
          Create News Article
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Blog Posts ({blogPosts.length})</h3>
          {blogLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {blogPosts.map((post: any) => (
                <div key={post.id} className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 flex-1">{post.title}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClick(post.id, 'blog', post.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{post.excerpt || 'No excerpt'}</p>
                  {post.pdf_attachment && (
                    <div className="flex items-center gap-2 mt-2">
                      <File className="h-4 w-4 text-red-600" />
                      <span className="text-xs text-gray-500">PDF attachment included</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      post.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {blogPosts.length === 0 && (
                <p className="text-gray-500 text-sm">No blog posts created yet.</p>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">News Articles ({newsArticles.length})</h3>
          {newsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {newsArticles.map((article: any) => (
                <div key={article.id} className="bg-white p-4 rounded-lg shadow border">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 flex-1">{article.title}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClick(article.id, 'news', article.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{article.excerpt || 'No excerpt'}</p>
                  {article.source && (
                    <p className="text-xs text-gray-500 mt-1">Source: {article.source}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      article.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {article.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(article.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {newsArticles.length === 0 && (
                <p className="text-gray-500 text-sm">No news articles created yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{itemToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminContentTab;
