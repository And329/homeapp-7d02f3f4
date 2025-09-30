import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LandingPage } from '@/types/landingPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Trash2 } from 'lucide-react';
import PropertyMediaUpload from './PropertyMediaUpload';
import QRCodeUpload from './QRCodeUpload';

interface LandingPageFormProps {
  onClose: () => void;
  editingPage?: LandingPage | null;
}

export const LandingPageForm = ({ onClose, editingPage }: LandingPageFormProps) => {
  const { register, handleSubmit, setValue, watch } = useForm();
  const { toast } = useToast();
  const [features, setFeatures] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [budgetOptions, setBudgetOptions] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [newAmenity, setNewAmenity] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [floorPlans, setFloorPlans] = useState<string[]>([]);
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    if (editingPage) {
      Object.keys(editingPage).forEach(key => {
        setValue(key, editingPage[key as keyof LandingPage]);
      });
      setFeatures(editingPage.features || []);
      setAmenities(editingPage.amenities || []);
      setBudgetOptions(editingPage.budget_options || []);
      setGalleryImages(editingPage.gallery_images || []);
      setFloorPlans(editingPage.floor_plans || []);
      setQrCode(editingPage.qr_code || '');
    }
  }, [editingPage, setValue]);

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      features,
      amenities,
      budget_options: budgetOptions,
      gallery_images: galleryImages,
      floor_plans: floorPlans,
      qr_code: qrCode,
      starting_price: data.starting_price ? parseInt(data.starting_price) : null
    };

    const { error } = editingPage
      ? await supabase.from('landing_pages').update(payload).eq('id', editingPage.id)
      : await supabase.from('landing_pages').insert(payload);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Project ${editingPage ? 'updated' : 'created'} successfully`
      });
      onClose();
    }
  };

  const handleMediaUpload = (urls: string[]) => {
    setGalleryImages(prev => [...prev, ...urls]);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{editingPage ? 'Edit' : 'Create'} Project</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input {...register('title', { required: true })} />
            </div>
            <div>
              <Label htmlFor="slug">URL Slug *</Label>
              <Input {...register('slug', { required: true })} placeholder="dwtn-residences" />
            </div>
          </div>

          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input {...register('subtitle')} placeholder="at Business Bay, Dubai" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="developer">Developer</Label>
              <Input {...register('developer')} placeholder="Deyaar" />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input {...register('location')} placeholder="Business Bay, Dubai" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="starting_price">Starting Price (AED)</Label>
              <Input type="number" {...register('starting_price')} placeholder="1860000" />
            </div>
            <div>
              <Label htmlFor="completion_date">Completion Date</Label>
              <Input {...register('completion_date')} placeholder="Q4 2025" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input {...register('bedrooms')} placeholder="1-3" />
            </div>
            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input {...register('bathrooms')} placeholder="1-2" />
            </div>
            <div>
              <Label htmlFor="area_from">Area From (sqft)</Label>
              <Input {...register('area_from')} placeholder="650" />
            </div>
            <div>
              <Label htmlFor="area_to">Area To (sqft)</Label>
              <Input {...register('area_to')} placeholder="1500" />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea {...register('description')} rows={4} />
          </div>

          <div>
            <Label htmlFor="payment_plan">Payment Plan</Label>
            <Textarea {...register('payment_plan')} rows={3} placeholder="20% Down Payment&#10;40% During Construction&#10;40% On Completion" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hero_image">Hero Image URL</Label>
              <Input {...register('hero_image')} placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="video_url">Video URL</Label>
              <Input {...register('video_url')} placeholder="https://youtube.com/..." />
            </div>
          </div>

          <div>
            <Label>Gallery Images</Label>
            <PropertyMediaUpload 
              images={galleryImages}
              onImagesChange={setGalleryImages}
            />
            {galleryImages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {galleryImages.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt="" className="w-20 h-20 object-cover rounded" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-0 right-0 opacity-0 group-hover:opacity-100"
                      onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== idx))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Floor Plans</Label>
            <PropertyMediaUpload 
              images={floorPlans}
              onImagesChange={setFloorPlans}
            />
            {floorPlans.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {floorPlans.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt="" className="w-20 h-20 object-cover rounded" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-0 right-0 opacity-0 group-hover:opacity-100"
                      onClick={() => setFloorPlans(prev => prev.filter((_, i) => i !== idx))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>QR Code</Label>
            <QRCodeUpload 
              qrCode={qrCode}
              onQRCodeChange={setQrCode}
            />
          </div>

          <div>
            <Label>Features</Label>
            <div className="flex gap-2 mb-2">
              <Input 
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add feature"
              />
              <Button
                type="button"
                onClick={() => {
                  if (newFeature) {
                    setFeatures([...features, newFeature]);
                    setNewFeature('');
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {features.map((f, idx) => (
                <div key={idx} className="bg-secondary px-3 py-1 rounded-full flex items-center gap-2">
                  {f}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Amenities</Label>
            <div className="flex gap-2 mb-2">
              <Input 
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Add amenity"
              />
              <Button
                type="button"
                onClick={() => {
                  if (newAmenity) {
                    setAmenities([...amenities, newAmenity]);
                    setNewAmenity('');
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a, idx) => (
                <div key={idx} className="bg-secondary px-3 py-1 rounded-full flex items-center gap-2">
                  {a}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => setAmenities(amenities.filter((_, i) => i !== idx))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Budget Options</Label>
            <div className="flex gap-2 mb-2">
              <Input 
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                placeholder="AED 1M - AED 2M"
              />
              <Button
                type="button"
                onClick={() => {
                  if (newBudget) {
                    setBudgetOptions([...budgetOptions, newBudget]);
                    setNewBudget('');
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {budgetOptions.map((b, idx) => (
                <div key={idx} className="bg-secondary px-3 py-1 rounded-full flex items-center gap-2">
                  {b}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => setBudgetOptions(budgetOptions.filter((_, i) => i !== idx))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="meta_title">Meta Title (SEO)</Label>
              <Input {...register('meta_title')} />
            </div>
            <div>
              <Label htmlFor="meta_description">Meta Description (SEO)</Label>
              <Input {...register('meta_description')} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">
              {editingPage ? 'Update' : 'Create'} Project
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
