"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

export function UpgradeNotifier({ upgraded }: { upgraded: boolean }) {
  useEffect(() => {
    if (upgraded) {
      toast.success("You're now on the Pro Plan! 🎉\nEnjoy unlimited captions and scheduled posts.", {
        duration: 5000,
      });
      
      // Optional: remove upgraded from URL
      window.history.replaceState({}, "", "/user/dashboard");
    }
  }, [upgraded]);

  return null;
}
