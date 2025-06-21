
import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, Linkedin } from 'lucide-react';

const Team = () => {
  const { t } = useTranslation();

  const teamMembers = [
    {
      name: "Ahmed Al-Rashid",
      position: "CEO & Founder",
      description: "15+ years in UAE real estate market with deep expertise in luxury properties and investment opportunities.",
      email: "ahmed@homeapp.ae",
      phone: "+971 50 123 4567",
      linkedin: "#"
    },
    {
      name: "Sarah Johnson",
      position: "Head of Sales",
      description: "International real estate expert specializing in helping expatriates find their perfect home in Dubai.",
      email: "sarah@homeapp.ae",
      phone: "+971 50 234 5678",
      linkedin: "#"
    },
    {
      name: "Omar Hassan",
      position: "Property Consultant",
      description: "Local market specialist with extensive knowledge of emerging neighborhoods and investment trends.",
      email: "omar@homeapp.ae",
      phone: "+971 50 345 6789",
      linkedin: "#"
    },
    {
      name: "Maria Rodriguez",
      position: "Client Relations Manager",
      description: "Dedicated to ensuring exceptional customer service and smooth property transactions for all clients.",
      email: "maria@homeapp.ae",
      phone: "+971 50 456 7890",
      linkedin: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('team.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('team.subtitle')}
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {teamMembers.map((member, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-white text-lg">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-primary font-medium mb-3">
                      {member.position}
                    </p>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {member.description}
                    </p>
                    <div className="flex flex-col space-y-2">
                      <a 
                        href={`mailto:${member.email}`}
                        className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">{member.email}</span>
                      </a>
                      <a 
                        href={`tel:${member.phone}`}
                        className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{member.phone}</span>
                      </a>
                      <a 
                        href={member.linkedin}
                        className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
                      >
                        <Linkedin className="h-4 w-4" />
                        <span className="text-sm">LinkedIn</span>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Team;
