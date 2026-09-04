const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// GOOGLE SHEET CSV LINK
const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1x18vTpvM4AkjprnecBmu4S4I-CrqyHHeP2CZqh6GuWo/gviz/tq?tqx=out:csv";

let mode = "idle";

let currentOutfit = {
  top: "",
  bottom: "",
  shoes: ""
};


// ------------------------------------
// CLEAN CSV VALUE
// ------------------------------------

function clean(value) {
  if (!value) return "";

  return value
    .replace(/^"|"$/g, "")
    .replace(/""/g, '"')
    .trim();
}


// ------------------------------------
// PARSE ONE CSV LINE
// ------------------------------------

function parseCSVLine(line) {
  const values = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {

      // Handle escaped quotes ("")
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }

    } else if (char === "," && !insideQuotes) {

      values.push(clean(current));
      current = "";

    } else {

      current += char;
    }
  }

  // Add final value
  values.push(clean(current));

  return values;
}


// ------------------------------------
// GET RANDOM OUTFIT FROM GOOGLE SHEET
// ------------------------------------

async function getRandomOutfit() {

  console.log("Getting Google Sheet data...");

  const response = await fetch(SHEET_URL);

  if (!response.ok) {
    throw new Error(
      `Google Sheets returned status ${response.status}`
    );
  }

  const text = await response.text();

  console.log("Google Sheet response:");
  console.log(text);

  // Split rows correctly for Windows/Mac line endings
  const rows = text
    .split(/\r?\n/)
    .filter(row => row.trim() !== "");

  console.log("Number of rows:", rows.length);

  // Need at least header + one outfit
  if (rows.length <= 1) {
    console.log("No outfit rows found.");
    return null;
  }

  // Remove header row
  const outfitRows = rows.slice(1);

  // Pick random row
  const randomRow =
    outfitRows[Math.floor(Math.random() * outfitRows.length)];

  console.log("Random row:");
  console.log(randomRow);

  // Parse CSV
  const cols = parseCSVLine(randomRow);

  console.log("Parsed columns:");
  console.log(cols);

  return {
    top: cols[0] || "",
    bottom: cols[1] || "",
    shoes: cols[2] || ""
  };
}


// ------------------------------------
// TEST ENDPOINT
// ------------------------------------

app.get("/test", async (req, res) => {

  try {

    const outfit = await getRandomOutfit();

    res.json({
      success: true,
      outfit: outfit
    });

  } catch (err) {

    console.error("TEST ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});


// ------------------------------------
// TRIGGER OUTFIT
// ------------------------------------

app.get("/trigger/outfit", async (req, res) => {

  try {

    console.log("Outfit trigger received.");

    const outfit = await getRandomOutfit();

    if (!outfit) {

      return res.status(404).json({
        success: false,
        message: "No outfits found"
      });

    }

    currentOutfit = outfit;
    mode = "outfit";

    console.log("Current outfit:");
    console.log(currentOutfit);

    res.json({
      success: true,
      message: "Outfit triggered",
      outfit: currentOutfit
    });

  } catch (err) {

    console.error("TRIGGER ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});


// ------------------------------------
// STATUS
// ------------------------------------

app.get("/status", (req, res) => {

  res.json({

    mode: mode,

    outfit: {

      top: currentOutfit.top,

      bottom: currentOutfit.bottom,

      shoes: currentOutfit.shoes

    }

  });

});


// ------------------------------------
// RESET
// ------------------------------------

app.get("/reset", (req, res) => {

  mode = "idle";

  currentOutfit = {
    top: "",
    bottom: "",
    shoes: ""
  };

  res.json({
    success: true,
    message: "Reset done"
  });

});


// ------------------------------------
// START SERVER
// ------------------------------------

app.listen(PORT, () => {

  console.log(
    "Server running on port " + PORT
  );

});
