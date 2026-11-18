import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { Pool } from "pg";
import bcrypt from "bcrypt";
require("dotenv").config();
const app: Application = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDB = async () => {
  await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      age INT,
      is_Active BOOLEAN DEFAULT true,

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )`);

  await pool.query(`
  CREATE TABLE IF NOT EXISTS profile(
  id SERIAL PRIMARY KEY,
  userId INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  address TEXT,
  phone VARCHAR(15),
  gender VARCHAR(15),
   created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
  )
  `);

  console.log("database connected successfuly");
};

initDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT;

app.post("/api/v1/users", async (req: Request, res: Response) => {
  try {
    const { name, email, password, age } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
  INSERT INTO users (name, email, password, age) VALUES($1,$2,$3,$4) RETURNING *
  `,
      [name, email, hashPassword, age],
    );
    delete result.rows[0].password;
    res.status(201).json({
      success: true,
      message: "user created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
      data: error,
    });
  }
});

app.get("/api/v1/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM users
      `);

    res.status(200).json({
      message: "all users get successfully!",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.get("/api/v1/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
  SELECT * FROM users WHERE id=$1  `,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "user is not found",
      });
    }

    res.status(200).json({
      message: "user get successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.put("/api/v1/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, age, password, is_Active } = req.body;
    const result = await pool.query(
      `
      UPDATE users SET
      name=COALESCE($1, name),
      password=COALESCE($2, password),
      age=COALESCE($3, age),
      is_Active=COALESCE($4, is_Active)
      WHERE id=$5 RETURNING *
      `,
      [name ?? null, age ?? null, password ?? null, is_Active ?? null, id],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "user is not found",
      });
    }

    res.status(200).json({
      message: "user updated successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.delete("/api/v1/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
DELETE FROM users
WHERE id=$1
  `,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "user is not found",
      });
    }

    res.status(200).json({
      message: "user deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
});
app.get("/", (_req: Request, res: Response) => {
  res.send("server is running");
});

app.listen(PORT, () => {
  console.log(`port is running on ${PORT}`);
});
