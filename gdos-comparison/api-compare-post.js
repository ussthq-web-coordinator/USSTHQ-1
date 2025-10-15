// Parse response
let jsonData = pm.response.json();
let objects = (jsonData && jsonData.data && jsonData.data.objects) ? jsonData.data.objects : [];
let totalCount = (jsonData && jsonData.data && jsonData.data.totalCount) ? jsonData.data.totalCount : 0;

// Get existing collected data
let collected = pm.collectionVariables.get("collectedData");
if (!collected) {
    collected = [];
} else {
    collected = JSON.parse(collected);
}

// Append current page
collected = collected.concat(objects);
pm.collectionVariables.set("collectedData", JSON.stringify(collected));

console.log(`Fetched ${objects.length} items. Total so far: ${collected.length}/${totalCount}`);

// Pagination logic
let start = parseInt(pm.collectionVariables.get("start"));
let pagelimit = parseInt(pm.collectionVariables.get("pagelimit"));

if (collected.length < totalCount) {
    // Set next start and loop
    pm.collectionVariables.set("start", start + pagelimit);
    pm.execution.setNextRequest(pm.info.requestName); // loop same request
} else {
    // All data collected
    console.log("✅ Done. All objects collected.");

    // Build CSV headers
    let headers = [
        "id",
        "name",
        "unitShortName",
        "address1",
        "city",
        "state",
        "displayZip",
        "phoneNumber",
        "primaryWebsite",
        "email",
        "latitude",
        "longitude",
        "division",
        "services"
    ];

    // Build CSV
    let csv = headers.join(",") + "\n";

    collected.forEach(row => {
        let line = [];

        line.push(JSON.stringify(row.id || ""));
        line.push(JSON.stringify(row.name || ""));
        line.push(JSON.stringify(row.unitShortName || ""));
        line.push(JSON.stringify(row.address1 || ""));
        line.push(JSON.stringify(row.city || ""));
        line.push(JSON.stringify(row.state ? row.state.shortCode : ""));
        line.push(JSON.stringify(row.displayZip || ""));
        line.push(JSON.stringify(row.phoneNumber || ""));
        line.push(JSON.stringify(row.primaryWebsite || ""));
        line.push(JSON.stringify(row.email ? row.email.address : ""));
        line.push(JSON.stringify(row.location ? row.location.latitude : ""));
        line.push(JSON.stringify(row.location ? row.location.longitude : ""));
        line.push(JSON.stringify(row.location && row.location.division ? row.location.division.name : ""));

        // Combine service names in one cell
        let serviceNames = (row.services && row.services.length > 0)
            ? row.services.map(s => s.name).join("; ")
            : "";
        line.push(JSON.stringify(serviceNames));

        csv += line.join(",") + "\n";
    });

    pm.collectionVariables.set("finalJSON", JSON.stringify(collected, null, 2));
    pm.collectionVariables.set("finalCSV", csv);

    console.log("CSV ready with combined services (copy from 'finalCSV').");
}

if (collected.length < totalCount) {
    pm.collectionVariables.set("start", start + pagelimit);
    console.log(`Looping again: next start = ${start + pagelimit}`);
    pm.execution.setNextRequest(pm.info.requestName);
}

