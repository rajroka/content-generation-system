import zernio from "@/lib/zernio";

// In-memory cache so we only call the API once per server process
let cachedProfileId: string | null = null;

/**
 * Returns the Zernio profile ID to use for OAuth connections.
 *
 * Resolution order:
 *  1. ZERNIO_PROFILE_ID env var (fastest — set this in .env.local to skip the API call)
 *  2. First profile returned by zernio.profiles.listProfiles() (auto-discovered)
 *
 * The result is cached in memory for the lifetime of the server process.
 */
export async function getZernioProfileId(): Promise<string> {
  // 1. Env var takes priority
  if (process.env.ZERNIO_PROFILE_ID) {
    return process.env.ZERNIO_PROFILE_ID;
  }

  // 2. Return cached value if already fetched
  if (cachedProfileId) {
    return cachedProfileId;
  }

  // 3. Auto-discover from Zernio API
  try {
    const result = await zernio.profiles.listProfiles();
    // Response shape: { data: { profiles: [{ _id, name, ... }] } }
    const profiles = (result as any)?.data?.profiles;

    if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
      throw new Error(
        "No Zernio profiles found. Create a profile at https://zernio.com → Settings → Profiles, " +
        "then set ZERNIO_PROFILE_ID in your .env.local."
      );
    }

    const profileId: string = profiles[0]._id ?? profiles[0].id;
    if (!profileId) {
      throw new Error("Zernio profile found but has no _id field. Please set ZERNIO_PROFILE_ID manually.");
    }

    cachedProfileId = profileId;
    console.log(`[Zernio] Auto-discovered profile ID: ${profileId}`);
    return profileId;
  } catch (err: any) {
    throw new Error(
      `Failed to auto-discover Zernio profile ID: ${err.message}\n\n` +
      "Fix: Add ZERNIO_PROFILE_ID=<your_profile_id> to .env.local\n" +
      "Get it from: https://zernio.com → Settings → Profiles"
    );
  }
}
