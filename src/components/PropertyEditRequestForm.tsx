import { useState, useEffect } from "react";
import { Property } from "@/types/property";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import PropertyMediaUpload from "@/components/PropertyMediaUpload";
import PropertyAmenities from "@/components/PropertyAmenities";
import PropertyLocationPicker from "@/components/PropertyLocationPicker";
import EmiratesSelector from "@/components/EmiratesSelector";
import QRCodeUpload from "@/components/QRCodeUpload";
import { Loader2 } from "lucide-react";

interface PropertyEditRequestFormProps {
  property: Property;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PropertyEditRequestForm = ({ property, open, onClose, onSuccess }: PropertyEditRequestFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: property.title,
    description: property.description,
    price: property.price.toString(),
    location: property.location,
    latitude: property.latitude,
    longitude: property.longitude,
    bedrooms: property.bedrooms.toString(),
    bathrooms: property.bathrooms.toString(),
    area: property.area?.toString() || "",
    emirate: property.emirate,
    year_built: property.year_built?.toString() || "",
    parking: property.parking?.toString() || "",
    property_type: property.property_type,
    type: property.type,
    amenities: property.amenities,
    images: property.images,
    qr_code: property.qr_code,
    contact_name: property.contact_name || "",
    contact_email: property.contact_email || "",
    contact_phone: property.contact_phone || "",
    user_message: "",
  });

  useEffect(() => {
    if (open) {
      setFormData({
        title: property.title,
        description: property.description,
        price: property.price.toString(),
        location: property.location,
        latitude: property.latitude,
        longitude: property.longitude,
        bedrooms: property.bedrooms.toString(),
        bathrooms: property.bathrooms.toString(),
        area: property.area?.toString() || "",
        emirate: property.emirate,
        year_built: property.year_built?.toString() || "",
        parking: property.parking?.toString() || "",
        property_type: property.property_type,
        type: property.type,
        amenities: property.amenities,
        images: property.images,
        qr_code: property.qr_code,
        contact_name: property.contact_name || "",
        contact_email: property.contact_email || "",
        contact_phone: property.contact_phone || "",
        user_message: "",
      });
    }
  }, [property, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("property_edit_requests")
        .insert({
          property_id: property.id,
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          price: parseInt(formData.price),
          location: formData.location,
          latitude: formData.latitude,
          longitude: formData.longitude,
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          area: formData.area ? parseFloat(formData.area) : null,
          emirate: formData.emirate,
          year_built: formData.year_built ? parseInt(formData.year_built) : null,
          parking: formData.parking ? parseInt(formData.parking) : null,
          property_type: formData.property_type,
          amenities: formData.amenities,
          images: formData.images,
          qr_code: formData.qr_code,
          contact_name: formData.contact_name,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          user_message: formData.user_message,
        });

      if (error) throw error;

      toast({
        title: "Edit Request Submitted",
        description: "Your edit request has been submitted for admin review.",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error submitting edit request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit edit request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Property Edit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (AED)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="property_type">Property Type</Label>
                <Input
                  id="property_type"
                  value={formData.property_type}
                  onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="area">Area (sq ft)</Label>
                <Input
                  id="area"
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>
            </div>

            <EmiratesSelector
              value={formData.emirate}
              onChange={(value) => setFormData({ ...formData, emirate: value })}
            />

            <PropertyLocationPicker
              location={formData.location}
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={(location, lat, lng) =>
                setFormData({ ...formData, location, latitude: lat, longitude: lng })
              }
            />

            <PropertyMediaUpload
              images={formData.images}
              onImagesChange={(images) => setFormData({ ...formData, images })}
            />

            <PropertyAmenities
              selectedAmenities={formData.amenities}
              onAmenitiesChange={(amenities) => setFormData({ ...formData, amenities })}
            />

            <QRCodeUpload
              qrCode={formData.qr_code}
              onQRCodeChange={(qr_code) => setFormData({ ...formData, qr_code })}
            />

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name">Contact Name</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="user_message">Message to Admin (optional)</Label>
              <Textarea
                id="user_message"
                value={formData.user_message}
                onChange={(e) => setFormData({ ...formData, user_message: e.target.value })}
                placeholder="Explain what changes you made and why..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Edit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
