import Stripe from "stripe";

/**
 * Ensure the Secret Key is present in your environment variables.
 * If you are using Next.js, this usually lives in .env.local
 */
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables.");
}

/**
 * Initialize the Stripe instance.
 * Using the '2026-03-25.dahlia' version to match your SDK's type definitions.
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true, // Optional: Provides better type support
});

export default stripe;