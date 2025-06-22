
import React from 'react';
import { Button } from '@/components/ui/button';

interface PropertyFormActionsProps {
  loading: boolean;
  isEditing: boolean;
  onCancel: () => void;
}

const PropertyFormActions: React.FC<PropertyFormActionsProps> = ({
  loading,
  isEditing,
  onCancel,
}) => {
  return (
    <div className="flex items-center justify-end space-x-4 pt-4 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {isEditing ? 'Updating...' : 'Creating...'}
          </div>
        ) : (
          isEditing ? 'Update Property' : 'Create Property'
        )}
      </Button>
    </div>
  );
};

export default PropertyFormActions;
