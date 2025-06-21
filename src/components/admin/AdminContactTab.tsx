
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, Calendar, MessageSquare } from 'lucide-react';

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  inquiry_type: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const AdminContactTab: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingInquiry, setEditingInquiry] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [status, setStatus] = useState<'new' | 'in_progress' | 'resolved'>('new');

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ['contact-inquiries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ContactInquiry[];
    },
  });

  const updateInquiryMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes: string }) => {
      const { error } = await supabase
        .from('contact_inquiries')
        .update({
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-inquiries'] });
      setEditingInquiry(null);
      toast({
        title: "Success",
        description: "Inquiry updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating inquiry:', error);
      toast({
        title: "Error",
        description: "Failed to update inquiry",
        variant: "destructive",
      });
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'new': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'secondary';
      default: return 'default';
    }
  };

  const handleEdit = (inquiry: ContactInquiry) => {
    setEditingInquiry(inquiry.id);
    setStatus(inquiry.status);
    setAdminNotes(inquiry.admin_notes || '');
  };

  const handleSave = () => {
    if (editingInquiry) {
      updateInquiryMutation.mutate({
        id: editingInquiry,
        status,
        adminNotes
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('admin.contactInquiries')} ({inquiries.length})</h2>
      </div>

      {inquiries.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No contact inquiries yet</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{inquiry.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusBadgeVariant(inquiry.status)}>
                      {t(`admin.inquiryStatus.${inquiry.status}`)}
                    </Badge>
                    <Button
                      onClick={() => handleEdit(inquiry)}
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{inquiry.email}</span>
                  </div>
                  {inquiry.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{inquiry.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium mb-1">Inquiry Type:</p>
                  <p className="text-sm text-gray-600 capitalize">{inquiry.inquiry_type.replace('_', ' ')}</p>
                </div>
                
                <div>
                  <p className="font-medium mb-1">Message:</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{inquiry.message}</p>
                </div>

                {inquiry.admin_notes && (
                  <div>
                    <p className="font-medium mb-1">Admin Notes:</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{inquiry.admin_notes}</p>
                  </div>
                )}

                {editingInquiry === inquiry.id && (
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('admin.updateStatus')}
                      </label>
                      <Select value={status} onValueChange={(value: 'new' | 'in_progress' | 'resolved') => setStatus(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">{t('admin.inquiryStatus.new')}</SelectItem>
                          <SelectItem value="in_progress">{t('admin.inquiryStatus.in_progress')}</SelectItem>
                          <SelectItem value="resolved">{t('admin.inquiryStatus.resolved')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('admin.addNotes')}
                      </label>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={3}
                        placeholder="Add your notes here..."
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={handleSave} disabled={updateInquiryMutation.isPending}>
                        {t('admin.save')}
                      </Button>
                      <Button
                        onClick={() => setEditingInquiry(null)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContactTab;
