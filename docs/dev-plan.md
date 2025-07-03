# SiteBoss OWL — Shopify Integration App Specifications

## 1. Project Overview

This project involves developing a Shopify app to integrate Shopify with SiteBoss OWL for seamless order fulfillment, inventory management, and status updates. The app enables **3PL (Third-Party Logistics) providers** using SiteBoss OWL to offer Shopify integration services to their **retail clients** (wineries, retailers, etc.).

**Business Model:**
- **SiteBoss**: SaaS company providing the integration app
- **SiteBoss OWL**: Order and warehouse logistics software used by 3PLs
- **3PL Clients**: Logistics providers who fulfill orders for retailers
- **Retailers**: Wineries and other businesses using Shopify who need fulfillment services

**Multi-Tenant Architecture:**
- Each 3PL has a unique `tenant_id` that identifies their SiteBoss OWL instance
- Retailers installing the app must provide their 3PL's `tenant_id` during setup
- The app displays tenant-specific branding (e.g., "Welcome to ShipItEZ's Shopify Integration")
- All API calls include both the retailer's API key and the 3PL's tenant identifier

**Current Technology Stack:**
- Framework: Remix v2.16+ with Vite
- Runtime: Node.js 18.20+ / 20.10+ / 21.0+
- Database:
  - **Session Storage**: SQLite (dev) → PostgreSQL (production) for Shopify sessions only
  - **Business Data**: SiteBoss OWL existing API and database
- Authentication: Shopify OAuth 2.0 with Prisma session storage
- UI: Shopify Polaris v12+ with App Bridge React v4+

---

## 2. Shopify App (Merchant-Side)

### 2.1 Admin UI in Shopify

**Purpose:** Allows merchants to configure their integration with SiteBoss OWL directly within Shopify.

**Features:**

- **Tenant Configuration**
  - Tenant ID input field to identify the 3PL provider
  - Dynamic tenant branding and welcome message (e.g., "Welcome to ShipItEZ's Shopify Integration")
  - Tenant-specific contact information and support details
  - Validation of tenant ID against SiteBoss OWL tenant registry

- **API Key Configuration**
  - Secure input field to store retailer's SiteBoss OWL API key with encryption at rest
  - API key validation with real-time connection testing against tenant-specific endpoints
  - Key regeneration and revocation capabilities
  - Tenant-scoped API key validation

- **Order Ingestion Settings**
  - Toggle to enable/disable automatic order ingestion
  - Scheduler to select batching frequency:
    - Real-time (immediate processing)
    - Hourly (batched every hour)
    - Daily (batched daily at specified time)
  - Order filtering options (by status, product type, etc.)
  - Tenant-specific order routing configuration

- **Inventory Management**
  - Toggle to enable/disable real-time inventory management
  - Inventory sync frequency settings
  - Product mapping configuration for SiteBoss OWL
  - **SKU Validation Dashboard**: Real-time display of SKU discrepancies

- **SKU Discrepancy Monitoring**
  - **Warning Panel**: Red alert box highlighting SKUs not found in warehouse
  - **SKU List**: Detailed list of problematic SKUs with last sync attempt
  - **Contact Information**: Dynamic display of tenant contact details for resolution
  - **Bulk Actions**: Mark SKUs as resolved, request mapping, or disable sync for specific SKUs
  - **Historical Tracking**: Log of SKU issues and their resolution status

- **Webhook Settings**
  - Toggle to enable/disable receipt of status update webhooks from SiteBoss OWL
  - Webhook endpoint configuration and testing
  - Event type selection (fulfillment, inventory, exceptions)
  - Tenant-specific webhook authentication

- **Order Status and Tracking**
  - **Real-time Order Status**: Live updates from SiteBoss OWL order processing
  - **Parcel Tracking Dashboard**: Visual display of all parcels and their delivery status
  - **Item-Level Tracking**: Show which specific items are in each parcel
  - **Delivery Timeline**: Track parcels from fulfillment to delivery
  - **Exception Handling**: Highlight delayed, damaged, or returned parcels
  - **Customer Communication**: Auto-sync tracking info back to Shopify for customer notifications

- **Status and Logs**
  - Real-time connection status dashboard with tenant-specific metrics
  - Sync statistics and performance metrics
  - Error logs with detailed failure reasons and tenant context
  - Recent sync history with filtering capabilities
  - Retry failed operations interface
  - **Tenant Support Integration**: Direct links to tenant support systems

**Layout Considerations:**

- Use Shopify Polaris components for UI consistency
- **Tenant Branding**: Display tenant name and logo prominently in header
- Split into clear sections: Tenant Setup, Connection, Orders & Tracking, Inventory, SKU Monitoring, Notifications
- **Order Status Prominence**: Real-time order and parcel status cards at top of dashboard
- **SKU Alert Prominence**: Red warning banner for SKU discrepancies
- **Parcel Tracking**: Visual timeline showing parcel journey and delivery status
- Highlight warnings or errors prominently with actionable remediation steps
- Implement progressive disclosure for advanced settings
- **Contextual Help**: Tenant-specific help documentation and contact information

---

## 3. SiteBoss OWL (Merchant-Side)

### 3.1 Integration Settings

**Features:**

- **Multi-Tenant Management**
  - Tenant-specific Shopify integration toggles
  - Per-tenant API key generation and management
  - Tenant branding configuration (name, logo, contact info)
  - Tenant-specific webhook endpoints and authentication

- **API Key Management**
  - Generate new API keys for retailer Shopify connections
  - Revoke/destroy existing API keys with confirmation
  - View API key usage statistics and last access time
  - Tenant-scoped API key validation and permissions

- **Retailer Store Management**
  - Multiple Shopify store support per tenant
  - Store-specific configuration settings
  - Retailer onboarding and setup workflows
  - **SKU Validation Configuration**: Set up SKU validation rules per tenant

- **Notification Configuration**
  - Email notifications with tenant-branded templates
  - SMS alerts for critical failures
  - In-app alerts with severity levels
  - Webhook notifications to external systems
  - **SKU Discrepancy Alerts**: Automated notifications for missing SKUs

**Layout Considerations:**

- Place these options under a new "Integrations" section in the 3PL's admin panel
- **Tenant Dashboard**: Overview of all connected retailers per tenant
- Show current Shopify connection status with detailed health metrics per retailer
- Display last sync summary with success/failure counts
- **SKU Management Interface**: Bulk SKU validation and mapping tools
- Provide integration logs and troubleshooting tools
- **Retailer Support Tools**: Direct communication channels with connected retailers

---

## 4. Order Handling

### 4.1 Ingestion Process

- Orders are sent directly from Shopify to SiteBoss OWL in JSON format
- No conversion to 209 or 205 EDI formats required
- Comprehensive JSON payload structure:
  - Shopify order ID and order number
  - Customer information (name, email, phone, addresses)
  - Line items with product details, variants, and quantities
  - Shipping details and selected shipping method
  - Payment status and payment method information
  - Tax calculations and breakdown
  - Discount codes and promotional information
  - Custom order attributes and metafields
  - Order tags and notes
  - Fulfillment requirements and special instructions

### 4.2 Batching and Processing

- Real-time processing for immediate order fulfillment
- Configurable batching based on merchant preferences:
  - Hourly batches with customizable time windows
  - Daily batches with timezone-aware scheduling
  - Volume-based batching (e.g., every 50 orders)
- Order deduplication and conflict resolution
- Priority handling for expedited orders

### 4.3 Exception Handling and Resilience

- Comprehensive error categorization:
  - Validation errors (missing required fields, invalid data)
  - API connectivity issues
  - SiteBoss OWL processing errors
  - Timeout and rate limiting scenarios
- Automatic retry logic with exponential backoff
- Dead letter queue for permanently failed orders
- Manual retry interface for failed orders
- Detailed error logging with correlation IDs
- Merchant notification system for critical failures

---

## 5. Order Status and Parcel Tracking

### 5.1 Real-time Order Status Dashboard

**Purpose:** Provide retailers with comprehensive visibility into their order fulfillment process through their 3PL provider.

**Features:**

- **Order Status Overview**: Real-time status updates from SiteBoss OWL
  - Received, Processing, Picking, Packed, Shipped, Delivered, Exception
- **Order Timeline**: Visual timeline showing order progression through fulfillment stages
- **Batch Status**: For batched orders, show batch processing status and individual order status within batches
- **Exception Alerts**: Highlight orders with issues (inventory shortages, damaged items, delivery failures)

### 5.2 Parcel Tracking System

**Comprehensive Parcel Management:**

