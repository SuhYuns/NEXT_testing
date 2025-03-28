import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
        const { id, ...updates } = req.body;

        if (!id) return res.status(400).json({ error: "Missing post ID" });

        const { data, error } = await supabase
            .from('posts')
            .update(updates)
            .eq('id', id);

        if (error) return res.status(500).json({ error: error.message });

        res.status(200).json(data);
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}