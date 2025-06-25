## Getting Started

Follow these steps to set up and run the project:

1. **Copy environment variables:**

Copy the example environment file and fill in the required values.

```sh
cp .env.example .env
# Edit .env and update the values as needed
```

2. **Install dependencies:**

```sh
bun install
```

3. **Start the database:**

```sh
docker compose up -d
```

4. **Run the development server:**

```sh
bun run dev
```

5. **Run tests (optional):**

```sh
bun test
```

6. **Open the app:**

Visit [http://localhost:3000](http://localhost:3000) in your browser.
