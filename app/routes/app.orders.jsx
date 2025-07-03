import { useState, useCallback } from "react";
import { useLoaderData, useFetcher, useSearchParams } from "@remix-run/react";
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
  Box,
  Divider,
  ProgressBar,
  TextField,
  FormLayout,
  Filters,
  DatePicker,
  Select,
  Collapsible,
  Icon
} from "@shopify/polaris";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const searchParams = {
    orderId: url.searchParams.get("orderId") || "",
    customerName: url.searchParams.get("customerName") || "",
    customerEmail: url.searchParams.get("customerEmail") || "",
    customerPhone: url.searchParams.get("customerPhone") || "",
    status: url.searchParams.get("status") || "",
    dateFrom: url.searchParams.get("dateFrom") || "",
    dateTo: url.searchParams.get("dateTo") || "",
    page: parseInt(url.searchParams.get("page") || "0"),
    limit: parseInt(url.searchParams.get("limit") || "10")
  };

  // Generate more mock data for pagination testing
  const allMockOrders = [
    {
      external_order_id: "12345",
      siteboss_order_id: "ORD-2024-001",
      order_number: "#1001",
      status: "partially_shipped",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-16T14:20:00Z",
      customer: {
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890"
      },
      timeline: [
        {
          status: "received",
          timestamp: "2024-01-15T10:30:00Z",
          note: "Order received and validated"
        },
        {
          status: "processing",
          timestamp: "2024-01-15T11:00:00Z",
          note: "Order processing started"
        }
      ],
      parcels: [
        {
          id: "parcel_001",
          parcel_number: "PKG-001",
          tracking_number: "1Z999AA1234567890",
          carrier: "UPS",
          status: "delivered",
          items: [
            {
              sku: "WINE-CABERNET-2021",
              title: "Cabernet Sauvignon 2021",
              quantity: 2,
              status: "delivered"
            }
          ]
        }
      ],
      total_price: "164.97",
      currency: "USD"
    },
    {
      external_order_id: "12346",
      siteboss_order_id: "ORD-2024-002",
      order_number: "#1002",
      status: "delivered",
      created_at: "2024-01-14T09:15:00Z",
      updated_at: "2024-01-17T16:45:00Z",
      customer: {
        name: "Jane Smith",
        email: "jane.smith@email.com",
        phone: "+1987654321"
      },
      timeline: [
        {
          status: "received",
          timestamp: "2024-01-14T09:15:00Z",
          note: "Order received and validated"
        },
        {
          status: "delivered",
          timestamp: "2024-01-17T16:45:00Z",
          note: "Order delivered successfully"
        }
      ],
      parcels: [
        {
          id: "parcel_002",
          parcel_number: "PKG-002",
          tracking_number: "1Z999BB1234567891",
          carrier: "UPS",
          status: "delivered",
          delivered_at: "2024-01-17T16:45:00Z",
          items: [
            {
              sku: "WINE-CHARDONNAY-2022",
              title: "Chardonnay 2022",
              quantity: 1,
              status: "delivered"
            }
          ]
        }
      ],
      total_price: "89.99",
      currency: "USD"
    }
  ];

  // Add more mock orders for pagination testing
  for (let i = 3; i <= 25; i++) {
    allMockOrders.push({
      external_order_id: `1234${i}`,
      siteboss_order_id: `ORD-2024-${String(i).padStart(3, '0')}`,
      order_number: `#100${i}`,
      status: i % 3 === 0 ? "delivered" : i % 2 === 0 ? "shipped" : "processing",
      created_at: new Date(2024, 0, Math.floor(Math.random() * 30) + 1, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)).toISOString(),
      updated_at: new Date().toISOString(),
      customer: {
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        phone: `+1${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`
      },
      timeline: [
        {
          status: "received",
          timestamp: new Date(2024, 0, Math.floor(Math.random() * 30) + 1).toISOString(),
          note: "Order received and validated"
        }
      ],
      parcels: [
        {
          id: `parcel_${String(i).padStart(3, '0')}`,
          parcel_number: `PKG-${String(i).padStart(3, '0')}`,
          tracking_number: `1Z999${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i + 1) % 26))}123456789${i}`,
          carrier: i % 2 === 0 ? "UPS" : "FedEx",
          status: i % 3 === 0 ? "delivered" : i % 2 === 0 ? "shipped" : "processing",
          items: [
            {
              sku: `WINE-ITEM-${String(i).padStart(3, '0')}`,
              title: `Wine Product ${i}`,
              quantity: Math.floor(Math.random() * 3) + 1,
              status: i % 3 === 0 ? "delivered" : i % 2 === 0 ? "shipped" : "processing"
            }
          ]
        }
      ],
      total_price: (Math.random() * 200 + 50).toFixed(2),
      currency: "USD"
    });
  }

  // Filter orders based on search parameters
  let filteredOrders = allMockOrders.filter(order => {
    if (searchParams.orderId && !order.order_number.toLowerCase().includes(searchParams.orderId.toLowerCase()) &&
        !order.external_order_id.includes(searchParams.orderId)) {
      return false;
    }
    if (searchParams.customerName && !order.customer.name.toLowerCase().includes(searchParams.customerName.toLowerCase())) {
      return false;
    }
    if (searchParams.customerEmail && !order.customer.email.toLowerCase().includes(searchParams.customerEmail.toLowerCase())) {
      return false;
    }
    if (searchParams.customerPhone && !order.customer.phone.includes(searchParams.customerPhone)) {
      return false;
    }
    if (searchParams.status && order.status !== searchParams.status) {
      return false;
    }
    if (searchParams.dateFrom) {
      const orderDate = new Date(order.created_at);
      const fromDate = new Date(searchParams.dateFrom);
      if (orderDate < fromDate) return false;
    }
    if (searchParams.dateTo) {
      const orderDate = new Date(order.created_at);
      const toDate = new Date(searchParams.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      if (orderDate > toDate) return false;
    }
    return true;
  });

  // Sort by created_at descending (most recent first)
  filteredOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Pagination
  const startIndex = searchParams.page * searchParams.limit;
  const endIndex = startIndex + searchParams.limit;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
  const hasMore = endIndex < filteredOrders.length;
  const totalCount = filteredOrders.length;

  return json({
    orders: paginatedOrders,
    hasMore,
    totalCount,
    searchParams,
    currentPage: searchParams.page
  });
};

