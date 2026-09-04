const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// 🔥 YOUR GOOGLE SHEET CSV LINK
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1x18vTpvM4AkjprnecBmu4S4I-CrqyHHeP2CZqh6GuWo/gviz/tq?tqx=out:csv";

let mode = "idle";
let currentOutfit = {
  top: "",
  bottom: "",
  shoes: ""
};

// ✅ CLEAN FUNCTION (VERY IMPORTANT)
function clean(link) {
  if (!link) return "";
  return link.replace(/"/g, "").trim();
}

// ✅ GET RANDOM OUTFIT FROM GOOGLE SHEET
async function getRandomOutfit() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();

  const rows = text.split("\n").slice(1).filter(r => r.trim() !== "");

  if (rows.length === 0) return null;

  const randomRow = rows[Math.floor(Math.random() * rows.length)];
  const cols = randomRow.split(",");

  return {
    top: clean(cols[0]),
    bottom: clean(cols[1]),
    shoes: clean(cols[2])
  };
}

// ✅ TRIGGER (Alexa / iPhone Shortcut)
app.get("/trigger/outfit", async (req, res) => {
  try {
    const outfit = await getRandomOutfit();

    if (!outfit) {
      return res.send("No outfits found");
    }

    currentOutfit = outfit;
    mode = "outfit";

    res.send("Outfit triggered");
  } catch (err) {
    console.log(err);
    res.send("Error");
  }
});

// ✅ STATUS (Dakboard reads this)
app.get("/status", (req, res) => {
  res.json({
    mode,
    outfit: currentOutfit
  });
});

// ✅ RESET (optional)
app.get("/reset", (req, res) => {
  mode = "idle";
  res.send("Reset done");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
