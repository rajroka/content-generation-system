export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey:   process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey:  process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

const SUPPORTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",  // .mov
  "video/webm",
  "video/x-msvideo",  // .avi
  "video/mpeg",
];

const MAX_VIDEO_SIZE_MB = 100;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!SUPPORTED_VIDEO_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported video format. Supported: MP4, MOV, WebM, AVI, MPEG` },
        { status: 400 }
      );
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_VIDEO_SIZE_MB) {
      return NextResponse.json(
        { error: `Video too large. Maximum size is ${MAX_VIDEO_SIZE_MB}MB` },
        { status: 400 }
      );
    }

    const ext      = file.name.split(".").pop() || "mp4";
    const fileName = `video_${Date.now()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const response = await imagekit.upload({
      file:            buffer,
      fileName,
      folder:          "/videos",
      useUniqueFileName: true,
    });

    return NextResponse.json({
      url:    response.url,
      fileId: response.fileId,
      type:   "video",
    });
  } catch (error: any) {
    console.error("Video Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
