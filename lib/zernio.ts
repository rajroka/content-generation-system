import Zernio from "@zernio/node";

if (!process.env.ZERNIO_API_KEY) {
  throw new Error("ZERNIO_API_KEY is not set in environment variables.");
}

const zernio = new Zernio({ apiKey: process.env.ZERNIO_API_KEY });

export default zernio;
