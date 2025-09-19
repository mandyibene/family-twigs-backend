# Family Twigs – Backend

This is the backend API for **Family Twigs**, a multilingual web application that allows users to create and manage family trees.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (using SQLite temporarily, via Prisma ORM)
- **Authentication:** JWT with refresh tokens
- **Validation:** Zod (planned)
- **Environment:** Docker (planned)
- **Localization:** i18next (planned)

## Features

- User authentication (register, login, refresh)
- Secure JWT token system
- Family tree creation and management
- Multilingual support (French & English)

## Project Structure

Here is a non-exhaustive structure of the project :

    family-twigs-backend/
    ├── prisma/             # Prisma schema & migrations
    ├── src/                # Source code (routes, controllers, etc.)
    ├── .env.example        # Example for env variables
    ├── tsconfig.json       # TypeScript config
    ├── package.json        # Scripts & dependencies

## Install the project

### Install dependencies

    npm install

### Set up env variables
   
Create a `.env` file based on `.env.example`.

### Run the development server

    npm run dev