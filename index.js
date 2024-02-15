import express, { json } from 'express';
import cors from "cors"

import newsRoutes from './newsLetter.js';

const app = express();

app.use(json())
app.use(cors({ origin: "*" }))
app.use("/api/newsletter", newsRoutes)
app.use(express.static('public'))

const PORT = process.env.PORT || 3000;


app.get('/', async (req, res) => {
    res.json({ status: true, message: "Our node.js app works" })
});

app.listen(PORT, () => console.log(`App listening at port ${PORT}`));