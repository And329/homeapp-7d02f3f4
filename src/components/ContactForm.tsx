
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send } from 'lucide-react';
import { sanitizeInput } from '@/utils/validation';

const ContactForm: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Sanitize all input data
      const sanitizedData = {
        name: sanitizeInput(formData.name),
        email: sanitizeInput(formData.email),
        phone: sanitizeInput(formData.phone),
        inquiry_type: sanitizeInput(formData.inquiryType),
        message: sanitizeInput(formData.message)
      };

      const { error } = await supabase
        .from('contact_inquiries')
        .insert(sanitizedData);

      if (error) throw error;

      toast({
        title: "Success",
        description: t('contact.form.success'),
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        inquiryType: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Error",
        description: t('contact.form.error'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Send className="h-5 w-5 text-primary" />
          <span>{t('contact.form.title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('contact.form.name')} *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('contact.form.namePlaceholder')}
                required
                className="h-9"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('contact.form.email')} *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={t('contact.form.emailPlaceholder')}
                required
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('contact.form.phone')}
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder={t('contact.form.phonePlaceholder')}
                className="h-9"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('contact.form.inquiryType')} *
              </label>
              <Select value={formData.inquiryType} onValueChange={(value) => handleInputChange('inquiryType', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{t('contact.form.inquiryTypes.general')}</SelectItem>
                  <SelectItem value="property">{t('contact.form.inquiryTypes.property')}</SelectItem>
                  <SelectItem value="viewing">{t('contact.form.inquiryTypes.viewing')}</SelectItem>
                  <SelectItem value="selling">{t('contact.form.inquiryTypes.selling')}</SelectItem>
                  <SelectItem value="buying">{t('contact.form.inquiryTypes.buying')}</SelectItem>
                  <SelectItem value="renting">{t('contact.form.inquiryTypes.renting')}</SelectItem>
                  <SelectItem value="support">{t('contact.form.inquiryTypes.support')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('contact.form.message')} *
            </label>
            <Textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder={t('contact.form.messagePlaceholder')}
              rows={4}
              required
              className="resize-none"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !formData.name || !formData.email || !formData.inquiryType || !formData.message}
            className="w-full h-9"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Sending...' : t('contact.form.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;
