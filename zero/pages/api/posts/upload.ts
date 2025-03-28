import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs-extra';
import path from 'path';

export const config = {
    api: {
        bodyParser: false, // form-data 처리를 위해 bodyParser 비활성화
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const form = formidable({
            uploadDir: path.join(process.cwd(), 'public/thumbnail'), // 저장할 폴더 경로
            keepExtensions: true, // 파일 확장자 유지
            maxFiles: 1, // 업로드 가능한 파일 개수 제한
            maxFileSize: 5 * 1024 * 1024, // 최대 파일 크기 (5MB)
            multiples: false // 여러 파일 허용 여부 (false: 단일 파일만 허용)
        });

        const [fields, files] = await form.parse(req);

        if (!files || !files.thumbnail) {
            return res.status(400).json({ error: "파일이 업로드되지 않았습니다." });
        }

        const file = Array.isArray(files.thumbnail) ? files.thumbnail[0] : files.thumbnail;
        const fileName = `${Date.now()}-${file.originalFilename}`; // 고유한 파일명 생성
        const newPath = path.join(process.cwd(), 'public/thumbnail', fileName);

        await fs.move(file.filepath, newPath); // 파일 이동

        return res.status(201).json({ fileName, filePath: `/thumbnail/${fileName}` });

    } catch (error) {
        return res.status(500).json({ error: '서버 내부 오류 발생' });
    }
}
