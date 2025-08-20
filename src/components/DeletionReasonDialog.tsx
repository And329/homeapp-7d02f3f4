import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';

interface DeletionReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
  propertyTitle: string;
}

export const DeletionReasonDialog: React.FC<DeletionReasonDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  propertyTitle,
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    console.log('DeletionReasonDialog: handleConfirm called with reason:', reason);
    onConfirm(reason);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Trash2 className="h-5 w-5 mr-2 text-red-600" />
            Request Property Deletion
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to request deletion of "{propertyTitle}"? This action will require admin approval.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="deletion-reason">Reason for deletion (optional)</Label>
            <Textarea
              id="deletion-reason"
              placeholder="Please provide a reason for requesting deletion..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Request Deletion
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};