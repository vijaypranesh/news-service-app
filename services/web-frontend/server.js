// server.js (in web-frontend)
const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
  try {
    const response = await axios.get("http://notification-service.news-app.svc.cluster.local.:3001/news");
    const news = response.data.map(item => {
      const istDate = new Date(item.timestamp).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata"
      });
      return { ...item, istTime: istDate };
    });
    res.render("index", { news });
  } catch (error) {
    console.error("Error fetching news:", error.message);
    res.render("index", { news: [] });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🧠 Web UI running at http://localhost:${PORT}`);
});