export const action = async ({ request }) => {
  await authenticate.admin(request);

  const formData = await request.formData();
  const actionType = formData.get("_action");

  if (actionType === "load_more") {
    // This will be handled by the loader with updated search params
    return json({ success: true });
  }

  return json({ success: false, message: "Invalid action" });
};

function getStatusBadge(status) {
  const statusMap = {
    received: { status: "info", text: "Received" },
    processing: { status: "attention", text: "Processing" },
    picking: { status: "attention", text: "Picking" },
    packed: { status: "attention", text: "Packed" },
    shipped: { status: "success", text: "Shipped" },
    partially_shipped: { status: "warning", text: "Partially Shipped" },
    delivered: { status: "success", text: "Delivered" },
    partially_delivered: { status: "warning", text: "Partially Delivered" },
    exception: { status: "critical", text: "Exception" }
  };
  
  const config = statusMap[status] || { status: "info", text: status };
  return <Badge status={config.status}>{config.text}</Badge>;
}

function getParcelStatusIcon(status) {
  const iconMap = {
    delivered: "✅",
    in_transit: "🚚",
    shipped: "📦",
    processing: "⏳",
    created: "📋"
  };
  return iconMap[status] || "📦";
}

function ParcelCard({ parcel, orderNumber }) {
  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between">
          <Text as="h3" variant="headingMd">
            {getParcelStatusIcon(parcel.status)} Parcel {parcel.parcel_number}
          </Text>
          {getStatusBadge(parcel.status)}
        </InlineStack>
        
        {parcel.tracking_number && (
          <InlineStack gap="200">
            <Text as="span" variant="bodyMd">
              <strong>Tracking:</strong> {parcel.tracking_number}
            </Text>
            <Text as="span" variant="bodyMd" tone="subdued">
              ({parcel.carrier})
            </Text>
          </InlineStack>
        )}
        
        <BlockStack gap="200">
          <Text as="p" variant="bodyMd">
            <strong>Contents:</strong>
          </Text>
          {parcel.items.map((item, index) => (
            <Box key={index} paddingInlineStart="400">
              <Text as="p" variant="bodySm">
                • {item.title} (Qty: {item.quantity}) - SKU: {item.sku}
              </Text>
            </Box>
          ))}
        </BlockStack>
        
        {parcel.delivered_at && (
          <Text as="p" variant="bodyMd" tone="success">
            <strong>Delivered:</strong> {new Date(parcel.delivered_at).toLocaleDateString()} at {new Date(parcel.delivered_at).toLocaleTimeString()}
          </Text>
        )}
        
        {parcel.estimated_delivery && !parcel.delivered_at && (
          <Text as="p" variant="bodyMd">
            <strong>Est. Delivery:</strong> {new Date(parcel.estimated_delivery).toLocaleDateString()}
          </Text>
        )}
        
        {parcel.tracking_url && (
          <Button url={parcel.tracking_url} external variant="plain">
            Track Package
          </Button>
        )}
      </BlockStack>
    </Card>
  );
}

