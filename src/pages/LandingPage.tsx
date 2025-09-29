import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LandingPage as LandingPageType } from '@/types/landingPage';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Check, MapPin, Calendar, Maximize2, Bed, Bath } from 'lucide-react';

export default function LandingPage() {
  const { slug } = useParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    budget: ''
  });

  const { data: landingPage, isLoading } = useQuery({
    queryKey: ['landing-page', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as LandingPageType;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!landingPage) return;

    const { error } = await supabase
      .from('landing_page_leads')
      .insert({
        landing_page_id: landingPage.id,
        ...formData
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success!",
        description: "Thank you for your interest. We'll contact you soon."
      });
      setFormData({ name: '', email: '', whatsapp: '', budget: '' });
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!landingPage) {
    return <div className="min-h-screen flex items-center justify-center">Landing page not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(${landingPage.hero_image || '/placeholder.svg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
            {/* Left side - Property info */}
            <div className="text-white space-y-6 animate-fade-in">
              <div className="space-y-2">
                {landingPage.developer && (
                  <p className="text-sm font-medium uppercase tracking-wider text-white/80">
                    {landingPage.developer}
                  </p>
                )}
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  {landingPage.title}
                </h1>
                {landingPage.subtitle && (
                  <p className="text-xl text-white/90">{landingPage.subtitle}</p>
                )}
              </div>
              
              {landingPage.starting_price && (
                <div className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg">
                  <p className="text-sm font-medium">Starting from</p>
                  <p className="text-3xl font-bold">
                    AED {(landingPage.starting_price / 1000000).toFixed(2)}M
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-4">
                {landingPage.bedrooms && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Bed className="h-5 w-5" />
                    <span className="font-medium">{landingPage.bedrooms} Beds</span>
                  </div>
                )}
                {landingPage.bathrooms && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Bath className="h-5 w-5" />
                    <span className="font-medium">{landingPage.bathrooms} Baths</span>
                  </div>
                )}
                {landingPage.area_from && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Maximize2 className="h-5 w-5" />
                    <span className="font-medium">{landingPage.area_from} - {landingPage.area_to} sqft</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Lead form */}
            <Card className="p-8 bg-card/95 backdrop-blur-lg shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Register Your Interest</h2>
                <p className="text-muted-foreground">Get exclusive details and pricing</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    placeholder="+971 50 123 4567"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="budget">Investment Budget</Label>
                  <Select 
                    value={formData.budget}
                    onValueChange={(value) => setFormData({ ...formData, budget: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      {landingPage.budget_options?.map((option, idx) => (
                        <SelectItem key={idx} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Get Property Details
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  By submitting, you agree to be contacted about this property
                </p>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Video Section */}
      {landingPage.video_url && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">Property Tour</h2>
            <div className="aspect-video max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                src={landingPage.video_url}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* Property Details */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-4">Property Details</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Discover the key features of this exceptional property
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {landingPage.bedrooms && (
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bed className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">Bedrooms</p>
                <p className="text-3xl font-bold">{landingPage.bedrooms}</p>
              </Card>
            )}
            {landingPage.bathrooms && (
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bath className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">Bathrooms</p>
                <p className="text-3xl font-bold">{landingPage.bathrooms}</p>
              </Card>
            )}
            {landingPage.area_from && (
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Maximize2 className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">Area Range</p>
                <p className="text-2xl font-bold">{landingPage.area_from} - {landingPage.area_to}</p>
                <p className="text-sm text-muted-foreground">sqft</p>
              </Card>
            )}
            {landingPage.completion_date && (
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">Completion</p>
                <p className="text-2xl font-bold">{landingPage.completion_date}</p>
              </Card>
            )}
          </div>

          {landingPage.description && (
            <div className="mb-16">
              <h3 className="text-3xl font-bold mb-6">About the Property</h3>
              <Card className="p-8 bg-muted/50">
                <p className="text-lg leading-relaxed whitespace-pre-line">{landingPage.description}</p>
              </Card>
            </div>
          )}

          {landingPage.features && landingPage.features.length > 0 && (
            <div className="mb-16">
              <h3 className="text-3xl font-bold mb-6">Key Features</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {landingPage.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-base">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {landingPage.amenities && landingPage.amenities.length > 0 && (
            <div className="mb-16">
              <h3 className="text-3xl font-bold mb-6">Premium Amenities</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {landingPage.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-base">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {landingPage.payment_plan && (
            <div className="mb-16">
              <h3 className="text-3xl font-bold mb-6">Flexible Payment Plan</h3>
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <p className="text-lg leading-relaxed whitespace-pre-line font-medium">{landingPage.payment_plan}</p>
              </Card>
            </div>
          )}

          {landingPage.gallery_images && landingPage.gallery_images.length > 0 && (
            <div>
              <h3 className="text-3xl font-bold mb-6">Gallery</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {landingPage.gallery_images.map((image, idx) => (
                  <div key={idx} className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
                    <img 
                      src={image} 
                      alt={`Gallery ${idx + 1}`} 
                      className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl font-bold mb-6">Ready to Invest?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Don't miss this exclusive opportunity. Register your interest now and our team will contact you with detailed information.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-6 hover:scale-105 transition-transform shadow-xl"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Register Your Interest
          </Button>
        </div>
      </section>
    </div>
  );
}
