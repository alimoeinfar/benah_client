export interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface Organisation {
  id: number;
  name: string;
  credit: string;
  contact_email: string;
  created_at: string;
  members: Member[];
}
