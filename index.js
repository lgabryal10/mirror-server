const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// 🔥 GLOBAL STATE
let mode = "idle";

// 🔥 DEFAULT OUTFIT (WORKING IMAGE LINKS)
let outfit = {
  top: "https://picsum.photos/300/400",
  bottom: "https://picsum.photos/300/401",
  shoes: "https://picsum.photos/300/402"
};

// 🟢 ROOT ROUTE (optional test)
app.get("/", (req, res) => {
  res.send("Mirror server is running");
});

// 🟢 TRIGGER ROUTE (THIS IS WHAT YOUR SHORTCUT CALLS)
app.get("/trigger/outfit", (req, res) => {
  mode = "outfit";

  // Optional: randomize images every time 🔥
  outfit = {
    top: `https://picsum.photos/300/${400 + Math.floor(Math.random()*10)}`,
    bottom: `https://picsum.photos/300/${410 + Math.floor(Math.random()*10)}`,
    shoes: `https://picsum.photos/300/${420 + Math.floor(Math.random()*10)}`
  };

  res.send("Outfit mode ON");
});

// 🟢 STATUS ROUTE (THIS IS WHAT DAKBOARD READS)
app.get("/status", (req, res) => {
  res.json({
    mode: mode,
    outfit: outfit
  });
});

// 🔥 START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
