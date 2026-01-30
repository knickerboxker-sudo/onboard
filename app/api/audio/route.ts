import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const audioDir = path.join(process.env.AUDIO_DIR ?? "/data/audio");
  await mkdir(audioDir, { recursive: true });
  const filename = `${session.user.id}-${Date.now()}.webm`;
  const fullPath = path.join(audioDir, filename);
  await writeFile(fullPath, buffer);

  return NextResponse.json({ path: fullPath });
}
