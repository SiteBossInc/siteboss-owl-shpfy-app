import { json } from "@remix-run/node";

export const loader = async () => {
  return json({
    status: "ok",
    message: "SiteBoss OWL Shopify App is running",
    timestamp: new Date().toISOString()
  });
};

export default function Health() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>🟢 App Health Check</h1>
      <p>The SiteBoss OWL Shopify App is running successfully!</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}
