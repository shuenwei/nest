import dotenv from "dotenv";
dotenv.config();

import app from "./utils/app"; // Express app instance
import mongo from "./utils/mongo"; // Mongoose connect logic
import { PORT } from "./constants";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import transactionRoutes from "./routes/transaction";
import exchangeRoutes from "./routes/exchange";
import translationRoutes from "./routes/translation";
import webhookRoutes from "./routes/webhook";
import "./utils/telegram-bot";
import checkBearerToken from "./middlewares/check-bearer-token";
import errorHandler from "./middlewares/error-handler";
import cronRecurring from "./controllers/transaction/cron-recurring";

// Immediately connect to DB and attach routes before Cloud Run starts handling
const setup = async () => {
  await mongo.connect();

  app.get("/", (_, res) => {
    res.status(200).send("Hello, world!");
  });

  app.get("/healthz", (_, res) => {
    res.sendStatus(204);
  });

  app.post("/cron/recurring", cronRecurring);

  app.use("/webhook", webhookRoutes);

  app.use("/auth", authRoutes, errorHandler);
  app.use("/user", checkBearerToken, userRoutes, errorHandler);
  app.use("/transaction", checkBearerToken, transactionRoutes, errorHandler);
  app.use("/translate", checkBearerToken, translationRoutes, errorHandler);
  app.use("/exchange", checkBearerToken, exchangeRoutes, errorHandler);

  // Local dev server (optional)
  if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
      console.log(`✅ Server listening on http://localhost:${PORT}`);
    });
  }
};

setup();

export default app;
