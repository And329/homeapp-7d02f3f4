
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MapPin, Phone, Mail, Facebook, Instagram, MessageCircle, Video } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-primary text-white p-2 rounded-lg">
                <Home className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold">HomeApp</span>
            </div>
            <p className="text-gray-300">
              Your trusted partner in UAE real estate. Find your dream property with us.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/15jWd7iVwn/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/m_zverev_davima?igsh=bGdvcWs4N3lhZ3c0" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.tiktok.com/@mzverev_davima?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors">
                <Video className="h-5 w-5" />
              </a>
              <a href="https://t.me/mzverev_davima" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/properties" className="text-gray-300 hover:text-primary transition-colors">Properties</Link></li>
              <li><Link to="/team" className="text-gray-300 hover:text-primary transition-colors">Our Team</Link></li>
              <li><Link to="/blog" className="text-gray-300 hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/news" className="text-gray-300 hover:text-primary transition-colors">News</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/information" className="text-gray-300 hover:text-primary transition-colors">Information</Link></li>
              <li><Link to="/instructions" className="text-gray-300 hover:text-primary transition-colors">How to Use</Link></li>
              <li><Link to="/list-property" className="text-gray-300 hover:text-primary transition-colors">List Property</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-gray-300">Office 402, Citadel Tower, Business Bay, Dubai</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-gray-300">+971 4 572 5281</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-gray-300">contact@homeapp.ae</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2025 HomeApp. All rights reserved. Real Estate License: RERA-12345
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
