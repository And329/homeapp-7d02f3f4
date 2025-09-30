import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LandingPage } from '@/types/landingPage';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Bed, Bath, Maximize2, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Projects() {
  const navigate = useNavigate();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as LandingPage[];
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">Loading projects...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold">
              Off-Plan Projects
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover exclusive off-plan developments in Dubai's most prestigious locations
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {projects && projects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/landing/${project.slug}`)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={project.hero_image || '/placeholder.svg'} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      {project.developer && (
                        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                          {project.developer}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      {project.subtitle && (
                        <p className="text-muted-foreground">{project.subtitle}</p>
                      )}
                    </div>

                    {project.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{project.location}</span>
                      </div>
                    )}

                    {project.starting_price && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground mb-1">Starting from</p>
                        <p className="text-2xl font-bold text-primary">
                          AED {(project.starting_price / 1000000).toFixed(2)}M
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-2">
                      {project.bedrooms && (
                        <div className="flex items-center gap-1 text-sm">
                          <Bed className="h-4 w-4 text-muted-foreground" />
                          <span>{project.bedrooms}</span>
                        </div>
                      )}
                      {project.bathrooms && (
                        <div className="flex items-center gap-1 text-sm">
                          <Bath className="h-4 w-4 text-muted-foreground" />
                          <span>{project.bathrooms}</span>
                        </div>
                      )}
                      {project.area_from && (
                        <div className="flex items-center gap-1 text-sm">
                          <Maximize2 className="h-4 w-4 text-muted-foreground" />
                          <span>{project.area_from} - {project.area_to} sqft</span>
                        </div>
                      )}
                      {project.completion_date && (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{project.completion_date}</span>
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full group/btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/landing/${project.slug}`);
                      }}
                    >
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No Projects Available</h3>
              <p className="text-muted-foreground">
                Check back soon for exciting new off-plan developments
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
