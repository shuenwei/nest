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

const MONTHLY_SCAN_LIMIT = parseInt(
  process.env.MONTHLY_SCAN_LIMIT || "100",
  10
);
const MONTHLY_TRANSLATE_LIMIT = parseInt(
  process.env.MONTHLY_TRANSLATE_LIMIT || "100",
  10
);

export {
  ORIGIN,
  PORT,
  MONGO_URI,
  MONGO_OPTIONS,
  JWT_SECRET,
  OTP_SECRET,
  MONTHLY_SCAN_LIMIT,
  MONTHLY_TRANSLATE_LIMIT,
};
