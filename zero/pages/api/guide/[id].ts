import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing post ID' });

  const postId = Array.isArray(id) ? id[0] : id;

  console.log("view api 시작");

  const { data: post, error: postErr } = await supabase
    .from('guideline')
    .select('*')
    .eq('id', postId)
    .single();

  if (postErr || !post) {
    console.error('Post not found:', postErr);
    return res.status(404).json({ error: 'Post not found' });
  }

  console.log("view api 종료");

  return res.status(200).json({
    post
  });

  
}
