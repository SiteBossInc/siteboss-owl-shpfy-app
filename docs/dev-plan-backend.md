# SiteBoss OWL — Shopify Integration Backend Development Plan

## Overview

This document outlines the backend development requirements for the SiteBoss OWL Shopify integration app. The app follows a **platform-agnostic architecture** to support future e-commerce platforms while leveraging existing SiteBoss infrastructure.

## Current Implementation Status

### Completed
- **Remix App Framework**: Basic Shopify app structure with Polaris UI
- **Authentication**: Shopify OAuth 2.0 with Prisma session storage
- **Mock API Endpoints**: Complete mock data service for frontend development
- **Frontend Routes**: Dashboard, Orders, Inventory, SKU Validation, Settings pages
- **Database Schema**: Basic Prisma schema with Session model

### In Progress / Needs Implementation
- **SiteBoss OWL API Integration**: Real backend endpoints
- **Database Extensions**: Platform-agnostic tables for multi-tenant support
- **Order Processing Pipeline**: Real-time order ingestion and processing
- **Inventory Synchronization**: Bidirectional inventory sync
- **SKU Validation System**: Real-time warehouse SKU validation
- **Webhook Management**: Event-driven status updates
- **Parcel Tracking**: Multi-parcel order tracking system

## Architecture Overview

### Technology Stack
- **Framework**: Remix v2.16+ with Vite
- **Runtime**: Node.js 18.20+ / 20.10+ / 21.0+
- **Database**: 
  - **Sessions**: SQLite (dev) → MySQL (production) via Prisma
  - **Business Data**: Existing SiteBoss OWL MySQL (per-tenant)
  - **Logs/Config**: Existing SiteBoss MongoDB
- **Authentication**: Shopify OAuth 2.0
- **API**: Platform-agnostic REST endpoints

### Database Strategy
**Leverage Existing SiteBoss Infrastructure:**
- **Tenant-Specific MySQL**: Business data in existing per-tenant databases
- **MongoDB**: Sessions, logs, and configurations in existing MongoDB
- **No Additional Databases**: Extend existing schemas with new tables

## Required Backend Endpoints

### 1. SiteBoss OWL API Extensions

#### Platform-Agnostic Order Ingestion
```http
POST /api/external/orders
Authorization: Bearer {retailer_api_key}
X-Platform: shopify
X-Store-Domain: {store_identifier}
X-Tenant-ID: {tenant_id}
```

#### Inventory Management
```http
PUT /api/external/inventory
GET /api/external/inventory/{sku}
Authorization: Bearer {retailer_api_key}
X-Tenant-ID: {tenant_id}
```

#### SKU Validation
```http
POST /api/external/sku/validate
GET /api/external/sku/status
Authorization: Bearer {retailer_api_key}
X-Tenant-ID: {tenant_id}
```

#### Order Status & Tracking
```http
GET /api/external/orders/{order_id}/status
GET /api/external/orders/{order_id}/parcels
Authorization: Bearer {retailer_api_key}
X-Tenant-ID: {tenant_id}
```

#### Platform Configuration
```http
POST /api/external/platforms/{platform}/configure
GET /api/external/platforms/{platform}/settings
Authorization: Bearer {retailer_api_key}
X-Tenant-ID: {tenant_id}
```

### 2. Unified External API Routes (All served from SiteBoss OWL Laravel API)

#### Tenant Management
```http
GET /api/external/tenant/current      # Get current shop's tenant info
POST /api/external/tenant/validate    # Validate tenant_id during onboarding
GET /api/external/tenant/config       # Get tenant-specific configuration
PUT /api/external/tenant/config       # Update tenant-specific settings
```

#### Shop Configuration
```http
GET /api/external/shop/settings
POST /api/external/shop/settings
PUT /api/external/shop/api-key
```

#### Order Synchronization
```http
GET /api/external/orders
POST /api/external/orders/sync
GET /api/external/orders/{id}/status
```

#### Inventory Sync
```http
GET /api/external/inventory
POST /api/external/inventory/sync
GET /api/external/inventory/status
```

