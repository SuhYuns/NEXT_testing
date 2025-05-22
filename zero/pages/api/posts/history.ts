// pages/api/posts/history.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// 서비스 키는 서버에서만 사용
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { post_id } = req.query
  if (!post_id || typeof post_id !== 'string') {
    return res.status(400).json({ error: 'post_id is required' })
  }

  const { data, error } = await supabaseAdmin
    .from('posts_history')
    .select('id, modified_at, changes')
    .eq('post_id', post_id)
    .order('modified_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json(data)
}
