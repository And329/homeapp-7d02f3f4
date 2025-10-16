import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PropertyEditRequest } from "@/types/propertyEditRequest";
import { Property } from "@/types/property";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Check, X, Eye } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const AdminEditRequestsTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewingRequest, setViewingRequest] = useState<PropertyEditRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: editRequests, isLoading } = useQuery({
    queryKey: ["admin-edit-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_edit_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PropertyEditRequest[];
    },
  });

  const { data: properties } = useQuery({
    queryKey: ["properties-for-edit-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*");

      if (error) throw error;
      return data as Property[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase.rpc("approve_property_edit_request", {
        edit_request_id: requestId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Edit Request Approved",
        description: "The property has been updated with the requested changes.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-edit-requests"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      setViewingRequest(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve edit request",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason?: string }) => {
      const { error } = await supabase.rpc("reject_property_edit_request", {
        edit_request_id: requestId,
        rejection_reason: reason || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Edit Request Rejected",
        description: "The edit request has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-edit-requests"] });
      setViewingRequest(null);
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject edit request",
        variant: "destructive",
      });
    },
  });

  const getPropertyById = (propertyId: string) => {
    return properties?.find((p) => p.id === propertyId);
  };

  const renderComparisonField = (label: string, oldValue: any, newValue: any) => {
    if (newValue === null || newValue === undefined) return null;
    
    const hasChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue);
    if (!hasChanged) return null;

    return (
      <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-md">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{label} (Current)</p>
          <p className="text-sm">{JSON.stringify(oldValue)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-primary mb-1">{label} (Requested)</p>
          <p className="text-sm font-semibold">{JSON.stringify(newValue)}</p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const pendingRequests = editRequests?.filter((r) => r.status === "pending") || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Property Edit Requests</h2>
        <Badge variant="secondary">{pendingRequests.length} Pending</Badge>
      </div>

      {pendingRequests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No pending edit requests
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((request) => {
            const property = getPropertyById(request.property_id);
            return (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Edit Request for: {property?.title || "Unknown Property"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Submitted: {new Date(request.created_at).toLocaleDateString()}
                      </p>
                      {request.user_message && (
                        <p className="text-sm mt-2 italic">"{request.user_message}"</p>
                      )}
                    </div>
                    <Badge>{request.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setViewingRequest(request)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Changes
                    </Button>
                    <Button
                      onClick={() => approveMutation.mutate(request.id)}
                      disabled={approveMutation.isPending}
                      size="sm"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => setViewingRequest(request)}
                      variant="destructive"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!viewingRequest} onOpenChange={() => {
        setViewingRequest(null);
        setRejectionReason("");
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Property Edit Request</DialogTitle>
          </DialogHeader>
          {viewingRequest && (
            <div className="space-y-4">
              <div className="space-y-3">
                {(() => {
                  const property = getPropertyById(viewingRequest.property_id);
                  if (!property) return <p>Property not found</p>;

                  return (
                    <>
                      {renderComparisonField("Title", property.title, viewingRequest.title)}
                      {renderComparisonField("Description", property.description, viewingRequest.description)}
                      {renderComparisonField("Price", property.price, viewingRequest.price)}
                      {renderComparisonField("Location", property.location, viewingRequest.location)}
                      {renderComparisonField("Bedrooms", property.bedrooms, viewingRequest.bedrooms)}
                      {renderComparisonField("Bathrooms", property.bathrooms, viewingRequest.bathrooms)}
                      {renderComparisonField("Area", property.area, viewingRequest.area)}
                      {renderComparisonField("Emirate", property.emirate, viewingRequest.emirate)}
                      {renderComparisonField("Contact Name", property.contact_name, viewingRequest.contact_name)}
                      {renderComparisonField("Contact Email", property.contact_email, viewingRequest.contact_email)}
                      {renderComparisonField("Contact Phone", property.contact_phone, viewingRequest.contact_phone)}
                    </>
                  );
                })()}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejection_reason">Rejection Reason (optional)</Label>
                <Textarea
                  id="rejection_reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewingRequest(null);
                    setRejectionReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => rejectMutation.mutate({ requestId: viewingRequest.id, reason: rejectionReason })}
                  disabled={rejectMutation.isPending}
                >
                  {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reject
                </Button>
                <Button
                  onClick={() => approveMutation.mutate(viewingRequest.id)}
                  disabled={approveMutation.isPending}
                >
                  {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Approve Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