- **Multi-Parcel Orders**: Display when orders are split across multiple parcels
- **Parcel Details**: Show contents of each parcel with item-level detail
- **Tracking Integration**: Real-time tracking updates from carriers (UPS, FedEx, USPS, etc.)
- **Delivery Status**: Track parcels from shipment to final delivery
- **Exception Handling**: Alert on delivery failures, damaged packages, or returns

**Parcel Information Display:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Order #1001 - ShipItEZ Logistics                               │
│ Status: Partially Shipped (2 of 3 parcels shipped)            │
│                                                                 │
│ Parcel 1 - Delivered ✅                                        │
│ Tracking: 1Z999AA1234567890 (UPS)                             │
│ Contents: • WINE-CABERNET-2021 (2 bottles)                    │
│          • WINE-OPENER-GOLD (1 item)                          │
│ Delivered: Jan 15, 2024 at 2:30 PM                            │
│                                                                 │
│ Parcel 2 - In Transit 🚚                                      │
│ Tracking: 1Z999AA1234567891 (UPS)                             │
│ Contents: • GIFT-BOX-PREMIUM (1 item)                         │
│ Est. Delivery: Jan 17, 2024                                    │
│                                                                 │
│ Parcel 3 - Processing 📦                                       │
│ Contents: • WINE-GLASSES-SET (1 set)                          │
│ Status: Awaiting inventory (backordered)                       │
│                                                                 │
│ [View Full Details] [Contact ShipItEZ] [Update Customer]      │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Shopify Integration Features

**Automatic Shopify Updates:**
- **Fulfillment Creation**: Auto-create Shopify fulfillments when parcels ship
- **Tracking Numbers**: Sync tracking numbers to Shopify for customer notifications
- **Partial Fulfillments**: Handle multi-parcel orders with separate fulfillment records
- **Delivery Confirmation**: Update Shopify when parcels are delivered
- **Return Processing**: Handle returns and refunds through Shopify

**Customer Communication:**
- **Shipping Notifications**: Automatic customer emails with tracking information
- **Delivery Updates**: Real-time delivery status updates to customers
- **Exception Notifications**: Alert customers about delivery issues or delays
- **Return Instructions**: Provide return labels and instructions when needed

### 5.4 Order and Parcel Data Structure

**Order Status Hierarchy:**
```
Order Level:
├── received          # Order received by 3PL
├── processing        # Order being processed
├── picking           # Items being picked from warehouse
├── packed            # Order packed into parcels
├── shipped           # All parcels shipped
├── partially_shipped # Some parcels shipped
├── delivered         # All parcels delivered
├── partially_delivered # Some parcels delivered
├── exception         # Issues with order/delivery
└── returned          # Order returned

Parcel Level:
├── created           # Parcel created in system
├── packed            # Items packed into parcel
├── labeled           # Shipping label created
├── shipped           # Parcel shipped
├── in_transit        # Parcel in transit
├── out_for_delivery  # Parcel out for delivery
├── delivered         # Parcel delivered
├── delivery_failed   # Delivery attempt failed
├── returned_to_sender # Parcel returned
└── damaged           # Parcel damaged
```

---

## 6. SKU Validation and Monitoring

### 5.1 Real-time SKU Validation

**Purpose:** Ensure all Shopify product SKUs exist in the 3PL's warehouse before order processing to prevent fulfillment failures.

**Features:**

- **Automatic SKU Validation**: Every product sync triggers SKU validation against tenant's warehouse inventory
- **Real-time Dashboard Alerts**: Prominent red warning banner for SKU discrepancies
- **Detailed SKU Reports**: Comprehensive list of problematic SKUs with context
- **Tenant-Specific Messaging**: Dynamic contact information for resolution
- **Historical Tracking**: Log of SKU issues and resolution status

### 5.2 SKU Discrepancy Dashboard

**Warning Panel Design:**
```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️  SKU VALIDATION ALERT                                        │
│                                                                 │
│ The following SKUs are not found in ShipItEZ's warehouse.      │
│ Please contact ShipItEZ at support@shipitez.com or             │
│ +1-555-SHIP-EZ for assistance.                                 │
│                                                                 │
│ Missing SKUs (3):                                               │
│ • WINE-CABERNET-2021 (Last checked: 2 hours ago)              │
│ • BOTTLE-OPENER-GOLD (Last checked: 1 day ago)                │
│ • GIFT-BOX-PREMIUM (Last checked: 3 hours ago)                │
│                                                                 │
│ [Contact ShipItEZ] [Mark as Resolved] [View Details]           │
└─────────────────────────────────────────────────────────────────┘
```

**Detailed SKU Management:**
- **SKU Status Tracking**: Valid, Invalid, Pending Resolution, Resolved
- **Bulk Actions**: Mark multiple SKUs as resolved, request mapping, disable sync
- **Alternative Suggestions**: Display suggested SKU alternatives from warehouse
- **Resolution Workflow**: Track who resolved issues and when
- **Notification Integration**: Automatic alerts to both retailer and 3PL

### 5.3 SKU Validation Workflow

**Validation Process:**
1. **Product Sync Trigger**: New/updated products trigger SKU validation
2. **Tenant Lookup**: Validate SKUs against specific tenant's warehouse inventory
3. **Status Update**: Update SKU validation status in database
4. **Dashboard Alert**: Display warnings for invalid SKUs
5. **Notification**: Alert both retailer and 3PL of discrepancies
6. **Resolution Tracking**: Monitor resolution progress and outcomes

**Integration Points:**
- **Order Processing**: Block orders with invalid SKUs (configurable)
- **Inventory Sync**: Skip inventory updates for invalid SKUs
- **Reporting**: Include SKU validation metrics in sync reports
- **Support Integration**: Direct links to tenant support systems

---

## 6. Inventory Synchronization

### 6.1 Real-time Synchronization

- **Tenant-Scoped Inventory Sync**: Bidirectional sync between specific 3PL tenant and retailer's Shopify
- **SKU-Validated Updates**: Only sync inventory for validated SKUs
- Real-time updates when enabled, with configurable sync intervals
- Support for multiple inventory locations in Shopify
- Inventory reservation and allocation management
- Low stock threshold alerts and automatic reordering triggers
- **Tenant-Specific Inventory Rules**: Custom inventory policies per 3PL

### 6.2 Data Flow and Mapping

- Product and variant mapping between systems
- SKU-based synchronization with fallback to product IDs
- Inventory level updates pushed as JSON payloads to Shopify's Inventory API
- Support for tracked and untracked inventory items
- Batch inventory updates for performance optimization
- Conflict resolution for simultaneous updates
- Synchronization status dashboard with real-time metrics
- Historical inventory change tracking and audit logs

### 6.3 Advanced Features

- Inventory forecasting and demand planning integration
- Multi-location inventory management
- Seasonal inventory adjustments
- Integration with third-party inventory management systems

---

## 7. Webhooks and Event Management

### 7.1 Supported Events

**From SiteBoss OWL to Shopify:**
- Fulfillment status updates (shipped, delivered, cancelled)
- Inventory level changes and stock adjustments
- Order processing status updates
- Exception and error notifications
- Tracking information updates

**From Shopify to SiteBoss OWL:**
- New order creation
- Order modifications and cancellations
- Customer information updates
- Product and inventory changes

### 6.2 Webhook Configuration and Management

- Granular event type selection with merchant control
- Webhook endpoint validation and testing tools
- Automatic retry logic with exponential backoff
- Webhook signature verification for security
- Event payload transformation and filtering
- Webhook delivery monitoring and alerting
- Failed webhook retry interface
- Webhook performance analytics and optimization

### 6.3 Event Processing

- Asynchronous event processing with queue management
- Event deduplication and ordering guarantees
- Circuit breaker pattern for webhook failures
- Event replay capabilities for system recovery

---

## 7. Security & Authentication

### 7.1 Authentication Methods

- **Shopify App**: OAuth 2.0 with PKCE for secure authentication flow
- **SiteBoss OWL**: API key-based authentication with JWT tokens
- **Session Management**: Secure session storage with Prisma and encrypted tokens
- **Multi-factor Authentication**: Support for 2FA on sensitive operations

### 7.2 Data Security

- **Encryption**: All sensitive data encrypted at rest using AES-256
- **API Key Management**: Secure generation, rotation, and revocation
- **Data Transmission**: TLS 1.3 for all API communications
- **PCI Compliance**: Secure handling of payment-related data
- **GDPR Compliance**: Data privacy and right to deletion support

### 7.3 Access Control

