export interface VolunteerOpportunity {
  id: string;
  title: string;
  organization: string;
  location: string;
  description: string;
  category: string;
  date?: string;
  tags: string[];
  link: string;
  imageUrl?: string;
}

export type Category = 'Environment' | 'Animals' | 'Education' | 'Health' | 'Community' | 'Arts' | 'Seniors' | 'Youth';
