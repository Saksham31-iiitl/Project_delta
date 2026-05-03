require("dotenv").config();
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
const { app } = require("./app");
const { connectDB } = require("./config/db");
const { env } = require("./config/env");
const { startAutoCancelJob } = require("./jobs/autoCancel.job");

async function bootstrap() {
  await connectDB();
  startAutoCancelJob();
  app.listen(Number(env.PORT), () => {
    // eslint-disable-next-line no-console
    console.log(`NearbyStay API running on ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