#### SKU Validation
```http
GET /api/external/sku-validation
POST /api/external/sku-validation/check
PUT /api/external/sku-validation/{sku}/resolve
```

## Database Schema Extensions

### SiteBoss OWL Database (Per-Tenant MySQL)

#### Core Platform Tables
```sql
-- Platform registry (seeded with common platforms)
CREATE TABLE platforms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE, -- 'shopify', 'woocommerce', etc.
  display_name VARCHAR(100) NOT NULL,
  api_version VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- API keys with tracking
CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  key_prefix VARCHAR(10) NOT NULL,
  name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_by INTEGER,
  revoked_by INTEGER,
  revoked_at TIMESTAMP,
  expires_at TIMESTAMP,
  last_used_at TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Platform integrations
CREATE TABLE platform_integrations (
  id SERIAL PRIMARY KEY,
  platform_id INTEGER NOT NULL REFERENCES platforms(id),
  store_identifier VARCHAR(255) NOT NULL,
  api_key_id INTEGER REFERENCES api_keys(id),
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
```

#### SKU Validation System
```sql
CREATE TABLE sku_validations (
  id SERIAL PRIMARY KEY,
  platform_integration_id INTEGER NOT NULL REFERENCES platform_integrations(id),
  sku VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'valid', 'invalid', 'pending', 'resolved'
  error_reason VARCHAR(100),
  last_checked TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolved_by INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform_integration_id, sku)
);
```

#### Order Sync Tracking
```sql
CREATE TABLE order_sync_logs (
  id SERIAL PRIMARY KEY,
  platform_integration_id INTEGER NOT NULL REFERENCES platform_integrations(id),
  external_order_id VARCHAR(255) NOT NULL,
  siteboss_order_id INTEGER REFERENCES orders(id),
  api_key_id INTEGER REFERENCES api_keys(id),
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
```

#### Parcel Tracking System
```sql
-- Parcel tracking (extends existing fulfillment data)
CREATE TABLE parcels (
  id SERIAL PRIMARY KEY,
  siteboss_order_id INTEGER NOT NULL REFERENCES orders(id),
  platform_integration_id INTEGER REFERENCES platform_integrations(id),
  external_order_id VARCHAR(255),
  parcel_number VARCHAR(100),
  tracking_number VARCHAR(255),
  carrier VARCHAR(100),
  carrier_service VARCHAR(100),
  tracking_url VARCHAR(500),
  status VARCHAR(30) NOT NULL,
  weight_oz DECIMAL(8,2),
  dimensions_json JSONB,
  shipped_at TIMESTAMP,
  estimated_delivery TIMESTAMP,
  delivered_at TIMESTAMP,
  delivery_address_json JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Parcel items (which items are in which parcel)
CREATE TABLE parcel_items (
  id SERIAL PRIMARY KEY,
  parcel_id INTEGER NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  siteboss_order_item_id INTEGER REFERENCES order_items(id),
  external_line_item_id VARCHAR(255),
  sku VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  status VARCHAR(30) DEFAULT 'packed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Parcel tracking events
CREATE TABLE parcel_tracking_events (
  id SERIAL PRIMARY KEY,
  parcel_id INTEGER NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  location VARCHAR(255),
  description TEXT,
  carrier_event_code VARCHAR(50),
  is_delivered BOOLEAN DEFAULT false,
  is_exception BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### MongoDB Collections (Existing Database)

#### Session Storage
```javascript
// Sessions collection (replaces separate session database)
db.sessions.createIndex({ "shop": 1, "tenant": 1 })
db.sessions.createIndex({ "expires": 1 }, { expireAfterSeconds: 0 })
```

#### Platform Configurations
```javascript
// Platform configurations collection
db.platform_configs.createIndex({ "tenant": 1, "platform_integration_id": 1 })
```

## Service Layer Architecture

### Directory Structure
```
app/services/
├── platform/
│   ├── shopify/
│   │   ├── orders.server.js      # Shopify order processing
│   │   ├── inventory.server.js   # Shopify inventory management
│   │   ├── products.server.js    # Shopify product sync
│   │   ├── webhooks.server.js    # Shopify webhook handling
│   │   └── adapter.server.js     # Shopify data transformation
│   ├── woocommerce/              # Future WooCommerce support
│   └── base/
│       ├── platformInterface.js  # Common platform interface
│       └── baseAdapter.server.js # Shared adapter functionality
├── siteboss/
│   ├── client.server.js          # SiteBoss API client
│   ├── orders.server.js          # Order sync and transformation
│   ├── inventory.server.js       # Inventory sync
│   ├── auth.server.js            # API key validation
│   ├── tenantRegistry.server.js  # Tenant management
│   └── skuValidation.server.js   # SKU validation
├── sync/
│   ├── orderSync.server.js       # Order synchronization
│   ├── inventorySync.server.js   # Inventory sync
│   ├── batchProcessor.server.js  # Batch processing
│   └── conflictResolver.server.js # Conflict resolution
└── monitoring/
    ├── logger.server.js          # Structured logging
    ├── metrics.server.js         # Performance metrics
    └── healthCheck.server.js     # System health monitoring