- **Role-based Access Control**: Different permission levels for users
- **API Rate Limiting**: Prevent abuse and ensure fair usage
- **IP Whitelisting**: Optional IP-based access restrictions
- **Audit Logging**: Comprehensive logging of all security-related events

---

## 8. Notifications and Alerting

### 8.1 Notification Channels

- **Email Notifications**
  - HTML and plain text templates
  - Customizable sender information
  - Attachment support for reports and logs
  - Email delivery tracking and bounce handling

- **SMS Alerts**
  - Critical failure notifications
  - Two-way SMS for acknowledgments
  - International SMS support
  - Delivery confirmation and retry logic

- **In-app Notifications**
  - Real-time browser notifications
  - Notification center with history
  - Severity-based categorization
  - Bulk actions for notification management

- **External Integrations**
  - Slack/Teams webhook notifications
  - PagerDuty integration for critical alerts
  - Custom webhook endpoints for third-party systems

### 8.2 Trigger Events and Escalation

- **Order Processing Events**
  - Order ingestion failures with detailed error context
  - Processing delays and timeout notifications
  - Successful order completion confirmations

- **System Health Events**
  - API connectivity issues and service outages
  - Performance degradation alerts
  - Inventory sync failures and data inconsistencies
  - Webhook delivery failures and retry exhaustion

- **Business Logic Events**
  - Low inventory warnings and stockout alerts
  - High-value order notifications
  - Unusual order patterns and fraud detection
  - Customer service escalations

### 8.3 Notification Management

- **Escalation Policies**: Automatic escalation for unacknowledged critical alerts
- **Notification Scheduling**: Quiet hours and business hour configurations
- **Alert Grouping**: Prevent notification spam through intelligent grouping
- **Custom Rules**: Merchant-defined notification rules and filters

---

## 9. Technical Architecture

### 9.1 Shopify App Architecture

**Technology Stack:**
- **Framework**: Remix v2.16+ with Vite for fast development and hot reloading
- **Runtime**: Node.js 18.20+ / 20.10+ / 21.0+ for optimal performance
- **Database**: SQLite (development) → PostgreSQL (production) with Prisma ORM
- **Authentication**: Shopify OAuth 2.0 with Prisma session storage
- **UI Framework**: Shopify Polaris v12+ with App Bridge React v4+
- **API Layer**: Remix loaders/actions for GraphQL/REST API interactions
- **Background Processing**: Bull/BullMQ for order batching and async tasks
- **Monitoring**: Structured logging with correlation IDs and error tracking

**Required Shopify Scopes:**
```
read_orders,write_orders,read_products,write_products,
write_inventory,read_inventory,write_fulfillments,read_fulfillments
```

**Environment Configuration:**
```env
# Shopify-specific configuration
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=read_orders,write_orders,read_products,write_products,write_inventory,read_inventory,write_fulfillments,read_fulfillments
SHOPIFY_APP_URL=your_app_url

# No additional databases needed!
# Sessions stored in existing MongoDB
# Business data in existing tenant-specific PostgreSQL databases

# MongoDB Configuration (EXISTING)
MONGODB_URL=mongodb://user:password@your-mongodb-cluster/siteboss
MONGODB_DATABASE=siteboss

# Tenant Database Configuration (EXISTING)
# Each tenant has their own PostgreSQL database
TENANT_DB_HOST=your-postgres-host
TENANT_DB_PORT=5432
TENANT_DB_USER=siteboss_user
TENANT_DB_PASSWORD=your_password
# Database names follow pattern: siteboss_tenant_{tenant_id}

# SiteBoss OWL API Configuration (EXISTING INFRASTRUCTURE)
SITEBOSS_API_BASE_URL=https://api.siteboss-owl.com
SITEBOSS_EXTERNAL_API_BASE_URL=https://api.siteboss-owl.com/api/external
SITEBOSS_API_KEY=your_internal_api_key  # For Shopify app to call SiteBoss APIs

# Optional: Redis (only if needed for Shopify app caching)
# Development: Skip Redis, use in-memory
# Production: Only if you need caching beyond what SiteBoss OWL provides
# REDIS_URL="redis://user:password@redis-cloud.com:12345"

# Multi-tenant configuration
TENANT_REGISTRY_URL=https://api.siteboss-owl.com/api/tenants
DEFAULT_TENANT_SUPPORT_EMAIL=support@siteboss.com
SKU_VALIDATION_ENABLED=true
SKU_VALIDATION_CACHE_TTL=3600

# Platform identification
PLATFORM_TYPE=shopify
PLATFORM_VERSION=1.0
```

**Revised Hosting Architecture (100% Existing SiteBoss Infrastructure):**
```
┌─────────────────────────────────────────────────────────────────┐
│                    EXISTING SITEBOSS INFRASTRUCTURE            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │   Per-Tenant     │    │   SiteBoss OWL   │                  │
│  │   PostgreSQL     │◄──►│   API Server     │                  │
│  │   - Orders       │    │   (Existing)     │                  │
│  │   - Inventory    │    │   + New Routes   │                  │
│  │   - SKUs         │    │   + SKU Validation│                  │
│  │   + Platforms    │    │   + Shopify APIs │                  │
│  │   + API Keys     │    │                  │                  │
│  │   + Integrations │    │                  │                  │
│  └──────────────────┘    └──────────────────┘                  │
│           ▲                        ▲                            │
│           │                        │                            │
│  ┌──────────────────┐              │                            │
│  │   MongoDB        │              │                            │
│  │   - Sessions     │──────────────┘                            │
│  │   - Configs      │  API calls to existing SiteBoss          │
│  │   - Logs         │                                           │
│  │   (Existing)     │                                           │
│  └──────────────────┘                                           │
│                                    ▲                            │
└────────────────────────────────────┼────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────┐
│              MINIMAL NEW HOSTING   │                            │
├────────────────────────────────────┼────────────────────────────┤
│                                    │                            │
│  ┌─────────────────┐               │                            │
│  │   Remix App     │               │                            │
│  │   (Shopify UI)  │───────────────┘                            │
│  │   NO DATABASE   │  API calls to existing SiteBoss           │
│  │   (Railway/     │  Sessions in MongoDB                       │
│  │   Vercel)       │  Data in PostgreSQL                        │
│  └─────────────────┘                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    Shopify      │
                    │   (They Host)   │
                    │  Merchant's     │
                    │  Admin Panel    │
                    └─────────────────┘
```

### 9.2 Service Layer Architecture

**Directory Structure (Platform-Agnostic):**
```
app/
├── services/
│   ├── platform/
│   │   ├── shopify/
│   │   │   ├── orders.server.js      # Shopify order fetching and processing
│   │   │   ├── inventory.server.js   # Shopify inventory management
│   │   │   ├── products.server.js    # Shopify product synchronization
│   │   │   ├── webhooks.server.js    # Shopify webhook handling
│   │   │   └── adapter.server.js     # Shopify-specific data transformation
│   │   ├── woocommerce/              # Future WooCommerce support
│   │   │   ├── orders.server.js      # WooCommerce order processing
│   │   │   ├── inventory.server.js   # WooCommerce inventory management
│   │   │   └── adapter.server.js     # WooCommerce data transformation
│   │   └── base/
│   │       ├── platformInterface.js  # Common platform interface
│   │       └── baseAdapter.server.js # Shared adapter functionality
│   ├── siteboss/
│   │   ├── client.server.js          # Platform-agnostic SiteBoss API client
│   │   ├── orders.server.js          # Universal order sync and transformation
│   │   ├── inventory.server.js       # Platform-agnostic inventory sync
│   │   ├── auth.server.js            # API key validation and management
│   │   ├── platformRegistry.server.js # Platform configuration management
│   │   ├── tenantRegistry.server.js  # Tenant management and validation
│   │   └── skuValidation.server.js   # SKU validation against tenant warehouses
│   ├── sync/
│   │   ├── orderSync.server.js       # Universal order synchronization
│   │   ├── inventorySync.server.js   # Cross-platform inventory sync
│   │   ├── batchProcessor.server.js  # Platform-aware batch processing
│   │   └── conflictResolver.server.js # Universal conflict resolution
│   ├── adapters/
│   │   ├── adapterFactory.server.js  # Platform adapter factory
│   │   └── dataTransformer.server.js # Universal data transformation
│   └── monitoring/
│       ├── logger.server.js          # Structured logging service
│       ├── metrics.server.js         # Performance metrics collection
│       └── healthCheck.server.js     # System health monitoring
```

### 9.3 Database Strategy: Leveraging Existing SiteBoss Architecture

