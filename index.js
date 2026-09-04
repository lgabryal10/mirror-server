const express = require("express");
const app = express();

let mode = "idle";

// 🔥 YOUR OUTFITS (PUT IMAGE LINKS HERE)
let outfits = [
  {
    top: "https://i.imgur.com/AAA.jpg",
    bottom: "https://i.imgur.com/BBB.jpg",
    shoes: "https://i.imgur.com/CCC.jpg"
  }
];

// trigger
app.get("/trigger/outfit", (req, res) => {
  mode = "outfit";
  res.send("Outfit mode ON");
});

// status + outfit data
app.get("/status", (req, res) => {
  res.json({
    mode,
    outfit: outfits[0]
  });
});

app.listen(3000, () => console.log("Running"));
