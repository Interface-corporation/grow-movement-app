import { supabase } from '@/integrations/supabase/client';

export async function logActivity(
  action: string,
  entityType?: string,
  entityId?: string,
  details?: Record<string, any>
) {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('activity_log').insert({
    action,
    entity_type: entityType || null,
    entity_id: entityId || null,
    details: details || null,
    user_id: user?.id || null,
  });
}
