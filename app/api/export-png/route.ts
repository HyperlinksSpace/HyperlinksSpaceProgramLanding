import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function safeName(raw: string) {
  const base = path.basename(raw).replace(/[^a-zA-Z0-9._-]/g, "_");
  return base.toLowerCase().endsWith(".png") ? base : `${base}.png`;
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const file = safeName(searchParams.get("file") || `landing-animation-${Date.now()}.png`);
  const body = (await req.json()) as { dataURL?: string };

  if (!body?.dataURL?.startsWith("data:image/png;base64,")) {
    return NextResponse.json({ ok: false, error: "Invalid PNG dataURL" }, { status: 400 });
  }

  const base64 = body.dataURL.replace(/^data:image\/png;base64,/, "");
  const bytes = Buffer.from(base64, "base64");

  const outDir = path.join(process.cwd(), "public", "exports");
  await mkdir(outDir, { recursive: true });
  const outputPath = path.join(outDir, file);
  await writeFile(outputPath, bytes);

  return NextResponse.json({
    ok: true,
    file,
    relativePath: `/exports/${file}`,
  });
}
