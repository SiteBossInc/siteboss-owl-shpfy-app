import { json } from "@remix-run/node";
import { mockTenants, simulateApiDelay, createApiResponse } from "../services/mockData.server";

export async function loader({ request }) {
  await simulateApiDelay();
  
  const url = new URL(request.url);
  const tenantId = url.searchParams.get("tenant_id");
  
  if (tenantId) {
    const tenant = mockTenants[tenantId];
    if (tenant) {
      return json(createApiResponse(tenant));
    } else {
      return json(createApiResponse(null, false, "Tenant not found"), { status: 404 });
    }
  }
  
  return json(createApiResponse(Object.values(mockTenants)));
}

export async function action({ request }) {
  await simulateApiDelay();
  
  if (request.method === "POST") {
    const body = await request.json();
    const { tenant_id } = body;
    
    if (!tenant_id) {
      return json(createApiResponse(null, false, "Tenant ID is required"), { status: 400 });
    }
    
    const tenant = mockTenants[tenant_id];
    if (!tenant) {
      return json(createApiResponse(null, false, "Invalid tenant ID"), { status: 404 });
    }
    
    return json(createApiResponse({
      tenant,
      validation_status: "valid",
      message: `Successfully validated tenant: ${tenant.display_name}`
    }));
  }
  
  return json(createApiResponse(null, false, "Method not allowed"), { status: 405 });
}
