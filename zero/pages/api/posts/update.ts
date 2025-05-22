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
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id, title, category, topics, thumbnail, content, state, created_at } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing post ID' });

  // 1) 원본 글 조회
  const { data: orig, error: getErr } = await supabaseAdmin
    .from('posts')
    .select('title, category, topics, thumbnail, content, state, created_at')
    .eq('id', id)
    .single();
  if (getErr) {
    console.error('Fetch original post error:', getErr);
    return res.status(500).json({ error: getErr.message });
  }

  // 2) 변경된 필드만 diff 생성
  const changes: Record<string, { before: any; after: any }> = {};
  if (title && orig.title !== title)           changes.title = { before: orig.title, after: title };
  if (category && orig.category !== category) changes.category = { before: orig.category, after: category };
  if (topics && orig.topics !== topics)       changes.topics = { before: orig.topics, after: topics };
  if (thumbnail && orig.thumbnail !== thumbnail)
    changes.thumbnail = { before: orig.thumbnail, after: thumbnail };
  if (content && orig.content !== content)     {
    const beforeText = orig.content.replace(/<[^>]*>/g, '');
    const afterText  = content.replace(/<[^>]*>/g, '');

    changes.content = {
      before: beforeText.length,
      after:  afterText.length,
    };
  }
  if (typeof state === 'boolean' && orig.state !== state)
    changes.state = { before: orig.state, after: state };
  if (created_at && orig.created_at !== created_at)
    changes.created_at = { before: orig.created_at, after: created_at };

  // 3) 이력 테이블에 기록 (변경된 게 있을 때만)
  if (Object.keys(changes).length > 0) {
    const { error: histErr } = await supabaseAdmin
      .from('posts_history')
      .insert([
        {
          post_id: id,
          changes,
        },
      ]);
    if (histErr) {
      console.error('Insert history error:', histErr);
      return res.status(500).json({ error: histErr.message });
    }
  }

  // 4) posts 테이블 업데이트
  const updates: Record<string, any> = {};
  if (title)    updates.title     = title;
  if (category) updates.category  = category;
  if (topics)   updates.topics    = topics;
  if (thumbnail)updates.thumbnail = thumbnail;
  if (content)  updates.content   = content;
  if (typeof state === 'boolean') updates.state = state;
  if (created_at) updates.created_at = created_at;

  const { error: updErr } = await supabaseAdmin
    .from('posts')
    .update(updates)
    .eq('id', id);
  if (updErr) {
    console.error('Update error:', updErr);
    return res.status(500).json({ error: updErr.message });
  }

  return res.status(200).json({ ok: true });
}
