const express = require('express');
const bodyParser = require('body-parser');
const { Kafka } = require('kafkajs');

const app = express();
const PORT = 5000;

// Middleware to parse JSON
app.use(bodyParser.json());

// Kafka setup
const kafka = new Kafka({
  clientId: 'news-service',
  brokers: ['kafka:9092'],
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
  const { title, summary } = req.body;

  if (!title || !summary) {
    return res.status(400).json({ message: 'Missing title or summary' });
  }

  try {
    const newsMessage = {
      title,
      summary,
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
