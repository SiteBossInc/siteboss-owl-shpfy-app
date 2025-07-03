/**
 * Shop connection management service
 * Tracks which shops have completed onboarding and are connected
 */

import db from "../db.server";

/**
 * Check if a shop has completed onboarding
 * @param {string} shop - Shop domain (e.g., "store.myshopify.com")
 * @returns {Promise<boolean>} True if shop has completed onboarding
 */
export async function isShopConnected(shop) {
  try {
    const session = await db.session.findFirst({
      where: {
        shop: shop,
        // You could add additional criteria here like checking for specific scopes
        // or a custom "onboarding_completed" field
      }
    });
    
    // For now, we'll consider a shop "connected" if it has an active session
    // In a more sophisticated setup, you might have a separate table to track onboarding status
    return !!session;
  } catch (error) {
    console.error('Error checking shop connection status:', error);
    return false;
  }
}

/**
 * Mark a shop as connected/onboarded
 * @param {string} shop - Shop domain
 * @param {Object} shopInfo - Shop information from Shopify API
 * @returns {Promise<boolean>} Success status
 */
export async function markShopAsConnected(shop, shopInfo = {}) {
  try {
    // Update the session with additional metadata to indicate onboarding completion
    await db.session.updateMany({
      where: { shop },
      data: {
        // You could store additional shop metadata here
        // For now, we'll just ensure the session exists
        // In a real implementation, you might add custom fields to track onboarding
      }
    });
    
    console.log(`Shop ${shop} marked as connected`);
    return true;
  } catch (error) {
    console.error('Error marking shop as connected:', error);
    return false;
  }
}

/**
 * Get shop connection metadata
 * @param {string} shop - Shop domain
 * @returns {Promise<Object|null>} Shop connection data or null if not found
 */
export async function getShopConnection(shop) {
  try {
    const session = await db.session.findFirst({
      where: { shop },
      orderBy: { id: 'desc' } // Get the most recent session
    });
    
    if (!session) {
      return null;
    }
    
    return {
      shop: session.shop,
      isOnline: session.isOnline,
      scope: session.scope,
      userId: session.userId,
      firstName: session.firstName,
      lastName: session.lastName,
      email: session.email,
      accountOwner: session.accountOwner,
      locale: session.locale,
      collaborator: session.collaborator,
      emailVerified: session.emailVerified,
      expires: session.expires
    };
  } catch (error) {
    console.error('Error getting shop connection:', error);
    return null;
  }
}

/**
 * Check if shop needs onboarding
 * @param {string} shop - Shop domain
 * @returns {Promise<boolean>} True if shop needs onboarding
 */
export async function shopNeedsOnboarding(shop) {
  const isConnected = await isShopConnected(shop);
  return !isConnected;
}