**No Additional Databases Needed!** Using existing SiteBoss infrastructure:
- **Tenant-Specific PostgreSQL**: Business data in existing per-tenant databases
- **MongoDB**: Sessions, logs, and configurations in existing MongoDB

**SiteBoss OWL Database Extensions (Per-Tenant PostgreSQL):**
```sql
-- Add to each tenant's existing PostgreSQL database
-- Using your existing integer ID pattern

-- Platform registry (seeded with common platforms)
CREATE TABLE platforms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE, -- 'shopify', 'woocommerce', 'magento', etc.
  display_name VARCHAR(100) NOT NULL, -- 'Shopify', 'WooCommerce', 'Magento'
  api_version VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- API keys with tracking and soft deletion
CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  key_hash VARCHAR(255) NOT NULL UNIQUE, -- hashed API key
  key_prefix VARCHAR(10) NOT NULL, -- first few chars for identification
  name VARCHAR(100), -- user-friendly name
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'revoked', 'expired'
  created_by INTEGER, -- user who created it
  revoked_by INTEGER, -- user who revoked it
  revoked_at TIMESTAMP,
  expires_at TIMESTAMP,
  last_used_at TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Platform integrations (no tenant_id needed - per-tenant DB)
CREATE TABLE platform_integrations (
  id SERIAL PRIMARY KEY,
  platform_id INTEGER NOT NULL REFERENCES platforms(id),
  store_identifier VARCHAR(255) NOT NULL, -- shop domain, store URL, etc.
  api_key_id INTEGER REFERENCES api_keys(id), -- which API key is used
  is_active BOOLEAN DEFAULT true,
  order_ingestion_enabled BOOLEAN DEFAULT false,
  batching_frequency VARCHAR(20) DEFAULT 'real-time',
  inventory_sync_enabled BOOLEAN DEFAULT false,
  webhooks_enabled BOOLEAN DEFAULT false,
  sku_validation_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform_id, store_identifier)
);

-- SKU validations (no tenant_id needed - per-tenant DB)
CREATE TABLE sku_validations (
  id SERIAL PRIMARY KEY,
  platform_integration_id INTEGER NOT NULL REFERENCES platform_integrations(id),
  sku VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'valid', 'invalid', 'pending', 'resolved'
  error_reason VARCHAR(100),
  last_checked TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolved_by INTEGER, -- user who resolved it
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform_integration_id, sku)
);

-- Order sync tracking (no tenant_id needed - per-tenant DB)
CREATE TABLE order_sync_logs (
  id SERIAL PRIMARY KEY,
  platform_integration_id INTEGER NOT NULL REFERENCES platform_integrations(id),
  external_order_id VARCHAR(255) NOT NULL,
  siteboss_order_id INTEGER REFERENCES orders(id), -- your existing orders table
  api_key_id INTEGER REFERENCES api_keys(id), -- which key was used
  status VARCHAR(20) NOT NULL, -- 'pending', 'synced', 'failed', 'retrying'
  error_message TEXT,
  sku_validation_status VARCHAR(20),
  attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMP,
  next_retry TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform_integration_id, external_order_id)
);

-- Parcel tracking (extends existing fulfillment data)
CREATE TABLE parcels (
  id SERIAL PRIMARY KEY,
  siteboss_order_id INTEGER NOT NULL REFERENCES orders(id),
  platform_integration_id INTEGER REFERENCES platform_integrations(id),
  external_order_id VARCHAR(255), -- reference back to platform order
  parcel_number VARCHAR(100), -- internal parcel identifier
  tracking_number VARCHAR(255),
  carrier VARCHAR(100), -- 'UPS', 'FedEx', 'USPS', etc.
  carrier_service VARCHAR(100), -- 'UPS Ground', 'FedEx Express', etc.
  tracking_url VARCHAR(500),
  status VARCHAR(30) NOT NULL, -- 'created', 'packed', 'shipped', 'delivered', etc.
  weight_oz DECIMAL(8,2),
  dimensions_json JSONB, -- {length, width, height, unit}
  shipped_at TIMESTAMP,
  estimated_delivery TIMESTAMP,
  delivered_at TIMESTAMP,
  delivery_address_json JSONB, -- full delivery address
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Parcel items (which items are in which parcel)
CREATE TABLE parcel_items (
  id SERIAL PRIMARY KEY,
  parcel_id INTEGER NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  siteboss_order_item_id INTEGER REFERENCES order_items(id), -- your existing order items
  external_line_item_id VARCHAR(255), -- platform line item reference
  sku VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  status VARCHAR(30) DEFAULT 'packed', -- 'packed', 'shipped', 'delivered', 'damaged', 'returned'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Parcel tracking events (detailed tracking history)
CREATE TABLE parcel_tracking_events (
  id SERIAL PRIMARY KEY,
  parcel_id INTEGER NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  location VARCHAR(255),
  description TEXT,
  carrier_event_code VARCHAR(50), -- carrier-specific event code
  is_delivered BOOLEAN DEFAULT false,
  is_exception BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order status history (track order-level status changes)
CREATE TABLE order_status_history (
  id SERIAL PRIMARY KEY,
  siteboss_order_id INTEGER NOT NULL REFERENCES orders(id),
  platform_integration_id INTEGER REFERENCES platform_integrations(id),
  external_order_id VARCHAR(255),
  status VARCHAR(30) NOT NULL,
  previous_status VARCHAR(30),
  note TEXT,
  changed_by VARCHAR(100), -- system, user, webhook, etc.
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_platform_integrations_platform ON platform_integrations(platform_id);
CREATE INDEX idx_platform_integrations_active ON platform_integrations(is_active);
CREATE INDEX idx_sku_validations_status ON sku_validations(status);
CREATE INDEX idx_sku_validations_platform ON sku_validations(platform_integration_id);
CREATE INDEX idx_order_sync_logs_status ON order_sync_logs(status);
CREATE INDEX idx_order_sync_logs_retry ON order_sync_logs(next_retry) WHERE next_retry IS NOT NULL;
CREATE INDEX idx_api_keys_status ON api_keys(status);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- Parcel tracking indexes
CREATE INDEX idx_parcels_order ON parcels(siteboss_order_id);
CREATE INDEX idx_parcels_external_order ON parcels(external_order_id);
CREATE INDEX idx_parcels_tracking ON parcels(tracking_number);
CREATE INDEX idx_parcels_status ON parcels(status);
CREATE INDEX idx_parcels_shipped ON parcels(shipped_at) WHERE shipped_at IS NOT NULL;
CREATE INDEX idx_parcel_items_parcel ON parcel_items(parcel_id);
CREATE INDEX idx_parcel_items_sku ON parcel_items(sku);
CREATE INDEX idx_parcel_tracking_events_parcel ON parcel_tracking_events(parcel_id);
CREATE INDEX idx_parcel_tracking_events_timestamp ON parcel_tracking_events(timestamp);
CREATE INDEX idx_order_status_history_order ON order_status_history(siteboss_order_id);
CREATE INDEX idx_order_status_history_timestamp ON order_status_history(timestamp);

-- Seed common platforms
INSERT INTO platforms (name, display_name, api_version) VALUES
('shopify', 'Shopify', '2025-07'),
('woocommerce', 'WooCommerce', 'v3'),
('magento', 'Magento', '2.4'),
('bigcommerce', 'BigCommerce', 'v3'),
('squarespace', 'Squarespace Commerce', 'v1'),
('prestashop', 'PrestaShop', '1.7');
```

