import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Tag, ArrowLeft, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PDFViewer from '../components/PDFViewer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BlogPost } from '@/types/blog';
import { SafeHtml } from '@/components/ui/safe-html';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfContent, setPdfContent] = useState<string>('');
  const [parsingPdf, setParsingPdf] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      try {
        const { data, error } = await supabase
          .from('admin_blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (error) throw error;
        setPost(data);
        
        // Parse PDF if available
        if (data.pdf_attachment) {
          parsePdfContent(data.pdf_attachment);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast({
          title: "Error",
          description: "Failed to load blog post.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, toast]);

  const parsePdfContent = async (pdfUrl: string) => {
    setParsingPdf(true);
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const file = new File([blob], 'document.pdf', { type: 'application/pdf' });
      
      // Use FormData to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Call edge function to parse PDF
      const { data, error } = await supabase.functions.invoke('parse-pdf', {
        body: formData,
      });

      if (error) throw error;
      if (data?.content) {
        setPdfContent(data.content);
      }
    } catch (error) {
      console.error('Error parsing PDF:', error);
      // Silently fail - we'll still show the PDF viewer
    } finally {
      setParsingPdf(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/blog')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/blog')}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Button>

        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            {post.featured_image && (
              <div className="w-full h-64 md:h-96 mb-6 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={post.featured_image} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {post.excerpt}
              </p>
            )}
            
            <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.published_at || post.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Admin</span>
              </div>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <SafeHtml 
              content={post.content}
              className="text-gray-700 leading-relaxed"
              allowLineBreaks={true}
            />
          </div>

          {/* PDF Attachment */}
          {post.pdf_attachment && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-destructive" />
                Document Content
              </h2>
              
              {parsingPdf ? (
                <div className="flex items-center justify-center py-12 bg-muted/20 rounded-xl">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm text-muted-foreground">Converting PDF to readable format...</p>
                  </div>
                </div>
              ) : pdfContent ? (
                <div className="bg-gradient-to-br from-background to-muted/10 border-2 border-border rounded-xl p-8 shadow-lg">
                  <SafeHtml 
                    content={pdfContent}
                    className="prose prose-lg max-w-none"
                    allowLineBreaks={true}
                  />
                </div>
              ) : (
                <PDFViewer 
                  pdfUrl={post.pdf_attachment} 
                  title={`${post.title} - Document`}
                  className="shadow-lg"
                />
              )}
            </div>
          )}
        </article>
      </div>

      <Footer />
    </div>
  );
};

export default BlogPostPage;