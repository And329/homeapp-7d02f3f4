
import React, { useState, useEffect } from 'react';
import { Calendar, ExternalLink, Tag } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  published_at: string | null;
  tags: string[] | null;
  source: string | null;
  author_id: string;
}

const News = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_news_articles')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (error) throw error;
        setArticles(data || []);
      } catch (error) {
        console.error('Error fetching news articles:', error);
        toast({
          title: "Error",
          description: "Failed to load news articles.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [toast]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Draft';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="uae-gradient text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Real Estate News</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Stay informed with the latest real estate news and market updates from Dubai and the UAE.
            </p>
          </div>
        </div>
      </section>

      {/* News Articles */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No news articles yet</h3>
              <p className="text-gray-500">Check back soon for the latest real estate news!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {articles.map((article) => (
                <article key={article.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="md:flex">
                    {article.featured_image && (
                      <div className="md:w-1/3">
                        <img
                          src={article.featured_image}
                          alt={article.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className={`p-6 ${article.featured_image ? 'md:w-2/3' : 'w-full'}`}>
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(article.published_at)}</span>
                        {article.source && (
                          <>
                            <ExternalLink className="h-4 w-4 ml-4 mr-1" />
                            <span>{article.source}</span>
                          </>
                        )}
                      </div>
                      
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        {article.title}
                      </h2>
                      
                      <p className="text-gray-600 mb-4">
                        {article.excerpt || truncateContent(article.content)}
                      </p>
                      
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <button className="text-primary font-semibold hover:text-primary/80 transition-colors">
                        Read Full Article
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default News;