**MongoDB Collections (Existing Database):**
```javascript
// Sessions collection (replaces separate session database)
db.sessions.createIndex({ "shop": 1, "tenant": 1 })
db.sessions.createIndex({ "expires": 1 }, { expireAfterSeconds: 0 })

// Example session document:
{
  _id: ObjectId("..."),
  tenant: "shipitez", // tenant identifier
  shop: "store.myshopify.com",
  sessionId: "shopify_session_id",
  state: "authenticated",
  isOnline: false,
  scope: "read_orders,write_orders,...",
  expires: ISODate("2024-02-15T10:30:00Z"),
  accessToken: "encrypted_token",
  userId: "12345",
  firstName: "John",
  lastName: "Doe",
  email: "john@store.com",
  accountOwner: true,
  locale: "en",
  collaborator: false,
  emailVerified: true,
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}

// Platform configurations collection
db.platform_configs.createIndex({ "tenant": 1, "platform_integration_id": 1 })

// Example configuration document:
{
  _id: ObjectId("..."),
  tenant: "shipitez",
  platform_integration_id: 123, // references PostgreSQL platform_integrations.id
  configuration: {
    webhook_endpoints: {
      order_updates: "https://store.myshopify.com/webhooks/siteboss/orders",
      inventory_updates: "https://store.myshopify.com/webhooks/siteboss/inventory",
      fulfillment_updates: "https://store.myshopify.com/webhooks/siteboss/fulfillments"
    },
    sync_settings: {
      batch_size: 50,
      retry_attempts: 3,
      retry_delay_minutes: [5, 15, 60]
    },
    tenant_branding: {
      tenant_name: "ShipItEZ Logistics",
      contact_email: "support@shipitez.com",
      contact_phone: "+1-555-SHIP-EZ",
      support_url: "https://shipitez.com/support",
      logo_url: "https://shipitez.com/logo.png"
    },
    platform_specific: {
      shopify_shop_domain: "store.myshopify.com",
      shopify_webhook_secret: "encrypted_secret"
    }
  },
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}

// Logs collection (existing pattern)
db.logs.createIndex({ "tenant": 1, "timestamp": -1 })
db.logs.createIndex({ "tenant": 1, "level": 1, "timestamp": -1 })
db.logs.createIndex({ "correlation_id": 1 })

// Example log document:
{
  _id: ObjectId("..."),
  tenant: "shipitez",
  level: "error",
  message: "SKU validation failed",
  context: {
    platform: "shopify",
    store: "store.myshopify.com",
    sku: "WINE-001",
    order_id: "12345",
    api_key_id: 42
  },
  correlation_id: "req_abc123",
  timestamp: ISODate("2024-01-15T10:30:00Z"),
  source: "shopify_integration"
}
```

model InventorySync {
  id                String   @id @default(cuid())
  platform          String   // "shopify", "woocommerce", etc.
  storeIdentifier   String   // shop domain, store URL, etc.
  externalProductId String   // Platform-specific product ID
  externalVariantId String?  // Platform-specific variant ID
  sku               String?
  platformQuantity  Int      // Quantity on the platform
  sitebossQuantity  Int      // Quantity in SiteBoss OWL
  status            String   // "synced", "conflict", "pending"
  lastSyncAt        DateTime
  platformSpecific  Json?    // Platform-specific inventory metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([platform, storeIdentifier, externalProductId, externalVariantId])
  @@index([platform, storeIdentifier, status])
  @@index([sku])
}

model SyncLog {
  id              String   @id @default(cuid())
  platform        String   // "shopify", "woocommerce", etc.
  storeIdentifier String   // shop domain, store URL, etc.
  type            String   // "order", "inventory", "webhook"
  operation       String   // "create", "update", "delete", "sync"
  status          String   // "success", "error", "warning"
  message         String
  details         Json?    // Additional context and error details
  correlationId   String?  // For tracing related operations
  duration        Int?     // Operation duration in milliseconds
  platformSpecific Json?   // Platform-specific log data
  createdAt       DateTime @default(now())

  @@index([platform, storeIdentifier, type, status])
  @@index([correlationId])
  @@index([createdAt])
}

model WebhookEvent {
  id              String   @id @default(cuid())
  platform        String   // "shopify", "woocommerce", etc.
  storeIdentifier String   // shop domain, store URL, etc.
  eventType       String
  payload         Json
  status          String   // "pending", "processed", "failed"
  attempts        Int      @default(0)
  lastAttempt     DateTime?
  nextRetry       DateTime?
  platformSpecific Json?   // Platform-specific webhook metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([status, nextRetry])
  @@index([platform, storeIdentifier, eventType])
}
```

### 9.4 SiteBoss OWL Integration (Platform-Agnostic Architecture)

**New Integration Module Components:**
- **Platform-Agnostic API Gateway**: Universal endpoint for e-commerce platform order ingestion
- **Platform Adapter Layer**: Handles platform-specific data transformation and validation
- **Order Processor**: Unified order validation and transformation engine
- **Inventory Manager**: Multi-platform inventory synchronization service
- **Webhook Publisher**: Event-driven notifications with platform-specific formatting
- **Configuration Manager**: Platform-agnostic integration settings and API key management
- **Platform Registry**: Manages supported platforms and their specific requirements

**Platform Adapter Architecture:**
```
SiteBoss OWL Integration Module
├── api/
│   ├── external/
│   │   ├── orders.controller.js      # Platform-agnostic order ingestion
│   │   ├── inventory.controller.js   # Universal inventory management
│   │   └── platforms.controller.js   # Platform configuration
├── adapters/
│   ├── shopify/
│   │   ├── orderAdapter.js          # Shopify-specific order transformation
│   │   ├── inventoryAdapter.js      # Shopify inventory sync logic
│   │   └── webhookAdapter.js        # Shopify webhook formatting
│   ├── woocommerce/
│   │   ├── orderAdapter.js          # WooCommerce order transformation
│   │   ├── inventoryAdapter.js      # WooCommerce inventory sync
│   │   └── webhookAdapter.js        # WooCommerce webhook formatting
│   └── base/
│       ├── baseAdapter.js           # Common adapter functionality
│       └── platformInterface.js     # Platform adapter interface
├── services/
│   ├── orderProcessor.js            # Unified order processing
│   ├── inventoryManager.js          # Cross-platform inventory management
│   └── webhookPublisher.js          # Platform-aware webhook delivery
└── config/
    ├── platformRegistry.js          # Supported platforms configuration
    └── adapterFactory.js            # Platform adapter factory
```

**Benefits of Platform-Agnostic Design:**
- **Future-Proof**: Easy addition of WooCommerce, Magento, BigCommerce, etc.
- **Code Reuse**: Shared business logic across all platforms
- **Consistent API**: Unified interface for all e-commerce integrations
- **Scalable Architecture**: Platform-specific adapters handle unique requirements
- **Maintainable**: Clear separation of concerns between platforms and core logic

---

## 10. API Contracts and Integration Specifications

### 10.1 SiteBoss OWL API Endpoints (Platform-Agnostic Design)

**Order Ingestion Endpoint:**
```http
POST /api/external/orders
Content-Type: application/json
Authorization: Bearer {retailer_api_key}
X-Platform: shopify
X-Store-Domain: {store_identifier}
X-Tenant-ID: {tenant_id}

{
  "platform": "shopify",
  "store_identifier": "store.myshopify.com",
  "tenant_id": "shipitez",
  "integration_version": "1.0",
  "orders": [
    {
      "external_order_id": "12345",
      "platform_order_id": "12345",  // Same as external_order_id for Shopify
      "order_number": "#1001",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "customer": {
        "external_id": "67890",
        "email": "customer@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+1234567890"
      },
      "billing_address": {
        "first_name": "John",
        "last_name": "Doe",
        "address1": "123 Main St",
        "address2": "Apt 4B",
        "city": "New York",
        "province": "NY",
        "country": "US",
        "zip": "10001",
        "phone": "+1234567890"
      },
      "shipping_address": { /* same structure as billing_address */ },
      "line_items": [
        {
          "external_id": "item123",
          "product_id": "prod456",
          "variant_id": "var789",
          "sku": "ITEM-001",
          "title": "Product Name",
          "quantity": 2,
          "price": "29.99",
          "total_discount": "5.00",
          "tax_amount": "2.40",
          "platform_specific": {
            // Platform-specific fields can go here
            "shopify_line_item_id": "item123",
            "shopify_fulfillment_service": "manual"
          }
        }
      ],
      "shipping_lines": [
        {
          "title": "Standard Shipping",
          "price": "9.99",
          "code": "standard",
          "carrier_identifier": "ups",
          "method": "ground"
        }
      ],
      "tax_lines": [
        {
          "title": "State Tax",
          "price": "4.99",
          "rate": 0.08
        }
      ],
      "total_price": "64.97",
      "subtotal_price": "59.98",
      "total_tax": "4.99",
      "total_shipping": "9.99",
      "total_discounts": "5.00",
      "currency": "USD",
      "financial_status": "paid",
      "fulfillment_status": null,
      "tags": ["priority", "gift"],
      "notes": "Please handle with care",
      "order_status_url": "https://store.myshopify.com/orders/token",
      "platform_specific": {
        // Shopify-specific fields
        "shopify_order_id": "12345",
        "shopify_checkout_id": "67890",
        "shopify_location_id": "loc123"
      }
    }
  ]
}
```

**Inventory Update Endpoint:**
```http
PUT /api/external/inventory
Content-Type: application/json
Authorization: Bearer {retailer_api_key}
X-Platform: shopify
X-Store-Domain: {store_identifier}
X-Tenant-ID: {tenant_id}

