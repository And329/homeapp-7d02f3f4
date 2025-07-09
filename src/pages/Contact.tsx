
import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactForm from '../components/ContactForm';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const Contact = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="uae-gradient text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {t('contact.title')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
              {t('contact.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Information */}
            <div className="space-y-6 md:space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                  {t('contact.info.title')}
                </h2>
                <p className="text-gray-600 mb-6 md:mb-8 leading-relaxed">
                  {t('contact.info.description')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start space-x-3 md:space-x-4">
                      <div className="bg-primary/10 p-2 md:p-3 rounded-lg flex-shrink-0">
                        <Phone className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1">
                          {t('contact.info.phone')}
                        </h3>
                        <p className="text-gray-600 text-sm break-all">+971 4 123 4567</p>
                        <p className="text-gray-600 text-sm break-all">+971 50 123 4567</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start space-x-3 md:space-x-4">
                      <div className="bg-primary/10 p-2 md:p-3 rounded-lg flex-shrink-0">
                        <Mail className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1">
                          {t('contact.info.email')}
                        </h3>
                        <p className="text-gray-600 text-sm break-all">info@homeapp.ae</p>
                        <p className="text-gray-600 text-sm break-all">support@homeapp.ae</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start space-x-3 md:space-x-4">
                      <div className="bg-primary/10 p-2 md:p-3 rounded-lg flex-shrink-0">
                        <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1">
                          {t('contact.info.address')}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Downtown Dubai</p>
                        <p className="text-gray-600 text-sm leading-relaxed">Dubai, UAE</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start space-x-3 md:space-x-4">
                      <div className="bg-primary/10 p-2 md:p-3 rounded-lg flex-shrink-0">
                        <Clock className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1">
                          {t('contact.info.hours')}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Mon - Fri: 9AM - 6PM</p>
                        <p className="text-gray-600 text-sm leading-relaxed">Sat: 9AM - 4PM</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
