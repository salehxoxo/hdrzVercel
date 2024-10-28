import express from "express";
import { load } from "cheerio";

const app = express();
// const PORT = 3000;

// const PORT = process.env.PORT || 3000;
// Define your getId function here

import fs from "fs";
import fetch from "node-fetch";


const getId = async (req, res) => {
  const { q, year, type } = req.query;

  try {
    const response = await fetch(
      "https://hdrezka.me/search/?do=search&subaction=search&q=" + q,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
        },
      }
    );
    const html = await response.text();

    // Write the HTML response to a file
    fs.writeFile("response.html", html, (err) => {
      if (err) {
        console.error("Error saving HTML response:", err);
      } else {
        console.log("HTML response saved to response.html");
      }
    });

    const $ = load(html);

    const id = $(".b-content__inline_item")
      .map((_, e) =>
        $(e)
          .find(".b-content__inline_item-link > div")
          .text()
          .split(",")
          .shift()
          .includes(year) && $(e).find(".entity").text() === type
          ? $(e).attr("data-id")
          : undefined
      )
      .get()
      .filter(Boolean);

    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ID." });
  }
};


// Utility to decode data
const getData = (x) => {
  const v = {
    file3_separator: "//_//",
    bk0: "$$#!!@#!@##",
    bk1: "^^^!@##!!##",
    bk2: "####^!!##!@@",
    bk3: "@@@@@!##!^^^",
    bk4: "$$!!@$$@^!@#$$@",
  };
  let a = x.substr(2);
  for (let i = 4; i >= 0; i--) {
    if (v["bk" + i]) {
      a = a.replace(
        v.file3_separator +
          btoa(
            encodeURIComponent(v["bk" + i]).replace(
              /%([0-9A-F]{2})/g,
              (_, p1) => String.fromCharCode("0x" + p1)
            )
          ),
        ""
      );
    }
  }
  try {
    a = decodeURIComponent(
      atob(a)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch (e) {
    a = "";
  }
  return a.split(",").reduce((m, ele) => {
    const [key, value] = ele.split("]");
    m[key.replace("[", "")] = value;
    return m;
  }, {});
};

const main = async (req, res) => {
  const { id, type = "movie", season, episode } = req.query;

  const params =
    type !== "movie"
      ? {
          id,
          translator_id: 238,
          season,
          episode,
          action: "get_stream",
        }
      : {
          id,
          translator_id: 238,
          action: "get_movie",
        };

  try {
    const response = await fetch(
      "https://hdrezka.me/ajax/get_cdn_series/?t=" + new Date().getTime(),
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(params).toString(),
      }
    );
    const resp = await response.json();

    const result = {
      src: getData(resp.url),
      subtitle: resp.subtitle,
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stream data." });
  }
};

// Define endpoints
app.get("/api", (req, res) => res.send("API"));
app.get("/api/getId", getId);
app.get("/api/getStream", main);

//Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

export default app;