{
  "platform": "shopify",
  "store_identifier": "store.myshopify.com",
  "tenant_id": "shipitez",
  "inventory_updates": [
    {
      "sku": "ITEM-001",
      "external_product_id": "prod456",
      "external_variant_id": "var789",
      "quantity": 150,
      "location_identifier": "main_warehouse",
      "updated_at": "2024-01-15T11:00:00Z",
      "platform_specific": {
        "shopify_inventory_item_id": "inv123",
        "shopify_location_id": "loc456"
      }
    }
  ]
}
```

**Platform Configuration Endpoint:**
```http
POST /api/external/platforms/{platform}/configure
Content-Type: application/json
Authorization: Bearer {retailer_api_key}
X-Tenant-ID: {tenant_id}

{
  "platform": "shopify",
  "store_identifier": "store.myshopify.com",
  "tenant_id": "shipitez",
  "configuration": {
    "webhook_endpoints": {
      "order_updates": "https://store.myshopify.com/webhooks/siteboss/orders",
      "inventory_updates": "https://store.myshopify.com/webhooks/siteboss/inventory",
      "fulfillment_updates": "https://store.myshopify.com/webhooks/siteboss/fulfillments"
    },
    "sync_settings": {
      "order_sync_enabled": true,
      "inventory_sync_enabled": true,
      "batch_size": 50,
      "sync_frequency": "real-time",
      "sku_validation_enabled": true
    },
    "tenant_settings": {
      "tenant_name": "ShipItEZ Logistics",
      "tenant_contact_email": "support@shipitez.com",
      "tenant_contact_phone": "+1-555-SHIP-EZ",
      "tenant_support_url": "https://shipitez.com/support"
    },
    "platform_specific": {
      "shopify_shop_domain": "store.myshopify.com",
      "shopify_access_token_hash": "hashed_token_for_verification"
    }
  }
}

**SKU Validation Endpoint:**
```http
POST /api/external/sku/validate
Content-Type: application/json
Authorization: Bearer {retailer_api_key}
X-Tenant-ID: {tenant_id}

{
  "platform": "shopify",
  "store_identifier": "store.myshopify.com",
  "tenant_id": "shipitez",
  "skus": ["WINE-001", "WINE-002", "BOTTLE-CAP-RED"]
}

# Response:
{
  "success": true,
  "tenant_id": "shipitez",
  "validation_results": {
    "valid_skus": ["WINE-001", "WINE-002"],
    "invalid_skus": [
      {
        "sku": "BOTTLE-CAP-RED",
        "reason": "not_found_in_warehouse",
        "suggested_alternatives": ["BOTTLE-CAP-R", "CAP-RED-001"]
      }
    ],
    "tenant_contact": {
      "name": "ShipItEZ Logistics",
      "email": "support@shipitez.com",
      "phone": "+1-555-SHIP-EZ"
    }
  }
}

**Order Status and Tracking Endpoint:**
```http
GET /api/external/orders/{external_order_id}/status
Authorization: Bearer {retailer_api_key}
X-Tenant-ID: {tenant_id}

# Response:
{
  "success": true,
  "tenant_id": "shipitez",
  "order": {
    "external_order_id": "12345",
    "siteboss_order_id": "ORD-2024-001",
    "order_number": "#1001",
    "status": "partially_shipped",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-16T14:20:00Z",
    "customer": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "timeline": [
      {
        "status": "received",
        "timestamp": "2024-01-15T10:30:00Z",
        "note": "Order received and validated"
      },
      {
        "status": "processing",
        "timestamp": "2024-01-15T11:00:00Z",
        "note": "Order processing started"
      },
      {
        "status": "picking",
        "timestamp": "2024-01-15T14:30:00Z",
        "note": "Items being picked from warehouse"
      },
      {
        "status": "partially_shipped",
        "timestamp": "2024-01-16T09:15:00Z",
        "note": "Parcel 1 of 2 shipped"
      }
    ],
    "parcels": [
      {
        "parcel_id": "PCL-001",
        "status": "delivered",
        "tracking_number": "1Z999AA1234567890",
        "carrier": "UPS",
        "carrier_service": "UPS Ground",
        "tracking_url": "https://ups.com/track?number=1Z999AA1234567890",
        "shipped_at": "2024-01-16T09:15:00Z",
        "estimated_delivery": "2024-01-18T17:00:00Z",
        "delivered_at": "2024-01-18T14:30:00Z",
        "delivery_address": {
          "name": "John Doe",
          "address1": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zip": "10001",
          "country": "US"
        },
        "items": [
          {
            "external_line_item_id": "item123",
            "sku": "WINE-CABERNET-2021",
            "title": "Cabernet Sauvignon 2021",
            "quantity": 2,
            "status": "delivered"
          },
          {
            "external_line_item_id": "item124",
            "sku": "WINE-OPENER-GOLD",
            "title": "Gold Wine Opener",
            "quantity": 1,
            "status": "delivered"
          }
        ],
        "tracking_events": [
          {
            "status": "shipped",
            "timestamp": "2024-01-16T09:15:00Z",
            "location": "ShipItEZ Warehouse, CA",
            "description": "Package shipped"
          },
          {
            "status": "in_transit",
            "timestamp": "2024-01-17T08:30:00Z",
            "location": "UPS Facility, NV",
            "description": "Package in transit"
          },
          {
            "status": "delivered",
            "timestamp": "2024-01-18T14:30:00Z",
            "location": "New York, NY",
            "description": "Package delivered to front door"
          }
        ]
      },
      {
        "parcel_id": "PCL-002",
        "status": "processing",
        "tracking_number": null,
        "carrier": null,
        "shipped_at": null,
        "estimated_delivery": null,
        "items": [
          {
            "external_line_item_id": "item125",
            "sku": "GIFT-BOX-PREMIUM",
            "title": "Premium Gift Box",
            "quantity": 1,
            "status": "backordered",
            "expected_availability": "2024-01-20T00:00:00Z"
          }
        ]
      }
    ],
    "summary": {
      "total_parcels": 2,
      "shipped_parcels": 1,
      "delivered_parcels": 1,
      "total_items": 4,
      "shipped_items": 3,
      "delivered_items": 3,
      "backordered_items": 1
    }
  }
}

**Bulk Order Status Endpoint:**
```http
GET /api/external/orders/status
Authorization: Bearer {retailer_api_key}
X-Tenant-ID: {tenant_id}
Query Parameters:
  - status: filter by order status
  - updated_since: ISO timestamp for incremental updates
  - limit: number of orders to return (default: 50, max: 200)
  - offset: pagination offset

# Response:
{
  "success": true,
  "tenant_id": "shipitez",
  "orders": [
    {
      "external_order_id": "12345",
      "siteboss_order_id": "ORD-2024-001",
      "status": "partially_shipped",
      "updated_at": "2024-01-16T14:20:00Z",
      "parcel_count": 2,
      "shipped_parcels": 1,
      "delivered_parcels": 1
    }
    // ... more orders
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

### 10.2 Webhook Endpoints (Platform Apps Receive)

**From SiteBoss OWL (Platform-Agnostic):**
```http
POST /webhooks/siteboss/fulfillment-update
POST /webhooks/siteboss/inventory-update
POST /webhooks/siteboss/order-exception
POST /webhooks/siteboss/order-status-change

# Example fulfillment update payload (enhanced with parcel details):
{
  "platform": "shopify",
  "store_identifier": "store.myshopify.com",
  "tenant_id": "shipitez",
  "event_type": "fulfillment_update",
  "event_id": "evt_12345",
  "timestamp": "2024-01-15T14:30:00Z",
  "external_order_id": "12345",
  "order_status": "partially_shipped",
  "fulfillment": {
    "fulfillment_id": "ful_67890",
    "status": "shipped",
    "parcel": {
      "parcel_id": "PCL-001",
      "tracking_number": "1Z999AA1234567890",
      "carrier": "UPS",
      "carrier_service": "UPS Ground",
      "tracking_url": "https://ups.com/track?number=1Z999AA1234567890",
      "shipped_at": "2024-01-15T14:30:00Z",
      "estimated_delivery": "2024-01-18T17:00:00Z",
      "weight_oz": 24.5,
      "dimensions": {
        "length": 12,
        "width": 8,
        "height": 6,
        "unit": "inches"
      }
    },
    "line_items": [
      {
        "external_line_item_id": "item123",
        "sku": "WINE-CABERNET-2021",
        "title": "Cabernet Sauvignon 2021",
        "quantity": 2,
        "status": "shipped"
      },
      {
        "external_line_item_id": "item124",
        "sku": "WINE-OPENER-GOLD",
        "title": "Gold Wine Opener",
        "quantity": 1,
        "status": "shipped"
      }
    ],
    "platform_specific": {
      "shopify_fulfillment_id": "ful_shopify_123",
      "shopify_location_id": "loc_456"
    }
  }
}

