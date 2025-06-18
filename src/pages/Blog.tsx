
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'UAE Real Estate Market Trends 2024: What Investors Need to Know',
    excerpt: 'Discover the latest trends shaping the UAE real estate market and how they impact investment opportunities across Dubai, Abu Dhabi, and other emirates.',
    image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=400&fit=crop',
    author: 'Sarah Al-Mahmoud',
    date: '2024-01-15',
    category: 'Market Analysis',
    readTime: '5 min read'
  },
  {
    id: '2',
    title: 'First-Time Home Buyer\'s Guide to Dubai Real Estate',
    excerpt: 'Everything you need to know before purchasing your first property in Dubai, from financing options to legal requirements and best neighborhoods.',
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop',
    author: 'Ahmed Hassan',
    date: '2024-01-10',
    category: 'Buying Guide',
    readTime: '8 min read'
  },
  {
    id: '3',
    title: 'Top 10 Luxury Communities in Dubai for 2024',
    excerpt: 'Explore the most exclusive residential communities in Dubai, featuring world-class amenities, stunning architecture, and prime locations.',
    image: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=800&h=400&fit=crop',
    author: 'Maria Rodriguez',
    date: '2024-01-08',
    category: 'Luxury Living',
    readTime: '6 min read'
  },
  {
    id: '4',
    title: 'Rental Market Insights: Finding the Perfect Property in Abu Dhabi',
    excerpt: 'Navigate the Abu Dhabi rental market with confidence. Learn about pricing trends, popular areas, and tips for securing your ideal rental property.',
    image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=400&fit=crop',
    author: 'Omar Al-Rashid',
    date: '2024-01-05',
    category: 'Rental Guide',
    readTime: '7 min read'
  },
  {
    id: '5',
    title: 'Investment Opportunities in UAE\'s Emerging Real Estate Markets',
    excerpt: 'Discover promising investment opportunities in up-and-coming areas across the UAE, from emerging neighborhoods to new development projects.',
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=400&fit=crop',
    author: 'Lisa Chen',
    date: '2024-01-03',
    category: 'Investment',
    readTime: '9 min read'
  },
  {
    id: '6',
    title: 'Smart Home Technology in UAE Real Estate: The Future is Now',
    excerpt: 'How smart home technology is revolutionizing UAE properties and what homebuyers should look for in modern connected homes.',
    image: 'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&h=400&fit=crop',
    author: 'John Smith',
    date: '2024-01-01',
    category: 'Technology',
    readTime: '5 min read'
  }
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="uae-gradient text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Real Estate Blog</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Expert insights, market analysis, and helpful guides for UAE real estate
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative">
                <img 
                  src={blogPosts[0].image} 
                  alt={blogPosts[0].title}
                  className="w-full h-64 lg:h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Featured
                </div>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full">
                    {blogPosts[0].category}
                  </span>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(blogPosts[0].date).toLocaleDateString()}</span>
                  </div>
                  <span>{blogPosts[0].readTime}</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  {blogPosts[0].title}
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{blogPosts[0].author}</span>
                  </div>
                  <Link 
                    to={`/blog/${blogPosts[0].id}`}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    Read More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white bg-opacity-90 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                    {post.category}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <span>{post.readTime}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-700 mb-4 text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{post.author}</span>
                    </div>
                    <Link 
                      to={`/blog/${post.id}`}
                      className="text-primary hover:text-blue-700 transition-colors flex items-center text-sm font-medium"
                    >
                      Read More
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
