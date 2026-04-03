import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const response = await imagekit.upload({
      file: buffer,
      fileName: `banamsathi_${Date.now()}.png`,
      folder: "/posts",
      useUniqueFileName: true,
    });

    return NextResponse.json({
      url: response.url,
      fileId: response.fileId,
    });
  } catch (error: any) {
    console.error("ImageKit Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}