# Example parcel tracking update payload:
{
  "platform": "shopify",
  "store_identifier": "store.myshopify.com",
  "tenant_id": "shipitez",
  "event_type": "parcel_tracking_update",
  "event_id": "evt_67891",
  "timestamp": "2024-01-17T08:30:00Z",
  "external_order_id": "12345",
  "parcel": {
    "parcel_id": "PCL-001",
    "tracking_number": "1Z999AA1234567890",
    "carrier": "UPS",
    "status": "in_transit",
    "tracking_event": {
      "status": "in_transit",
      "timestamp": "2024-01-17T08:30:00Z",
      "location": "UPS Facility, Las Vegas, NV",
      "description": "Package is in transit to the next facility",
      "carrier_event_code": "IT"
    },
    "estimated_delivery": "2024-01-18T17:00:00Z"
  }
}

# Example delivery confirmation payload:
{
  "platform": "shopify",
  "store_identifier": "store.myshopify.com",
  "tenant_id": "shipitez",
  "event_type": "parcel_delivered",
  "event_id": "evt_67892",
  "timestamp": "2024-01-18T14:30:00Z",
  "external_order_id": "12345",
  "parcel": {
    "parcel_id": "PCL-001",
    "tracking_number": "1Z999AA1234567890",
    "carrier": "UPS",
    "status": "delivered",
    "delivered_at": "2024-01-18T14:30:00Z",
    "delivery_location": "Front Door",
    "signature_required": false,
    "tracking_event": {
      "status": "delivered",
      "timestamp": "2024-01-18T14:30:00Z",
      "location": "New York, NY 10001",
      "description": "Package delivered to front door",
      "carrier_event_code": "D"
    }
  },
  "order_status": "delivered" // if this was the last parcel
}

# Example inventory update payload:
{
  "platform": "shopify",
  "store_identifier": "store.myshopify.com",
  "event_type": "inventory_update",
  "event_id": "evt_67890",
  "timestamp": "2024-01-15T15:00:00Z",
  "inventory_changes": [
    {
      "sku": "ITEM-001",
      "external_product_id": "prod456",
      "external_variant_id": "var789",
      "old_quantity": 100,
      "new_quantity": 85,
      "change_reason": "sale",
      "location_identifier": "main_warehouse",
      "platform_specific": {
        "shopify_inventory_item_id": "inv123",
        "shopify_location_id": "loc456"
      }
    }
  ]
}

# Example order exception payload:
{
  "platform": "shopify",
  "store_identifier": "store.myshopify.com",
  "event_type": "order_exception",
  "event_id": "evt_99999",
  "timestamp": "2024-01-15T16:00:00Z",
  "external_order_id": "12345",
  "exception": {
    "type": "inventory_shortage",
    "severity": "high",
    "message": "Insufficient inventory for SKU ITEM-001",
    "details": {
      "sku": "ITEM-001",
      "requested_quantity": 5,
      "available_quantity": 2,
      "location": "main_warehouse"
    },
    "suggested_actions": [
      "reduce_order_quantity",
      "backorder",
      "cancel_line_item"
    ],
    "platform_specific": {
      "shopify_line_item_id": "item123"
    }
  }
}
```

### 10.3 Error Handling and Response Codes

**Standard Response Format:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "error": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "correlation_id": "uuid-1234-5678-9012"
}

// Error response:
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid order data",
    "details": {
      "field": "customer.email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "correlation_id": "uuid-1234-5678-9012"
}
```

---

## 11. Implementation Roadmap

### 11.1 Phase 1: Foundation Setup (Weeks 1-2)

**Week 1: Environment and Database Setup**
- [ ] Update Shopify app scopes in `shopify.app.toml`
- [ ] Extend Prisma schema with new models (ShopConfiguration, OrderSync, etc.)
- [ ] Create and run database migrations
- [ ] Set up Redis for session storage and job queues
- [ ] Configure environment variables and secrets management
- [ ] Set up development and staging environments

**Week 2: Core Services and Infrastructure**
- [ ] Implement SiteBoss API client service with retry logic
- [ ] Create basic configuration management UI components
- [ ] Set up structured logging and monitoring infrastructure
- [ ] Implement API key encryption and validation
- [ ] Create health check endpoints
- [ ] Set up error tracking and alerting

### 11.2 Phase 2: Core Integration (Weeks 3-4)

**Week 3: Order Processing Foundation**
- [ ] Build Shopify order fetching service
- [ ] Implement order data transformation and validation
- [ ] Create SiteBoss order submission service
- [ ] Add basic retry logic and error handling
- [ ] Implement order sync status tracking
- [ ] Create order processing queue system

**Week 4: Configuration and Management**
- [ ] Build comprehensive configuration management UI
- [ ] Implement API key management interface
- [ ] Create connection testing and validation tools
- [ ] Add order ingestion settings (batching, filtering)
- [ ] Implement basic sync monitoring dashboard
- [ ] Add manual order retry functionality

### 11.3 Phase 3: Advanced Features (Weeks 5-6)

**Week 5: Batching and Inventory**
- [ ] Implement order batching functionality with scheduling
- [ ] Build inventory synchronization service
- [ ] Create product and variant mapping system
- [ ] Add inventory conflict resolution logic
- [ ] Implement real-time inventory updates
- [ ] Create inventory sync monitoring tools

**Week 6: Webhooks and Notifications**
- [ ] Build webhook receiver endpoints
- [ ] Implement webhook signature verification
- [ ] Create notification system (email, SMS, in-app)
- [ ] Add webhook delivery monitoring and retry logic
- [ ] Implement event processing queue
- [ ] Create comprehensive sync logs and reporting

### 11.4 Phase 4: Polish and Testing (Weeks 7-8)

**Week 7: Testing and Quality Assurance**
- [ ] Add comprehensive unit test coverage (>80%)
- [ ] Implement integration tests for API endpoints
- [ ] Create end-to-end tests for critical user flows
- [ ] Set up automated testing pipeline
- [ ] Perform security audit and penetration testing
- [ ] Optimize database queries and API performance

**Week 8: Documentation and Optimization**
- [ ] Complete API documentation and integration guides
- [ ] Create merchant onboarding documentation
- [ ] Implement performance monitoring and optimization
- [ ] Add comprehensive error handling and user feedback
- [ ] Create troubleshooting guides and FAQ
- [ ] Prepare App Store submission materials

### 11.5 Phase 5: Deployment and Launch (Week 9)

**Week 9: Production Deployment**
- [ ] Set up production infrastructure and monitoring
- [ ] Deploy to production environment with blue-green deployment
- [ ] Configure production monitoring and alerting
- [ ] Submit app to Shopify App Store
- [ ] Launch beta testing with select merchants
- [ ] Monitor system performance and user feedback
- [ ] Provide launch support and issue resolution

### 11.6 Post-Launch: Maintenance and Enhancement (Ongoing)

**Immediate Post-Launch (Weeks 10-12)**
- [ ] Monitor system performance and stability
- [ ] Address user feedback and bug reports
- [ ] Optimize based on real-world usage patterns
- [ ] Implement additional requested features
- [ ] Scale infrastructure based on adoption

**Long-term Enhancements**
- [ ] Multi-store support for Shopify Plus merchants
- [ ] Advanced analytics and reporting features
- [ ] Integration with additional fulfillment providers
- [ ] Mobile app for order management
- [ ] AI-powered inventory optimization

---

## 12. Future Considerations and Roadmap

### 12.1 Short-term Enhancements (3-6 months)

- **Multi-Platform Support**: WooCommerce integration as the second platform
- **Multi-store Support**: Shopify Plus merchant support with centralized management
- **Advanced Order Management**: Partial fulfillments, order edits, and cancellations
- **Enhanced Reporting**: Advanced analytics dashboard with business intelligence
- **Mobile Application**: Native mobile app for order and inventory management
- **API Rate Optimization**: Intelligent API usage optimization and caching

### 12.1.1 WooCommerce Integration Priority

**Why WooCommerce Next:**
- **Market Share**: WooCommerce powers ~28% of all online stores
- **WordPress Ecosystem**: Leverages existing WordPress/WooCommerce developer community
- **API Maturity**: Well-documented REST API similar to Shopify's approach
- **Self-Hosted**: Appeals to merchants wanting more control over their data
- **Cost-Effective**: Lower transaction fees compared to Shopify for many merchants

