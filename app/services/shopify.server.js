/**
 * Shopify GraphQL queries and utilities
 */

export const SHOP_INFO_QUERY = `
  query getShopInfo {
    shop {
      id
      name
      myshopifyDomain
      primaryDomain {
        host
        url
      }
      email
      currencyCode
      plan {
        displayName
        partnerDevelopment
        shopifyPlus
      }
      url
      createdAt
      updatedAt
    }
  }
`;

/**
 * Fetch shop information using Shopify Admin API
 * @param {Object} admin - Shopify admin API client
 * @returns {Promise<Object>} Shop information
 */
export async function getShopInfo(admin) {
  try {
    const response = await admin.graphql(SHOP_INFO_QUERY);
    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error('Failed to fetch shop information');
    }
    
    return data.data.shop;
  } catch (error) {
    console.error('Error fetching shop info:', error);
    throw error;
  }
}

/**
 * Format shop information for display
 * @param {Object} shop - Raw shop data from GraphQL
 * @returns {Object} Formatted shop data
 */
export function formatShopInfo(shop) {
  return {
    id: shop.id,
    name: shop.name,
    domain: shop.myshopifyDomain,
    primaryDomain: shop.primaryDomain?.host || shop.myshopifyDomain,
    email: shop.email,
    currency: shop.currencyCode,
    plan: {
      name: shop.plan?.displayName || 'Unknown',
      isPartnerDevelopment: shop.plan?.partnerDevelopment || false,
      isShopifyPlus: shop.plan?.shopifyPlus || false
    },
    url: shop.url,
    createdAt: shop.createdAt,
    updatedAt: shop.updatedAt
  };
}

export const PRODUCTS_WITH_SKUS_QUERY = `
  query getProductsWithSkus($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          status
          variants(first: 250) {
            edges {
              node {
                id
                title
                sku
                inventoryQuantity
                price
                compareAtPrice
                inventoryPolicy
                createdAt
                updatedAt
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * Fetch all products with their SKUs from Shopify
 * @param {Object} admin - Shopify admin API client
 * @param {number} limit - Maximum number of products to fetch (default: 250)
 * @returns {Promise<Array>} Array of products with variants and SKUs
 */
export async function getProductsWithSkus(admin, limit = 250) {
  try {
    const allProducts = [];
    let hasNextPage = true;
    let cursor = null;
    let fetchedCount = 0;

    while (hasNextPage && fetchedCount < limit) {
      const remainingLimit = Math.min(250, limit - fetchedCount); // GraphQL max is 250 per request

      const response = await admin.graphql(PRODUCTS_WITH_SKUS_QUERY, {
        variables: {
          first: remainingLimit,
          after: cursor
        }
      });

      const data = await response.json();

      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        throw new Error('Failed to fetch products');
      }

      const products = data.data.products.edges.map(edge => edge.node);
      allProducts.push(...products);

      fetchedCount += products.length;
      hasNextPage = data.data.products.pageInfo.hasNextPage && fetchedCount < limit;
      cursor = data.data.products.pageInfo.endCursor;
    }

    return allProducts;
  } catch (error) {
    console.error('Error fetching products with SKUs:', error);
    throw error;
  }
}

/**
 * Extract and format SKU data from products
 * @param {Array} products - Array of products from Shopify
 * @returns {Object} Formatted SKU data with valid/invalid lists
 */
export function formatSkuData(products) {
  const allSkus = [];

  products.forEach(product => {
    product.variants.edges.forEach(variantEdge => {
      const variant = variantEdge.node;
      if (variant.sku && variant.sku.trim()) {
        allSkus.push({
          sku: variant.sku.trim(),
          productTitle: product.title,
          variantTitle: variant.title,
          productId: product.id,
          variantId: variant.id,
          inventoryQuantity: variant.inventoryQuantity || 0,
          price: variant.price,
          status: product.status,
          lastUpdated: variant.updatedAt
        });
      }
    });
  });

  // Since no SKUs are synced yet, all will be invalid
  const invalidSkus = allSkus.map(skuData => ({
    sku: skuData.sku,
    productTitle: skuData.productTitle,
    variantTitle: skuData.variantTitle,
    reason: "not_synced_with_warehouse",
    last_checked: new Date().toISOString(),
    suggested_alternatives: [],
    shopifyData: skuData
  }));

  return {
    valid_skus: [], // None are synced yet
    invalid_skus: invalidSkus,
    total_products: products.length,
    total_variants: allSkus.length
  };
}
