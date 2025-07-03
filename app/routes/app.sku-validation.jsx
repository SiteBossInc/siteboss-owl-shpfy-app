import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import {
  Page,
  Layout,
  Card,
  Text,
  Banner,
  BlockStack,
  InlineStack,
  Button,
  Badge,
  Box,
  DataTable,
  EmptyState
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getProductsWithSkus, formatSkuData } from "../services/shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  try {
    // Fetch real products and SKUs from Shopify
    console.log('Fetching products with SKUs from Shopify...');
    const products = await getProductsWithSkus(admin, 100); // Limit to 100 products for performance
    const skuData = formatSkuData(products);

    console.log(`Found ${skuData.total_products} products with ${skuData.total_variants} variants (${skuData.invalid_skus.length} SKUs)`);

    // Mock tenant info (this would come from the API key configuration in a real app)
    const tenantInfo = {
      name: "ShipItEZ Logistics",
      contact_email: "support@shipitez.com",
      contact_phone: "+1-555-SHIP-EZ",
      support_url: "https://shipitez.com/support"
    };

    return json({
      skuData,
      tenantInfo,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching SKU data:', error);

    // Fallback to mock data if there's an error
    const mockSkuData = {
      valid_skus: [],
      invalid_skus: [
        {
          sku: "ERROR-FETCHING-SKUS",
          reason: "fetch_error",
          last_checked: new Date().toISOString(),
          suggested_alternatives: [],
          productTitle: "Error fetching products",
          variantTitle: "Please check your connection"
        }
      ],
      total_products: 0,
      total_variants: 0
    };

    const tenantInfo = {
      name: "ShipItEZ Logistics",
      contact_email: "support@shipitez.com",
      contact_phone: "+1-555-SHIP-EZ",
      support_url: "https://shipitez.com/support"
    };

    return json({
      skuData: mockSkuData,
      tenantInfo,
      error: "Failed to fetch SKU data from Shopify",
      fetchedAt: new Date().toISOString()
    });
  }
};

function SKUWarningBanner({ invalidSkus, tenantInfo }) {
  if (invalidSkus.length === 0) {
    return (
      <Banner status="success">
        <BlockStack gap="200">
          <Text as="p" variant="bodyMd">
            ✅ All SKUs are validated and found in the warehouse.
          </Text>
        </BlockStack>
      </Banner>
    );
  }
  
  return (
    <Banner status="critical">
      <BlockStack gap="300">
        <Text as="h3" variant="headingMd">
          ⚠️ SKU VALIDATION ALERT
        </Text>
        
        <Text as="p" variant="bodyMd">
          The following SKUs from your Shopify store are not synced with {tenantInfo.name}'s warehouse.
          Please contact {tenantInfo.name} at {tenantInfo.contact_email} or {tenantInfo.contact_phone} to set up SKU mapping and inventory sync.
        </Text>
        
        <BlockStack gap="200">
          <Text as="p" variant="bodyMd">
            <strong>Missing SKUs ({invalidSkus.length}):</strong>
          </Text>
          {invalidSkus.slice(0, 5).map((item, index) => (
            <Box key={index} paddingInlineStart="400">
              <Text as="p" variant="bodySm">
                • {item.sku} (Last checked: {new Date(item.last_checked).toLocaleString()})
              </Text>
            </Box>
          ))}
          {invalidSkus.length > 5 && (
            <Text as="p" variant="bodySm" tone="subdued">
              ... and {invalidSkus.length - 5} more
            </Text>
          )}
        </BlockStack>
        
        <InlineStack gap="300">
          <Button 
            url={`mailto:${tenantInfo.contact_email}?subject=SKU Validation Issues&body=Hello, I need assistance with SKU validation issues in my Shopify integration.`}
            external
          >
            Contact {tenantInfo.name}
          </Button>
          <Button variant="plain">
            Mark as Resolved
          </Button>
          <Button variant="plain">
            View Details
          </Button>
        </InlineStack>
      </BlockStack>
    </Banner>
  );
}

function getReasonBadge(reason) {
  const reasonMap = {
    not_found_in_warehouse: { status: "critical", text: "Not Found" },
    not_synced_with_warehouse: { status: "warning", text: "Not Synced" },
    discontinued: { status: "warning", text: "Discontinued" },
    out_of_stock: { status: "attention", text: "Out of Stock" },
    mapping_required: { status: "info", text: "Mapping Required" },
    fetch_error: { status: "critical", text: "Fetch Error" }
  };

  const config = reasonMap[reason] || { status: "info", text: reason };
  return <Badge status={config.status}>{config.text}</Badge>;
}

