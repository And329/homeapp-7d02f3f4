
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
      content: [
        "Create your free HomeApp account by clicking 'Sign Up'",
        "Complete your profile with your contact information",
        "Verify your email address to access all features",
        "Explore the platform and set up your preferences"
      ]
    },
    {
      title: t('instructions.searchProperties'),
      icon: Search,
      content: [
        "Browse all properties or use advanced search filters",
        "Filter by emirate, property type, bedrooms, and price range",
        "View properties on map or in grid layout",
        "Save your favorite properties for later viewing"
      ]
    },
    {
      title: t('instructions.listProperty'),
      icon: Building2,
      content: [
        "Click 'List Property' in the navigation menu",
        "Fill out the comprehensive property information form",
        "Upload high-quality photos, videos, and documents",
        "Submit for admin review - properties approved within 24 hours",
        "Monitor your property status in your profile"
      ]
    },
    {
      title: t('instructions.contactSupport'),
      icon: MessageCircle,
      content: [
        "Use the contact form for general inquiries",
        "Contact property owners directly through property listings",
        "Get help from our expert team members",
        "Access our comprehensive information and news sections"
      ]
    }
  ];

  const features = [
    {
      icon: Star,
      title: "Favorites System",
      description: "Save and organize properties you're interested in for easy access later."
    },
    {
      icon: Shield,
      title: "Verified Listings",
      description: "All properties are reviewed and verified by our admin team for accuracy."
    },
    {
      icon: Map,
      title: "Interactive Maps",
      description: "View properties on interactive maps with precise location details."
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Connect with our professional real estate team for personalized assistance."
    },
    {
      icon: Bell,
      title: "Real-time Updates",
      description: "Stay informed with the latest property news and market insights."
    },
    {
      icon: FileText,
      title: "Comprehensive Information",
      description: "Access detailed property information, photos, videos, and documentation."
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
            <CardTitle>Platform Features</CardTitle>
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
