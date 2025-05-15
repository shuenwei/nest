import express from 'express'
import cors from 'cors'
import { ORIGIN } from '../constants/index'
import bot from './telegram-bot';

// initialize app
const app = express()

// middlewares
app.use(cors({ origin: ORIGIN }))
app.use(express.json()) // body parser
app.use(express.urlencoded({ extended: false })) // url parser
app.post('/telegram', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

export default app
