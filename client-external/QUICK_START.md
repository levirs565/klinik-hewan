# VetConnect Frontend - Quick Start Guide

## Getting Started

### 1. Install Dependencies
```bash
cd client-external
npm install
```

### 2. Configure Environment
The `.env` file is already configured with:
```
VITE_API_URL=http://localhost:1323/api
```

Make sure your backend is running on `http://localhost:1323`

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5175` (or next available port)

### 4. Build for Production
```bash
npm run build
```

## Key Features Implemented

### Authentication ✅
- User registration with validation
- User login with email/password
- JWT token management with automatic refresh
- Protected routes
- Logout functionality

### Pet Management ✅
- Create new pets with full details
- Upload pet photos to S3
- View pet list
- Pet profile display
- Species-based breed selection

### Dashboard ✅
- User greeting with personalized welcome
- Active appointments display
- Health reminders section
- Quick pet overview cards
- "Add Pet" and "Book Visit" CTAs

### Navigation ✅
- Bottom navigation bar for mobile (Home, Pets, Bookings, Reminders)
- React Router for all page navigation
- Protected routes for authenticated pages
- Redirect to login for unauthorized access

### UI Components ✅
- Responsive design (mobile-first)
- Material Design 3 color scheme
- Form validation and error display
- Loading states
- Success/error feedback

## Pages Available

| Page | Route | Status |
|------|-------|--------|
| Login | `/login` | ✅ Fully Implemented |
| Register | `/register` | ✅ Fully Implemented |
| Dashboard | `/` | ✅ Fully Implemented |
| Pets List | `/pets` | ✅ Fully Implemented |
| Add Pet | `/add-pet` | ✅ Fully Implemented |
| Appointments | `/appointments` | ⚠️ Stub (UI ready) |
| Reminders | `/reminders` | ⚠️ Stub (UI ready) |

## API Endpoints Connected

### Auth
- `POST /owner/register` - Register new user
- `POST /owner/login` - Login user
- `POST /token/refresh` - Refresh auth token
- `POST /logout` - Logout user
- `GET /me` - Get current user

### Pets
- `GET /pets` - List user's pets
- `POST /pets` - Create new pet
- `POST /pets/avatar/presigned-url` - Get S3 upload URL

## File Structure

```
src/
├── components/
│   ├── Button.tsx         - Button component with variants
│   ├── Input.tsx          - Input component with validation
│   ├── Select.tsx         - Select/dropdown component
│   ├── Card.tsx           - Card + Avatar + Badge components
│   ├── BottomNavigation.tsx - Mobile navigation
│   ├── ProtectedRoute.tsx - Route protection wrapper
│   └── index.ts           - Component exports
├── context/
│   └── AuthContext.tsx    - Global auth state
├── pages/
│   ├── LoginPage.tsx      - Login page
│   ├── RegisterPage.tsx   - Registration page
│   ├── DashboardPage.tsx  - Main dashboard
│   ├── AddPetPage.tsx     - Pet creation
│   ├── PetsPage.tsx       - Pet listing
│   ├── AppointmentsPage.tsx - Appointments (stub)
│   ├── RemindersPage.tsx  - Reminders (stub)
│   └── index.ts           - Page exports
├── services/
│   └── api.ts             - API client with Axios
├── types/
│   └── index.ts           - TypeScript definitions
├── App.tsx                - Main routing
├── main.tsx               - Entry point
└── index.css              - Global Tailwind styles
```

## Theme Colors

| Name | Color | Use |
|------|-------|-----|
| Primary | #004532 | Main CTA buttons, accents |
| Primary Container | #065f46 | Hover states, containers |
| Secondary | #565e74 | Secondary buttons, labels |
| Error | #ba1a1a | Error states, alerts |
| Background | #f8f9ff | Main background |
| Surface Variant | #d3e4fe | Card borders, dividers |

## Testing the Application

### Test User Registration
1. Open http://localhost:5175/register
2. Fill in registration form
3. Should create user via backend API

### Test Pet Management
1. Login to dashboard
2. Click "Add Pet" button
3. Fill in pet details and upload photo
4. Pet should appear in pet list

### Test Navigation
1. Click bottom navigation tabs
2. Each tab should navigate to respective page
3. Dashboard should show user-specific content

## Troubleshooting

### "Cannot find module" error
```bash
npm install
```

### Port already in use
Dev server will automatically use next available port (5173, 5174, 5175, etc.)

### API connection errors
- Ensure backend is running on localhost:1323
- Check .env file has correct VITE_API_URL
- Check browser console for detailed error messages

### Build errors
```bash
rm -rf dist node_modules
npm install
npm run build
```

## Environment Variables

Create `.env` file with:
```
VITE_API_URL=http://localhost:1323/api
```

## Deploy to Production

### 1. Build
```bash
npm run build
```

### 2. Deploy `dist` folder to your hosting
- Update VITE_API_URL environment variable for production API
- Upload contents of `dist` to your web server

### 3. Configure backend URL
Update the API base URL in the production environment if needed.

## Next Steps

1. **Complete Appointment Booking UI** - Implement service selection, date picker, time slot selection
2. **Medical Records Display** - Show pet medical history from appointments
3. **Reminder Management** - Allow users to create appointments from reminders
4. **Real-time Updates** - Add WebSocket support for live appointment status
5. **Offline Support** - Add service workers for offline functionality
6. **Push Notifications** - Integrate Firebase for real-time notifications

## Support

For issues or questions about the frontend implementation, refer to:
- [Frontend README](./README_FRONTEND.md)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [React Router Docs](https://reactrouter.com)
- [Axios Docs](https://axios-http.com)
