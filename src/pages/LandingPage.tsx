import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LandingPage as LandingPageType } from '@/types/landingPage';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Check, MapPin, Calendar, Maximize2, Bed, Bath, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import PropertyQRCode from '@/components/PropertyQRCode';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function LandingPage() {
  const { slug } = useParams();
  const { toast } = useToast();
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(0);
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
      <Navbar />
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center py-20"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(${landingPage.hero_image || '/placeholder.svg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
        key="hero-section"
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
              <h3 className="text-3xl font-bold mb-6 text-center">About the Development</h3>
              <Card className="p-8 bg-gradient-to-br from-muted/30 to-muted/60 border-none shadow-lg">
                <div className="max-w-4xl mx-auto">
                  {landingPage.description.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-lg leading-relaxed mb-4 last:mb-0 text-foreground/90">
                      {paragraph}
                    </p>
                  ))}
                </div>
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
              <h3 className="text-3xl font-bold mb-6 text-center">Investment Opportunity</h3>
              <Card className="p-10 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 shadow-xl">
                <div className="max-w-3xl mx-auto">
                  {landingPage.payment_plan.split('\n\n').map((section, idx) => (
                    <div key={idx} className="mb-6 last:mb-0">
                      {section.split('\n').map((line, lineIdx) => {
                        if (line.startsWith('💰') || line.startsWith('✨')) {
                          return <h4 key={lineIdx} className="text-2xl font-bold mb-4 text-primary">{line}</h4>;
                        }
                        return <p key={lineIdx} className="text-lg leading-relaxed mb-2">{line}</p>;
                      })}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {landingPage.floor_plans && landingPage.floor_plans.length > 0 && (
            <div className="mb-16">
              <h3 className="text-3xl font-bold mb-8 text-center">Floor Plans</h3>
              <Carousel className="w-full max-w-5xl mx-auto">
                <CarouselContent>
                  {landingPage.floor_plans.map((plan, idx) => (
                    <CarouselItem key={idx}>
                      <Card className="p-6 bg-muted/30">
                        <div className="flex items-center justify-center mb-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-5 w-5" />
                            <span className="font-medium">Floor Plan {idx + 1} of {landingPage.floor_plans!.length}</span>
                          </div>
                        </div>
                        <img 
                          src={plan} 
                          alt={`Floor Plan ${idx + 1}`} 
                          className="w-full h-auto object-contain rounded-lg bg-white p-4" 
                        />
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          )}

          {landingPage.gallery_images && landingPage.gallery_images.length > 0 && (
            <div className="mb-16">
              <h3 className="text-3xl font-bold mb-8 text-center">Property Gallery</h3>
              <div className="max-w-6xl mx-auto">
                {/* Main Featured Image */}
                <Card className="overflow-hidden mb-4 group">
                  <div className="relative aspect-video">
                    <img 
                      src={landingPage.gallery_images[selectedGalleryImage]} 
                      alt={`Gallery ${selectedGalleryImage + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    
                    {/* Navigation Arrows */}
                    {landingPage.gallery_images.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                          onClick={() => setSelectedGalleryImage(prev => 
                            prev === 0 ? landingPage.gallery_images!.length - 1 : prev - 1
                          )}
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                          onClick={() => setSelectedGalleryImage(prev => 
                            prev === landingPage.gallery_images!.length - 1 ? 0 : prev + 1
                          )}
                        >
                          <ChevronRight className="h-6 w-6" />
                        </Button>
                      </>
                    )}
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                      {selectedGalleryImage + 1} / {landingPage.gallery_images.length}
                    </div>
                  </div>
                </Card>

                {/* Thumbnail Grid */}
                {landingPage.gallery_images.length > 1 && (
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {landingPage.gallery_images.map((image, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedGalleryImage(idx)}
                        className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                          selectedGalleryImage === idx 
                            ? 'ring-4 ring-primary scale-105' 
                            : 'hover:scale-105 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img 
                          src={image} 
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {landingPage.qr_code && (
            <div className="text-center pt-8">
              <h3 className="text-3xl font-bold mb-6">Get Detailed Brochure</h3>
              <Card className="inline-block p-10 shadow-2xl bg-gradient-to-br from-card to-muted/30">
                <PropertyQRCode 
                  qrCode={landingPage.qr_code}
                  propertyTitle={landingPage.title}
                  className="mb-6"
                />
                <div className="space-y-2">
                  <p className="text-xl font-semibold">Scan to Download</p>
                  <p className="text-muted-foreground max-w-sm">Get comprehensive property details, payment plans, and exclusive offers delivered to your device</p>
                </div>
              </Card>
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
      
      <Footer />
    </div>
  );
}
