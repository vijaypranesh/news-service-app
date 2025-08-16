const express = require('express');
const bodyParser = require('body-parser');
const { Kafka } = require('kafkajs');

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(bodyParser.json());

// Kafka setup
const kafkaBroker = process.env.KAFKA_BROKER || 'kafka:9092';
const kafka = new Kafka({
  clientId: 'news-service',
  brokers: [kafkaBroker],
});

const producer = kafka.producer();

// Connect Kafka producer
(async () => {
  try {
    await producer.connect();
    console.log('✅ Kafka producer connected');
  } catch (err) {
    console.error('❌ Failed to connect Kafka producer:', err);
  }
})();

// POST /news route
app.post('/news', async (req, res) => {
  const { title, summary, url, source } = req.body;

  if (!title || !summary) {
    return res.status(400).json({ message: 'Missing title or summary' });
  }

  try {
    const newsMessage = {
      title: title,
      summary: summary,
      url: url,                 // Add the article URL
      source: source,           // Add source name (e.g., CNN, TechCrunch)
      timestamp: new Date().toISOString(),
    };

    // Send to Kafka topic
    await producer.send({
      topic: 'tech-news',
      messages: [
        {
          key: title,
          value: JSON.stringify(newsMessage),
        },
      ],
    });

    console.log('📤 News sent to Kafka:', newsMessage);

    res.status(200).json({ message: 'News received and sent to Kafka!' });
  } catch (error) {
    console.error('❌ Error sending news to Kafka:', error);
    res.status(500).json({ message: 'Error sending news to Kafka' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 News service running on http://localhost:${PORT}`);
});
