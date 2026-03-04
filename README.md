# Kitameraki Backend Test - Task Management API

This is a Node.js-based Azure Functions application for managing tasks with support for dynamic custom fields and organization-level data separation. This is part of the Kitameraki test for developer position.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or v20 recommended)
- [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- [Azure Cosmos DB Emulator](https://learn.microsoft.com/en-us/azure/cosmos-db/how-to-develop-locally) (or an active Azure Cosmos DB account)

## Local Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/MuhammadFaisalMaulanaPutra/kitameraki-be-test.git
   cd kitameraki-be-test
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Rename `local.settings.json.example` to `local.settings.json`.
   - Update `CosmosDbConnectionString` with your local emulator connection string or your Azure Cosmos DB connection string.

4. **Initialize the Database**:
   This script creates the `TaskApp` database and the `Tasks` and `Settings` containers with the correct partition keys.

   ```bash
   npm run db:setup
   ```

5. **Seed the Database (Optional)**:
   This script adds sample tasks and form settings (including custom fields) to your database.
   ```bash
   npm run db:seed
   ```

## Running the Application

Start the Azure Functions host locally:

```bash
npm start
```

The API will be available at `http://localhost:7071/api`.

## API Documentation

### Tasks

- `GET /GetTasks?organizationId={id}`: List tasks (omits `customFields`).
- `GET /GetTask?id={id}&organizationId={orgId}`: Get full task details.
- `POST /InsertTask`: Create a new task.
- `PATCH /UpdateTask?id={id}&organizationId={orgId}`: Update a task.
- `DELETE /DeleteTask?id={id}&organizationId={orgId}`: Delete a task.
- `POST /BulkDeleteTasks?organizationId={orgId}`: Delete multiple tasks.

### Form Settings (Custom Fields)

- `GET /GetFormSettings?organizationId={id}`: Get the custom field configuration for an organization.
- `PUT /UpdateFormSettings`: Update/Create form settings.

## Features

- **Custom Fields**: Dynamic fields support via `customFields` array in tasks.
- **Data Isolation**: All operations require an `organizationId`.
- **Database Separation**: Settings and Tasks are stored in separate containers for better scalability.
- **Error Handling**: Centralized error mapping for consistent API responses.
