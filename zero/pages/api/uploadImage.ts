// 📁 pages/api/uploadImage.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import formidable, { File as FFile } from "formidable";
import { v4 as uuid } from "uuid";

/** Next.js 기본 bodyParser 끄기 (Formidable이 직접 multipart 처리) */
export const config = { api: { bodyParser: false } };

/* ───────────────────────── Supabase Admin ──────────────────────────
   - URL은 공개되어도 상관없지만, 서비스 롤 키는 절대 NEXT_PUBLIC 로 노출 X
   - .env.local 예시
     SUPABASE_URL               = https://xyz.supabase.co
     SUPABASE_SERVICE_ROLE_KEY  = eyJhbGciOiJIUzI1…
     NEXT_PUBLIC_SUPABASE_BUCKET= blog-uploads
*/
const supabase = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** multipart/form-data → Promise 기반 파서 */
function parseForm(
  req: NextApiRequest
): Promise<{ file: FFile; folder: string }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req, (err, _fields, files) => {
      if (err) return reject(err);

      /* 1) folder 쿼리 파라미터 확인 */
      const folder = Array.isArray(req.query.folder)
        ? req.query.folder[0]
        : (req.query.folder as string);
      if (!folder)
        return reject(new Error("folder query param is required"));

      /* 2) SunEditor: file-0 / file-1 …  썸네일: file */
      const key = Object.keys(files).find((k) => k.startsWith("file"));
      if (!key) return reject(new Error("No file uploaded"));

      const anyFiles = files as Record<string, FFile | FFile[] | undefined>;
      const target = anyFiles[key]!; // key 존재 확정
      const file: FFile = Array.isArray(target) ? target[0] : target;

      resolve({ file, folder });
    });
  });
}

/** POST /api/uploadImage?folder=thumbnails|content */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    /* ───── 1. multipart 파싱 ───── */
    const { file, folder } = await parseForm(req);

    /* ───── 2. Supabase Storage 업로드 ───── */
    const safeName = (file.originalFilename ?? "image").replace(
      /[^a-z0-9.\-_]/gi,
      "_"
    );
    const ext = safeName.split(".").pop();
    const path = `${folder}/${uuid()}.${ext}`;

    const buffer = await fs.readFile(file.filepath);
    const { error: upErr } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET!)
      .upload(path, buffer, { upsert: false });
    if (upErr) throw upErr;

    /* ───── 3. 공개 URL 생성 ───── */
    const { data } = supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET!)
      .getPublicUrl(path);

    /* ───── 4. SunEditor 규격 응답 ───── */
    return res.status(200).json({
      url: data.publicUrl, 
      errorMessage: "",
      result: [{ url: data.publicUrl, name: safeName, size: file.size }],
    });
  } catch (e: any) {
    console.error(e);
    return res.status(400).json({ error: e.message ?? "upload error" });
  }
}
