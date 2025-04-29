// pages/api/posts/update.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Admin client using Service Role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1) 메서드 체크
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 2) 파라미터 파싱 (thumbnailUrl → thumbnail 으로 변경)
  const { id, title, category, topics, thumbnail, content, state, created_at } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Missing post ID' });
  }

  // 3) 업데이트할 필드만 모아서
  const updates: Record<string, any> = {};
  if (title)        updates.title     = title;
  if (category)     updates.category  = category;
  if (created_at)     updates.created_at  = created_at;
  if (topics)       updates.topics    = topics;
  if (thumbnail)    updates.thumbnail = thumbnail;  // body.thumbnail 값을 thumbnail 컬럼에
  if (content)      updates.content   = content;
  if (typeof state === 'boolean')      updates.state   = state;

  console.log(updates.state);

  // 4) 실제 업데이트
  const { error } = await supabaseAdmin
    .from('posts')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Update error:', error);
    return res.status(500).json({ error: error.message });
  }

  // 5) 성공 응답
  return res.status(200).json({ ok: true });
}