**WooCommerce Integration Considerations:**
- **Authentication**: WordPress application passwords or OAuth 2.0 via plugins
- **API Differences**: Different endpoint structures but similar data concepts
- **Plugin Architecture**: May require a companion WordPress plugin for optimal integration
- **Hosting Variability**: Self-hosted nature means more diverse server environments
- **Version Compatibility**: Need to support multiple WooCommerce versions

### 12.2 Medium-term Features (6-12 months)

- **Refund and Return Synchronization**: Complete order lifecycle management
- **Shopify Flow Integration**: Advanced automation and workflow integration
- **Third-party Integrations**: ERP, accounting, and logistics provider integrations
- **AI-powered Features**: Demand forecasting and inventory optimization
- **Advanced Security**: SOC 2 compliance and enhanced security features

### 12.3 Long-term Vision (12+ months)

- **Comprehensive Platform Support**: Magento, BigCommerce, Squarespace, and other major platforms
- **Global Expansion**: Multi-currency and international shipping support
- **Enterprise Features**: Advanced user management and enterprise-grade security
- **Machine Learning**: Predictive analytics and automated decision making
- **Ecosystem Development**: Partner integrations and third-party developer APIs

### 12.3.1 Platform Expansion Roadmap

**Tier 1 Platforms (High Priority):**
1. **Shopify** ✅ (Current focus)
2. **WooCommerce** (Next 3-6 months)
3. **Magento** (6-12 months) - Enterprise focus
4. **BigCommerce** (9-15 months) - Growing market share

**Tier 2 Platforms (Medium Priority):**
5. **Squarespace Commerce** (12-18 months) - Design-focused merchants
6. **PrestaShop** (15-21 months) - European market focus
7. **OpenCart** (18-24 months) - Open source community

**Tier 3 Platforms (Future Consideration):**
8. **Salesforce Commerce Cloud** - Enterprise B2B focus
9. **Adobe Commerce** (formerly Magento Commerce) - Enterprise segment
10. **Custom/Headless Solutions** - API-first commerce platforms

**Platform Selection Criteria:**
- Market share and growth trajectory
- API quality and documentation
- Developer ecosystem maturity
- Merchant demand and feedback
- Technical complexity and maintenance overhead
- Revenue potential and merchant value

---

## 13. Success Metrics and KPIs

### 13.1 Technical Metrics

- **System Uptime**: 99.9% availability target
- **API Response Time**: <500ms average response time
- **Order Processing Time**: <30 seconds for real-time orders
- **Error Rate**: <1% for order synchronization
- **Data Accuracy**: 99.95% inventory sync accuracy

### 13.2 Business Metrics

- **Merchant Adoption**: Number of active installations
- **Order Volume**: Total orders processed through integration
- **Customer Satisfaction**: App store rating and review scores
- **Support Ticket Volume**: Reduction in integration-related support requests
- **Revenue Impact**: Merchant revenue increase through improved fulfillment

### 13.3 Operational Metrics

- **Time to Resolution**: Average time to resolve integration issues
- **Onboarding Time**: Time for new merchants to complete setup
- **Feature Adoption**: Usage rates of different integration features
- **Performance Optimization**: Continuous improvement in system efficiency
- **Security Incidents**: Zero tolerance for security breaches

---

## 14. Risk Management and Mitigation

### 14.1 Technical Risks

- **API Rate Limiting**: Implement intelligent rate limiting and caching strategies
- **Data Synchronization Conflicts**: Robust conflict resolution and manual override capabilities
- **System Scalability**: Cloud-native architecture with auto-scaling capabilities
- **Third-party Dependencies**: Fallback mechanisms and service redundancy

### 14.2 Business Risks

- **Shopify Policy Changes**: Stay current with Shopify app requirements and policies
- **Competitive Pressure**: Continuous feature development and differentiation
- **Customer Churn**: Proactive support and feature enhancement based on feedback
- **Market Changes**: Flexible architecture to adapt to e-commerce trends

### 14.3 Security Risks

- **Data Breaches**: Comprehensive security measures and regular audits
- **API Security**: Strong authentication, authorization, and input validation
- **Compliance Requirements**: GDPR, PCI DSS, and other regulatory compliance
- **Insider Threats**: Access controls and audit logging for all system access

---

## 15. Deployment and Hosting Strategy

### 15.1 Hosting Requirements Overview

**Important:** Shopify does NOT host your app or database. You are responsible for hosting:
- Remix application server
- MySQL database
- Any additional services (Redis, file storage, etc.)
- SiteBoss OWL API backend

### 15.2 Development vs Production Setup

#### **Development Environment:**
```env
# Local development - no external hosting needed
DATABASE_URL="file:./dev.sqlite"
SHOPIFY_APP_URL="https://your-tunnel.ngrok.io"  # or cloudflare tunnel
```

#### **Production Environment:**
```env
# Production - all services externally hosted
DATABASE_URL="postgresql://user:pass@db.supabase.co:5432/db"
SHOPIFY_APP_URL="https://your-app.railway.app"
REDIS_URL="redis://user:pass@redis-cloud.com:12345"
```

```

#### **Recommended Stack for Your Project (Final - Zero Additional Databases):**
```
┌─────────────────┐
│   Remix App     │
│   (Linode)      │ ──── API calls ────┐
│                 │                    │
│   NO DATABASE   │                    ▼
└─────────────────┘    ┌─────────────────────────────────────────┐
                       │        Existing SiteBoss OWL            │
                       │   ┌─────────────┐  ┌─────────────────┐  │
                       │   │  Per-Tenant │  │   API Server    │  │
                       │   │ MySQL       │◄►│   + New Routes  │  │
                       │   │ (Existing)  │  │   (Existing)    │  │
                       │   └─────────────┘  └─────────────────┘  │
                       │           ▲                             │
                       │           │                             │
                       │   ┌─────────────┐                       │
                       │   │  MongoDB    │                       │
                       │   │ (Existing)  │                       │
                       │   │ Sessions +  │                       │
                       │   │ Configs +   │                       │
                       │   │ Logs        │                       │
                       │   └─────────────┘                       │
                       └─────────────────────────────────────────┘
```

### 15.3 Deployment Workflow

#### **Recommended CI/CD Pipeline:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Deploy to Railway
        run: railway deploy
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### 15.4 Database Migration Strategy

#### **Development to Production Migration:**
```bash
# 1. Set up production database
npx prisma migrate deploy --preview-feature

# 2. Generate Prisma client for production
npx prisma generate

# 3. Seed initial data (tenants, configurations)
npx prisma db seed
```

#### **Ongoing Migrations:**
```bash
# Create new migration
npx prisma migrate dev --name add_sku_validation

# Deploy to production
npx prisma migrate deploy
```

### 15.5 Monitoring and Observability

#### **Essential Monitoring:**
- **Application Performance**: Vercel Analytics, Railway Metrics
- **Database Performance**: Supabase Dashboard, PlanetScale Insights
- **Error Tracking**: Sentry, LogRocket
- **Uptime Monitoring**: Pingdom, UptimeRobot

#### **Logging Strategy:**
```javascript
// Structured logging for production
import { createLogger } from 'winston';

const logger = createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'shopify-app' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## 16. Next Steps and Immediate Actions

### 15.1 Immediate Actions (This Week)

1. **Update Shopify Configuration**
   - Modify `shopify.app.toml` with required scopes
   - Update environment variables for development

2. **Database Schema Implementation**
   - Extend Prisma schema with new models
   - Create and test database migrations
   - Set up development database with sample data

3. **Development Environment Setup**
   - Configure SiteBoss OWL development/staging environment
   - Set up webhook tunneling for local development (ngrok/cloudflare tunnel)
   - Create test data sets and mock services

### 15.2 Week 1 Deliverables

1. **Technical Foundation**
   - Updated Shopify app configuration
   - Extended database schema with migrations
   - Basic service layer structure implementation
   - Development environment fully configured

2. **Documentation**
   - Updated technical specifications
   - API contract documentation
   - Development setup guide
   - Initial architecture diagrams

### 15.3 Stakeholder Communication

1. **Development Team**
   - Technical architecture review and approval
   - Resource allocation and timeline confirmation
   - Development environment access and setup

2. **Product Team**
   - Feature prioritization and scope confirmation
   - User experience design review
   - Beta testing merchant identification

3. **Operations Team**
   - Infrastructure requirements and scaling plans
   - Monitoring and alerting setup
   - Support documentation and training materials

This comprehensive plan provides a solid foundation for developing a robust, scalable, and secure Shopify-SiteBoss OWL integration that will deliver significant value to merchants while maintaining high standards for reliability and user experience.