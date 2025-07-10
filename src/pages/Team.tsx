
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, Linkedin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types/teamMember';

const Team = () => {
  const { t } = useTranslation();

  // Fetch team members from database
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as TeamMember[];
    },
  });

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

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Loading team members...</div>
          </div>
        )}

        {/* Team Grid */}
        {!isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {teamMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={member.profile_picture || ''} alt={member.name} />
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
                      {member.description && (
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {member.description}
                        </p>
                      )}
                      <div className="flex flex-col space-y-2">
                        {member.email && (
                          <a 
                            href={`mailto:${member.email}`}
                            className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
                          >
                            <Mail className="h-4 w-4" />
                            <span className="text-sm">{member.email}</span>
                          </a>
                        )}
                        {member.phone && (
                          <a 
                            href={`tel:${member.phone}`}
                            className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
                          >
                            <Phone className="h-4 w-4" />
                            <span className="text-sm">{member.phone}</span>
                          </a>
                        )}
                        {member.linkedin && member.linkedin !== '#' && (
                          <a 
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
                          >
                            <Linkedin className="h-4 w-4" />
                            <span className="text-sm">LinkedIn</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && teamMembers.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
            <p className="text-gray-600">Check back later for team information.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Team;
