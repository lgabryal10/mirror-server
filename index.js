const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// 🔥 YOUR GOOGLE SHEET (ALREADY FIXED)
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1x18vTpvM4AkjprnecBmu4S4I-CrqyHHeP2CZqh6GuWo/gviz/tq?tqx=out:csv";

// 🔥 STATE
let mode = "idle";
let currentOutfit = {
  top: "",
  bottom: "",
  shoes: ""
};

// 🟢 ROOT
app.get("/", (req, res) => {
  res.send("Mirror server running");
});

// 🟢 TRIGGER (Alexa / Shortcut hits this)
app.get("/trigger/outfit", async (req, res) => {
  try {
    const response = await fetch(SHEET_URL);
    const text = await response.text();

    const rows = text.split("\n").slice(1).filter(r => r.trim() !== "");

    if (rows.length === 0) {
      return res.send("No outfits found");
    }

    // 🎲 RANDOM OUTFIT
    const randomRow = rows[Math.floor(Math.random() * rows.length)];

    const [top, bottom, shoes] = randomRow.split(",");

    currentOutfit = {
      top: top.trim(),
      bottom: bottom.trim(),
      shoes: shoes.trim()
    };

    mode = "outfit";

    res.send("Outfit triggered");

  } catch (err) {
    console.log(err);
    res.send("Error reading sheet");
  }
});

// 🟢 STATUS (Dakboard reads this)
app.get("/status", (req, res) => {
  res.json({
    mode: mode,
    outfit: currentOutfit
  });
});

// 🟢 RESET (optional)
app.get("/reset", (req, res) => {
  mode = "idle";
  res.send("Reset done");
});

// 🚀 START
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
