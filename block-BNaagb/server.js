// const express = require("express");
// const axios = require("axios");
// const redis = require("redis");

// const client = redis.createClient((err) => {
//   if (err) {
//     console.log("Error creating redis server");
//   }
//   console.log("redis connected successfully ");
// });

// const app = express();
// // set uo redis client at default port

// // cache middleware

// const cacheJobs = async (req, res, next) => {
//   await client.get("Peoples", (err, data) => {
//     if (err) {
//       console.error("Redis GET error:", err);
//       next(); // If there's an error, skip to the next middleware
//     }
//     if (data) {
//       // If data is found in cache, return it as the response
//       res.json(JSON.parse(data));
//       console.log("coming from redi store");
//     } else {
//       // Otherwise, proceed to the next middleware to fetch fresh data
//       next();
//     }
//   });
// };

// app.get("/jobs", cacheJobs, async (req, res) => {
//   const url = "https://swapi.dev/api/people/1";

//   const data = await axios.get(url, {
//     headers: {
//       "Content-Type": "application/json",
//       // Add any other headers you need here
//     },
//   });

//   await client.set("Peoples", JSON.stringify(data));

//   res.json(data);
//   console.log("coming from api ");
// });

// app.listen("3000", () => {
//   console.log("server is live at 3k ");
// });

const express = require("express");
const axios = require("axios");
const redis = require("redis");

const app = express();

// Set up Redis client
const client = redis.createClient();

(async () => {
  try {
    await client.connect();
    console.log("Redis connected successfully");
  } catch (err) {
    console.error("Error connecting to Redis:", err);
  }
})();

// async function initializeRedis() {
//   try {
//     await client.connect();
//     console.log("Redis connected successfully");
//   } catch (err) {
//     console.error("Error connecting to Redis:", err);
//   }
// }

// initializeRedis();

// Cache middleware
const cacheJobs = async (req, res, next) => {
  try {
    const data = await client.get("Peoples");
    if (data) {
      res.json(JSON.parse(data));
    } else {
      next();
    }
  } catch (err) {
    console.error("Redis GET error:", err);
    next(); // Skip to the next middleware in case of error
  }
};

app.get("/", (req, res) => {
  res.send("API Caching With Redis");
});

app.get("/jobs", cacheJobs, async (req, res) => {
  const url = "https://swapi.dev/api/people/1";

  try {
    const { data } = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Store the response data in Redis with an expiration time of 3600 seconds (1 hour)
    client.setEx("Peoples", 3600, JSON.stringify(data));

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data" });
  }
});

app.listen(3000, () => {
  console.log("Server is live at port 3000");
});
