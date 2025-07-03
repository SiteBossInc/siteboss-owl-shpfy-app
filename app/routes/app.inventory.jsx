import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import {
  Page,
  Layout,
  Card,
  Text,
  Badge,
  BlockStack,
  InlineStack,
  Button,
  DataTable,
  Banner,
  ProgressBar,
  Box
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  // Use static mock data for now
  const mockInventory = [
    {
      sku: "WINE-CABERNET-2021",
      title: "Cabernet Sauvignon 2021",
      quantity: 150,
      reserved: 25,
      available: 125,
      location: "Warehouse A - Section 1",
      last_updated: "2024-01-17T09:30:00Z",
      status: "in_stock"
    },
    {
      sku: "WINE-CHARDONNAY-2022",
      title: "Chardonnay 2022",
      quantity: 89,
      reserved: 12,
      available: 77,
      location: "Warehouse A - Section 2",
      last_updated: "2024-01-17T09:30:00Z",
      status: "low_stock"
    }
  ];

  // Mock sync settings
  const syncSettings = {
    enabled: true,
    frequency: "hourly",
    last_sync: new Date().toISOString(),
    sync_status: "healthy",
    total_items: mockInventory.length,
    low_stock_threshold: 10
  };

  return json({
    inventory: mockInventory,
    syncSettings
  });
};

function getStockStatusBadge(status, quantity) {
  const statusMap = {
    in_stock: { status: "success", text: "In Stock" },
    low_stock: { status: "warning", text: "Low Stock" },
    out_of_stock: { status: "critical", text: "Out of Stock" }
  };
  
  const config = statusMap[status] || { status: "info", text: status };
  return <Badge status={config.status}>{config.text}</Badge>;
}

export default function Inventory() {
  const { inventory, syncSettings } = useLoaderData();
  
  // Prepare data for the inventory table
  const inventoryRows = inventory.map((item) => [
    item.sku,
    item.title,
    item.quantity.toString(),
    item.reserved.toString(),
    item.available.toString(),
    item.location,
    getStockStatusBadge(item.status, item.quantity),
    new Date(item.last_updated).toLocaleDateString()
  ]);
  
  const lowStockItems = inventory.filter(item => item.status === "low_stock" || item.status === "out_of_stock");
  const inStockItems = inventory.filter(item => item.status === "in_stock");
  
  return (
    <Page>
      <TitleBar title="Inventory Management" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Sync Status Banner */}
            {syncSettings.enabled ? (
              <Banner status="success">
                <InlineStack align="space-between">
                  <Text as="p" variant="bodyMd">
                    ✅ Inventory sync is enabled and running smoothly
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Last sync: {new Date(syncSettings.last_sync).toLocaleTimeString()}
                  </Text>
                </InlineStack>
              </Banner>
            ) : (
              <Banner status="warning">
                <Text as="p" variant="bodyMd">
                  ⚠️ Inventory sync is disabled. Enable sync to keep inventory levels updated.
                </Text>
              </Banner>
            )}
            
            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
              <Banner status="critical">
                <Text as="p" variant="bodyMd">
                  ⚠️ {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} require attention due to low or no stock
                </Text>
              </Banner>
            )}

            {/* Summary Cards */}
            <Layout>
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd" alignment="center">
                      Total Items
                    </Text>
                    <Text as="p" variant="heading2xl" alignment="center">
                      {syncSettings.total_items}
                    </Text>
                  </BlockStack>
                </Card>
              </Layout.Section>
              
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd" alignment="center">
                      In Stock
                    </Text>
                    <Text as="p" variant="heading2xl" alignment="center" tone="success">
                      {inStockItems.length}
                    </Text>
                  </BlockStack>
                </Card>
              </Layout.Section>
              
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd" alignment="center">
                      Low/Out of Stock
                    </Text>
                    <Text as="p" variant="heading2xl" alignment="center" tone="critical">
                      {lowStockItems.length}
                    </Text>
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout>

            {/* Inventory Table */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">
                    Current Inventory Levels
                  </Text>
                  <Button variant="primary">
                    Sync Now
                  </Button>
                </InlineStack>
                
                <DataTable
                  columnContentTypes={['text', 'text', 'numeric', 'numeric', 'numeric', 'text', 'text', 'text']}
                  headings={['SKU', 'Product', 'Total Qty', 'Reserved', 'Available', 'Location', 'Status', 'Last Updated']}
                  rows={inventoryRows}
                />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        {/* Sidebar */}
        <Layout.Section variant="oneThird">
          <BlockStack gap="500">
            {/* Sync Settings */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Sync Settings
                </Text>
                
                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    <Text as="p" variant="bodyMd">
                      <strong>Status:</strong>
                    </Text>
                    <Badge status={syncSettings.enabled ? "success" : "critical"}>
                      {syncSettings.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </InlineStack>
                  
                  <InlineStack align="space-between">
                    <Text as="p" variant="bodyMd">
                      <strong>Frequency:</strong>
                    </Text>
                    <Text as="p" variant="bodyMd">
                      {syncSettings.frequency}
                    </Text>
                  </InlineStack>
                  
                  <InlineStack align="space-between">
                    <Text as="p" variant="bodyMd">
                      <strong>Last Sync:</strong>
                    </Text>
                    <Text as="p" variant="bodyMd">
                      {new Date(syncSettings.last_sync).toLocaleTimeString()}
                    </Text>
                  </InlineStack>
                </BlockStack>
                
                <Button fullWidth>
                  Configure Sync Settings
                </Button>
              </BlockStack>
            </Card>

            {/* Quick Actions */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Quick Actions
                </Text>
                <BlockStack gap="300">
                  <Button fullWidth>
                    Force Full Sync
                  </Button>
                  <Button fullWidth variant="plain">
                    Export Inventory Report
                  </Button>
                  <Button fullWidth variant="plain">
                    View Sync History
                  </Button>
                </BlockStack>
              </BlockStack>
            </Card>

            {/* Low Stock Items */}
            {lowStockItems.length > 0 && (
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Items Needing Attention
                  </Text>
                  <BlockStack gap="300">
                    {lowStockItems.slice(0, 5).map((item) => (
                      <Box key={item.sku} padding="300" background="bg-surface-secondary" borderRadius="200">
                        <BlockStack gap="100">
                          <Text as="p" variant="bodyMd">
                            <strong>{item.sku}</strong>
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            {item.title}
                          </Text>
                          <InlineStack align="space-between">
                            <Text as="p" variant="bodySm">
                              Available: {item.available}
                            </Text>
                            {getStockStatusBadge(item.status, item.quantity)}
                          </InlineStack>
                        </BlockStack>
                      </Box>
                    ))}
                    {lowStockItems.length > 5 && (
                      <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                        ... and {lowStockItems.length - 5} more items
                      </Text>
                    )}
                  </BlockStack>
                </BlockStack>
              </Card>
            )}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
