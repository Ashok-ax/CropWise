const fs = require("fs");

const raw = fs.readFileSync("crop_data.json", "utf8");
const data = JSON.parse(raw); // validates it's actually valid JSON

const output = "const cropData = " + JSON.stringify(data) + ";\nexport default cropData;\n";

fs.writeFileSync("crop_data.ts", output);

console.log("Done — crop_data.ts created successfully.");
