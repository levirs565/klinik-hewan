# Server Architecture

This document serves as a guide for developers and AI agents to understand the architecture and engineering standards of the this project's server.

## 1. Architectural Pattern: Layered Domain-Driven Design
The project follows a modular structure where each domain (e.g., auth, notification, pet) is encapsulated in its own package. Each package typically contains:

- **Controller (controller.go):** Handles HTTP transport logic using the Echo framework. Responsible for binding, validation, and calling the appropriate service.
- **Service (service.go):** Contains the core business logic. It is agnostic of the transport layer and interacts with the database or external services.
- **DTOs (dto.go):** Data Transfer Objects that define the contract between the API and the client, preventing leak of database models to the edge. DTO also use `validate` tags for validation.
- **Models (server/models/):** Represents the database schema. **Strict Rule:** Models MUST NOT contain `json` tags. API response and request structures must be exclusively defined in DTOs.

## 2. Data Access Layer (GORM)
The project utilizes the latest **GORM Generic API** (`gorm.io/gorm` v1.30+) for type-safe database operations.

- **Usage:** `gorm.G[models.ModelName](db)` is used to create a typed DB instance.
- **Explicit Selection:** Always use `.Select()` to specify only the columns required for the response. Avoid using `Select("*")` or relying on default selects to optimize performance and prevent over-fetching.
- **Constraint:** NEVER mix `gorm.G` with traditional GORM patterns (e.g., `db.Find(&models)`) in the same query chain. The generic wrapper is designed to provide type safety and context-aware execution; mixing them breaks these guarantees.
- **Identity:** New tables MUST use **UUID** as the Primary Key type (stored as `char(36)` in MySQL). Existing tables using `int` are preserved for compatibility but should be migrated when feasible.
- **Example:**
  ```go
  // Correct idiomatic usage
  results, err := gorm.G[models.Product](s.db).
      Select("id", "name", "price").
      Where("category_id = ?", catID).
      Find(ctx)
  ```
- **Transactions:** Complex operations involving multiple steps are wrapped in `db.Transaction`.

## 3. Data Access Layer (MongoDB)
For non-relational data such as audit logs, medical records, and session management, the project uses MongoDB with a centralized storage pattern.

- **MongoStorage:** A centralized struct in `core/db.go` that exposes specific collections as typed fields. This eliminates magic strings in service logic.
- **Usage:** Access collections via `s.mongo.CollectionName` (e.g., `s.mongo.RefreshTokens`).

## 4. Engineering Standards & Best Practices

### Security
- **Password Hashing:** Uses **Argon2id** for industry-standard security.
- **Authentication:** JWT-based with a **Refresh Token Rotation** strategy. Refresh tokens are stored in the database with replaced_by_id tracking for security auditing.
- **Authorization:** Role-Based Access Control (RBAC) is enforced via core.NewGuardRoleMiddleware.

### Request & Error Handling
- **Request Processing:** Use `core.BindAndValidate` in Controllers to ensure consistent binding and validation logic.
- **Action Responses:** For operations that do not return a specific resource (e.g., delete, logout, status updates), use `core.CreateActionResponse(success bool)` to provide a standardized JSON response: `{"success": true}`.
- **Error Propagation:** 
    - **Internal/Unknown Errors:** Propagate raw errors for unexpected failures (e.g., database connection issues, S3 timeout) to allow Echo's default handler to manage them, usually resulting in a 500 Internal Server Error.
    - **Known Domain Errors:** If an error is expected as part of business logic (e.g., `ErrAvatarNotFound`, `ErrEmailAlreadyRegistered`), define a specific error variable in the **Service** layer. The **Controller** MUST then check for these errors using `errors.Is` and map them to appropriate HTTP status codes (e.g., 400 Bad Request, 409 Conflict, 404 Not Found). This prevents business logic failures from appearing as generic system crashes.
- **Route Management:** Controllers should implement a `RegisterRoutes(group *echo.Group)` method to manage their own domain routing, keeping `main.go` clean.

### Middleware & Authorization

- **Session Middleware:** `core.NewSessionMiddleware` must be registered (usually in `main.go` for the `/api` group) to populate the `UserSession` in the Echo context from JWT tokens.
- **Guard Middleware:** Use `core.NewGuardRoleMiddleware(rule)` to enforce access control on specific routes. 
    - `core.GuardRoleLoggedIn`: Ensures the user is authenticated.
    - `core.GuardRoleNotLoggedIn`: Ensures the user is NOT authenticated (e.g., for login/register routes).
    - `models.AccountRole`: Pass a specific role (e.g., `models.RoleOwner`, `models.RoleDoctor`) to restrict access to that role only.
- **Session Retrieval:** Use `core.GetUserSession(c)` in controllers to safely retrieve the current user's session data. This is a **custom function** that extracts session information from the Echo context after it has been populated by the Session Middleware.

## 5. Development Workflow
1. Define the GORM and MongoDB database model in server/models/.
2. Register the model in db.AutoMigrate in main.go.
3. Implement the Service logic.
4. Implement the Controller and DTOs.
5. Register routes in main.go using the controller's `RegisterRoutes` method.
