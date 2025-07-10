
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

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
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
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
              <li><span className="text-gray-300">Market Reports</span></li>
              <li><span className="text-gray-300">Investment Guide</span></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-gray-300">Dubai Marina, UAE</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-gray-300">+971 4 123 4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-gray-300">info@homeapp.ae</span>
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
