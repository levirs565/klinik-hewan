# VetConnect Frontend

A comprehensive pet healthcare management application built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **User Authentication**: Login and registration for pet owners
- **Pet Management**: Create, view, and manage pet profiles with photos
- **Appointment Booking**: Schedule veterinary appointments for pets
- **Health Reminders**: Receive and manage health reminders from veterinarians
- **Medical Records**: Access pet medical history and records
- **Responsive Design**: Mobile-first design following Material Design 3 principles

## Tech Stack

- **Frontend Framework**: React 19.2.6
- **Build Tool**: Vite 8.0.12
- **Styling**: Tailwind CSS 3.4.1
- **Routing**: React Router DOM 6.20.0
- **HTTP Client**: Axios 1.6.2
- **Language**: TypeScript 6.0.2

## Project Structure

```
src/
├── components/        # Reusable UI components (Button, Input, Card, etc.)
├── context/          # React Context (AuthContext for state management)
├── pages/            # Page components (Login, Dashboard, Pets, etc.)
├── services/         # API service and utilities
├── types/            # TypeScript type definitions
├── App.tsx           # Main app component with routing
├── main.tsx          # Entry point
├── index.css         # Global styles with Tailwind CSS
└── App.css           # App-specific styles

```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
cd client-external
npm install
```

### Development

```bash
npm run dev
```

This will start a development server at `http://localhost:5173`

### Build

```bash
npm run build
```

Creates an optimized production build in the `dist/` folder.

### Linting

```bash
npm run lint
```

## Environment Variables

Create a `.env` file in the `client-external` directory:

```
VITE_API_URL=http://localhost:1323/api
```

## API Integration

The frontend communicates with the backend via the API client at `src/services/api.ts`. The API base URL can be configured via environment variables.

### Key API Endpoints

- `POST /owner/register` - User registration
- `POST /owner/login` - User login
- `POST /token/refresh` - Refresh authentication token
- `GET /me` - Get current user information
- `GET /pets` - Get user's pets
- `POST /pets` - Create a new pet
- `POST /pets/avatar/presigned-url` - Get S3 upload URL for pet photos

## Theme & Design

The application follows Material Design 3 principles with a custom color scheme:

- **Primary Color**: #004532 (Dark Teal)
- **Primary Container**: #065f46
- **Secondary Color**: #565e74
- **Error Color**: #ba1a1a
- **Background**: #f8f9ff (Light Blue-White)

### Fonts

- **Headlines & Display**: Hanken Grotesk
- **Body & Labels**: Inter
- **Icons**: Material Symbols Outlined

## Component Library

### Core Components

- **Button** - Primary, secondary, and tertiary button variants
- **Input** - Text input with validation and error states
- **Select** - Dropdown select component
- **Card** - Container component for content
- **Avatar** - User/pet avatar display
- **Badge** - Status and category badges
- **BottomNavigation** - Mobile navigation bar

## Authentication Flow

1. User registers or logs in
2. Backend returns access and refresh tokens
3. Tokens are stored in localStorage
4. Auth state is managed globally via AuthContext
5. Protected routes redirect unauthenticated users to login
6. Token refresh happens automatically on 401 responses

## Pages

### Public Pages
- `/login` - User login
- `/register` - User registration

### Protected Pages
- `/` - Dashboard/Home page
- `/pets` - Pet list
- `/add-pet` - Add new pet
- `/appointments` - Appointment bookings
- `/reminders` - Health reminders

## Development Guidelines

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add imports and routing in `src/App.tsx`
3. Wrap with `<ProtectedRoute>` if authentication is required

### Adding New Components

1. Create component file in `src/components/`
2. Export from `src/components/index.ts`
3. Use consistent styling with Tailwind CSS classes

### API Calls

Use the `apiClient` from `src/services/api.ts`:

```typescript
import { apiClient } from '../services/api';

const response = await apiClient.getPets();
```

## Error Handling

- Network errors are logged to console
- User-friendly error messages are displayed
- Token expiration is handled automatically with token refresh
- Failed refresh redirects to login page

## Performance Optimization

- Code splitting with React Router
- Lazy loading of routes
- Optimized CSS with Tailwind CSS purging
- Gzip compression in production

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Future Enhancements

- Offline support with service workers
- Push notifications
- Advanced filtering and search
- Appointment rescheduling
- Downloadable medical records
- Integration with payment systems

## Troubleshooting

### Build Errors

Clear node_modules and rebuild:
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Development Server Issues

- Ensure backend is running at `http://localhost:1323`
- Check `.env` file for correct `VITE_API_URL`
- Clear browser cache and local storage if needed

## License

This project is part of the VetConnect system.
