# Facebluk

The web app is currently disabled to save costs.

Facebluk is my "magnum opus" project, a simple prototype social network that showcases the implementation of various backend software design and architecture patterns.

The project is composed of a backend and frontend codebase. It draws inspiration from various methodologies and principles such as Domain-Driven Design (DDD), Event Sourcing, Command Query Responsibility Segregation (CQRS), Clean Architecture, Event-Driven Architecture, Polyglot Persistence and Functional Programming.

The backend codebase uses the following tech: TypeScript, Fastify, REST API, GraphQL, PostgreSQL, ElasticSearch, InfluxDB, Redis, MongoDB, RabbitMQ, Supabase.

- Fastify: for the command REST API and the query GraphQL API.
- PostgreSQL: for storing events and also data state for validation of commands.
- ElasticSearch: for searching other users.
- InfluxDB: for storing logs.
- Redis: as a cache for storing posts to later retrieve in the homepage.
- MongoDB: for queries to state data.
- RabbitMQ: for sending commands and events.
- Supabase: for user auth management and file storage.

Here is a diagram of the backend architecture:
![faceblukbackend](https://github.com/Raigiku/facebluk-backend/assets/31873735/bc190d26-e6c3-4f77-b750-e7e3f2589a86)

The frontend codebase is not the main highlight of the project, it uses the following tech: TypeScript, Next.js, React Query, and TailwindCSS. It can be found here https://github.com/Raigiku/facebluk-web-app

Work-in-progress additions: a graph db for better relationship navigation, websockets for chat communication.

-----

### Dev note

1. Create the package

npm init -y --scope @facebluk -w packages/n

2. Change main to dist/index.js inside package.json

3. Install dependencies 

- npm install @facebluk/n -w @facebluk/n

4. Create tsconfig inside project

project/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "references": [{ "path": "../n" }]
}

5. Add project reference inside root tsconfig.json

{ "path": "apps/n" }
