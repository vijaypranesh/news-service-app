const express = require("express");
const cors = require("cors");
const { startProducer, getLatestNews } = require("./kafka/producer");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.send("✅ News Service is running");
});

app.get("/news", (req, res) => {
  const news = getLatestNews();
  if (!news) {
    return res.status(404).json({ message: "No news yet!" });
  }
  res.json(news);
});

// Start Kafka producer
startProducer().catch(console.error);

app.listen(PORT, () => {
  console.log(`🚀 News Service running on http://localhost:${PORT}`);
});
