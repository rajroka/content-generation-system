// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import Groq from "groq-sdk";

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// export async function POST(req: Request) {
//   try {
//     const { userId } = await auth();
//     if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { topic, platform, tone } = await req.json();

//     if (!topic) return NextResponse.json({ error: "Topic is required" }, { status: 400 });

//     const platformLimits: Record<string, number> = {
//       INSTAGRAM: 2200,
//       FACEBOOK: 500,
//       TWITTER: 280,
//       LINKEDIN: 3000,
//     };

//     const toneDescriptions: Record<string, string> = {
//       CASUAL: "casual and friendly",
//       PROFESSIONAL: "professional and formal",
//       INSPIRATIONAL: "motivational and inspiring",
//       HUMOROUS: "funny and witty",
//     };

//     const prompt = `Generate a ${toneDescriptions[tone] || "casual"} social media caption for ${platform} about: "${topic}".

// Rules:
// - Caption must be under ${platformLimits[platform] || 2200} characters
// - Include 5-10 relevant hashtags at the end
// - Make it engaging and scroll-stopping
// - Return ONLY a JSON object in this exact format:
// {
//   "caption": "your caption here without hashtags",
//   "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
// }`;

//     const completion = await groq.chat.completions.create({
//       model: "llama-3.3-70b-versatile",
//       messages: [{ role: "user", content: prompt }],
//       temperature: 0.7,
//       max_tokens: 1000,
//     });

//     const content = completion.choices[0]?.message?.content || "";

//     // Parse JSON from response
//     const jsonMatch = content.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) throw new Error("Invalid response format");

//     const parsed = JSON.parse(jsonMatch[0]);

//     return NextResponse.json({
//       caption: parsed.caption,
//       hashtags: parsed.hashtags,
//     });

//   } catch (err: any) {
//     console.error("Caption generation error:", err);
//     return NextResponse.json({ error: err.message || "Failed to generate caption" }, { status: 500 });
//   }
// }









import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
// import { db } from "@/lib/db";
// import { PrismaClient } from "../../../lib/generated/prisma";
import prisma from "@/lib/prisma";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { topic, platform, tone } = await req.json();
    if (!topic) return NextResponse.json({ error: "Topic is required" }, { status: 400 });

    const platformLimits: Record<string, number> = {
      INSTAGRAM: 2200,
      FACEBOOK: 500,
      TWITTER: 280,
      LINKEDIN: 3000,
    };

    const toneDescriptions: Record<string, string> = {
      CASUAL: "casual and friendly",
      PROFESSIONAL: "professional and formal",
      INSPIRATIONAL: "motivational and inspiring",
      HUMOROUS: "funny and witty",
    };

    const prompt = `Generate a ${toneDescriptions[tone] || "casual"} social media caption for ${platform} about: "${topic}".

Rules:
- Caption must be under ${platformLimits[platform] || 2200} characters
- Include 5-10 relevant hashtags at the end
- Make it engaging and scroll-stopping
- Return ONLY a JSON object in this exact format:
{
  "caption": "your caption here without hashtags",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid response format");
    const parsed = JSON.parse(jsonMatch[0]);

    // Find or create user in DB
    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: "unknown@email.com",
          plan: "FREE",
        },
      });
    }

    // Save generation
    await prisma.generation.create({
      data: {
        userId: user.id,
        topic,
        platform: platform as any,
        tone: tone as any,
        caption: parsed.caption,
        hashtags: parsed.hashtags,
      },
    });

    // Update usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.usage.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      update: { captionCount: { increment: 1 } },
      create: { userId: user.id, date: today, captionCount: 1 },
    });

    return NextResponse.json({
      caption: parsed.caption,
      hashtags: parsed.hashtags,
    });

  } catch (err: any) {
    console.error("Caption generation error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate caption" }, { status: 500 });
  }
}













// import { auth, currentUser } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import Groq from "groq-sdk";
// import { db } from "@/lib/db";

// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// export async function POST(req: Request) {
//   try {
//     console.log("API HIT");
//      console.log("GROQ KEY:", process.env.GROQ_API_KEY);
// console.log("DB URL:", process.env.DATABASE_URL);
//     // ✅ AUTH
//     const { userId } = await auth();
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const clerkUser = await currentUser();

//     // ✅ BODY
//     const body = await req.json().catch(() => null);
//     if (!body) {
//       return NextResponse.json({ error: "Invalid body" }, { status: 400 });
//     }

//     const { topic, platform, tone } = body;

//     if (!topic) {
//       return NextResponse.json({ error: "Topic is required" }, { status: 400 });
//     }

//     // ✅ ENUM SAFETY
//     const safePlatform = platform?.toUpperCase();
//     const safeTone = tone?.toUpperCase();

//     const validPlatforms = ["INSTAGRAM", "FACEBOOK", "TWITTER", "LINKEDIN"];
//     const validTones = ["CASUAL", "PROFESSIONAL", "INSPIRATIONAL", "HUMOROUS"];

//     if (!validPlatforms.includes(safePlatform)) {
//       return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
//     }

//     if (!validTones.includes(safeTone)) {
//       return NextResponse.json({ error: "Invalid tone" }, { status: 400 });
//     }

//     // ✅ LIMITS
//     const platformLimits: Record<string, number> = {
//       INSTAGRAM: 2200,
//       FACEBOOK: 500,
//       TWITTER: 280,
//       LINKEDIN: 3000,
//     };

//     const toneDescriptions: Record<string, string> = {
//       CASUAL: "casual and friendly",
//       PROFESSIONAL: "professional and formal",
//       INSPIRATIONAL: "motivational and inspiring",
//       HUMOROUS: "funny and witty",
//     };

//     // ✅ PROMPT
//     const prompt = `Generate a ${toneDescriptions[safeTone]} social media caption for ${safePlatform} about: "${topic}".

