import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Badge,
  BlockStack,
  InlineStack,
  Button,
  Box,
  Banner
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
  // Temporarily bypass authentication for testing
  // await authenticate.admin(request);

  // Use static mock data for now to avoid fetch issues during development
  const mockOrders = [
    {
      external_order_id: "12345",
      order_number: "#1001",
      status: "partially_shipped",
      customer: { name: "John Doe" },
      currency: "USD",
      total_price: "164.97"
    },
    {
      external_order_id: "12346",
      order_number: "#1002",
      status: "delivered",
      customer: { name: "Jane Smith" },
      currency: "USD",
      total_price: "89.97"
    }
  ];

  const mockSkuValidation = {
    valid_skus: ["WINE-CABERNET-2021", "WINE-CHARDONNAY-2022"],
    invalid_skus: [
      { sku: "WINE-MERLOT-2020", reason: "not_found_in_warehouse" },
      { sku: "BOTTLE-OPENER-SILVER", reason: "discontinued" }
    ]
  };

  // Mock integration status
  const integrationStatus = {
    tenant_configured: true,
    tenant_name: "ShipItEZ Logistics",
    api_key_configured: true,
    connection_status: "healthy",
    last_sync: new Date().toISOString(),
    orders_synced_today: 12,
    inventory_sync_enabled: true
  };

  return json({
    orders: mockOrders,
    skuValidation: mockSkuValidation,
    integration: integrationStatus
  });
};

function getStatusBadge(status) {
  const statusMap = {
    healthy: { status: "success", text: "Connected" },
    warning: { status: "warning", text: "Warning" },
    error: { status: "critical", text: "Error" },
    disconnected: { status: "critical", text: "Disconnected" }
  };
  
  const config = statusMap[status] || { status: "info", text: status };
  return <Badge status={config.status}>{config.text}</Badge>;
}

export default function Dashboard() {
  const { orders, skuValidation, integration } = useLoaderData();
  
  const recentOrders = orders.slice(0, 3);
  const invalidSkuCount = skuValidation.invalid_skus.length;
  const totalSkuCount = skuValidation.valid_skus.length + invalidSkuCount;
  const skuSuccessRate = totalSkuCount > 0 ? Math.round((skuValidation.valid_skus.length / totalSkuCount) * 100) : 100;

  return (
    <Page>
      <TitleBar title="SiteBoss OWL Integration Dashboard" />
      <BlockStack gap="500">
        {/* Integration Status Banner */}
        {integration.tenant_configured ? (
          <Banner status="success">
            <Text as="p" variant="bodyMd">
              ✅ Connected to <strong>{integration.tenant_name}</strong> - Integration is active and healthy
            </Text>
          </Banner>
        ) : (
          <Banner status="warning">
            <Text as="p" variant="bodyMd">
              ⚠️ Integration not configured. Please complete the setup in Settings.
            </Text>
          </Banner>
        )}
        
        {/* SKU Validation Alert */}
        {invalidSkuCount > 0 && (
          <Banner status="critical">
            <InlineStack align="space-between">
              <Text as="p" variant="bodyMd">
                ⚠️ {invalidSkuCount} SKU{invalidSkuCount > 1 ? 's' : ''} require attention
              </Text>
              <Button url="/app/sku-validation" variant="plain">
                View Details
              </Button>
            </InlineStack>
          </Banner>
        )}

        <Layout>
          {/* Main Content */}
          <Layout.Section>
            <BlockStack gap="500">
              {/* Status Cards */}
              <Layout>
                <Layout.Section variant="oneThird">
                  <Card>
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingMd" alignment="center">
                        Connection Status
                      </Text>
                      <Box textAlign="center">
                        {getStatusBadge(integration.connection_status)}
                      </Box>
                      <Text as="p" variant="bodySm" alignment="center" tone="subdued">
                        Last sync: {new Date(integration.last_sync).toLocaleTimeString()}
                      </Text>
                    </BlockStack>
                  </Card>
                </Layout.Section>
                
                <Layout.Section variant="oneThird">
                  <Card>
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingMd" alignment="center">
                        Orders Today
                      </Text>
                      <Text as="p" variant="heading2xl" alignment="center">
                        {integration.orders_synced_today}
                      </Text>
                    </BlockStack>
                  </Card>
                </Layout.Section>
                
                <Layout.Section variant="oneThird">
                  <Card>
                    <BlockStack gap="200">
                      <Text as="h3" variant="headingMd" alignment="center">
                        SKU Success Rate
                      </Text>
                      <Text as="p" variant="heading2xl" alignment="center" tone={skuSuccessRate >= 95 ? "success" : "critical"}>
                        {skuSuccessRate}%
                      </Text>
                    </BlockStack>
                  </Card>
                </Layout.Section>
              </Layout>

              {/* Recent Orders */}
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between">
                    <Text as="h2" variant="headingMd">
                      Recent Orders
                    </Text>
                    <Button url="/app/orders" variant="plain">
                      View All Orders
                    </Button>
                  </InlineStack>
                  
                  {recentOrders.length === 0 ? (
                    <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                      No recent orders. Orders will appear here once synced from Shopify.
                    </Text>
                  ) : (
                    <BlockStack gap="300">
                      {recentOrders.map((order) => (
                        <Box key={order.external_order_id} padding="300" background="bg-surface-secondary" borderRadius="200">
                          <InlineStack align="space-between">
                            <BlockStack gap="100">
                              <Text as="p" variant="bodyMd">
                                <strong>Order {order.order_number}</strong>
                              </Text>
                              <Text as="p" variant="bodySm" tone="subdued">
                                {order.customer.name} • {order.currency} {order.total_price}
                              </Text>
                            </BlockStack>
                            <Badge status={order.status === "delivered" ? "success" : order.status === "shipped" ? "info" : "attention"}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </InlineStack>
                        </Box>
                      ))}
                    </BlockStack>
                  )}
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          {/* Sidebar */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              {/* Quick Actions */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Quick Actions
                  </Text>
                  <BlockStack gap="300">
                    <Button url="/app/settings" fullWidth>
                      Integration Settings
                    </Button>
                    <Button url="/app/sku-validation" fullWidth>
                      Check SKU Validation
                    </Button>
                    <Button url="/app/orders" fullWidth>
                      View Order Status
                    </Button>
                    <Button url="/app/inventory" fullWidth>
                      Manage Inventory Sync
                    </Button>
                  </BlockStack>
                </BlockStack>
              </Card>

              {/* Integration Info */}
              {integration.tenant_configured && (
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Integration Details
                    </Text>
                    <BlockStack gap="200">
                      <Text as="p" variant="bodyMd">
                        <strong>3PL Provider:</strong> {integration.tenant_name}
                      </Text>
                      <Text as="p" variant="bodyMd">
                        <strong>API Status:</strong> {integration.api_key_configured ? "✅ Configured" : "❌ Not Configured"}
                      </Text>
                      <Text as="p" variant="bodyMd">
                        <strong>Inventory Sync:</strong> {integration.inventory_sync_enabled ? "✅ Enabled" : "❌ Disabled"}
                      </Text>
                    </BlockStack>
                  </BlockStack>
                </Card>
              )}
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
