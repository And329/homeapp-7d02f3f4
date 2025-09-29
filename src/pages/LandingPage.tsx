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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${landingPage.hero_image || '/placeholder.svg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Card className="max-w-md w-full mx-4 p-8 bg-white/95 backdrop-blur">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">{landingPage.title}</h1>
            {landingPage.subtitle && (
              <p className="text-lg text-muted-foreground">{landingPage.subtitle}</p>
            )}
            {landingPage.starting_price && (
              <p className="text-2xl font-bold text-primary mt-4">
                Starting from AED {(landingPage.starting_price / 1000000).toFixed(2)}M
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="budget">Budget</Label>
              <Select 
                value={formData.budget}
                onValueChange={(value) => setFormData({ ...formData, budget: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your budget" />
                </SelectTrigger>
                <SelectContent>
                  {landingPage.budget_options?.map((option, idx) => (
                    <SelectItem key={idx} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Submit
            </Button>
          </form>
        </Card>
      </section>

      {/* Video Section */}
      {landingPage.video_url && (
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="aspect-video max-w-4xl mx-auto">
              <iframe
                src={landingPage.video_url}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* Property Details */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12">Property Details</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {landingPage.bedrooms && (
              <Card className="p-6 text-center">
                <Bed className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Bedrooms</p>
                <p className="text-2xl font-bold">{landingPage.bedrooms}</p>
              </Card>
            )}
            {landingPage.bathrooms && (
              <Card className="p-6 text-center">
                <Bath className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Bathrooms</p>
                <p className="text-2xl font-bold">{landingPage.bathrooms}</p>
              </Card>
            )}
            {landingPage.area_from && (
              <Card className="p-6 text-center">
                <Maximize2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Area</p>
                <p className="text-2xl font-bold">{landingPage.area_from} - {landingPage.area_to} sqft</p>
              </Card>
            )}
            {landingPage.completion_date && (
              <Card className="p-6 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className="text-2xl font-bold">{landingPage.completion_date}</p>
              </Card>
            )}
          </div>

          {landingPage.description && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-4">About the Property</h3>
              <p className="text-lg text-muted-foreground whitespace-pre-line">{landingPage.description}</p>
            </div>
          )}

          {landingPage.features && landingPage.features.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6">Features</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {landingPage.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {landingPage.amenities && landingPage.amenities.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6">Amenities</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {landingPage.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {landingPage.payment_plan && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6">Payment Plan</h3>
              <Card className="p-6">
                <p className="text-lg whitespace-pre-line">{landingPage.payment_plan}</p>
              </Card>
            </div>
          )}

          {landingPage.gallery_images && landingPage.gallery_images.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Gallery</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {landingPage.gallery_images.map((image, idx) => (
                  <img key={idx} src={image} alt="" className="w-full h-64 object-cover rounded-lg" />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Interested?</h2>
          <p className="text-xl mb-8">Fill out the form above to get more information</p>
          <Button size="lg" variant="secondary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Contact Us Now
          </Button>
        </div>
      </section>
    </div>
  );
}