export default function SKUValidation() {
  const { skuData, tenantInfo, error, fetchedAt } = useLoaderData();

  // Prepare data for the invalid SKUs table
  const invalidSkuRows = skuData.invalid_skus.map((item) => [
    <BlockStack gap="100" key={item.sku}>
      <Text as="p" variant="bodyMd" fontWeight="semibold">
        {item.sku}
      </Text>
      {item.productTitle && (
        <Text as="p" variant="bodySm" tone="subdued">
          {item.productTitle}
          {item.variantTitle && item.variantTitle !== "Default Title" && ` - ${item.variantTitle}`}
        </Text>
      )}
    </BlockStack>,
    getReasonBadge(item.reason),
    new Date(item.last_checked).toLocaleDateString(),
    item.suggested_alternatives?.join(", ") || "None",
    <InlineStack gap="200" key={item.sku}>
      <Button size="micro" variant="plain">
        Resolve
      </Button>
      <Button size="micro" variant="plain">
        Disable
      </Button>
    </InlineStack>
  ]);
  
  const validSkuRows = skuData.valid_skus.map((sku) => [
    sku,
    <Badge status="success" key={sku}>Valid</Badge>,
    new Date().toLocaleDateString(),
    "N/A",
    <Text as="span" variant="bodySm" tone="subdued" key={sku}>
      No action needed
    </Text>
  ]);
  
  return (
    <Page>
      <TitleBar title="SKU Validation" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Error Banner */}
            {error && (
              <Banner tone="critical">
                <Text as="p" variant="bodyMd">
                  {error}
                </Text>
              </Banner>
            )}

            {/* Data Freshness Info */}
            {fetchedAt && (
              <Banner tone="info">
                <Text as="p" variant="bodyMd">
                  SKU data fetched from Shopify at {new Date(fetchedAt).toLocaleString()}.
                  Since no warehouse sync is configured yet, all SKUs appear as "Not Synced".
                </Text>
              </Banner>
            )}

            {/* Warning Banner */}
            <SKUWarningBanner
              invalidSkus={skuData.invalid_skus}
              tenantInfo={tenantInfo}
            />
            
            {/* Summary Cards */}
            <Layout>
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd" alignment="center">
                      Valid SKUs
                    </Text>
                    <Text as="p" variant="heading2xl" alignment="center" tone="success">
                      {skuData.valid_skus.length}
                    </Text>
                  </BlockStack>
                </Card>
              </Layout.Section>
              
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd" alignment="center">
                      Invalid SKUs
                    </Text>
                    <Text as="p" variant="heading2xl" alignment="center" tone="critical">
                      {skuData.invalid_skus.length}
                    </Text>
                  </BlockStack>
                </Card>
              </Layout.Section>
              
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd" alignment="center">
                      Success Rate
                    </Text>
                    <Text as="p" variant="heading2xl" alignment="center">
                      {Math.round((skuData.valid_skus.length / (skuData.valid_skus.length + skuData.invalid_skus.length)) * 100)}%
                    </Text>
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout>
            
            {/* Invalid SKUs Table */}
            {skuData.invalid_skus.length > 0 && (
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Invalid SKUs Requiring Attention
                  </Text>
                  
                  <DataTable
                    columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                    headings={['SKU & Product', 'Status', 'Last Checked', 'Suggested Alternatives', 'Actions']}
                    rows={invalidSkuRows}
                  />
                </BlockStack>
              </Card>
            )}
            
            {/* Valid SKUs Table */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Valid SKUs
                </Text>
                
                {skuData.valid_skus.length === 0 ? (
                  <EmptyState
                    heading="No valid SKUs found"
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <Text as="p" variant="bodyMd">
                      Valid SKUs will appear here once they are validated against the warehouse inventory.
                    </Text>
                  </EmptyState>
                ) : (
                  <DataTable
                    columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                    headings={['SKU', 'Status', 'Last Checked', 'Notes', 'Actions']}
                    rows={validSkuRows}
                  />
                )}
              </BlockStack>
            </Card>
            
            {/* Support Information */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Need Help with SKU Issues?
                </Text>
                
                <BlockStack gap="300">
                  <Text as="p" variant="bodyMd">
                    If you're experiencing SKU validation issues, contact your 3PL provider directly:
                  </Text>
                  
                  <InlineStack gap="400">
                    <Text as="p" variant="bodyMd">
                      <strong>{tenantInfo.name}</strong>
                    </Text>
                    <Text as="p" variant="bodyMd">
                      {tenantInfo.contact_email}
                    </Text>
                    <Text as="p" variant="bodyMd">
                      {tenantInfo.contact_phone}
                    </Text>
                  </InlineStack>
                  
                  <InlineStack gap="300">
                    <Button 
                      url={`mailto:${tenantInfo.contact_email}?subject=SKU Validation Support`}
                      external
                    >
                      Send Email
                    </Button>
                    {tenantInfo.support_url && (
                      <Button 
                        url={tenantInfo.support_url}
                        external
                        variant="plain"
                      >
                        Visit Support Center
                      </Button>
                    )}
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
