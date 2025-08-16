const express = require('express');
const { Kafka } = require('kafkajs');
const mongoose = require('mongoose');
const News = require('./models/News');

const app = express();
const PORT = process.env.PORT || 3001;

// Healthcheck route
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// ✅ Add this
app.get('/news', async (req, res) => {
  try {
    const newsList = await News.find().sort({ timestamp: -1 });
    res.json(newsList);
  } catch (error) {
    console.error("❌ Failed to fetch news from DB:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// Start Express server (for healthcheck)
app.listen(PORT, () => {
  console.log(`✅ Healthcheck server listening on port ${PORT}`);
});

// Connect to MongoDB
mongoose.connect('mongodb://mongodb.infra.svc.cluster.local.:27017/tech-news', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Kafka setup
const kafkaBroker = process.env.KAFKA_BROKER || 'kafka:9092';
const kafka = new Kafka({
  clientId: 'news-service',
  brokers: [kafkaBroker],
});

const consumer = kafka.consumer({ groupId: 'news-group' });
const producer = kafka.producer();

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'tech-news', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      console.log(`🔔 New Tech News Notification!
📰 Title: ${data.title}
📝 Summary: ${data.summary}
🔗 URL: ${data.url || 'N/A'}
🏢 Source: ${data.source || 'N/A'}
📅 Timestamp: ${data.timestamp}
--------------------------`);

      try {
        await News.create({
          title: data.title,
          summary: data.summary,
          url: data.url,
          source: data.source,
          timestamp: data.timestamp || new Date()
        });
        console.log('🗃️ News saved to MongoDB');
      } catch (err) {
        console.error('❌ Error saving news to MongoDB:', err);
      }
    },
  });
};

run().catch(console.error);
