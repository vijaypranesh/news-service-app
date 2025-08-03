const { Kafka } = require("kafkajs");

let latestNews = null;

const kafka = new Kafka({
  clientId: "news-service",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

const getMockNews = () => ({
  date: new Date().toISOString().split("T")[0],
  headlines: [
    "GPT-5 Launched Today!",
    "NVIDIA Acquires AI Startup X",
    "Meta Ships New Smart Glasses",
    "GitHub Launches Copilot CLI",
    "Apple Previews M4 Chip for Macs"
  ],
});

const startProducer = async () => {
  await producer.connect();

  setInterval(async () => {
    const news = getMockNews();
    latestNews = news;

    const message = {
      key: "techpulse-daily",
      value: JSON.stringify(news),
    };

    await producer.send({
      topic: "daily-news-ready",
      messages: [message],
    });

    console.log(`📰 Sent daily news: ${news.date}`);
  }, 30000); // every 30 seconds
};

const getLatestNews = () => latestNews;

module.exports = { startProducer, getLatestNews };
