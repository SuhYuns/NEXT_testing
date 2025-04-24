import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing post ID' });

  const postId = Array.isArray(id) ? id[0] : id;

  console.log("view api 시작");

  /* ─── 1. 현재 글 ─── */
  const { data: post, error: postErr } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (postErr || !post) {
    console.error('Post not found:', postErr);
    return res.status(404).json({ error: 'Post not found' });
  }

  await supabase
  .from('posts')
  .update({ views: (post?.views ?? 0) + 1 })
  .eq('id', postId);

  /* ─── 2. 공통 필터 ─── */
  const baseFilter = {
    state: true,
    // category: post.category,   // 필요하면 주석 해제
  };

  /* ─── 3. 이전·다음 글 쿼리를 병렬 실행 ─── */
  const [{ data: prevArr }, { data: nextArr }] = await Promise.all([
    supabase
      .from('posts')
      .select('id, title')
      .match(baseFilter)
      .lt('created_at', post.created_at)
      .order('created_at', { ascending: false })
      .limit(1),

    supabase
      .from('posts')
      .select('id, title')
      .match(baseFilter)
      .gt('created_at', post.created_at)
      .order('created_at', { ascending: true })
      .limit(1),
  ]);

  console.log("view api 종료");
  /* ─── 4. 응답 한 번에 보내기 ─── */
  return res.status(200).json({
    post,
    prev_id: prevArr?.[0] ?? null,
    next_id: nextArr?.[0] ?? null,
  });

  
}
