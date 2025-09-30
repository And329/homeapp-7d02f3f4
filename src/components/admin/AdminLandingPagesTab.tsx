import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, ExternalLink, Eye, EyeOff, Trash2, Edit } from 'lucide-react';
import { LandingPageForm } from '@/components/LandingPageForm';
import { useToast } from '@/hooks/use-toast';
import { LandingPage } from '@/types/landingPage';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const AdminLandingPagesTab = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: landingPages, refetch } = useQuery({
    queryKey: ['admin-landing-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as LandingPage[];
    }
  });

  const { data: leadsCount } = useQuery({
    queryKey: ['landing-page-leads-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_page_leads')
        .select('landing_page_id');
      
      if (error) throw error;
      
      // Count leads per landing page
      const counts: Record<string, number> = {};
      data?.forEach(lead => {
        counts[lead.landing_page_id] = (counts[lead.landing_page_id] || 0) + 1;
      });
      return counts;
    }
  });

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('landing_pages')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update landing page status",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Landing page ${!currentStatus ? 'activated' : 'deactivated'}`
      });
      refetch();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('landing_pages')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete landing page",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Landing page deleted successfully"
      });
      refetch();
    }
    setDeleteId(null);
  };

  const handleEdit = (page: LandingPage) => {
    setEditingPage(page);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPage(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Landing Pages</h2>
          <p className="text-muted-foreground">Create and manage property landing pages for lead generation</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Landing Page
        </Button>
      </div>

      {isFormOpen && (
        <LandingPageForm 
          onClose={handleFormClose}
          editingPage={editingPage}
        />
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {landingPages?.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">{page.title}</TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{page.slug}</code>
                </TableCell>
                <TableCell>
                  {page.starting_price ? `AED ${(page.starting_price / 1000000).toFixed(2)}M` : '-'}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    page.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {page.is_active ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{leadsCount?.[page.id] || 0}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/landing/${page.slug}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(page.id, page.is_active)}
                    >
                      {page.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(page)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(page.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Landing Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this landing page? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
