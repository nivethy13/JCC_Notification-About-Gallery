// frontend/src/types/about.ts

export interface About {
  id: number;
  
  // Hero Section (only background image is editable)
  hero_title: string;
  hero_subtitle: string;
  hero_badge: string;
  hero_quote: string;
  hero_background_url?: string | null;

  
  // Mission Section
  mission_heading: string;
  mission_title: string;
  mission_subtitle: string;
  mission_description: string;
  mission_quote?: string;
  
  // Vision Section
  vision_title: string;
  vision_description: string;
  vision_quote?: string;
  
  // Timeline Section
  timeline_heading: string;
  timeline_subtitle: string;
  timeline_event_1_year: string;
  timeline_event_1_title: string;
  timeline_event_1_description: string;
  timeline_event_2_year: string;
  timeline_event_2_title: string;
  timeline_event_2_description: string;
  timeline_event_3_year: string;
  timeline_event_3_title: string;
  timeline_event_3_description: string;
  
  // Facilities Section
  facilities_heading: string;
  facilities_subtitle: string;
  facility_1_title: string;
  facility_1_description: string;
  facility_2_title: string;
  facility_2_description: string;
  facility_3_title: string;
  facility_3_description: string;
  facility_4_title: string;
  facility_4_description: string;
  
  // Cultural Programs Section
  cultural_heading: string;
  cultural_subtitle: string;
  cultural_1_title: string;
  cultural_1_description: string;
  cultural_2_title: string;
  cultural_2_description: string;
  cultural_3_title: string;
  cultural_3_description: string;
  
  // Outreach Section
  outreach_heading: string;
  outreach_subtitle: string;
  outreach_1_title: string;
  outreach_1_description: string;
  outreach_2_title: string;
  outreach_2_description: string;
  outreach_3_title: string;
  outreach_3_description: string;
  
  // Partnerships Section
  partnerships_heading: string;
  partnerships_subtitle: string;
  partnership_1_title: string;
  partnership_1_description: string;
  partnership_2_title: string;
  partnership_2_description: string;
  
  // Closing Section
  closing_title: string;
  closing_quote: string;
  
  // Contact
  address: string;
  phone: string;
  email: string;
  
  // Meta
  is_active: boolean;
  updated_at: string;
}

