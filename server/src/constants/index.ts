const ORIGIN = '*'
const PORT = process.env.PORT || 8080
import dotenv from 'dotenv';
dotenv.config();


// For "MongoDB Atlas": edit MONGO_URI in -> .env file
// For "MongoDB Community Server": edit <DB_NAME> in -> MONGO_URI below
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/<DB_NAME>'
const MONGO_OPTIONS = {}

const JWT_SECRET = process.env.JWT_SECRET || 'unsafe_secret'

export { ORIGIN, PORT, MONGO_URI, MONGO_OPTIONS, JWT_SECRET }
