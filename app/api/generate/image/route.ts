export const dynamic = "force-dynamic";

// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import OpenAI from "openai";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// export async function POST(req: Request) {
//   try {
//     const { userId } = await auth();
//     if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { topic, platform } = await req.json();

//     const sizes: Record<string, "1024x1024" | "1024x1792" | "1792x1024"> = {
//       INSTAGRAM: "1024x1024",
//       TWITTER: "1792x1024",
//       LINKEDIN: "1792x1024",
//       FACEBOOK: "1792x1024",
//     };

//     const response = await openai.images.generate({
//       model: "dall-e-3",
//       prompt: `Professional social media image for ${platform} about: ${topic}. Clean, modern, visually striking, suitable for social media.`,
//       n: 1,
//       size: sizes[platform] || "1024x1024",
//       quality: "standard",
//     });

//     const imageUrl = response.data[0]?.url;
//     if (!imageUrl) throw new Error("No image generated");

//     return NextResponse.json({ imageUrl });

//   } catch (err: any) {
//     console.error("Image generation error:", err);
//     return NextResponse.json({ error: err.message || "Failed to generate image" }, { status: 500 });
//   }
// }



import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Placeholder image for testing
    return NextResponse.json({
      imageUrl: "https://placehold.co/1024x1024/2563eb/ffffff?text=PostSathi"
    });

  } catch (err: any) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
