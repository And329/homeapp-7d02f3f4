import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types/property";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { PropertyEditRequestForm } from "./PropertyEditRequestForm";
import { useToast } from "@/hooks/use-toast";
import { transformDatabaseProperty } from "@/utils/propertyTransform";

export const UserPropertyList = () => {
  const { toast } = useToast();
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const { data: userProperties, isLoading } = useQuery({
    queryKey: ["user-properties"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(transformDatabaseProperty);
    },
  });

  const handleEditClick = (property: Property) => {
    setEditingProperty(property);
    setIsEditFormOpen(true);
  };

  const handleDeleteRequest = async (propertyId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("request_property_deletion_enhanced", {
        property_id_param: propertyId,
        reason_param: "User requested deletion from profile",
      });

      if (error) throw error;

      toast({
        title: "Deletion Request Submitted",
        description: "Your deletion request has been submitted for admin review.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit deletion request",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userProperties || userProperties.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          You haven't listed any properties yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {userProperties.map((property) => (
          <Card key={property.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{property.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Listed: {new Date(property.created_at || "").toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={property.is_approved ? "default" : "secondary"}>
                    {property.is_approved ? "Published" : "Pending"}
                  </Badge>
                  {property.is_archived && <Badge variant="outline">Archived</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEditClick(property)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Request Edit
                </Button>
                <Button
                  onClick={() => handleDeleteRequest(property.id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Request Deletion
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingProperty && (
        <PropertyEditRequestForm
          property={editingProperty}
          open={isEditFormOpen}
          onClose={() => {
            setIsEditFormOpen(false);
            setEditingProperty(null);
          }}
          onSuccess={() => {
            setIsEditFormOpen(false);
            setEditingProperty(null);
          }}
        />
      )}
    </>
  );
};
