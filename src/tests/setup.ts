import dotenv from "dotenv";

// Make Jest load .env before before importing modules**
dotenv.config({
  path: ".env"
});