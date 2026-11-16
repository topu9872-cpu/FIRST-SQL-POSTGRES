import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { Pool } from "pg";
require("dotenv").config();
const app: Application = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      age INT,
      is_Active BOOLEAN DEFAULT true,

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )`);
    console.log("database connected successfuly");
  } catch (error) {
    console.error(error);
  }
};

initDB();

app.use(express.json());
const PORT = process.env.PORT;

app.post("/products", async (req: Request, res: Response) => {
  const body = await req.body;
  console.log(body);
  res.json(body);
});

app.get("/", (req: Request, res: Response) => {
  res.send("server is running");
});

app.listen(PORT, () => {
  console.log(`port is running on ${PORT}`);
});
