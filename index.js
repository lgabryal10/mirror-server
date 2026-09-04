const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1x18vTpvM4AkjprnecBmu4S4I-CrqyHHeP2CZqh6GuWo/gviz/tq?tqx=out:csv";

let mode = "idle";
let currentOutfit = {
  top: "",
  bottom: "",
  shoes: ""
};

// 🔥 READ SHEET + PICK RANDOM OUTFIT
async function getRandomOutfit() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();

  const rows = text.split("\n").slice(1).filter(r => r.trim() !== "");

  if (rows.length === 0) return null;

  const randomRow = rows[Math.floor(Math.random() * rows.length)];
  const [top, bottom, shoes] = randomRow.split(",");

  return {
    top: top.trim(),
    bottom: bottom.trim(),
    shoes: shoes.trim()
  };
}

// 🔥 TRIGGER
app.get("/trigger/outfit", async (req, res) => {
  try {
    const outfit = await getRandomOutfit();

    if (!outfit) {
      return res.send("No outfits in sheet");
    }

    currentOutfit = outfit;
    mode = "outfit";

    res.send("Outfit updated");

  } catch (err) {
    console.log(err);
    res.send("Error");
  }
});

// 🔥 STATUS (Dakboard reads this)
app.get("/status", (req, res) => {
  res.json({
    mode,
    outfit: currentOutfit
  });
});

// RESET
app.get("/reset", (req, res) => {
  mode = "idle";
  res.send("Reset");
});

app.listen(PORT, () => {
  console.log("Server running");
});
