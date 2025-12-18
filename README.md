# NestJS Boilerplate

A comprehensive NestJS boilerplate with authentication, database setup, and best practices.

## Features

### Core Features
- ✅ **Authentication & Authorization**: JWT with Access/Refresh tokens, Passport strategies, Role-based access control
- ✅ **Database**: Prisma ORM with PostgreSQL, soft deletes, audit trail, transactions
- ✅ **Configuration**: Environment-based configuration with validation
- ✅ **Validation**: Global validation pipes with class-validator
- ✅ **Error Handling**: Global exception filter with standardized error responses
- ✅ **Logging**: Winston logger with request/response logging
- ✅ **API Documentation**: Swagger/OpenAPI integration
- ✅ **Security**: Helmet, CORS, Rate limiting (global, per-user, per-endpoint)
- ✅ **Testing**: Jest configuration with E2E test setup
- ✅ **Docker**: Multi-stage Dockerfile and docker-compose setup

### Advanced Features
- ✅ **Caching**: Redis caching with @nestjs/cache-manager, decorators, cache strategies
- ✅ **Queue System**: Bull queues for background jobs (email, notifications)
- ✅ **Event System**: EventEmitter and CQRS pattern support
- ✅ **WebSocket**: Socket.IO with JWT authentication, room management
- ✅ **File Storage**: S3, Local, Cloudinary providers with image processing
- ✅ **Email System**: NodeMailer with Handlebars templates, queue-based sending
- ✅ **Notifications**: Multi-channel (Email, SMS, Push, WebSocket)
- ✅ **Search Engine**: Elasticsearch integration with full-text search
- ✅ **Monitoring**: Prometheus metrics, distributed tracing
- ✅ **Microservices**: RabbitMQ, Kafka, NATS support

Xem [FEATURES.md](./FEATURES.md) để biết chi tiết về tất cả các tính năng.

## Project Structure

```
src/
├── common/              # Shared utilities
│   ├── decorators/      # Custom decorators (@Public, @Roles, @CurrentUser)
│   ├── filters/         # Exception filters
│   ├── guards/          # Auth guards, role guards
│   ├── interceptors/    # Logging, transform, timeout
│   ├── pipes/           # Validation pipes
│   ├── middleware/      # Custom middleware
│   └── utils/           # Utility functions
├── config/              # Configuration
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── app.config.ts
├── modules/             # Feature modules
│   ├── auth/           # Authentication module
│   ├── users/          # Users CRUD
│   └── health/         # Health check
├── database/            # Database related
│   └── prisma.service.ts
└── main.ts
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/nest_boilerplate
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret-key
   ```

5. Set up the database:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

6. Start the application:
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000/api`
Swagger documentation at `http://localhost:3000/api/docs`

## API Response Format

### Success Response
```json
{
  "error": false,
  "code": 0,
  "message": "Success",
  "data": { ... },
  "traceId": "VIHOLaKaWe"
}
```

### Error Response
```json
{
  "error": true,
  "code": 403,
  "message": "Invalid token!",
  "data": null,
  "traceId": "VIHOLaKaWe"
}
```

### Paginated Response
```json
{
  "error": false,
  "code": 0,
  "message": "Success",
  "data": {
    "items": [],
    "meta": {
      "itemCount": 0,
      "totalItems": 0,
      "itemsPerPage": 10,
      "totalPages": 1,
      "currentPage": 1
    }
  },
  "traceId": "VIHOLaKaWe"
}
```

### Auth Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiredAt": "2025-09-29T08:08:14.822Z"
}
```

## Available Scripts

- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run E2E tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database
- `npm run prisma:studio` - Open Prisma Studio

## Docker

### Using Docker Compose

```bash
docker-compose up -d
```

This will start:
- Application on port 3000
- PostgreSQL on port 5432
- Redis on port 6379

### Building Docker Image

```bash
docker build -t nest-boilerplate .
docker run -p 3000:3000 nest-boilerplate
```

## Authentication

### Register
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Refresh Token
```bash
POST /api/auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Routes
Add `Authorization: Bearer <accessToken>` header to access protected routes.

## Roles

- `USER` - Default role
- `ADMIN` - Admin access
- `MODERATOR` - Moderator access

Use `@Roles('ADMIN')` decorator to restrict routes to specific roles.

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

MIT

