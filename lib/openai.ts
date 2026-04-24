import OpenAI from "openai";
import ImageKit from "imagekit";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

// Platform-specific visual style guidelines
const platformStyle: Record<string, string> = {
  instagram: "square composition, vibrant colors, aesthetic, Instagram-worthy lifestyle photography style",
  twitter: "wide horizontal, bold and eye-catching, clean background, minimal design",
  linkedin: "professional, corporate, clean modern design, blue tones, business context",
  facebook: "warm, friendly, colorful, community-oriented, approachable style",
  tiktok: "bold colors, dynamic, Gen-Z aesthetic, modern and trendy",
};

export async function generateAndStoreImage(
  topic: string,
  platform: string
): Promise<{ url: string; prompt: string }> {
  const style = platformStyle[platform] || "high quality, social media optimized";
  const prompt = `${style} image for a social media post about "${topic}". 
Photorealistic, professional quality, no text overlays, no watermarks, no logos. 
Visually stunning and shareable.`;

  // Generate with DALL-E 3
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });

  const temporaryUrl = response?.data?.[0]?.url;
  if (!temporaryUrl) throw new Error("No image returned from OpenAI");

  // DALL-E URLs expire — download and store permanently in ImageKit
  const imageResponse = await fetch(temporaryUrl);
  if (!imageResponse.ok) throw new Error("Failed to fetch generated image");

  const buffer = await imageResponse.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const uploaded = await imagekit.upload({
    file: base64,
    fileName: `banamsathi_${Date.now()}.png`,
    folder: "/banamsathi/generated",
    tags: [platform, topic.replace(/\s+/g, "_").toLowerCase()],
  });

  return {
    url: uploaded.url,
    prompt,
  };
}
