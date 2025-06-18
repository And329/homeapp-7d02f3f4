
import React, { useState } from 'react';
import { Calendar, User, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  published_at: string | null;
  tags: string[] | null;
  pdf_attachment: string | null;
}

interface ExpandableBlogCardProps {
  post: BlogPost;
}

const ExpandableBlogCard = ({ post }: ExpandableBlogCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {post.featured_image && (
        <img
          src={post.featured_image}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <CardContent className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{formatDate(post.published_at)}</span>
          <User className="h-4 w-4 ml-4 mr-1" />
          <span>Admin</span>
        </div>
        
        <CardTitle className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {post.title}
        </CardTitle>
        
        <div className="text-gray-600 mb-4">
          {isExpanded ? (
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          ) : (
            <p className="line-clamp-3">
              {post.excerpt || truncateContent(post.content)}
            </p>
          )}
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {post.pdf_attachment && (
          <div className="mb-4">
            <a
              href={post.pdf_attachment}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span className="text-sm">View PDF Attachment</span>
            </a>
          </div>
        )}
        
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          className="flex items-center gap-2 p-0 h-auto font-semibold text-primary hover:text-primary/80"
        >
          {isExpanded ? (
            <>
              Show Less
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Read More
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExpandableBlogCard;
