import { json } from "@remix-run/node";
import { mockOrders, simulateApiDelay, createApiResponse } from "../services/mockData.server";

export async function loader({ request }) {
  await simulateApiDelay();
  
  const url = new URL(request.url);
  const orderId = url.searchParams.get("order_id");
  const status = url.searchParams.get("status");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  
  if (orderId) {
    const order = mockOrders.find(o => 
      o.external_order_id === orderId || o.siteboss_order_id === orderId
    );
    
    if (order) {
      return json(createApiResponse(order));
    } else {
      return json(createApiResponse(null, false, "Order not found"), { status: 404 });
    }
  }
  
  let filteredOrders = mockOrders;
  
  if (status) {
    filteredOrders = mockOrders.filter(order => order.status === status);
  }
  
  const paginatedOrders = filteredOrders.slice(0, limit);
  
  return json(createApiResponse({
    orders: paginatedOrders,
    total: filteredOrders.length,
    limit,
    has_more: filteredOrders.length > limit
  }));
}

export async function action({ request }) {
  await simulateApiDelay();
  
  if (request.method === "POST") {
    // Simulate order creation/update
    const body = await request.json();
    
    return json(createApiResponse({
      message: "Order processed successfully",
      order_id: "ORD-2024-" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      status: "received"
    }));
  }
  
  return json(createApiResponse(null, false, "Method not allowed"), { status: 405 });
}
