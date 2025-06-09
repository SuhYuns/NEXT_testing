import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Admin client using Service Role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function createHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { title, category, topics, thumbnail, content, overview, keyword } = req.body;

  if (!title || !category || !topics || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 로그 확인
  console.log("API 수신 :", {
    title,
    category,
    topics,
    thumbnail,
    overview,
    keyword,
  });

  const { error } = await supabaseAdmin
    .from('posts')
    .insert([
      {
        title,
        category,
        topics,
        thumbnail,
        content,
        overview,    // ✅ 메타 description
        keyword,     // ✅ 키워드 (string[])
      }
    ]);

  if (error) {
    console.error('Insert error:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
}
