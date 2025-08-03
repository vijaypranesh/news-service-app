# 📰 Tech News Microservices App

This is a simple full-stack microservices application built using Node.js, Express, Kafka, MongoDB, and Docker Compose. It allows users to post tech news, which is then distributed via Kafka to a notification service, stored in MongoDB, and displayed in a web UI.

---

## 🧱 Architecture

```
+-------------+       Kafka       +--------------------+       MongoDB       +---------------+
| news-service|  ─────────────▶   | notification-service|  ───────────────▶  |  news-database |
+-------------+                   +--------------------+                      +---------------+
                                                    │
                                                    ▼
                                             +--------------+
                                             | web-frontend |
                                             +--------------+
```

- **news-service**: Accepts news via HTTP POST and publishes to Kafka.
- **notification-service**: Consumes Kafka messages, saves to MongoDB, exposes stored news.
- **web-frontend**: Fetches and displays saved news.
- **Kafka + Zookeeper**: Message broker infrastructure.
- **MongoDB**: Persistent storage.

---

## 📦 Tech Stack

- Node.js + Express.js
- KafkaJS (Kafka client)
- MongoDB
- Docker & Docker Compose
- EJS templating for frontend

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/tech-news-app.git
cd tech-news-app
```

### 2. Start Infrastructure

This includes Kafka, Zookeeper, and MongoDB:

```bash
docker-compose -f docker-compose.infra.yml up -d --build
```

### 3. Start Microservices

This includes the news-service, notification-service, and web-frontend:

```bash
docker-compose -f docker-compose.services.yml up -d --build
```

### 4. Access the Application

- Web Frontend: http://localhost:3000
- News Service Health: http://localhost:5000/health
- Notification Service Health: http://localhost:4000/health

---

## 📬 API Usage

### POST a News Item (to news-service)

```bash
curl -X POST http://localhost:5000/news \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI Breakthrough in 2025",
    "summary": "A new AI model surpasses human-level reasoning.",
    "timestamp": "2025-07-30T12:34:00Z"
}'
```

### Fetch Stored News (from notification-service)

```bash
curl http://localhost:4000/news
```

---

## 🧪 Health Check

Each service exposes a `/health` endpoint to verify liveness:

```bash
curl http://localhost:5000/health    # news-service
curl http://localhost:4000/health    # notification-service
curl http://localhost:3000           # frontend (should return HTML)
```

---

## 🛠️ Debugging & Inspection

- List Docker containers:
  ```bash
  docker ps
  ```

- View logs:
  ```bash
  docker logs -f services-news-service-1
  docker logs -f services-notification-service-1
  docker logs -f services-web-frontend-1
  ```

- List networks:
  ```bash
  docker network ls
  docker network inspect news-app-network
  ```

- Verify connectivity inside containers:
  ```bash
  docker exec -it services-notification-service-1 sh
  curl http://localhost:4000/health
  ```

---

## 🗂 Folder Structure

```
tech-news-app/
├── docker-compose.infra.yml       # Kafka, Zookeeper, MongoDB
├── docker-compose.services.yml    # news-service, notification-service, web-frontend
├── services/
│   ├── news-service/
│   │   └── server.js
│   ├── notification-service/
│   │   └── server.js
│   └── web-frontend/
│       ├── server.js
│       ├── views/
│       └── public/
├── README.md
└── .gitignore
```

---

## 📦 Example .gitignore

```
node_modules/
.env
dist/
*.log
```

---

## 🗃️ Docker Compose Split

You should have two compose files to separate concerns:

#### Infrastructure (`docker-compose.infra.yml`)
Contains:
- Zookeeper
- Kafka
- MongoDB
- Defines and creates `news-app-network` (external if reused)

#### Application Services (`docker-compose.services.yml`)
Contains:
- news-service
- notification-service
- web-frontend
- Reuses the `news-app-network` (external: true)

Start order:
1. Infrastructure: `docker-compose -f docker-compose.infra.yml up -d --build`
2. Services: `docker-compose -f docker-compose.services.yml up -d --build`

---

## 🧠 Notes on Service Responsibilities

- **news-service** is the producer: receives POST `/news` and publishes to Kafka.
- **notification-service** is the consumer: subscribes to `tech-news` topic, saves to MongoDB, and serves saved news on `/news`.
- **web-frontend** fetches from `notification-service` and renders the UI.

---

## 🗃 Persisted Data

- MongoDB database: `tech-news`
- Collection: `news`
- You can inspect via:
  ```bash
  docker exec -it infra-mongodb-1 mongo tech-news
  show collections
  db.news.find().pretty()
  ```

---

## 🧰 Local Development Tips

- If Kafka is not yet ready when services start, add retries/backoff in the Kafka client connection.
- Use service hostnames (`kafka`, `mongodb`) inside Docker; use `localhost` when testing outside containers.
- Ensure ports in code (`PORT`) match the Docker Compose port mappings.

---

## 📦 Git & GitHub Setup

```bash
git init
echo "node_modules
.env
dist
*.log" > .gitignore
git add .
git commit -m "Initial commit of tech news microservices app"
git branch -M main
git remote add origin https://github.com/<your-username>/tech-news-app.git
git push -u origin main
```

---

## 🧾 Attribution

Author: Vijayendra Hunasgi

---

## 📝 License

MIT License
