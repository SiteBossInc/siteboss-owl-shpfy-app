import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useActionData, Form } from "@remix-run/react";
import { useState, useCallback } from "react";
import {
  Page,
  Card,
  Text,
  Button,
  BlockStack,
  InlineStack,
  Badge,
  Divider,
  Icon,
  Box,
  TextField,
  FormLayout,
  Banner,
  Spinner
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { CheckIcon, StoreIcon, KeyIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import { getShopInfo, formatShopInfo } from "../services/shopify.server";
import { markShopAsConnected } from "../services/shopConnection.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  
  try {
    // Fetch shop information
    const rawShopInfo = await getShopInfo(admin);
    const shopInfo = formatShopInfo(rawShopInfo);
    
    return json({
      shopInfo,
      session: {
        shop: session.shop,
        isOnline: session.isOnline
      }
    });
  } catch (error) {
    console.error('Error loading shop info:', error);
    return json({
      error: 'Failed to load shop information',
      shopInfo: null,
      session: {
        shop: session.shop,
        isOnline: session.isOnline
      }
    });
  }
};

export const action = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);

  if (request.method === "POST") {
    const formData = await request.formData();
    const action = formData.get("action");

    if (action === "validate_api_key") {
      const apiKey = formData.get("api_key");
      const tenantId = formData.get("tenant_id");

      if (!apiKey || !tenantId) {
        return json({
          error: "API Key and Tenant ID are required",
          success: false
        });
      }

      try {
        // TODO: Implement actual API key validation against SiteBoss OWL
        // For now, we'll simulate validation
        const isValid = await validateSiteBossApiKey(apiKey, tenantId);

        if (isValid) {
          // Store the API key and tenant ID (encrypted in production)
          // TODO: Implement secure storage
          console.log(`API Key validated for shop ${session.shop}, tenant ${tenantId}`);

          return json({
            success: true,
            message: "API Key validated successfully!"
          });
        } else {
          return json({
            error: "Invalid API Key or Tenant ID",
            success: false
          });
        }
      } catch (error) {
        console.error('Error validating API key:', error);
        return json({
          error: "Failed to validate API Key",
          success: false
        });
      }
    }

    if (action === "connect") {
      const apiKey = formData.get("api_key");
      const tenantId = formData.get("tenant_id");

      if (!apiKey || !tenantId) {
        return json({
          error: "API Key and Tenant ID are required",
          success: false
        });
      }

      try {
        // Get shop info for storage
        const rawShopInfo = await getShopInfo(admin);
        const shopInfo = formatShopInfo(rawShopInfo);

        // Mark shop as connected in our database with API key info
        const success = await markShopAsConnected(session.shop, {
          ...shopInfo,
          apiKey,
          tenantId
        });

        if (success) {
          console.log(`Shop ${session.shop} connected with tenant ${tenantId}`);
          // Redirect to dashboard after successful connection
          return redirect("/app/dashboard");
        } else {
          return json({
            error: "Failed to save connection status",
            success: false
          });
        }
      } catch (error) {
        console.error('Error during shop connection:', error);
        return json({
          error: "Failed to complete connection",
          success: false
        });
      }
    }
  }

  return json({ success: false });
};

// Mock API key validation function
async function validateSiteBossApiKey(apiKey, tenantId) {
  // TODO: Replace with actual SiteBoss OWL API validation
  // This should make a request to SiteBoss OWL to validate the API key

  // For demo purposes, accept any key that starts with "sb_" and has tenant "demo"
  return apiKey.startsWith("sb_") && tenantId === "demo";
}

