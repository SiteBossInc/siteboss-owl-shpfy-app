import { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import {
  Page,
  Layout,
  Card,
  Text,
  FormLayout,
  TextField,
  Select,
  Checkbox,
  Button,
  BlockStack,
  InlineStack,
  Banner,
  Badge,
  Divider
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  
  // Mock current settings
  const settings = {
    order_ingestion: {
      enabled: true,
      batching_frequency: "real-time",
      auto_fulfill: false,
      order_filters: {
        min_amount: "",
        exclude_tags: ["test", "sample"]
      }
    },
    inventory_sync: {
      enabled: true,
      frequency: "hourly",
      sync_all_products: true,
      low_stock_threshold: 10
    },
    webhooks: {
      enabled: true,
      order_updates: true,
      inventory_updates: true,
      fulfillment_updates: true,
      endpoint_url: "https://your-store.myshopify.com/webhooks/siteboss"
    },
    notifications: {
      email_enabled: true,
      email_address: "admin@your-store.com",
      sms_enabled: false,
      sms_number: "",
      critical_alerts: true,
      daily_summary: true
    }
  };
  
  return json({ settings });
};

export default function Settings() {
  const { settings } = useLoaderData();
  
  const [orderSettings, setOrderSettings] = useState(settings.order_ingestion);
  const [inventorySettings, setInventorySettings] = useState(settings.inventory_sync);
  const [webhookSettings, setWebhookSettings] = useState(settings.webhooks);
  const [notificationSettings, setNotificationSettings] = useState(settings.notifications);
  
  const batchingOptions = [
    { label: "Real-time (immediate)", value: "real-time" },
    { label: "Every 15 minutes", value: "15min" },
    { label: "Hourly", value: "hourly" },
    { label: "Daily", value: "daily" }
  ];
  
  const syncFrequencyOptions = [
    { label: "Every 15 minutes", value: "15min" },
    { label: "Hourly", value: "hourly" },
    { label: "Every 6 hours", value: "6hour" },
    { label: "Daily", value: "daily" }
  ];

  return (
    <Page>
      <TitleBar title="Integration Settings" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Order Ingestion Settings */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Order Ingestion Settings
                </Text>
                
                <FormLayout>
                  <Checkbox
                    label="Enable automatic order ingestion"
                    checked={orderSettings.enabled}
                    onChange={(checked) => setOrderSettings({...orderSettings, enabled: checked})}
                    helpText="Automatically send new orders to SiteBoss OWL for fulfillment"
                  />
                  
                  <Select
                    label="Batching frequency"
                    options={batchingOptions}
                    value={orderSettings.batching_frequency}
                    onChange={(value) => setOrderSettings({...orderSettings, batching_frequency: value})}
                    helpText="How often to send orders to the fulfillment center"
                  />
                  
                  <Checkbox
                    label="Auto-fulfill orders in Shopify"
                    checked={orderSettings.auto_fulfill}
                    onChange={(checked) => setOrderSettings({...orderSettings, auto_fulfill: checked})}
                    helpText="Automatically mark orders as fulfilled in Shopify when shipped"
                  />
                  
                  <TextField
                    label="Minimum order amount"
                    value={orderSettings.order_filters.min_amount}
                    onChange={(value) => setOrderSettings({
                      ...orderSettings, 
                      order_filters: {...orderSettings.order_filters, min_amount: value}
                    })}
                    placeholder="0.00"
                    prefix="$"
                    helpText="Only process orders above this amount"
                  />
                </FormLayout>
              </BlockStack>
            </Card>

            {/* Inventory Sync Settings */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Inventory Synchronization
                </Text>
                
                <FormLayout>
                  <Checkbox
                    label="Enable inventory sync"
                    checked={inventorySettings.enabled}
                    onChange={(checked) => setInventorySettings({...inventorySettings, enabled: checked})}
                    helpText="Keep Shopify inventory levels in sync with warehouse stock"
                  />
                  
                  <Select
                    label="Sync frequency"
                    options={syncFrequencyOptions}
                    value={inventorySettings.frequency}
                    onChange={(value) => setInventorySettings({...inventorySettings, frequency: value})}
                    helpText="How often to update inventory levels"
                  />
                  
                  <Checkbox
                    label="Sync all products"
                    checked={inventorySettings.sync_all_products}
                    onChange={(checked) => setInventorySettings({...inventorySettings, sync_all_products: checked})}
                    helpText="Sync inventory for all products, not just those with valid SKUs"
                  />
                  
                  <TextField
                    label="Low stock threshold"
                    type="number"
                    value={inventorySettings.low_stock_threshold.toString()}
                    onChange={(value) => setInventorySettings({...inventorySettings, low_stock_threshold: parseInt(value) || 0})}
                    helpText="Alert when inventory falls below this level"
                  />
                </FormLayout>
              </BlockStack>
            </Card>

            {/* Webhook Settings */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Webhook Configuration
                </Text>
                
                <FormLayout>
                  <Checkbox
                    label="Enable webhooks"
                    checked={webhookSettings.enabled}
                    onChange={(checked) => setWebhookSettings({...webhookSettings, enabled: checked})}
                    helpText="Receive real-time updates from SiteBoss OWL"
                  />
                  
                  <TextField
                    label="Webhook endpoint URL"
                    value={webhookSettings.endpoint_url}
                    onChange={(value) => setWebhookSettings({...webhookSettings, endpoint_url: value})}
                    helpText="URL where SiteBoss OWL will send webhook notifications"
                    disabled={!webhookSettings.enabled}
                  />
                  
                  <Text as="h3" variant="headingSm">
                    Event Types
                  </Text>
                  
                  <Checkbox
                    label="Order status updates"
                    checked={webhookSettings.order_updates}
                    onChange={(checked) => setWebhookSettings({...webhookSettings, order_updates: checked})}
                    disabled={!webhookSettings.enabled}
                  />
                  
                  <Checkbox
                    label="Inventory level changes"
                    checked={webhookSettings.inventory_updates}
                    onChange={(checked) => setWebhookSettings({...webhookSettings, inventory_updates: checked})}
                    disabled={!webhookSettings.enabled}
                  />
                  
                  <Checkbox
                    label="Fulfillment and shipping updates"
                    checked={webhookSettings.fulfillment_updates}
                    onChange={(checked) => setWebhookSettings({...webhookSettings, fulfillment_updates: checked})}
                    disabled={!webhookSettings.enabled}
                  />
                </FormLayout>
              </BlockStack>
            </Card>

            {/* Notification Settings */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Notification Preferences
                </Text>
                
                <FormLayout>
                  <Checkbox
                    label="Enable email notifications"
                    checked={notificationSettings.email_enabled}
                    onChange={(checked) => setNotificationSettings({...notificationSettings, email_enabled: checked})}
                  />
                  
                  <TextField
                    label="Email address"
                    type="email"
                    value={notificationSettings.email_address}
                    onChange={(value) => setNotificationSettings({...notificationSettings, email_address: value})}
                    disabled={!notificationSettings.email_enabled}
                  />
                  
                  <Checkbox
                    label="Enable SMS notifications"
                    checked={notificationSettings.sms_enabled}
                    onChange={(checked) => setNotificationSettings({...notificationSettings, sms_enabled: checked})}
                  />
                  
                  <TextField
                    label="SMS number"
                    type="tel"
                    value={notificationSettings.sms_number}
                    onChange={(value) => setNotificationSettings({...notificationSettings, sms_number: value})}
                    placeholder="+1 (555) 123-4567"
                    disabled={!notificationSettings.sms_enabled}
                  />
                  
                  <Divider />
                  
                  <Text as="h3" variant="headingSm">
                    Alert Types
                  </Text>
                  
                  <Checkbox
                    label="Critical alerts (errors, failures)"
                    checked={notificationSettings.critical_alerts}
                    onChange={(checked) => setNotificationSettings({...notificationSettings, critical_alerts: checked})}
                  />
                  
                  <Checkbox
                    label="Daily summary reports"
                    checked={notificationSettings.daily_summary}
                    onChange={(checked) => setNotificationSettings({...notificationSettings, daily_summary: checked})}
                  />
                </FormLayout>
              </BlockStack>
            </Card>

            {/* Save Button */}
            <InlineStack align="end">
              <Button variant="primary" size="large">
                Save All Settings
              </Button>
            </InlineStack>
          </BlockStack>
        </Layout.Section>

        {/* Sidebar */}
        <Layout.Section variant="oneThird">
          <BlockStack gap="500">
            {/* Current Status */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Current Status
                </Text>
                
                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    <Text as="p" variant="bodyMd">Order Ingestion</Text>
                    <Badge status={orderSettings.enabled ? "success" : "critical"}>
                      {orderSettings.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </InlineStack>
                  
                  <InlineStack align="space-between">
                    <Text as="p" variant="bodyMd">Inventory Sync</Text>
                    <Badge status={inventorySettings.enabled ? "success" : "critical"}>
                      {inventorySettings.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </InlineStack>
                  
                  <InlineStack align="space-between">
                    <Text as="p" variant="bodyMd">Webhooks</Text>
                    <Badge status={webhookSettings.enabled ? "success" : "critical"}>
                      {webhookSettings.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </InlineStack>
                  
                  <InlineStack align="space-between">
                    <Text as="p" variant="bodyMd">Notifications</Text>
                    <Badge status={notificationSettings.email_enabled || notificationSettings.sms_enabled ? "success" : "critical"}>
                      {notificationSettings.email_enabled || notificationSettings.sms_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>

            {/* Help & Support */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Help & Support
                </Text>
                
                <BlockStack gap="300">
                  <Text as="p" variant="bodyMd">
                    Need help configuring your integration? Contact your 3PL provider for assistance.
                  </Text>
                  
                  <Button fullWidth variant="plain">
                    View Documentation
                  </Button>
                  
                  <Button fullWidth variant="plain">
                    Contact Support
                  </Button>
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
