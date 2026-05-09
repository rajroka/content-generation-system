import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// This is PostSathi's custom text generation API
// It uses Groq (Llama 3) with custom prompt engineering for each content type

interface TextParams {
  topic: string;
  platform: string;
  tone: string;
}

// Platform-specific caption guidelines
const platformGuide: Record<string, string> = {
  instagram: "150-220 chars, use 2-3 emojis, end with engaging question or CTA",
  twitter: "under 280 chars, punchy and direct, no hashtags in body text",
  linkedin: "professional tone, 200-300 chars, value-focused, no excessive emojis",
  facebook: "friendly and conversational, 100-200 chars, encourage comments",
  tiktok: "short and punchy, hook in first line, trendy language, 1-2 emojis",
};

// Platform-specific title styles
const titleStyle: Record<string, string> = {
  instagram: "visually descriptive, aspirational, emoji-friendly",
  twitter: "punchy, debate-starting, under 70 chars",
  linkedin: "professional insight, thought leadership",
  facebook: "shareable, relatable, community-focused",
  tiktok: "viral, trend-aware, Gen-Z friendly",
};

export async function generateTitles({ topic, platform, tone }: TextParams): Promise<string[]> {
  const style = titleStyle[platform] || "engaging and scroll-stopping";

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You are a viral social media content expert specializing in scroll-stopping titles. You ONLY return the exact format requested — no extra text, no numbering, no labels.",
      },
      {
        role: "user",
        content: `Generate 5 viral ${tone} titles for ${platform} content about "${topic}".
Style: ${style}
Mix these types:
1. Curiosity hook ("The truth about...")
2. Number-based ("Top 5 reasons...")  
3. Question ("Are you making this mistake...")
4. How-to ("How to achieve...")
5. Bold statement or surprise fact

RETURN ONLY: exactly 5 titles separated by ||| — no numbering, no labels, no extra text.`,
      },
    ],
    temperature: 0.9,
    max_tokens: 400,
  });

  const text = completion.choices[0]?.message?.content || "";
  const titles = text
    .split("|||")
    .map((t) => t.trim())
    .filter((t) => t.length > 5 && !t.match(/^\d+\./))
    .slice(0, 5);

  return titles.length >= 3 ? titles : ["Check out this amazing content!", "You need to see this", "This will change everything", "The truth about " + topic, "Everything about " + topic];
}

export async function generateCaptions({ topic, platform, tone }: TextParams): Promise<string[]> {
  const guide = platformGuide[platform] || "engaging, 150-200 chars, include emojis";

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You are a social media caption expert. You ONLY return the exact format requested — no extra text, no numbering, no labels.",
      },
      {
        role: "user",
        content: `Generate 3 different ${tone} captions for ${platform} about "${topic}".
Platform guidelines: ${guide}
Make each caption unique in approach:
- Caption 1: Direct and punchy
- Caption 2: Story-driven or emotional
- Caption 3: Question or engagement-focused

RETURN ONLY: exactly 3 captions separated by ||| — no numbering, no labels, no extra text.`,
      },
    ],
    temperature: 0.8,
    max_tokens: 600,
  });

  const text = completion.choices[0]?.message?.content || "";
  const captions = text
    .split("|||")
    .map((c) => c.trim())
    .filter((c) => c.length > 15)
    .slice(0, 3);

  return captions.length >= 1 ? captions : ["Exciting content about " + topic + " 🔥", "Let's talk about " + topic + " 💭", "What do you think about " + topic + "? 👇"];
}

export async function generateHashtags({ topic, platform, tone }: TextParams): Promise<string[]> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You are a hashtag strategy expert. You ONLY return hashtags — no other text.",
      },
      {
        role: "user",
        content: `Generate 15 strategic hashtags for a ${platform} post about "${topic}" with ${tone} tone.

Mix strategy:
- 3 very popular/broad hashtags (millions of posts, e.g. #viral #trending)
- 7 medium-reach hashtags (thousands of posts, specific to topic)
- 5 niche hashtags (highly specific, less competition)

RETURN ONLY: hashtags starting with # separated by spaces. Nothing else. No explanations.`,
      },
    ],
    temperature: 0.6,
    max_tokens: 200,
  });

  const text = completion.choices[0]?.message?.content || "";
  const hashtags = (text.match(/#[a-zA-Z0-9_]+/g) || []).slice(0, 15);

  return hashtags.length >= 5 ? hashtags : ["#viral", "#trending", "#socialmedia", "#content", "#fyp"];
}

export async function generatePostingPlan(platform: string): Promise<Array<{
  day: string;
  time: string;
  reason: string;
  engagement: string;
}>> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "user",
        content: `Generate the 7 best posting times for ${platform} to maximize engagement.
Based on real platform analytics and user behavior patterns.

Return ONLY a valid JSON array with no other text:
[
  {"day": "Monday", "time": "09:00", "reason": "Users check phone after weekend", "engagement": "High"},
  ...7 items total
]`,
      },
    ],
    temperature: 0.3,
    max_tokens: 600,
  });

  try {
    const text = (completion.choices[0]?.message?.content || "[]")
      .replace(/```json|```/g, "")
      .trim();
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Fallback default plan
    return [
      { day: "Monday", time: "09:00", reason: "Start of work week, high engagement", engagement: "High" },
      { day: "Tuesday", time: "12:00", reason: "Lunch break browsing peak", engagement: "High" },
      { day: "Wednesday", time: "18:00", reason: "Mid-week after work", engagement: "Medium" },
      { day: "Thursday", time: "20:00", reason: "Evening relaxation time", engagement: "High" },
      { day: "Friday", time: "17:00", reason: "TGIF mood, high sharing", engagement: "Very High" },
      { day: "Saturday", time: "11:00", reason: "Weekend morning leisure", engagement: "Medium" },
      { day: "Sunday", time: "19:00", reason: "Sunday evening scrolling", engagement: "High" },
    ];
  }
}
