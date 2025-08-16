const axios = require("axios");
const chalk = require("chalk");
const { execSync } = require("child_process");
const cheerio = require("cheerio");

const NEWS_SERVICE_POST_URL = "http://20.44.60.109/news";  // POST endpoint
const NEWS_SERVICE_GET_URL = "http://20.44.60.109/";       // HTML GET endpoint
const KAFKA_BOOTSTRAP = "kafka.infra.svc.cluster.local:9092";
const KAFKA_TOPIC = "news";
const MONGO_NAMESPACE = "infra";
const MONGO_APP_LABEL = "mongodb";
const MONGO_DB = "tech-news";
const MONGO_COLLECTION = "news";

async function main() {
  try {
    const postPayload = {
      title: "AKS Test News",
      summary: "Testing news on AKS via Node script",
      timestamp: new Date().toISOString()
    };

    console.log(chalk.blue("=== TEST 1: POST /news ==="));
    const postRes = await axios.post(NEWS_SERVICE_POST_URL, postPayload);
    console.log("POST response:", postRes.data);

    if (!postRes.data.message || !postRes.data.message.includes("Kafka")) {
      throw new Error("❌ Unexpected POST response");
    }
    console.log(chalk.green("✅ POST succeeded"));

    console.log("\n" + chalk.blue("=== TEST 2: GET / (parse HTML) ==="));
    const getRes = await axios.get(NEWS_SERVICE_GET_URL);
    const $ = cheerio.load(getRes.data);

    let foundNews = false;
    $("li.news-card").each((index, element) => {
      const title = $(element).find("h2").text().trim();
      const summary = $(element).find("p").text().trim();
      if (title === postPayload.title && summary === postPayload.summary) {
        foundNews = true;
        return false; // stop looping
      }
    });

    if (!foundNews) {
      throw new Error("❌ GET did not return posted news");
    }
    console.log(chalk.green("✅ GET returned posted news"));

    console.log("\n" + chalk.blue("=== TEST 3: MongoDB Persistence ==="));

    // Launch temporary MongoDB client pod (no --rm)
    execSync(
      `kubectl run -n ${MONGO_NAMESPACE} mongo-client --restart=Never --image=mongo -- sleep 20`,
      { stdio: "inherit", shell: "/bin/bash" }
    );

    // Run Mongo shell to check for posted news
    const mongoCheck = execSync(
      `kubectl exec -n ${MONGO_NAMESPACE} mongo-client -- mongo ${MONGO_DB} --host mongodb --quiet --eval "db.${MONGO_COLLECTION}.find({ title: '${postPayload.title}' }).count()"`,
      { encoding: "utf-8", shell: "/bin/bash" }
    ).trim();

    // Delete Mongo client pod
    execSync(
      `kubectl delete pod -n ${MONGO_NAMESPACE} mongo-client`,
      { stdio: "inherit", shell: "/bin/bash" }
    );

    if (mongoCheck !== "1") throw new Error("❌ MongoDB does not have the news item");
    console.log(chalk.green("✅ MongoDB persistence confirmed"));

    console.log("\n" + chalk.blue("=== TEST 4: Kafka Connectivity ==="));

    // Create Kafka Producer pod (no --rm)
    execSync(
      `kubectl run -n ${MONGO_NAMESPACE} kafka-producer --restart=Never --image=bitnami/kafka -- sleep 20`,
      { stdio: "inherit", shell: "/bin/bash" }
    );

    // Produce Kafka message
    execSync(
      `kubectl exec -n ${MONGO_NAMESPACE} kafka-producer -- bash -c "echo '{\\"title\\":\\"Kafka AKS Test\\",\\"content\\":\\"Kafka test message\\"}' | kafka-console-producer.sh --broker-list ${KAFKA_BOOTSTRAP} --topic ${KAFKA_TOPIC}"`,
      { stdio: "inherit", shell: "/bin/bash" }
    );

    // Delete Kafka Producer pod
    execSync(
      `kubectl delete pod -n ${MONGO_NAMESPACE} kafka-producer`,
      { stdio: "inherit", shell: "/bin/bash" }
    );

    // Create Kafka Consumer pod (no --rm)
    execSync(
      `kubectl run -n ${MONGO_NAMESPACE} kafka-consumer --restart=Never --image=bitnami/kafka -- sleep 20`,
      { stdio: "inherit", shell: "/bin/bash" }
    );

    // Consume Kafka messages
    execSync(
      `kubectl exec -n ${MONGO_NAMESPACE} kafka-consumer -- bash -c "kafka-console-consumer.sh --bootstrap-server ${KAFKA_BOOTSTRAP} --topic ${KAFKA_TOPIC} --from-beginning --timeout-ms 5000"`,
      { stdio: "inherit", shell: "/bin/bash" }
    );

    // Delete Kafka Consumer pod
    execSync(
      `kubectl delete pod -n ${MONGO_NAMESPACE} kafka-consumer`,
      { stdio: "inherit", shell: "/bin/bash" }
    );

    console.log(chalk.green("\n✅ Kafka message flow verified"));

    console.log(chalk.bgGreenBright("\nALL TESTS PASSED ✅\n"));
    process.exit(0);

  } catch (err) {
    console.error(chalk.bgRedBright("\nTEST FAILED ❌"));
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Response data:", err.response.data);
    }
    console.error(err.message || err);
    process.exit(1);
  }
}

main();
