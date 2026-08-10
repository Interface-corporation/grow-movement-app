import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PublicTestimonial {
  id: string;
  title: string | null;
  project_brief: string | null;
  entrepreneur_review: string | null;
  coach_review: string | null;
  video_url: string | null;
  rating: number | null;
  created_at: string;
  project_id: string;
  project_name: string | null;
  entrepreneur_id: string | null;
  entrepreneur_name: string | null;
  business_name: string | null;
  country: string | null;
  sector: string | null;
  entrepreneur_photo_url: string | null;
  coach_name: string | null;
  coach_organization: string | null;
  coach_photo_url: string | null;
}

/** Published impact case studies (public_testimonials view). */
export function usePublicTestimonials(limit?: number) {
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      let query = (supabase as any)
        .from('public_testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      if (limit) query = query.limit(limit);
      const { data } = await query;
      if (!active) return;
      setTestimonials((data as PublicTestimonial[]) || []);
      setLoading(false);
    };
    load();
    return () => { active = false; };
  }, [limit]);

  return { testimonials, loading };
}
