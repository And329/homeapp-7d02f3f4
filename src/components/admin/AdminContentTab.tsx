
import React from 'react';
import { FileText, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
                  <h4 className="font-medium text-gray-900">{post.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{post.excerpt || 'No excerpt'}</p>
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
                  <h4 className="font-medium text-gray-900">{article.title}</h4>
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
    </>
  );
};

export default AdminContentTab;
