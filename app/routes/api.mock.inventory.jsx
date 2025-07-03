import { json } from "@remix-run/node";
import { mockInventory, simulateApiDelay, createApiResponse } from "../services/mockData.server";

export async function loader({ request }) {
  await simulateApiDelay();
  
  const url = new URL(request.url);
  const sku = url.searchParams.get("sku");
  
  if (sku) {
    const item = mockInventory.find(i => i.sku === sku);
    if (item) {
      return json(createApiResponse(item));
    } else {
      return json(createApiResponse(null, false, "SKU not found"), { status: 404 });
    }
  }
  
  return json(createApiResponse({
    inventory: mockInventory,
    total: mockInventory.length,
    last_sync: new Date().toISOString()
  }));
}
