import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Card, Text, Button, BlockStack } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { shopNeedsOnboarding } from "../services/shopConnection.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const skipOnboarding = url.searchParams.get("skip_onboarding");

  // Check if shop needs onboarding (unless explicitly skipping)
  if (!skipOnboarding) {
    const needsOnboarding = await shopNeedsOnboarding(session.shop);
    if (needsOnboarding) {
      throw redirect("/app/onboarding");
    }
  }

  return json({
    shop: session.shop,
    message: "Welcome back to SiteBoss OWL!",
    timestamp: new Date().toISOString()
  });
};

export default function Index() {
  const { shop, message, timestamp } = useLoaderData();

  return (
    <Page>
      <TitleBar title="SiteBoss OWL Integration" />
      <Card>
        <BlockStack gap="400">
          <Text as="h1" variant="headingLg">
            🎉 {message}
          </Text>
          <Text as="p" variant="bodyMd">
            <strong>Shop:</strong> {shop}
          </Text>
          <Text as="p" variant="bodyMd">
            <strong>Loaded at:</strong> {timestamp}
          </Text>
          <Button url="/app/dashboard" variant="primary">
            Go to Dashboard
          </Button>
        </BlockStack>
      </Card>
    </Page>
  );
}
