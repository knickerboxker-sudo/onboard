import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getDefaultUserId } from "@/lib/default-user";

export async function POST(request: Request) {
  const userId = await getDefaultUserId();

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const audioDir = path.join(process.env.AUDIO_DIR ?? "/data/audio");
  await mkdir(audioDir, { recursive: true });
  const filename = `${userId}-${Date.now()}.webm`;
  const fullPath = path.join(audioDir, filename);
  await writeFile(fullPath, buffer);

  return NextResponse.json({ path: fullPath });
}
