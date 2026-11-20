import 'dotenv/config';

const {PORT, DATABASE_URL, TEST_DATABASE_URL, API_KEY, NODE_ENV} = process.env;
const databaseUrl = NODE_ENV === "test" ? TEST_DATABASE_URL : DATABASE_URL;
const config = {PORT, databaseUrl, API_KEY}

for(const [key, value] of Object.entries(config)) {
  if(!value) {
    throw new Error(`Missing required config: ${key}`);
  }
}

export default config;