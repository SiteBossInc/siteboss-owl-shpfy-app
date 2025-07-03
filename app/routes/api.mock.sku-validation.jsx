import { json } from "@remix-run/node";
import { mockSkuValidation, simulateApiDelay, createApiResponse } from "../services/mockData.server";

export async function loader({ request }) {
  await simulateApiDelay();
  return json(createApiResponse(mockSkuValidation));
}

export async function action({ request }) {
  await simulateApiDelay();
  
  if (request.method === "POST") {
    const body = await request.json();
    const { skus } = body;
    
    if (!skus || !Array.isArray(skus)) {
      return json(createApiResponse(null, false, "SKUs array is required"), { status: 400 });
    }
    
    const validSkus = skus.filter(sku => mockSkuValidation.valid_skus.includes(sku));
    const invalidSkus = skus
      .filter(sku => !mockSkuValidation.valid_skus.includes(sku))
      .map(sku => ({
        sku,
        reason: "not_found_in_warehouse",
        last_checked: new Date().toISOString(),
        suggested_alternatives: [`${sku}-ALT`, `${sku}-V2`]
      }));
    
    return json(createApiResponse({
      valid_skus: validSkus,
      invalid_skus: invalidSkus,
      tenant_contact: {
        name: "ShipItEZ Logistics",
        email: "support@shipitez.com",
        phone: "+1-555-SHIP-EZ"
      }
    }));
  }
  
  return json(createApiResponse(null, false, "Method not allowed"), { status: 405 });
}
