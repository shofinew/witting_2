# Server Architecture

This server is organized using a clean, modular architecture with clear separation of concerns.

## Folder Structure

```
server/
├── src/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── Event.js           # Event schema
│   ├── routes/
│   │   ├── auth.js            # Auth endpoints (uses controllers & middleware)
│   │   └── event.js           # Event endpoints (uses controllers & middleware)
│   ├── controllers/
│   │   ├── authController.js  # Auth business logic
│   │   └── eventController.js # Event business logic
│   ├── services/
│   │   ├── authService.js     # Auth service (database operations)
│   │   └── eventService.js    # Event service (database operations)
│   ├── middleware/
│   │   ├── validation.js      # Request validation middleware
│   │   └── errorHandler.js    # Error handling & async wrapper
│   └── utils/
│       ├── constants.js       # Constants (STATUS_ORDER, VALID_STATUSES, etc)
│       └── validators.js      # Validation helper functions
├── server.js                  # Main entry point
└── package.json
```

## Architecture Layers

### 1. **Routes** (`src/routes/`)
- Clean route definitions
- Uses middleware for request validation
- Delegates to controllers for logic

### 2. **Controllers** (`src/controllers/`)
- Handles HTTP request/response
- Validates input
- Calls services for business logic
- Returns formatted responses

### 3. **Services** (`src/services/`)
- Pure business logic
- Database operations using models
- Error handling with custom status codes
- Reusable across different routes

### 4. **Middleware** (`src/middleware/`)
- **validation.js**: Request validation, ObjectId validation
- **errorHandler.js**: Global error handling, async wrapper

### 5. **Utils** (`src/utils/`)
- **constants.js**: Configuration constants
- **validators.js**: Validation helper functions

### 6. **Models** (`src/models/`)
- Mongoose schemas
- Database structure definition

## Request Flow

```
Request
  ↓
Route
  ↓
Validation Middleware (if needed)
  ↓
Controller
  ↓
Service (business logic)
  ↓
Model (database)
  ↓
Response
```

## Example: Auth Flow

1. **Route** (`auth.js`): `POST /api/register`
2. **Middleware** validates input with `validateRegisterRequest`
3. **Controller** (`authController.register`) calls service
4. **Service** (`authService.register`) handles logic & database
5. **Response** sent back

## Benefits

✅ **Separation of Concerns** - Each layer has a single responsibility
✅ **Reusability** - Services can be used by multiple controllers
✅ **Testability** - Each layer can be tested independently
✅ **Maintainability** - Easy to locate and modify code
✅ **Scalability** - Easy to add new features or routes
✅ **Error Handling** - Centralized error handling

## Adding New Features

To add a new feature (e.g., notifications):

1. Create `Notification.js` model in `src/models/`
2. Create `notificationService.js` in `src/services/`
3. Create `notificationController.js` in `src/controllers/`
4. Create `notification.js` routes in `src/routes/`
5. Add validation middleware if needed in `src/middleware/`
6. Mount routes in `server.js`

Done! The new feature integrates seamlessly with existing code.
