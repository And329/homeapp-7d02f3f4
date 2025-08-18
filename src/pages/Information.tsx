
import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Target, Eye, CheckCircle, Facebook, Instagram, Youtube, Mail, MessageCircle, Video } from 'lucide-react';

const Information = () => {
  const { t } = useTranslation();

  const services = [
    t('information.servicesList.buying'),
    t('information.servicesList.selling'),
    t('information.servicesList.renting'),
    t('information.servicesList.consultation'),
    t('information.servicesList.valuation'),
    t('information.servicesList.investment')
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('information.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('information.subtitle')}
          </p>
        </div>

        {/* Mission and Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-primary" />
                <span>{t('information.mission')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                {t('information.missionText')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-6 w-6 text-primary" />
                <span>{t('information.vision')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                {t('information.visionText')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Services */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span>{t('information.services')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{service}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Connect With Us</CardTitle>
            <p className="text-center text-muted-foreground">Follow us on social media for the latest updates</p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center gap-6 flex-wrap">
              <a
                href="https://www.facebook.com/share/15jWd7iVwn/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-muted/50 transition-all duration-300 hover:scale-105"
              >
                <div className="p-3 rounded-full bg-blue-100 group-hover:bg-blue-500 transition-colors duration-300">
                  <Facebook className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">Facebook</span>
              </a>
              
              <a
                href="https://www.instagram.com/m_zverev_davima?igsh=bGdvcWs4N3lhZ3c0"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-muted/50 transition-all duration-300 hover:scale-105"
              >
                <div className="p-3 rounded-full bg-pink-100 group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300">
                  <Instagram className="h-6 w-6 text-pink-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">Instagram</span>
              </a>
              
              <a
                href="https://www.tiktok.com/@mzverev_davima?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-muted/50 transition-all duration-300 hover:scale-105"
              >
                <div className="p-3 rounded-full bg-gray-900 group-hover:bg-black transition-colors duration-300">
                  <Video className="h-6 w-6 text-white group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">TikTok</span>
              </a>
              
              <a
                href="https://youtube.com/@mzverev_davimare?si=mpjcdlAFLs0mKMp4"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-muted/50 transition-all duration-300 hover:scale-105"
              >
                <div className="p-3 rounded-full bg-red-100 group-hover:bg-red-600 transition-colors duration-300">
                  <Youtube className="h-6 w-6 text-red-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">YouTube</span>
              </a>
              
              <a
                href="https://t.me/mzverev_davima"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-muted/50 transition-all duration-300 hover:scale-105"
              >
                <div className="p-3 rounded-full bg-sky-100 group-hover:bg-sky-500 transition-colors duration-300">
                  <MessageCircle className="h-6 w-6 text-sky-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">Telegram</span>
              </a>
              
              <a
                href="mailto:contact@example.com"
                className="group flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-muted/50 transition-all duration-300 hover:scale-105"
              >
                <div className="p-3 rounded-full bg-gray-100 group-hover:bg-gray-600 transition-colors duration-300">
                  <Mail className="h-6 w-6 text-gray-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">Email</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Information;
