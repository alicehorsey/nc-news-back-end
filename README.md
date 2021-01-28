# News Application Back End Project

## About the Project
This project was the culmination of my three week back end coding block on the Northcoders Coding Bootcamp. I spent 4 days working on the project, using full TDD to build an API which can access application data programmatically.

The link to the hosted API is https://alices-news-app.herokuapp.com/api

The database is PSQL and is interacted with using Knex. I also used Express, Jest and Supertest.

### The Brief
Build a mimik of a real world backend service (such as reddit) to provide application data information to the front end architecture.

## Set up
Please fork and clone from my GitHub repository and run `npm install` to install the required dev dependencies.

You will need to create a `knexfile.js` file at the root of the project. Here is an example of what this might look like.

`const ENV = process.env.NODE_ENV || 'development';
const { DB_URL } = process.env;

const baseConfig = {
  client: 'pg',
  migrations: {
    directory: './db/migrations'
  },
  seeds: {
    directory: './db/seeds'
  }
};

const customConfig = {
  development: {
    connection: {
      database: 'nc_news'
    }
  },
  test: {
    connection: {
      database: 'nc_news_test'
    }
  },
  production: {
    connection: {
      connectionString: DB_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    },
  },
};

module.exports = { ...customConfig[ENV], ...baseConfig };
`

In order to set up and seed the local database run `npm run setup-dbs` followed by `npm run seed`.

You can then run `npm run test-app` to view all the tests for the API.

NB: You will require a minimum of Postgres v8.4.2.

