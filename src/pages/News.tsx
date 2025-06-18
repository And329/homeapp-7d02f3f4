
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  image: string;
  date: string;
  category: string;
  urgent?: boolean;
}

const newsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Dubai Real Estate Prices Rise 15% in Q1 2024',
    summary: 'The Dubai real estate market continues its strong performance with a 15% price increase in the first quarter of 2024, driven by international demand.',
    image: 'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&h=400&fit=crop',
    date: '2024-01-18',
    category: 'Market Update',
    urgent: true
  },
  {
    id: '2',
    title: 'New Visa Regulations Boost UAE Property Investment',
    summary: 'Recent changes to UAE visa regulations for property investors are expected to significantly increase foreign investment in the real estate sector.',
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=400&fit=crop',
    date: '2024-01-16',
    category: 'Government News'
  },
  {
    id: '3',
    title: 'Abu Dhabi Launches Sustainable Housing Initiative',
    summary: 'Abu Dhabi government announces new initiative to promote sustainable and eco-friendly housing developments across the emirate.',
    image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=400&fit=crop',
    date: '2024-01-14',
    category: 'Development News'
  },
  {
    id: '4',
    title: 'HomeApp Expands Services to Northern Emirates',
    summary: 'HomeApp announces expansion of its real estate services to cover Sharjah, Ajman, and other northern emirates, bringing comprehensive property solutions closer to more clients.',
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop',
    date: '2024-01-12',
    category: 'Company News'
  },
  {
    id: '5',
    title: 'Smart City Projects Drive Property Demand',
    summary: 'UAE\'s smart city initiatives are creating new opportunities in the real estate market, with tech-enabled properties seeing increased demand.',
    image: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=800&h=400&fit=crop',
    date: '2024-01-10',
    category: 'Technology'
  },
  {
    id: '6',
    title: 'Foreign Investment in UAE Real Estate Reaches Record High',
    summary: 'International investors continue to show strong confidence in UAE real estate, with foreign investment reaching unprecedented levels.',
    image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=400&fit=crop',
    date: '2024-01-08',
    category: 'Investment News'
  }
];

const News = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="uae-gradient text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Real Estate News</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Stay updated with the latest news and developments in UAE real estate market
            </p>
          </div>
        </div>
      </section>

      {/* Breaking News */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {newsArticles.filter(article => article.urgent).map((article) => (
            <div key={article.id} className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-8 animate-fade-in-up">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-500 font-semibold text-sm uppercase tracking-wide">Breaking News</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h2>
              <p className="text-gray-700 mb-3">{article.summary}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(article.date).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>{article.category}</span>
                </div>
                <Link 
                  to={`/news/${article.id}`}
                  className="text-red-500 hover:text-red-700 font-medium text-sm"
                >
                  Read Full Story →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* News Grid */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsArticles.filter(article => !article.urgent).map((article) => (
              <article key={article.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white bg-opacity-90 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                    {article.category}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(article.date).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>2 min read</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-700 mb-4 text-sm leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                  
                  <Link 
                    to={`/news/${article.id}`}
                    className="text-primary hover:text-blue-700 transition-colors font-medium text-sm"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Stay Informed</h2>
            <p className="text-gray-600 mb-6">
              Subscribe to our newsletter for the latest real estate news and market updates delivered to your inbox.
            </p>
            <form className="flex flex-col md:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default News;