function OrderCard({ order }) {
  const deliveredParcels = order.parcels.filter(p => p.status === "delivered").length;
  const totalParcels = order.parcels.length;
  const progressValue = totalParcels > 0 ? (deliveredParcels / totalParcels) * 100 : 0;
  
  return (
    <Card>
      <BlockStack gap="400">
        {/* Order Header */}
        <InlineStack align="space-between">
          <BlockStack gap="200">
            <Text as="h2" variant="headingLg">
              Order {order.order_number}
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              {order.customer.name} • {order.customer.email}
            </Text>
          </BlockStack>
          {getStatusBadge(order.status)}
        </InlineStack>
        
        {/* Progress Bar for Multi-Parcel Orders */}
        {totalParcels > 1 && (
          <BlockStack gap="200">
            <InlineStack align="space-between">
              <Text as="p" variant="bodyMd">
                Delivery Progress
              </Text>
              <Text as="p" variant="bodyMd">
                {deliveredParcels} of {totalParcels} parcels delivered
              </Text>
            </InlineStack>
            <ProgressBar progress={progressValue} size="small" />
          </BlockStack>
        )}
        
        <Divider />
        
        {/* Parcels */}
        <BlockStack gap="300">
          <Text as="h3" variant="headingMd">
            Parcels ({totalParcels})
          </Text>
          <BlockStack gap="300">
            {order.parcels.map((parcel) => (
              <ParcelCard 
                key={parcel.id} 
                parcel={parcel} 
                orderNumber={order.order_number}
              />
            ))}
          </BlockStack>
        </BlockStack>
        
        {/* Order Timeline */}
        <BlockStack gap="300">
          <Text as="h3" variant="headingMd">
            Order Timeline
          </Text>
          <BlockStack gap="200">
            {order.timeline.map((event, index) => (
              <InlineStack key={index} gap="300">
                <Box minWidth="120px">
                  <Text as="p" variant="bodySm" tone="subdued">
                    {new Date(event.timestamp).toLocaleDateString()}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </Text>
                </Box>
                <Box>
                  {getStatusBadge(event.status)}
                </Box>
                <Text as="p" variant="bodyMd">
                  {event.note}
                </Text>
              </InlineStack>
            ))}
          </BlockStack>
        </BlockStack>
        
        {/* Order Details */}
        <Divider />
        <InlineStack align="space-between">
          <Text as="p" variant="bodyMd">
            <strong>Total:</strong> {order.currency} {order.total_price}
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Created: {new Date(order.created_at).toLocaleDateString()}
          </Text>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

export default function Orders() {
  const { orders, hasMore, totalCount, searchParams: initialSearchParams } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();

  // Search state
  const [orderId, setOrderId] = useState(initialSearchParams.orderId || "");
  const [customerName, setCustomerName] = useState(initialSearchParams.customerName || "");
  const [customerEmail, setCustomerEmail] = useState(initialSearchParams.customerEmail || "");
  const [customerPhone, setCustomerPhone] = useState(initialSearchParams.customerPhone || "");
  const [status, setStatus] = useState(initialSearchParams.status || "");
  const [dateFrom, setDateFrom] = useState(initialSearchParams.dateFrom || "");
  const [dateTo, setDateTo] = useState(initialSearchParams.dateTo || "");

  // UI state
  const [searchExpanded, setSearchExpanded] = useState(false);

  // Accumulated orders for "View more" functionality
  const [allOrders, setAllOrders] = useState(orders);
  const [currentPage, setCurrentPage] = useState(initialSearchParams.page || 0);

  // Update accumulated orders when new data comes in
  if (fetcher.data?.orders && currentPage > 0) {
    // This is a "load more" request, append to existing orders
    const newOrders = fetcher.data.orders.filter(
      newOrder => !allOrders.some(existingOrder => existingOrder.external_order_id === newOrder.external_order_id)
    );
    if (newOrders.length > 0) {
      setAllOrders(prev => [...prev, ...newOrders]);
    }
  } else if (orders !== allOrders && currentPage === 0) {
    // This is a new search, replace all orders
    setAllOrders(orders);
  }

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (orderId) params.set("orderId", orderId);
    if (customerName) params.set("customerName", customerName);
    if (customerEmail) params.set("customerEmail", customerEmail);
    if (customerPhone) params.set("customerPhone", customerPhone);
    if (status) params.set("status", status);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    params.set("page", "0"); // Reset to first page on new search

    setSearchParams(params);
    setCurrentPage(0);
  }, [orderId, customerName, customerEmail, customerPhone, status, dateFrom, dateTo, setSearchParams]);

  const handleClearSearch = useCallback(() => {
    setOrderId("");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setSearchParams({});
    setCurrentPage(0);
  }, [setSearchParams]);

  const handleLoadMore = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    const nextPage = currentPage + 1;
    params.set("page", nextPage.toString());

    fetcher.load(`/app/orders?${params.toString()}`);
    setCurrentPage(nextPage);
  }, [searchParams, currentPage, fetcher]);

  const isLoading = fetcher.state === "loading";
  const hasSearchFilters = orderId || customerName || customerEmail || customerPhone || status || dateFrom || dateTo;

  // Status options for the select dropdown
  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Received", value: "received" },
    { label: "Processing", value: "processing" },
    { label: "Picking", value: "picking" },
    { label: "Packed", value: "packed" },
    { label: "Shipped", value: "shipped" },
    { label: "Partially Shipped", value: "partially_shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Partially Delivered", value: "partially_delivered" },
    { label: "Exception", value: "exception" }
  ];

  return (
    <Page>
      <TitleBar title="Order Status & Tracking" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Search Section */}
            <Card>
              <BlockStack gap="400">
                <Button
                  onClick={() => setSearchExpanded(!searchExpanded)}
                  variant="plain"
                  textAlign="left"
                  fullWidth
                >
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingMd">
                      Search & Filter Orders
                      {hasSearchFilters && (
                        <Badge status="info" size="small">
                          {Object.values({orderId, customerName, customerEmail, customerPhone, status, dateFrom, dateTo}).filter(Boolean).length} filters active
                        </Badge>
                      )}
                    </Text>
                    <Icon source={searchExpanded ? ChevronUpIcon : ChevronDownIcon} />
                  </InlineStack>
                </Button>

                <Collapsible
                  open={searchExpanded}
                  id="search-collapsible"
                  transition={{duration: '200ms', timingFunction: 'ease-in-out'}}
                >
                  <FormLayout>
                    <FormLayout.Group>
                      <TextField
                        label="Order ID or Number"
                        value={orderId}
                        onChange={setOrderId}
                        placeholder="e.g., #1001 or 12345"
                        autoComplete="off"
                      />
                      <TextField
                        label="Customer Name"
                        value={customerName}
                        onChange={setCustomerName}
                        placeholder="e.g., John Doe"
                        autoComplete="off"
                      />
                    </FormLayout.Group>

                    <FormLayout.Group>
                      <TextField
                        label="Customer Email"
                        value={customerEmail}
                        onChange={setCustomerEmail}
                        placeholder="e.g., customer@example.com"
                        autoComplete="off"
                      />
                      <TextField
                        label="Customer Phone"
                        value={customerPhone}
                        onChange={setCustomerPhone}
                        placeholder="e.g., +1234567890"
                        autoComplete="off"
                      />
                    </FormLayout.Group>

                    <FormLayout.Group>
                      <Select
                        label="Order Status"
                        options={statusOptions}
                        value={status}
                        onChange={setStatus}
                      />
                      <Box /> {/* Empty box to maintain grid layout */}
                    </FormLayout.Group>

                    <FormLayout.Group>
                      <TextField
                        label="Date From"
                        type="date"
                        value={dateFrom}
                        onChange={setDateFrom}
                        autoComplete="off"
                      />
                      <TextField
                        label="Date To"
                        type="date"
                        value={dateTo}
                        onChange={setDateTo}
                        autoComplete="off"
                      />
                    </FormLayout.Group>

                    <InlineStack gap="300">
                      <Button onClick={handleSearch} variant="primary">
                        Search Orders
                      </Button>
                      {hasSearchFilters && (
                        <Button onClick={handleClearSearch}>
                          Clear All Filters
                        </Button>
                      )}
                    </InlineStack>
                  </FormLayout>
                </Collapsible>
              </BlockStack>
            </Card>

            {/* Results Section */}
            <BlockStack gap="300">
              <InlineStack align="space-between">
                <Text as="h1" variant="headingLg">
                  {hasSearchFilters ? "Search Results" : "Recent Orders"}
                </Text>
                {totalCount > 0 && (
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Showing {allOrders.length} of {totalCount} orders
                  </Text>
                )}
              </InlineStack>

              {allOrders.length === 0 ? (
                <Card>
                  <BlockStack gap="300">
                    <Text as="p" variant="bodyMd" alignment="center">
                      {hasSearchFilters
                        ? "No orders found matching your search criteria. Try adjusting your filters."
                        : "No orders found. Orders will appear here once they are synced from your Shopify store."
                      }
                    </Text>
                  </BlockStack>
                </Card>
              ) : (
                <BlockStack gap="500">
                  {allOrders.map((order) => (
                    <OrderCard key={order.external_order_id} order={order} />
                  ))}

                  {/* Load More Button */}
                  {hasMore && (
                    <Box textAlign="center">
                      <Button
                        onClick={handleLoadMore}
                        loading={isLoading}
                        size="large"
                      >
                        View More Orders
                      </Button>
                    </Box>
                  )}
                </BlockStack>
              )}
            </BlockStack>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
