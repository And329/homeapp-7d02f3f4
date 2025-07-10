import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types/teamMember';
import { useToast } from '@/hooks/use-toast';

interface AdminTeamTabProps {
  onCreateTeamMember: () => void;
  onEditTeamMember: (member: TeamMember) => void;
}

const AdminTeamTab: React.FC<AdminTeamTabProps> = ({
  onCreateTeamMember,
  onEditTeamMember,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch team members
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['admin-team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as TeamMember[];
    },
  });

  // Delete team member mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "Success",
        description: "Team member deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete team member",
        variant: "destructive",
      });
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('team_members')
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "Success",
        description: "Team member status updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update team member status",
        variant: "destructive",
      });
    },
  });

  // Update display order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, display_order }: { id: string; display_order: number }) => {
      const { error } = await supabase
        .from('team_members')
        .update({ display_order })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update display order",
        variant: "destructive",
      });
    },
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (id: string, is_active: boolean) => {
    toggleActiveMutation.mutate({ id, is_active: !is_active });
  };

  const handleMoveUp = (member: TeamMember) => {
    const currentIndex = teamMembers.findIndex(m => m.id === member.id);
    if (currentIndex > 0) {
      const prevMember = teamMembers[currentIndex - 1];
      updateOrderMutation.mutate({ id: member.id, display_order: prevMember.display_order });
      updateOrderMutation.mutate({ id: prevMember.id, display_order: member.display_order });
    }
  };

  const handleMoveDown = (member: TeamMember) => {
    const currentIndex = teamMembers.findIndex(m => m.id === member.id);
    if (currentIndex < teamMembers.length - 1) {
      const nextMember = teamMembers[currentIndex + 1];
      updateOrderMutation.mutate({ id: member.id, display_order: nextMember.display_order });
      updateOrderMutation.mutate({ id: nextMember.id, display_order: member.display_order });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading team members...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Team Management</h2>
          <Badge variant="secondary">{teamMembers.length} members</Badge>
        </div>
        <Button onClick={onCreateTeamMember} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Team Member</span>
        </Button>
      </div>

      {/* Team Members Grid */}
      <div className="grid gap-4">
        {teamMembers.map((member, index) => (
          <Card key={member.id} className={`transition-opacity ${!member.is_active ? 'opacity-60' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={member.profile_picture || ''} alt={member.name} />
                  <AvatarFallback className="bg-primary text-white text-lg">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {member.name}
                        </h3>
                        <Badge variant={member.is_active ? "default" : "secondary"}>
                          {member.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-primary font-medium mb-2">
                        {member.position}
                      </p>
                      {member.description && (
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {member.description}
                        </p>
                      )}
                      <div className="flex flex-col space-y-1 text-sm text-gray-600">
                        {member.email && <span>📧 {member.email}</span>}
                        {member.phone && <span>📱 {member.phone}</span>}
                        {member.linkedin && <span>💼 LinkedIn</span>}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveUp(member)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveDown(member)}
                          disabled={index === teamMembers.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditTeamMember(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={member.is_active ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleToggleActive(member.id, member.is_active)}
                        >
                          {member.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(member.id, member.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first team member.</p>
            <Button onClick={onCreateTeamMember}>
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminTeamTab;