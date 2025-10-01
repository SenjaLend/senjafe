/* eslint-disable @typescript-eslint/no-unused-vars */
function withValidProperties(
  properties: Record<string, undefined | string | string[]>
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    })
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL;
  const PROJECT_NAME =
    process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "senja";
  const APP_HERO_IMAGE = process.env.NEXT_PUBLIC_APP_HERO_IMAGE;
  const SPLASH_IMAGE = process.env.NEXT_PUBLIC_SPLASH_IMAGE;
  const SPLASH_BACKGROUND_COLOR =
    process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#000000";
  const FARCASTER_HEADER = process.env.FARCASTER_HEADER;
  const FARCASTER_PAYLOAD = process.env.FARCASTER_PAYLOAD;
  const FARCASTER_SIGNATURE = process.env.FARCASTER_SIGNATURE;

  return Response.json({
    accountAssociation: {
      header: FARCASTER_HEADER,
      payload: FARCASTER_PAYLOAD,
      signature: FARCASTER_SIGNATURE,
    },
    frame: {
      name: PROJECT_NAME,
      homeUrl: URL || "https://senja-land.vercel.app",
      iconUrl: APP_HERO_IMAGE || `${URL}/senja-logo.png`,
      version: "1",
      imageUrl: APP_HERO_IMAGE || `${URL}/senja-logo.png`,
      subtitle: PROJECT_NAME,
      webhookUrl: `${URL}/api/webhook`,
      description: PROJECT_NAME,
      splashImageUrl: SPLASH_IMAGE || `${URL}/senja-logo.png`,
      primaryCategory: "finance",
      splashBackgroundColor: SPLASH_BACKGROUND_COLOR,
    },
  });
}
