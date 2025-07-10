export interface TeamMember {
  id: string;
  name: string;
  position: string;
  description?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  profile_picture?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTeamMemberData {
  name: string;
  position: string;
  description?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  profile_picture?: string;
  display_order?: number;
}

export interface UpdateTeamMemberData extends Partial<CreateTeamMemberData> {
  id: string;
  is_active?: boolean;
}