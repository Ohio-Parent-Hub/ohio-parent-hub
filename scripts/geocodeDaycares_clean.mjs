// scripts/geocodeDaycares.mjs
import fs from "node:fs";
import path from "node:path";
import axios from "axios";
import FormData from "form-data";
import { parse } from "csv-parse/sync";

const CHUNK_SIZE = 1000;
const DELAY_MS = 2000; // 2 seconds between chunks

// Path to data file
const DATA_FILE = path.join(process.cwd(), "data", "daycares.json");

// Read existing data
if (!fs.existsSync(DATA_FILE)) {
  console.error("Error: data/daycares.json not found!");
  process.exit(1);
}

const rawData = fs.readFileSync(DATA_FILE, "utf8");
let daycares = JSON.parse(rawData);

console.log(`Loaded ${daycares.length} daycares.`);

// Find daycares needing geocoding
// We'll filter for those missing LAT or LNG
const toGeocode = daycares.filter(d => !d.LAT || !d.LNG);

console.log(`${toGeocode.length} records need geocoding.`);

if (toGeocode.length === 0) {
  console.log("All records are already geocoded. Exiting.");
  process.exit(0);
}

// Function to process a chunk
async function processChunk(chunk, chunkIndex, totalChunks) {
  console.log(`Processing chunk ${chunkIndex + 1}/${totalChunks} (${chunk.length} records)...`);
  
  // Create CSV content for this chunk
  // Format: "Unique ID, Street address, City, State, Zip"
  let csvContent = "";
  chunk.forEach(d => {
    const id = d["PROGRAM NUMBER"];
    const street = (d["STREET ADDRESS"] || "").replace(/,/g, " "); // Basic CSV escape
    const city = (d["CITY"] || "").replace(/,/g, " ");
    const state = "OH";
    const zip = (d["ZIP CODE"] || "").substring(0, 5);
    
    csvContent += `"${id}","${street}","${city}","${state}","${zip}"\n`;
  });

  // Prepare form data
  const form = new FormData();
  form.append("addressFile", Buffer.from(csvContent, "utf-8"), {
    filename: "addresses.csv",
    contentType: "text/csv",
  });
  form.append("benchmark", "Public_AR_Current"); // Use current benchmark

  try {
    const response = await axios.post(
      "https://geocoding.geo.census.gov/geocoder/locations/addressbatch",
      form,
      {
        headers: {
          ...form.getHeaders(),
          "User-Agent": "OhioParentHub/1.0 (https://ohioparenthub.com/; contact@ohioparenthub.com)" // Polite UA
        },
        timeout: 300000 // 5 minutes timeout per chunk
      }
    );

    // Response is CSV text
    // "id", "address_in", "match_status", "match_type", "address_out", "coordinates", "tiger_line", "side"
    // Use csv-parse to handle quotes correctly
    const records = parse(response.data, {
      columns: false,
      trim: true,
      skip_empty_lines: true,
      relax_column_count: true,
      skip_records_with_error: true
    });

    let matchCount = 0;

    records.forEach(cols => {
      // Expected columns:
      // 0: ID
      // 1: Input Address
      // 2: Match Indicator (Match/Tie/No_Match)
      // 3: Match Type
      // 4: Matched Address
      // 5: Coordinates (Lon, Lat)
      // ...
      
      if (cols.length < 6) return; // Skip invalid lines

      const id = cols[0];
      const matchStatus = cols[2];
      const coordinates = cols[5];

      if ((matchStatus === "Match" || matchStatus === "Tie") && coordinates && coordinates.includes(",")) {
        const [lng, lat] = coordinates.split(",").map(s => parseFloat(s.trim()));
        
        if (!isNaN(lat) && !isNaN(lng)) {
          // Find the daycare in the main array
          const d = daycares.find(item => item["PROGRAM NUMBER"] === id);
          if (d) {
            d.LAT = lat;
            d.LNG = lng;
            matchCount++;
          }
        }
      }
    });

    console.log(`  Chunk ${chunkIndex + 1}: matched ${matchCount}/${chunk.length} addresses.`);

  } catch (error) {
    console.error(`  Error processing chunk ${chunkIndex + 1}:`, error.message);
    if (error.response) {
      // Log partial response if error is HTML (common with Census errors)
      const data = typeof error.response.data === 'string' ? error.response.data.substring(0, 200) : JSON.stringify(error.response.data);
      console.error("  Response status:", error.response.status);
      console.error("  Response data:", data);
    }
  }
}

// Main execution block
(async () => {
  // Split into chunks
  const chunks = [];
  for (let i = 0; i < toGeocode.length; i += CHUNK_SIZE) {
    chunks.push(toGeocode.slice(i, i + CHUNK_SIZE));
  }

  for (let i = 0; i < chunks.length; i++) {
    await processChunk(chunks[i], i, chunks.length);
    
    // Save progress after each chunk
    fs.writeFileSync(DATA_FILE, JSON.stringify(daycares, null, 2));
    console.log(`  Saved progress to disk.`);
    
    if (i < chunks.length - 1) {
      console.log(`  Waiting ${DELAY_MS}ms...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  const geocoded = daycares.filter(d => d.LAT && d.LNG).length;
  console.log(`Done! Total geocoded: ${geocoded}/${daycares.length}.`);
})();
