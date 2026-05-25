// PostSathi Caption Generator
// Uses a fine-tuned Phi-2 model hosted on Hugging Face Inference API
// Set HF_MODEL_ID and HF_API_KEY in .env.local when model is deployed

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

async function callModel(prompt: string): Promise<string> {
  if (!HF_API_URL || !HF_API_KEY) {
    throw new Error("Model not deployed yet. Set HF_MODEL_ID and HF_API_KEY in .env.local");
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
  // HF Inference API returns [{ generated_text: "..." }]
  return Array.isArray(data) ? (data[0]?.generated_text ?? "") : (data?.generated_text ?? "");
}

export async function generateCaption({ topic, platform, tone }: TextParams): Promise<{ caption: string; hashtags: string[] }> {
  const guide = platformGuide[platform.toLowerCase()] ?? "engaging, 150-200 chars";

  const prompt = `Generate a ${tone} social media caption for ${platform} about: "${topic}".
Platform guidelines: ${guide}
Return ONLY a JSON object: { "caption": "...", "hashtags": ["#tag1", "#tag2"] }`;

  const output = await callModel(prompt);

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
