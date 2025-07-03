# SiteBoss OWL Shopify Integration App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.20-brightgreen)](https://nodejs.org/)
[![Shopify App](https://img.shields.io/badge/Shopify-App-green)](https://shopify.dev/docs/apps)
[![Remix](https://img.shields.io/badge/Remix-v2.16+-blue)](https://remix.run/)

A comprehensive Shopify app that integrates Shopify stores with **SiteBoss OWL** (Order and Warehouse Logistics) software, enabling seamless order fulfillment, inventory management, and real-time status tracking for 3PL (Third-Party Logistics) providers and their retail clients.

## 🏢 Business Model

**SiteBoss OWL Shopify App** serves a multi-tenant B2B2C model:

- **SiteBoss**: SaaS company providing the integration platform
- **SiteBoss OWL**: Order and warehouse logistics software used by 3PLs
- **3PL Clients**: Logistics providers who fulfill orders for retailers
- **Retailers**: Wineries and other businesses using Shopify who need fulfillment services

Each 3PL has a unique `tenant_id` that identifies their SiteBoss OWL instance, and retailers installing the app must provide their 3PL's tenant identifier during setup.

## ✨ Key Features

### 🏪 Merchant Dashboard
- **Multi-tenant Configuration**: Dynamic tenant branding and setup
- **Real-time Order Tracking**: Live updates from SiteBoss OWL order processing
- **Parcel Tracking Dashboard**: Visual display of all parcels and delivery status
- **SKU Discrepancy Monitoring**: Real-time alerts for warehouse SKU mismatches
- **Inventory Management**: Automated sync with SiteBoss OWL inventory systems
- **API Key Management**: Secure configuration and validation

### 📦 Order Management
- **Automated Order Ingestion**: Real-time or batched order processing
- **Item-Level Tracking**: Track specific items within each parcel
- **Delivery Timeline**: Complete fulfillment to delivery tracking
- **Exception Handling**: Alerts for delayed, damaged, or returned parcels
- **Customer Communication**: Auto-sync tracking info back to Shopify

### 🔧 Integration Features
- **Webhook Support**: Real-time status updates from SiteBoss OWL
- **Tenant-Specific Routing**: Orders routed to correct 3PL systems
- **Bulk Operations**: Efficient handling of large order volumes
- **Error Recovery**: Comprehensive retry and error handling mechanisms

## 🚀 Quick Start

### Prerequisites

Before you begin, you'll need the following:

1. **Node.js**: Version 18.20+ / 20.10+ / 21.0+ ([Download](https://nodejs.org/en/download/))
2. **Shopify Partner Account**: [Create an account](https://partners.shopify.com/signup) if you don't have one
3. **Test Store**: Set up either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store)
4. **SiteBoss OWL Access**: Valid tenant ID and API credentials for testing

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SiteBossInc/siteboss-owl-shpfy-app.git
   cd siteboss-owl-shpfy-app
   ```

2. **Install dependencies**:
   ```bash
   # Using npm (recommended)
   npm install

   # Using yarn
   yarn install

   # Using pnpm
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your Shopify app credentials and SiteBoss OWL settings
   ```

4. **Initialize the database**:
   ```bash
   npm run setup
   ```

### Local Development

Start the development server:

```bash
# Using npm (recommended)
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm run dev
```

Press **P** to open the URL to your app. Once you click install, you can start development.

Local development is powered by [the Shopify CLI](https://shopify.dev/docs/apps/tools/cli). It logs into your partners account, connects to an app, provides environment variables, updates remote config, creates a tunnel and provides commands to generate extensions.

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```bash
# Shopify App Configuration
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SCOPES=read_products,write_products,read_orders,write_orders,read_inventory,write_inventory

# Database
DATABASE_URL="file:./dev.sqlite"

# SiteBoss OWL Configuration
SITEBOSS_API_BASE_URL=https://api.siteboss.com
SITEBOSS_API_VERSION=v1

# Optional: Platform Configuration
PLATFORM_TYPE=shopify
PLATFORM_VERSION=2024-01
```

## 🏗️ Architecture

### Technology Stack

- **Framework**: Remix v2.16+ with Vite
- **Runtime**: Node.js 18.20+ / 20.10+ / 21.0+
- **Database**:
  - **Session Storage**: SQLite (dev) → PostgreSQL (production) for Shopify sessions
  - **Business Data**: SiteBoss OWL existing API and database
- **Authentication**: Shopify OAuth 2.0 with Prisma session storage
- **UI**: Shopify Polaris v12+ with App Bridge React v4+

### Project Structure

```
siteboss-owl-shpfy-app/
├── app/
│   ├── routes/                 # Remix routes
│   │   ├── app.dashboard.jsx   # Main dashboard
│   │   ├── app.orders.jsx      # Order management
│   │   ├── app.inventory.jsx   # Inventory sync
│   │   ├── app.settings.jsx    # Configuration
│   │   └── api.mock.*.jsx      # Mock API endpoints
│   ├── services/               # Business logic
│   │   ├── mockData.server.js  # Development data
│   │   ├── shopConnection.server.js # Shop setup
│   │   └── shopify.server.js   # Shopify integration
│   └── shopify.server.js       # Main Shopify config
├── docs/                       # Documentation
│   ├── dev-plan.md            # Detailed development plan
│   └── dev-plan-backend.md    # Backend specifications
├── prisma/                     # Database schema
└── extensions/                 # Shopify app extensions
```

### API Integration

The app integrates with SiteBoss OWL through RESTful APIs:

```js
// Example: Fetching orders from SiteBoss OWL
export async function loader({ request }) {
  const { admin } = await shopify.authenticate.admin(request);

  // Get tenant configuration
  const tenantId = await getTenantId(request);
  const apiKey = await getApiKey(request);

  // Fetch from SiteBoss OWL
  const orders = await fetchSiteBossOrders(tenantId, apiKey);

  return json({ orders });
}
```

## 🚀 Deployment

### Build Process

Build the application for production:

```bash
# Using npm
npm run build

# Using yarn
yarn build

# Using pnpm
pnpm run build
```

### Database Configuration

The app uses [Prisma](https://www.prisma.io/) for session storage with the following options:

**Development**: SQLite (included)
**Production**: PostgreSQL (recommended)

#### Supported Database Providers

| Database   | Type             | Recommended Hosters                                                                                                                                                                                                                               |
| ---------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PostgreSQL | SQL              | [Digital Ocean](https://www.digitalocean.com/products/managed-databases-postgresql), [Amazon Aurora](https://aws.amazon.com/rds/aurora/), [Google Cloud SQL](https://cloud.google.com/sql/docs/postgres), [Supabase](https://supabase.com/) |
| MySQL      | SQL              | [Digital Ocean](https://www.digitalocean.com/products/managed-databases-mysql), [Planet Scale](https://planetscale.com/), [Amazon Aurora](https://aws.amazon.com/rds/aurora/)                                                                 |
| MongoDB    | NoSQL / Document | [Digital Ocean](https://www.digitalocean.com/products/managed-databases-mongodb), [MongoDB Atlas](https://www.mongodb.com/atlas/database)                                                                                                       |

To use a different database, update the [datasource provider](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#datasource) in your `schema.prisma` file.

### Hosting Options

Deploy your app to any of these platforms:

#### Recommended Platforms
- **[Fly.io](https://fly.io/)**: Optimized for Remix apps
- **[Heroku](https://www.heroku.com/)**: Easy deployment with add-ons
- **[Vercel](https://vercel.com/)**: Serverless deployment (see Vercel section below)
- **[Railway](https://railway.app/)**: Simple deployment with database support

#### Environment Variables for Production

Set these environment variables in your hosting platform:

```bash
NODE_ENV=production
SHOPIFY_API_KEY=your_production_api_key
SHOPIFY_API_SECRET=your_production_api_secret
DATABASE_URL=your_production_database_url
SITEBOSS_API_BASE_URL=https://api.siteboss.com
```

### Hosting on Vercel

For Vercel deployment, use the Vercel Preset:

```diff
// vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
+ import { vercelPreset } from '@vercel/remix/vite';

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
+     presets: [vercelPreset()],
    }),
    tsconfigPaths(),
  ],
});
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📚 Documentation

- **[Development Plan](./docs/dev-plan.md)**: Comprehensive feature specifications
- **[Backend Plan](./docs/dev-plan-backend.md)**: API and integration details
- **[Shopify App Documentation](https://shopify.dev/docs/apps)**: Official Shopify app development guide
- **[Remix Documentation](https://remix.run/docs)**: Remix framework documentation

## 🔧 Troubleshooting

### Common Issues

#### Database tables don't exist
```bash
# Run the setup script to initialize the database
npm run setup
```

#### OAuth authentication loop
If authentication fails after changing scopes:
```bash
npm run deploy
```

#### Embedded app navigation issues
- Use `Link` from `@remix-run/react` or `@shopify/polaris`
- Use `redirect` helper from `authenticate.admin`
- Use `<Form/>` from `@remix-run/react` (not lowercase `<form/>`)

#### SiteBoss OWL connection issues
1. Verify your tenant ID is correct
2. Check API key validity
3. Ensure SiteBoss OWL endpoints are accessible
4. Review error logs in the app dashboard

### Getting Help

- **Issues**: [GitHub Issues](https://github.com/SiteBossInc/siteboss-owl-shpfy-app/issues)
- **Documentation**: [Shopify App Development](https://shopify.dev/docs/apps)
- **SiteBoss Support**: Contact your 3PL provider for tenant-specific issues

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 About SiteBoss

SiteBoss provides comprehensive logistics and fulfillment solutions for e-commerce businesses. Our OWL (Order and Warehouse Logistics) platform powers 3PL providers serving wineries, retailers, and other businesses requiring sophisticated fulfillment capabilities.

**Key Benefits:**
- **Multi-tenant Architecture**: Supports multiple 3PL providers and their clients
- **Real-time Integration**: Live order and inventory synchronization
- **Comprehensive Tracking**: End-to-end visibility from order to delivery
- **Scalable Infrastructure**: Built to handle high-volume operations

## 📞 Support

- **Technical Issues**: [GitHub Issues](https://github.com/SiteBossInc/siteboss-owl-shpfy-app/issues)
- **Documentation**: [Development Guides](./docs/)
- **SiteBoss OWL Support**: Contact your 3PL provider
- **Shopify App Store**: [SiteBoss OWL Integration](https://apps.shopify.com/siteboss-owl)

## 🔗 Resources

- **[Shopify App Development](https://shopify.dev/docs/apps)**: Official Shopify documentation
- **[Remix Framework](https://remix.run/docs)**: Remix documentation and guides
- **[Shopify Polaris](https://polaris.shopify.com/)**: Design system documentation
- **[SiteBoss OWL API](https://api.siteboss.com/docs)**: API documentation
- **[Shopify CLI](https://shopify.dev/docs/apps/tools/cli)**: Command-line tools

---

**Built with ❤️ by the SiteBoss team**
