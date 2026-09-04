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

/*
 * NEW:
 * Every time Alexa triggers an outfit,
 * this number changes.
 */
let triggerID = 0;


/* =========================================================
   CLEAN CSV VALUE
   ========================================================= */

function clean(value) {

  if (!value) return "";

  return value
    .replace(/^"|"$/g, "")
    .replace(/""/g, '"')
    .trim();

}


/* =========================================================
   PARSE CSV LINE
   ========================================================= */

function parseCSVLine(line) {

  const values = [];

  let current = "";

  let insideQuotes = false;


  for (let i = 0; i < line.length; i++) {

    const char = line[i];


    if (char === '"') {

      if (
        insideQuotes &&
        line[i + 1] === '"'
      ) {

        current += '"';

        i++;

      } else {

        insideQuotes =
          !insideQuotes;

      }

    }


    else if (
      char === "," &&
      !insideQuotes
    ) {

      values.push(
        clean(current)
      );

      current = "";

    }


    else {

      current += char;

    }

  }


  values.push(
    clean(current)
  );


  return values;

}


/* =========================================================
   GET RANDOM OUTFIT
   ========================================================= */

async function getRandomOutfit() {

  console.log(
    "Getting Google Sheet data..."
  );


  const response =
    await fetch(
      SHEET_URL
    );


  if (!response.ok) {

    throw new Error(
      `Google Sheets returned status ${response.status}`
    );

  }


  const text =
    await response.text();


  console.log(
    "Google Sheet response:"
  );

  console.log(text);


  const rows =
    text
      .split(/\r?\n/)
      .filter(
        row => row.trim() !== ""
      );


  console.log(
    "Number of rows:",
    rows.length
  );


  if (rows.length <= 1) {

    console.log(
      "No outfit rows found."
    );

    return null;

  }


  const outfitRows =
    rows.slice(1);


  const randomRow =
    outfitRows[
      Math.floor(
        Math.random() *
        outfitRows.length
      )
    ];


  console.log(
    "Random row:"
  );

  console.log(
    randomRow
  );


  const cols =
    parseCSVLine(
      randomRow
    );


  console.log(
    "Parsed columns:"
  );

  console.log(
    cols
  );


  return {

    top:
      cols[0] || "",

    bottom:
      cols[1] || "",

    shoes:
      cols[2] || ""

  };

}


/* =========================================================
   TEST
   ========================================================= */

app.get(
  "/test",
  async (req, res) => {

    try {

      const outfit =
        await getRandomOutfit();


      res.json({

        success: true,

        outfit: outfit

      });

    }


    catch (err) {

      console.error(
        "TEST ERROR:",
        err
      );


      res.status(500).json({

        success: false,

        error:
          err.message

      });

    }

  }
);


/* =========================================================
   ALEXA OUTFIT TRIGGER
   ========================================================= */

app.get(
  "/trigger/outfit",
  async (req, res) => {

    try {

      console.log(
        "================================="
      );

      console.log(
        "OUTFIT TRIGGER RECEIVED"
      );

      console.log(
        "================================="
      );


      const outfit =
        await getRandomOutfit();


      if (!outfit) {

        return res.status(404).json({

          success: false,

          message:
            "No outfits found"

        });

      }


      /*
       * Save the new outfit.
       */

      currentOutfit =
        outfit;


      /*
       * Change mode.
       */

      mode =
        "outfit";


      /*
       * IMPORTANT:
       *
       * Increase trigger ID EVERY
       * time Alexa calls this endpoint.
       */

      triggerID++;


      console.log(
        "Trigger ID:",
        triggerID
      );


      console.log(
        "Current outfit:"
      );

      console.log(
        currentOutfit
      );


      res.json({

        success: true,

        message:
          "Outfit triggered",

        triggerID:
          triggerID,

        outfit:
          currentOutfit

      });

    }


    catch (err) {

      console.error(
        "TRIGGER ERROR:",
        err
      );


      res.status(500).json({

        success: false,

        error:
          err.message

      });

    }

  }
);


/* =========================================================
   STATUS
   ========================================================= */

app.get(
  "/status",
  (req, res) => {

    res.json({

      mode:
        mode,

      /*
       * NEW:
       * DAKboard watches this number.
       */

      triggerID:
        triggerID,

      outfit: {

        top:
          currentOutfit.top,

        bottom:
          currentOutfit.bottom,

        shoes:
          currentOutfit.shoes

      }

    });

  }
);


/* =========================================================
   RESET
   ========================================================= */

app.get(
  "/reset",
  (req, res) => {

    mode =
      "idle";


    currentOutfit = {

      top: "",

      bottom: "",

      shoes: ""

    };


    /*
     * IMPORTANT:
     *
     * DO NOT reset triggerID.
     *
     * The triggerID must continue increasing
     * so DAKboard can recognize a future
     * Alexa trigger as a NEW trigger.
     */


    res.json({

      success: true,

      message:
        "Reset done",

      triggerID:
        triggerID

    });

  }
);


/* =========================================================
   START SERVER
   ========================================================= */

app.listen(
  PORT,
  () => {

    console.log(
      "Server running on port " +
      PORT
    );

  }
);
