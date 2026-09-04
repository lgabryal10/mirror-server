const express = require("express");
const app = express();

let mode = "idle";

app.get("/", (req, res) => {
  res.send("Server running");
});

app.get("/trigger/outfit", (req, res) => {
  mode = "outfit";
  res.send("Outfit mode ON");
});

app.get("/status", (req, res) => {
  res.json({ mode });
});

app.listen(3000, () => console.log("Running"));
