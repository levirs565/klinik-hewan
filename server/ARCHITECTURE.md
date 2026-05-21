# Server Architecture

This document serves as a guide for developers and AI agents to understand the architecture and engineering standards of the this project's server.

## 1. Architectural Pattern: Layered Domain-Driven Design
The project follows a modular structure where each domain (e.g., auth, notification, pet) is encapsulated in its own package. Each package typically contains:

- **Controller (controller.go):** Handles HTTP transport logic using the Echo framework. Responsible for binding, validation, and calling the appropriate service.
- **Service (service.go):** Contains the core business logic. It is agnostic of the transport layer and interacts with the database or external services.
- **DTOs (dto.go):** Data Transfer Objects that define the contract between the API and the client, preventing leak of database models to the edge. DTO also use `validate` tags for validation.

## 2. Data Access Layer (GORM)
The project utilizes the latest **GORM Generic API** for type-safe database operations.

- **Usage:** gorm.G[models.ModelName](db) is used to create a typed DB instance.
- **Example:** gorm.G[models.Product](s.db).Where("id = ?", id).First(ctx)
- **Transactions:** Complex operations involving multiple steps are wrapped in db.Transaction.

## 3. Engineering Standards & Best Practices

### Security
- **Password Hashing:** Uses **Argon2id** for industry-standard security.
- **Authentication:** JWT-based with a **Refresh Token Rotation** strategy. Refresh tokens are stored in the database with replaced_by_id tracking for security auditing.
- **Authorization:** Role-Based Access Control (RBAC) is enforced via core.NewGuardRoleMiddleware.

### Request & Error Handling
- **Request Processing:** Use `core.BindAndValidate` in Controllers to ensure consistent binding and validation logic.
- **Error Propagation:** 
    - Propagate raw errors for internal failures or generic binding/validation issues to allow Echo's default handler to manage them.
    - Define and handle specific domain errors (e.g., `ErrEmailAlreadyRegistered`) only when custom HTTP status codes (like 409) are required.
- **Route Management:** Controllers should implement a `RegisterRoutes(group *echo.Group)` method to manage their own domain routing, keeping `main.go` clean.

## 4. Development Workflow
1. Define the GORM database model in server/models/.
2. Register the model in db.AutoMigrate in main.go.
3. Implement the Service logic.
4. Implement the Controller and DTOs.
5. Register routes in main.go using the controller's `RegisterRoutes` method.
