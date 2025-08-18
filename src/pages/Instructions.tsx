
import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Search, Building2, MessageCircle, Star, Shield, Users, FileText, Bell, Map } from 'lucide-react';

const Instructions = () => {
  const { t } = useTranslation();

  const steps = [
    {
      title: t('instructions.gettingStarted'),
      icon: UserPlus,
      content: t('instructions.content.gettingStarted', { returnObjects: true }) as string[]
    },
    {
      title: t('instructions.searchProperties'),
      icon: Search,
      content: t('instructions.content.searchProperties', { returnObjects: true }) as string[]
    },
    {
      title: t('instructions.listProperty'),
      icon: Building2,
      content: t('instructions.content.listProperty', { returnObjects: true }) as string[]
    },
    {
      title: t('instructions.contactSupport'),
      icon: MessageCircle,
      content: t('instructions.content.contactSupport', { returnObjects: true }) as string[]
    }
  ];

  const features = [
    {
      icon: Star,
      title: t('instructions.features.favoritesSystem.title'),
      description: t('instructions.features.favoritesSystem.description')
    },
    {
      icon: Shield,
      title: t('instructions.features.verifiedListings.title'),
      description: t('instructions.features.verifiedListings.description')
    },
    {
      icon: Map,
      title: t('instructions.features.interactiveMaps.title'),
      description: t('instructions.features.interactiveMaps.description')
    },
    {
      icon: Users,
      title: t('instructions.features.expertTeam.title'),
      description: t('instructions.features.expertTeam.description')
    },
    {
      icon: Bell,
      title: t('instructions.features.realTimeUpdates.title'),
      description: t('instructions.features.realTimeUpdates.description')
    },
    {
      icon: FileText,
      title: t('instructions.features.comprehensiveInformation.title'),
      description: t('instructions.features.comprehensiveInformation.description')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('instructions.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('instructions.subtitle')}
          </p>
        </div>

        {/* Step-by-step Guide */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <span>{step.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {step.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-3">
                        <span className="bg-primary text-white text-xs rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {itemIndex + 1}
                        </span>
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Platform Features */}
        <Card>
          <CardHeader>
            <CardTitle>{t('instructions.features.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Instructions;
