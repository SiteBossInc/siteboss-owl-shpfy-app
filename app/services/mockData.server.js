// Mock data service to simulate SiteBoss OWL API responses
// This provides realistic data for frontend development and testing

export const mockTenants = {
  "shipitez": {
    id: "shipitez",
    name: "ShipItEZ Logistics",
    display_name: "ShipItEZ Logistics",
    contact_email: "support@shipitez.com",
    contact_phone: "+1-555-SHIP-EZ",
    support_url: "https://shipitez.com/support",
    logo_url: "https://shipitez.com/logo.png",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z"
  },
  "winefulfill": {
    id: "winefulfill",
    name: "Wine Fulfillment Pro",
    display_name: "Wine Fulfillment Pro",
    contact_email: "help@winefulfill.com",
    contact_phone: "+1-800-WINE-PRO",
    support_url: "https://winefulfill.com/help",
    logo_url: "https://winefulfill.com/assets/logo.png",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z"
  }
};

export const mockOrders = [
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
    billing_address: {
      first_name: "John",
      last_name: "Doe",
      address1: "123 Main St",
      address2: "Apt 4B",
      city: "New York",
      province: "NY",
      country: "US",
      zip: "10001"
    },
    shipping_address: {
      first_name: "John",
      last_name: "Doe",
      address1: "123 Main St",
      address2: "Apt 4B",
      city: "New York",
      province: "NY",
      country: "US",
      zip: "10001"
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
      },
      {
        status: "picking",
        timestamp: "2024-01-15T14:30:00Z",
        note: "Items being picked from warehouse"
      },
      {
        status: "partially_shipped",
        timestamp: "2024-01-16T09:15:00Z",
        note: "Parcel 1 of 2 shipped"
      }
    ],
    parcels: [
      {
        id: "parcel_001",
        parcel_number: "PKG-001",
        tracking_number: "1Z999AA1234567890",
        carrier: "UPS",
        carrier_service: "UPS Ground",
        status: "delivered",
        shipped_at: "2024-01-16T09:15:00Z",
        delivered_at: "2024-01-17T14:30:00Z",
        estimated_delivery: "2024-01-17T17:00:00Z",
        tracking_url: "https://www.ups.com/track?tracknum=1Z999AA1234567890",
        items: [
          {
            sku: "WINE-CABERNET-2021",
            title: "Cabernet Sauvignon 2021",
            quantity: 2,
            status: "delivered"
          },
          {
            sku: "WINE-OPENER-GOLD",
            title: "Gold Wine Opener",
            quantity: 1,
            status: "delivered"
          }
        ],
        tracking_events: [
          {
            status: "shipped",
            timestamp: "2024-01-16T09:15:00Z",
            location: "New York, NY",
            description: "Package shipped from fulfillment center"
          },
          {
            status: "in_transit",
            timestamp: "2024-01-16T18:30:00Z",
            location: "Philadelphia, PA",
            description: "Package in transit"
          },
          {
            status: "delivered",
            timestamp: "2024-01-17T14:30:00Z",
            location: "New York, NY",
            description: "Package delivered to recipient"
          }
        ]
      },
      {
        id: "parcel_002",
        parcel_number: "PKG-002",
        tracking_number: "1Z999AA1234567891",
        carrier: "UPS",
        carrier_service: "UPS Ground",
        status: "in_transit",
        shipped_at: "2024-01-17T10:00:00Z",
        estimated_delivery: "2024-01-18T17:00:00Z",
        tracking_url: "https://www.ups.com/track?tracknum=1Z999AA1234567891",
        items: [
          {
            sku: "GIFT-BOX-PREMIUM",
            title: "Premium Gift Box",
            quantity: 1,
            status: "in_transit"
          }
        ],
        tracking_events: [
          {
            status: "shipped",
            timestamp: "2024-01-17T10:00:00Z",
            location: "New York, NY",
            description: "Package shipped from fulfillment center"
          },
          {
            status: "in_transit",
            timestamp: "2024-01-17T20:15:00Z",
            location: "Newark, NJ",
            description: "Package in transit"
          }
        ]
      },
      {
        id: "parcel_003",
        parcel_number: "PKG-003",
        tracking_number: null,
        carrier: null,
        status: "processing",
        items: [
          {
            sku: "WINE-GLASSES-SET",
            title: "Wine Glasses Set (4 pieces)",
            quantity: 1,
            status: "backordered"
          }
        ],
        tracking_events: [
          {
            status: "created",
            timestamp: "2024-01-15T11:00:00Z",
            location: "New York, NY",
            description: "Parcel created - awaiting inventory"
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
    updated_at: "2024-01-16T11:45:00Z",
    customer: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1987654321"
    },
    timeline: [
      {
        status: "received",
        timestamp: "2024-01-14T09:15:00Z",
        note: "Order received and validated"
      },
      {
        status: "processing",
        timestamp: "2024-01-14T10:00:00Z",
        note: "Order processing started"
      },
      {
        status: "shipped",
        timestamp: "2024-01-15T08:30:00Z",
        note: "Order shipped"
      },
      {
        status: "delivered",
        timestamp: "2024-01-16T11:45:00Z",
        note: "Order delivered successfully"
      }
    ],
    parcels: [
      {
        id: "parcel_004",
        parcel_number: "PKG-004",
        tracking_number: "1Z999AA1234567892",
        carrier: "UPS",
        status: "delivered",
        shipped_at: "2024-01-15T08:30:00Z",
        delivered_at: "2024-01-16T11:45:00Z",
        items: [
          {
            sku: "WINE-CHARDONNAY-2022",
            title: "Chardonnay 2022",
            quantity: 3,
            status: "delivered"
          }
        ]
      }
    ],
    total_price: "89.97",
    currency: "USD"
  }
];

export const mockSkuValidation = {
  valid_skus: ["WINE-CABERNET-2021", "WINE-CHARDONNAY-2022", "WINE-OPENER-GOLD"],
  invalid_skus: [
    {
      sku: "WINE-MERLOT-2020",
      reason: "not_found_in_warehouse",
      last_checked: "2024-01-17T08:00:00Z",
      suggested_alternatives: ["WINE-MERLOT-2021", "MERLOT-2020-V2"]
    },
    {
      sku: "BOTTLE-OPENER-SILVER",
      reason: "discontinued",
      last_checked: "2024-01-16T15:30:00Z",
      suggested_alternatives: ["BOTTLE-OPENER-GOLD", "OPENER-SILVER-NEW"]
    },
    {
      sku: "GIFT-BOX-STANDARD",
      reason: "out_of_stock",
      last_checked: "2024-01-17T06:45:00Z",
      suggested_alternatives: ["GIFT-BOX-PREMIUM", "BOX-STANDARD-ALT"]
    }
  ]
};

export const mockInventory = [
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
  },
  {
    sku: "WINE-OPENER-GOLD",
    title: "Gold Wine Opener",
    quantity: 45,
    reserved: 5,
    available: 40,
    location: "Warehouse B - Accessories",
    last_updated: "2024-01-17T09:30:00Z",
    status: "in_stock"
  },
  {
    sku: "WINE-GLASSES-SET",
    title: "Wine Glasses Set (4 pieces)",
    quantity: 0,
    reserved: 1,
    available: 0,
    location: "Warehouse B - Glassware",
    last_updated: "2024-01-17T09:30:00Z",
    status: "out_of_stock"
  }
];

export const mockIntegrationSettings = {
  tenant_id: "shipitez",
  platform: "shopify",
  store_identifier: "demo-store.myshopify.com",
  is_active: true,
  order_ingestion_enabled: true,
  batching_frequency: "real-time",
  inventory_sync_enabled: true,
  inventory_sync_frequency: "hourly",
  webhooks_enabled: true,
  sku_validation_enabled: true,
  api_key_configured: true,
  last_sync: "2024-01-17T09:30:00Z",
  sync_status: "healthy"
};

// Helper functions to simulate API delays and responses
export function simulateApiDelay(min = 500, max = 1500) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

export function createApiResponse(data, success = true, message = null) {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}