```

## Implementation Priority

### Phase 1: Core Infrastructure (Week 1-2)
1. **Database Schema**: Implement platform-agnostic tables
2. **SiteBoss API Client**: Basic API communication layer
3. **Tenant Management**: Tenant validation and configuration
4. **API Key Management**: Secure key generation and validation

### Phase 2: Order Processing (Week 3-4)
1. **Order Ingestion**: Platform-agnostic order processing
2. **Order Sync Service**: Bidirectional order synchronization
3. **Status Tracking**: Real-time order status updates
4. **Error Handling**: Retry logic and failure management

### Phase 3: Inventory & SKU Validation (Week 5-6)
1. **Inventory Sync**: Real-time inventory synchronization
2. **SKU Validation**: Warehouse SKU validation system
3. **Conflict Resolution**: Handle inventory discrepancies
4. **Batch Processing**: Efficient bulk operations

### Phase 4: Parcel Tracking (Week 7-8)
1. **Parcel Management**: Multi-parcel order tracking
2. **Carrier Integration**: Tracking number management
3. **Delivery Status**: Real-time delivery updates
4. **Customer Notifications**: Automated status updates

### Phase 5: Webhooks & Monitoring (Week 9-10)
1. **Webhook System**: Event-driven status updates
2. **Performance Monitoring**: System health and metrics
3. **Error Alerting**: Automated failure notifications
4. **Audit Logging**: Comprehensive operation tracking

## Security Considerations

### API Security
- **API Key Management**: Secure generation, rotation, and revocation
- **Rate Limiting**: Prevent abuse and ensure fair usage
- **Request Validation**: Comprehensive input validation
- **Audit Logging**: Track all API access and modifications

### Data Security
- **Encryption at Rest**: All sensitive data encrypted using AES-256
- **TLS 1.3**: All API communications encrypted in transit
- **Access Control**: Role-based permissions and tenant isolation
- **PCI Compliance**: Secure handling of payment-related data

## Testing Strategy

### Unit Tests
- Service layer functions
- Data transformation logic
- API endpoint handlers
- Database operations

### Integration Tests
- SiteBoss OWL API integration
- Shopify API integration
- Database operations
- Webhook processing

### End-to-End Tests
- Complete order processing flow
- Inventory synchronization
- SKU validation workflow
- Parcel tracking updates

## Monitoring & Observability

### Metrics Collection
- API response times and error rates
- Order processing throughput
- Inventory sync performance
- SKU validation accuracy

### Logging Strategy
- Structured logging with correlation IDs
- Error tracking and alerting
- Performance monitoring
- Security audit logs

### Health Checks
- Database connectivity
- SiteBoss OWL API availability
- Shopify API connectivity
- Background job processing

## Next Steps

1. **Review and Approve**: Stakeholder review of backend architecture
2. **Database Migration**: Implement schema extensions in staging
3. **Service Implementation**: Begin Phase 1 development
4. **Testing Setup**: Establish testing infrastructure
5. **Monitoring Setup**: Configure logging and metrics collection

This backend development plan provides a comprehensive roadmap for implementing the SiteBoss OWL Shopify integration while maintaining platform-agnostic architecture for future expansion.
