# Git Ship Done - a real-time sync todo app

![Screenshot 2024-07-29 at 10 13 27 PM](https://github.com/user-attachments/assets/5e651adc-e79e-4134-a68f-3a61508e7db7)

Git Ship Done is a low latency todo application built with modern web technologies to ensure seamless real-time synchronization and efficient task management. Utilizing Replicache for real-time data sync, Fastify for a robust backend, Next.js for a dynamic frontend, and Turborepo for efficient monorepo management, this application offers a smooth and interactive user experience. Manage your tasks effortlessly with real-time updates, ensuring your to-do list is always up-to-date across all your devices.

## Key Features:

- Real-Time Sync: Instant updates across all your devices using Replicache.
- GitHub Issues Integration: Create and manage GitHub issues directly from the application. Each todo can be linked to a GitHub issue, allowing you to keep track of your tasks and their corresponding issues in one place.
- Efficient Monorepo Management: Leverage Turborepo for streamlined project organization and build processes.

## Architecture:

![Screenshot 2024-07-29 at 10 58 22 PM](https://github.com/user-attachments/assets/540c73e5-c8ce-4117-8708-99240ad4e580)


## Tech Stack
- Turborepo - monorepo tooling
- Frontend
  - Next.js
  - Typescript
  - Shad CN
  - Tailwind CSS
  - Replicache
- Backend
  - Fastify
  - Typescript
  - Replicache
  - Nats Jetstream
  - Pusher.js
  - Supabase
  - Prisma
  - Octokit API
 

## Setup Instructions
- fork & clone the repo
- run `yarn install` in the root dir of the project. This will install both BE & FE deps
- run `npx replicache@latest get-license` to create replicache license key
- add `.env` file locally with all your secrets
  - Client secrets:
  ```txt
  REPLICACHE_LICENSE_KEY=your license key
  ```
  - Server secrets:
  ```txt
  DATABASE_URL="your db url"
  DIRECT_URL="your direct url"
  GITHUB_API_URL=https://api.github.com
  GITHUB_TOKEN=your PAT
  REPO_OWNER=owner
  REPO_NAME=repo
  PUSHER_APP_ID=app id
  PUSHER_KEY=key
  PUSHER_SECRET=secret
  PUSHER_CLUSTER=cluster
  ```
- Run `yarn dev` in the root to spin up both the client & the server
- Client will be running in port 3000 & server in port 8888
- Go to HTTP://localhost:3000

## Development Process
- Setup Monorepo with Turborepo:

- Initialize a monorepo using Turborepo to manage the frontend and backend projects.
Create two main workspaces: apps/ui for the Next.js frontend and apps/api for the Fastify backend.
Frontend Development:

- Next.js Setup:
  - Initialize a Next.js project in the apps/ui workspace.
  - Configure TypeScript for type safety and improved development experience.
  - Styling and UI Components:
  - Integrate Tailwind CSS for utility-first styling.
  - Use ShadCN for custom UI components, including checkboxes for todo items.
    
- Real-Time Sync:
  - Initialize Replicache using `useReplicache` to enable real-time synchronization of todo items across devices.
  - develop ui components for todo app
 
    
- Backend Development:
  - Initialize a Fastify server in the apps/api workspace.
  - Configure TypeScript for backend development.
  - Use Supabase or any db of your choice as the SQL database for storing todo items.
  - Set up Prisma ORM for database interactions and schema management.
  - Define the Prisma schema for the Todo model & run migrations.

- Real-Time Sync:
  - Integrate Replicache on the backend to handle real-time data sync operations.
  - Ensure you write controllers that'll handle the creation, updating, and deletion of todos.
  - Create endpoints for Replicache push and pull to synchronize data.
  - Use NATS JetStream for event handling and message streaming.
  - Integrate Pusher.js to send real-time pokes to the client to let it know to pull patch from server.

- GitHub Issues Integration:
  - Use Octokit API to create and manage GitHub issues from the application.
  - Develop endpoints to handle the creation and linking of GitHub issues to todo items.

- Connect the Next.js frontend with the Fastify backend through API calls.

---

*Built with* <3 *by [Pritish](https://pritishsamal.xyz) .aka CIPHERTron*