// Rules:
// - Caption must be under ${platformLimits[safePlatform]} characters
// - Include 5-10 relevant hashtags at the end
// - Make it engaging and scroll-stopping
// - Return ONLY a JSON object in this exact format:
// {
//   "caption": "your caption here without hashtags",
//   "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
// }`;

//     // ✅ AI CALL
//     const completion = await groq.chat.completions.create({
//       model: "llama-3.3-70b-versatile",
//       messages: [{ role: "user", content: prompt }],
//       temperature: 0.7,
//       max_tokens: 1000,
//     });

//     const content = completion.choices[0]?.message?.content || "";

//     // ✅ SAFE JSON PARSE
//     let parsed;

//     try {
//       const jsonMatch = content.match(/\{[\s\S]*\}/);
//       if (!jsonMatch) throw new Error("No JSON found");

//       parsed = JSON.parse(jsonMatch[0]);
//     } catch (err) {
//       console.error("Parsing error:", content);
//       return NextResponse.json(
//         { error: "AI response parsing failed" },
//         { status: 500 }
//       );
//     }

//     // ✅ FIND OR CREATE USER
//     let user = await db.user.findUnique({
//       where: { clerkId: userId },
//     });

//     if (!user) {
//       user = await db.user.create({
//         data: {
//           clerkId: userId,
//           email:
//             clerkUser?.emailAddresses[0]?.emailAddress ||
//             `user-${userId}@fallback.com`,
//           name: clerkUser?.firstName || "",
//           imageUrl: clerkUser?.imageUrl || "",
//           plan: "FREE",
//         },
//       });
//     }

//     // ✅ SAVE GENERATION
//     await db.generation.create({
//       data: {
//         userId: user.id,
//         topic,
//         platform: safePlatform,
//         tone: safeTone,
//         caption: parsed.caption,
//         hashtags: parsed.hashtags,
//       },
//     });

//     // ✅ USAGE TRACKING (FIXED DATE)
//     const today = new Date();
//     today.setUTCHours(0, 0, 0, 0);

//     await db.usage.upsert({
//       where: {
//         userId_date: {
//           userId: user.id,
//           date: today,
//         },
//       },
//       update: {
//         captionCount: { increment: 1 },
//       },
//       create: {
//         userId: user.id,
//         date: today,
//         captionCount: 1,
//       },
//     });

//     // ✅ RESPONSE
//     return NextResponse.json({
//       caption: parsed.caption,
//       hashtags: parsed.hashtags,
//     });

//   } catch (err: any) {
//     console.error("Caption generation error:", err);

//     return NextResponse.json(
//       { error: err.message || "Failed to generate caption" },
//       { status: 500 }
//     );
//   }
// }