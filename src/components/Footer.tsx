
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, MapPin, Phone, Mail, Facebook, Instagram, MessageCircle } from 'lucide-react';
import TikTokIcon from '@/components/icons/TikTokIcon';

const Footer = () => {
  const { t } = useTranslation();

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
              {t('footer.companyDescription')}
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/15jWd7iVwn/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/m_zverev_davima?igsh=bGdvcWs4N3lhZ3c0" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.tiktok.com/@mzverev_davima?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors">
                <TikTokIcon className="h-5 w-5" />
              </a>
              <a href="https://t.me/mzverev_davima" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-primary transition-colors">{t('navbar.home')}</Link></li>
              <li><Link to="/properties" className="text-gray-300 hover:text-primary transition-colors">{t('navbar.properties')}</Link></li>
              <li><Link to="/team" className="text-gray-300 hover:text-primary transition-colors">{t('navbar.team')}</Link></li>
              <li><Link to="/blog" className="text-gray-300 hover:text-primary transition-colors">{t('navbar.blog')}</Link></li>
              <li><Link to="/news" className="text-gray-300 hover:text-primary transition-colors">{t('navbar.news')}</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-primary transition-colors">{t('navbar.contact')}</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.resources')}</h3>
            <ul className="space-y-2">
              <li><Link to="/information" className="text-gray-300 hover:text-primary transition-colors">{t('navbar.information')}</Link></li>
              <li><Link to="/instructions" className="text-gray-300 hover:text-primary transition-colors">{t('navbar.instructions')}</Link></li>
              <li><Link to="/list-property" className="text-gray-300 hover:text-primary transition-colors">{t('navbar.listProperty')}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.contactInfo')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-gray-300">{t('footer.address')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+97145725281" className="text-gray-300 hover:text-primary transition-colors">
                  +971 4 572 5281
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:contact@homeapp.ae" className="text-gray-300 hover:text-primary transition-colors">
                  contact@homeapp.ae
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
