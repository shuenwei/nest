const ORIGIN = "*";
const PORT = process.env.PORT || 8080;
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/<DB_NAME>";
const MONGO_OPTIONS = {};

const JWT_SECRET = process.env.JWT_SECRET as string;
const OTP_SECRET = process.env.OTP_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment.");
}

if (!OTP_SECRET) {
  throw new Error("OTP_SECRET is not defined in the environment.");
}

export { ORIGIN, PORT, MONGO_URI, MONGO_OPTIONS, JWT_SECRET, OTP_SECRET };