export default function Onboarding() {
  const { shopInfo, session, error } = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();

  const [apiKey, setApiKey] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleApiKeyChange = useCallback((value) => {
    setApiKey(value);
    setIsValidated(false);
    setValidationError("");
  }, []);

  const handleTenantIdChange = useCallback((value) => {
    setTenantId(value);
    setIsValidated(false);
    setValidationError("");
  }, []);

  // Handle action data from server
  if (actionData) {
    if (actionData.success && !isValidated) {
      setIsValidated(true);
      setValidationError("");
    } else if (actionData.error && !validationError) {
      setValidationError(actionData.error);
      setIsValidated(false);
    }
  }

  if (error) {
    return (
      <Page>
        <TitleBar title="Connection Error" />
        <Card>
          <BlockStack gap="400">
            <Text as="h1" variant="headingLg" tone="critical">
              Unable to Connect
            </Text>
            <Text as="p" variant="bodyMd">
              {error}
            </Text>
            <Button onClick={() => navigate("/app")} variant="primary">
              Try Again
            </Button>
          </BlockStack>
        </Card>
      </Page>
    );
  }

  if (!shopInfo) {
    return (
      <Page>
        <TitleBar title="Loading..." />
        <Card>
          <Text as="p" variant="bodyMd">
            Loading shop information...
          </Text>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <TitleBar title="Shop Setup" />
      <BlockStack gap="500">
        {/* Welcome Section */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="center" gap="300">
              <Icon source={StoreIcon} tone="base" />
              <Text as="h1" variant="headingLg">
                Welcome to SiteBoss OWL
              </Text>
            </InlineStack>
            <Text as="p" variant="bodyMd">
              Connect your Shopify store with SiteBoss OWL for automated order fulfillment and inventory management.
            </Text>
          </BlockStack>
        </Card>

        {/* Shop Information Card */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text as="h2" variant="headingMd">
                Shop Information
              </Text>
              <Badge tone="success">
                <InlineStack gap="100" align="center">
                  <Icon source={CheckIcon} />
                  <Text as="span">Connected</Text>
                </InlineStack>
              </Badge>
            </InlineStack>
            
            <Divider />
            
            <BlockStack gap="300">
              <InlineStack gap="400" wrap={false}>
                <Box minWidth="120px">
                  <Text as="dt" variant="bodyMd" fontWeight="semibold">
                    Shop Name:
                  </Text>
                </Box>
                <Text as="dd" variant="bodyMd">
                  {shopInfo.name}
                </Text>
              </InlineStack>
              
              <InlineStack gap="400" wrap={false}>
                <Box minWidth="120px">
                  <Text as="dt" variant="bodyMd" fontWeight="semibold">
                    Domain:
                  </Text>
                </Box>
                <Text as="dd" variant="bodyMd">
                  {shopInfo.domain}
                </Text>
              </InlineStack>
              
              {shopInfo.email && (
                <InlineStack gap="400" wrap={false}>
                  <Box minWidth="120px">
                    <Text as="dt" variant="bodyMd" fontWeight="semibold">
                      Email:
                    </Text>
                  </Box>
                  <Text as="dd" variant="bodyMd">
                    {shopInfo.email}
                  </Text>
                </InlineStack>
              )}
              
              <InlineStack gap="400" wrap={false}>
                <Box minWidth="120px">
                  <Text as="dt" variant="bodyMd" fontWeight="semibold">
                    Plan:
                  </Text>
                </Box>
                <InlineStack gap="200">
                  <Badge tone={shopInfo.plan.isShopifyPlus ? "success" : "info"}>
                    {shopInfo.plan.name}
                  </Badge>
                  {shopInfo.plan.isShopifyPlus && (
                    <Badge tone="success">Shopify Plus</Badge>
                  )}
                </InlineStack>
              </InlineStack>
              
              <InlineStack gap="400" wrap={false}>
                <Box minWidth="120px">
                  <Text as="dt" variant="bodyMd" fontWeight="semibold">
                    Currency:
                  </Text>
                </Box>
                <Text as="dd" variant="bodyMd">
                  {shopInfo.currency}
                </Text>
              </InlineStack>
            </BlockStack>
          </BlockStack>
        </Card>

        {/* API Key Configuration */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text as="h2" variant="headingMd">
                SiteBoss OWL Configuration
              </Text>
              {isValidated && (
                <Badge tone="success">
                  <InlineStack gap="100" align="center">
                    <Icon source={CheckIcon} />
                    <Text as="span">Validated</Text>
                  </InlineStack>
                </Badge>
              )}
            </InlineStack>

            <Text as="p" variant="bodyMd">
              Enter your SiteBoss OWL API credentials provided by your fulfillment warehouse.
            </Text>

            {validationError && (
              <Banner tone="critical">
                <Text as="p" variant="bodyMd">
                  {validationError}
                </Text>
              </Banner>
            )}

            {actionData?.success && (
              <Banner tone="success">
                <Text as="p" variant="bodyMd">
                  {actionData.message}
                </Text>
              </Banner>
            )}

            <Form method="post">
              <FormLayout>
                <TextField
                  label="Tenant ID"
                  value={tenantId}
                  onChange={handleTenantIdChange}
                  placeholder="e.g., demo, shipitez"
                  helpText="Your warehouse provider's tenant identifier"
                  autoComplete="off"
                />

                <TextField
                  label="API Key"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="sb_xxxxxxxxxxxxxxxxxxxxxxxx"
                  helpText="Your SiteBoss OWL API key provided by your warehouse"
                  type="password"
                  autoComplete="off"
                />

                <InlineStack gap="300">
                  <Button
                    submit
                    variant="secondary"
                    disabled={!apiKey || !tenantId || isValidating}
                    loading={isValidating}
                  >
                    <input type="hidden" name="action" value="validate_api_key" />
                    <input type="hidden" name="api_key" value={apiKey} />
                    <input type="hidden" name="tenant_id" value={tenantId} />
                    {isValidating ? "Validating..." : "Validate API Key"}
                  </Button>
                </InlineStack>
              </FormLayout>
            </Form>
          </BlockStack>
        </Card>

        {/* Connection Confirmation */}
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Ready to Connect?
            </Text>
            <Text as="p" variant="bodyMd">
              By connecting this shop to SiteBoss OWL, you'll enable:
            </Text>
            <BlockStack gap="200">
              <Text as="p" variant="bodyMd">
                • Automated order fulfillment and tracking
              </Text>
              <Text as="p" variant="bodyMd">
                • Real-time inventory synchronization
              </Text>
              <Text as="p" variant="bodyMd">
                • SKU validation and management
              </Text>
              <Text as="p" variant="bodyMd">
                • Comprehensive order and shipment tracking
              </Text>
            </BlockStack>

            <Form method="post">
              <input type="hidden" name="action" value="connect" />
              <input type="hidden" name="api_key" value={apiKey} />
              <input type="hidden" name="tenant_id" value={tenantId} />
              <InlineStack gap="300">
                <Button
                  submit
                  variant="primary"
                  size="large"
                  disabled={!isValidated || !apiKey || !tenantId}
                >
                  Connect Shop & Continue
                </Button>
                <Button onClick={() => navigate("/app")} variant="secondary">
                  Cancel
                </Button>
              </InlineStack>
            </Form>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
