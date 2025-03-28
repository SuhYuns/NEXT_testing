import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing post ID" });

    const postId = Array.isArray(id) ? id[0] : id; // 배열인 경우 문자열로 변환
    console.log("Requested ID:", postId); // 디버깅 로그 추가

    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', String(postId)) // id를 문자열로 변환하여 검색
        .single();

    if (error || !data) {
        console.error("Post not found or error:", error);
        return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(data);
}
