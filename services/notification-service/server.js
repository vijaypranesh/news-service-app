const express = require('express');
const { Kafka } = require('kafkajs');
const mongoose = require('mongoose');
const News = require('./models/News');

const app = express();
const PORT = process.env.PORT || 4000;

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

// Post news

app.use(express.json());

app.post('/api/news', async (req, res) => {
  const { title, summary, timestamp } = req.body;

  const message = {
    title,
    summary,
    timestamp: timestamp || new Date().toISOString(),
  };

  try {
    await producer.send({
      topic: 'tech-news',
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log('📤 Sent news to Kafka');
    res.status(200).json({ status: 'News sent to Kafka' });
  } catch (error) {
    console.error('❌ Kafka produce error:', error);
    res.status(500).json({ error: 'Failed to send news to Kafka' });
  }
});



// Start Express server (for healthcheck)
app.listen(PORT, () => {
  console.log(`✅ Healthcheck server listening on port ${PORT}`);
});

// Connect to MongoDB
mongoose.connect('mongodb://mongodb:27017/tech-news', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Kafka setup
const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: ['kafka:9092'],
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
📅 Timestamp: ${data.timestamp}
--------------------------`);

      try {
        await News.create({
          title: data.title,
          summary: data.summary,
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
