const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'news-group' });

const run = async () => {
  await consumer.connect();
  console.log('✅ Notification service connected to Kafka');

  await consumer.subscribe({ topic: 'tech-news', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const news = JSON.parse(message.value.toString());
      console.log('🔔 New Tech News Notification!');
      console.log(`📰 Title: ${news.title}`);
      console.log(`📝 Summary: ${news.summary}`);
      console.log(`📅 Timestamp: ${news.timestamp}`);
      console.log('--------------------------');
    },
  });
};

run().catch(console.error);
