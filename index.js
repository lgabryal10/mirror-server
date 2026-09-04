const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// 🔥 HARD TEST LINKS (REPLACE THESE LATER WITH YOUR IMGUR LINKS)
let currentOutfit = {
  top: "https://picsum.photos/300/400",
  bottom: "https://picsum.photos/300/401",
  shoes: "https://picsum.photos/300/402"
};

let mode = "idle";

// ✅ TRIGGER (Alexa / Shortcut)
app.get("/trigger/outfit", (req, res) => {
  mode = "outfit";

  // OPTIONAL: random images so you SEE change
  currentOutfit = {
    top: `https://picsum.photos/300/${400 + Math.floor(Math.random()*10)}`,
    bottom: `https://picsum.photos/300/${410 + Math.floor(Math.random()*10)}`,
    shoes: `https://picsum.photos/300/${420 + Math.floor(Math.random()*10)}`
  };

  res.send("Triggered");
});

// ✅ STATUS (Dakboard reads this)
app.get("/status", (req, res) => {
  res.json({
    mode: mode,
    outfit: currentOutfit
  });
});

// OPTIONAL RESET
app.get("/reset", (req, res) => {
  mode = "idle";
  res.send("Reset");
});

app.listen(PORT, () => {
  console.log("Server running");
});
