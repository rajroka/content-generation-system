// PostSathi Caption Generator
// Supports two backends:
//   1. Friend's model server (dev tunnel or hosted) — set MODEL_API_URL in .env.local
//   2. Hugging Face Inference API — set HF_MODEL_ID and HF_API_KEY in .env.local
// MODEL_API_URL takes priority if set.

const MODEL_API_URL = process.env.MODEL_API_URL ?? null;

const HF_API_URL = process.env.HF_MODEL_ID
  ? `https://api-inference.huggingface.co/models/${process.env.HF_MODEL_ID}`
  : null;

const HF_API_KEY = process.env.HF_API_KEY;

interface TextParams {
  topic: string;
  platform: string;
  tone: string;
}

const platformGuide: Record<string, string> = {
  instagram: "150-220 chars, use 2-3 emojis, end with engaging question or CTA",
  facebook:  "friendly and conversational, 100-200 chars, encourage comments",
  tiktok:    "short and punchy, hook in first line, trendy language, 1-2 emojis",
  youtube:   "descriptive, 200-300 chars, include keywords, encourage subscribe",
};

// ── Backend 1: Custom model server (friend's tunnel / hosted API) ─────────────
async function callCustomServer(params: TextParams): Promise<{ caption: string; hashtags: string[] }> {
  const guide = platformGuide[params.platform.toLowerCase()] ?? "engaging, 150-200 chars";

  const prompt = `Generate a ${params.tone} social media caption for ${params.platform} about: "${params.topic}".
Platform guidelines: ${guide}
Return ONLY a JSON object: { "caption": "...", "hashtags": ["#tag1", "#tag2"] }`;

  // 5-minute timeout — model inference can be slow on CPU
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);

  let res: Response;
  try {
    res = await fetch(`${MODEL_API_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Model server timed out. The model may be loading — please try again in a moment.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Custom model server error (${res.status}): ${err}`);
  }

  const data = await res.json();

  // Accept either { caption, hashtags } directly, or { generated_text } (raw string)
  if (data.caption) {
    return {
      caption:  data.caption,
      hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
    };
  }

  // Fallback: try to parse JSON from generated_text
  const raw: string = data.generated_text ?? JSON.stringify(data);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      caption:  parsed.caption  ?? `Check out this content about ${params.topic}!`,
      hashtags: parsed.hashtags ?? ["#content", "#socialmedia"],
    };
  }

  // Last resort: treat the whole response as the caption
  return { caption: raw.trim(), hashtags: ["#content", "#socialmedia"] };
}

// ── Backend 2: Hugging Face Inference API ─────────────────────────────────────
async function callHuggingFace(prompt: string): Promise<string> {
  if (!HF_API_URL || !HF_API_KEY) {
    throw new Error("Model not deployed yet. Set MODEL_API_URL or HF_MODEL_ID + HF_API_KEY in .env.local");
  }

  const res = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.7,
        return_full_text: false,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Model API error: ${err}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? (data[0]?.generated_text ?? "") : (data?.generated_text ?? "");
}

export async function generateCaption({ topic, platform, tone }: TextParams): Promise<{ caption: string; hashtags: string[] }> {
  // Prefer custom model server if configured
  if (MODEL_API_URL) {
    return callCustomServer({ topic, platform, tone });
  }

  // Fall back to Hugging Face Inference API
  const guide = platformGuide[platform.toLowerCase()] ?? "engaging, 150-200 chars";

  const prompt = `Generate a ${tone} social media caption for ${platform} about: "${topic}".
Platform guidelines: ${guide}
Return ONLY a JSON object: { "caption": "...", "hashtags": ["#tag1", "#tag2"] }`;

  const output = await callHuggingFace(prompt);

  const jsonMatch = output.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid model response");

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    caption:  parsed.caption  ?? `Check out this content about ${topic}!`,
    hashtags: parsed.hashtags ?? ["#content", "#socialmedia"],
  };
}

export async function generatePostingPlan(platform: string): Promise<Array<{
  day: string;
  time: string;
  reason: string;
  engagement: string;
}>> {
  // Static fallback plan — replace with model call when deployed
  return [
    { day: "Monday",    time: "09:00", reason: "Start of work week, high engagement",  engagement: "High"      },
    { day: "Tuesday",   time: "12:00", reason: "Lunch break browsing peak",             engagement: "High"      },
    { day: "Wednesday", time: "18:00", reason: "Mid-week after work",                   engagement: "Medium"    },
    { day: "Thursday",  time: "20:00", reason: "Evening relaxation time",               engagement: "High"      },
    { day: "Friday",    time: "17:00", reason: "TGIF mood, high sharing",               engagement: "Very High" },
    { day: "Saturday",  time: "11:00", reason: "Weekend morning leisure",               engagement: "Medium"    },
    { day: "Sunday",    time: "19:00", reason: "Sunday evening scrolling",              engagement: "High"      },
  ];
}
