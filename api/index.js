import express from "express";
import axios from "axios";
import { load } from "cheerio";

const app = express();
// const PORT = 3000;

// Define your getId function here
const getId = async (req, res) => {
  const { q, year, type } = req.query;

  // try {
    console.log("Starting request with query:", { q, year, type });

    const resp = await axios.get(
      "https://hdrezka.me/search/?do=search&subaction=search&q=" + q
    );
    console.log("Request successful. Status:", resp.status);
    console.log("Request:", resp);

//     const $ = load(resp.data);
//     console.log("HTML successfully loaded with cheerio.");

//     const id = $(".b-content__inline_item")
//       .map((_, e) => {
//         const text = $(e).find(".b-content__inline_item-link > div").text();
//         console.log("Item text:", text);

//         const yearMatch = text.split(",").shift().includes(year);
//         console.log("Year match:", yearMatch);

//         const typeMatch = $(e).find(".entity").text() === type;
//         console.log("Type match:", typeMatch);

//         return yearMatch && typeMatch ? $(e).attr("data-id") : undefined;
//       })
//       .get()
//       .filter(Boolean);

//     console.log("IDs extracted:", id);

//     res.json({ id });
//   } catch (error) {
//     console.error("Error occurred:", error.message);
//     res.status(500).json({ error: "Failed to fetch ID." });
//   }
};



// // Utility to decode data
// const getData = (x) => {
//     const v = {
//       file3_separator: "//_//",
//       bk0: "$$#!!@#!@##",
//       bk1: "^^^!@##!!##",
//       bk2: "####^!!##!@@",
//       bk3: "@@@@@!##!^^^",
//       bk4: "$$!!@$$@^!@#$$@",
//     };
//     let a = x.substr(2);
//     for (let i = 4; i >= 0; i--) {
//       if (v["bk" + i]) {
//         a = a.replace(
//           v.file3_separator +
//             btoa(
//               encodeURIComponent(v["bk" + i]).replace(
//                 /%([0-9A-F]{2})/g,
//                 (_, p1) => String.fromCharCode("0x" + p1)
//               )
//             ),
//           ""
//         );
//       }
//     }
//     try {
//       a = decodeURIComponent(
//         atob(a)
//           .split("")
//           .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//           .join("")
//       );
//     } catch (e) {
//       a = "";
//     }
//     return a.split(",").reduce((m, ele) => {
//       const [key, value] = ele.split("]");
//       m[key.replace("[", "")] = value;
//       return m;
//     }, {});
  // };



const main = async (req, res) => {
    const { id, type = "movie", season, episode } = req.query;
  
    // Validate required parameters
    // if (!id || (type === "tv" && (!season || !episode))) {
    //   return res.status(400).json({ error: "Invalid parameters." });
    // }
  
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
      const resp = (
        await axios.post(
          "https://hdrezka.me/ajax/get_cdn_series/?t=" + new Date().getTime(),
          new URLSearchParams(params).toString()
        )
      ).data;
  
      const result = {
        src: getData(resp.url),
        subtitle: resp.subtitle,
      };
  
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stream data." });
    }
};

// Define an endpoint to call the getId function

app.get("/api", (req, res) => res.send("API"));

app.get("/api/getId", getId);

app.get("/api/getStream", main);

// Start the server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

export default app;  // Export the app for Vercel
