
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Tag, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BlogPost } from '@/types/blog';
import PDFViewer from './PDFViewer';

interface ExpandableBlogCardProps {
  post: BlogPost;
}

const ExpandableBlogCard: React.FC<ExpandableBlogCardProps> = ({ post }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="h-fit transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-4">
        {post.featured_image && (
          <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
            <img 
              src={post.featured_image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <CardTitle className="text-xl leading-tight">{post.title}</CardTitle>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(post.published_at || post.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>Admin</span>
          </div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {post.excerpt && (
          <p className="text-gray-600 mb-4 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {isExpanded && (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
              />
            </div>

            {post.pdf_attachment && (
              <PDFViewer 
                pdfUrl={post.pdf_attachment} 
                title={`${post.title} - Document`}
              />
            )}
          </div>
         )}

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 mt-4 flex items-center justify-center gap-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Read More
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate(`/blog/${post.slug}`)}
            className="mt-4 flex items-center justify-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Full Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpandableBlogCard;
