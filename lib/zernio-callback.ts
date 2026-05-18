/**
 * Resolves the Zernio account ID for a just-completed OAuth connection.
 *
 * Resolution order:
 *  1. `accountId` param — Zernio includes this directly in some versions
 *  2. `connect_token` param — use it to fetch the specific account that was just connected
 *  3. Match by `username` + `platform` in the profile's account list
 *  4. Most recently created account for the platform (last resort)
 */

import zernio from "@/lib/zernio";

export interface ZernioAccountInfo {
  accountId: string;
  accountName: string | null;
}

export async function resolveZernioAccount(
  platform: string,
  params: {
    accountId:    string | null;
    connectToken: string | null;
    profileId:    string | null;
    username:     string | null;
  }
): Promise<ZernioAccountInfo | null> {
  const { accountId, connectToken, profileId, username } = params;

  // 1. accountId already in callback params — fastest path
  if (accountId) {
    return { accountId, accountName: username };
  }

  // 2. Use connect_token to fetch the specific account
  if (connectToken) {
    try {
      // Zernio's connect token can be used to retrieve the account
      const result = await (zernio as any).connect.getConnectToken?.({
        path: { token: connectToken },
      });
      const acc = result?.data?.account;
      if (acc?._id) {
        return {
          accountId:   acc._id,
          accountName: acc.username || acc.displayName || username,
        };
      }
    } catch {
      // connect_token API may not exist — fall through
    }
  }

  // 3 & 4. List accounts for the profile and match
  if (profileId) {
    try {
      const result = await zernio.accounts.listAccounts({ query: { profileId } });
      const accounts: any[] = (result as any)?.data?.accounts ?? [];

      // Filter to the right platform
      const platformAccounts = accounts.filter(
        (a) => a.platform === platform.toLowerCase() && a.isActive !== false
      );

      if (platformAccounts.length === 0) return null;

      // Match by username if available
      if (username) {
        const byUsername = platformAccounts.find(
          (a) =>
            a.username?.toLowerCase() === username.toLowerCase() ||
            a.displayName?.toLowerCase() === username.toLowerCase()
        );
        if (byUsername) {
          return {
            accountId:   byUsername._id,
            accountName: byUsername.username || byUsername.displayName || username,
          };
        }
      }

      // Fall back to most recently created
      const sorted = [...platformAccounts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const latest = sorted[0];
      return {
        accountId:   latest._id,
        accountName: latest.username || latest.displayName || username,
      };
    } catch (e: any) {
      console.error(`Failed to list Zernio accounts for platform ${platform}:`, e.message);
    }
  }

  return null;
}
