// import { NextApiRequest, NextApiResponse } from 'next';
// import { supabase } from '../../../lib/supabase';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method === 'POST') {
//         const { title, topics, category, thumbnail, content } = req.body;

//         const { data, error } = await supabase.from('posts').insert([
//             { title, topics, category, thumbnail, content }
//         ]);

//         if (error) return res.status(500).json({ error: error.message });

//         res.status(201).json(data);
//     } else {
//         res.setHeader('Allow', ['POST']);
//         res.status(405).end(`Method ${req.method} Not Allowed`);
//     }
// }


import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // 지원하는 HTTP 메서드 확인
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        // 요청 데이터 가져오기
        const { title, topics, category, thumbnail, content } = req.body;

        // 필수 필드 검사
        if (!title || !topics || !category || !content) {
            return res.status(400).json({ error: '모든 필드를 입력하세요.' });
        }

        // Supabase 데이터 삽입
        const { data, error } = await supabase.from('posts').insert([
            { title, topics, category, thumbnail, content }
        ]).select('*'); // 삽입된 데이터 반환

        // Supabase 오류 처리
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // 데이터가 정상적으로 삽입되었는지 확인
        if (!data || data.length === 0) {
            return res.status(500).json({ error: '게시글을 저장하는 중 오류가 발생했습니다.' });
        }

        // 성공 응답
        return res.status(201).json({
            message: '게시글 작성 완료',
            post: data[0], // 삽입된 게시글 정보 반환
        });

    } catch (err) {
        return res.status(500).json({ error: '서버 내부 오류 발생' });
    }
}
