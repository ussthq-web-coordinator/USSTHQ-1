// Pre-request
// Get current values or defaults
let start = parseInt(pm.collectionVariables.get("start")) || 0;
let pagelimit = parseInt(pm.collectionVariables.get("pagelimit")) || 100;
let code = pm.collectionVariables.get("code") || "USS";

// Update collection variables so the request URL path placeholders are populated
pm.collectionVariables.set("start", start);
pm.collectionVariables.set("pagelimit", pagelimit);
pm.collectionVariables.set("code", code);

