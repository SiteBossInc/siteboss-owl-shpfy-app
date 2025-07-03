import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Card, Text } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  
  return json({
    message: "Test route is working!",
    timestamp: new Date().toISOString()
  });
};

export default function Test() {
  const { message, timestamp } = useLoaderData();
  
  return (
    <Page>
      <TitleBar title="Test Page" />
      <Card>
        <Text as="h1" variant="headingLg">
          {message}
        </Text>
        <Text as="p" variant="bodyMd">
          Loaded at: {timestamp}
        </Text>
      </Card>
    </Page>
  );
}
