# Room Rental Platform

A modern, full-stack room rental platform built with Next.js 15, TypeScript, Tailwind CSS v4, Shadcn UI, MongoDB, Prisma, and Auth.js.

![Room Rental Platform](https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=400&fit=crop)

## Features

### 🏠 For Users
- Browse and search rooms with advanced filters
- Book rooms with date selection and guest count
- Pay booking amounts securely with eSewa (sandbox)
- View booking history and manage reservations
- Write reviews for completed stays
- Manage profile and account settings

### 🏘️ For Landlords
- Create and manage room listings
- Upload images and set amenities
- View and manage bookings for their properties
- Track revenue and analytics
- Respond to booking requests

### 👤 For Admins
- Full platform management dashboard
- User management (view, edit, delete)
- Room moderation and oversight
- Booking management across all properties
- Platform-wide analytics and statistics

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI
- **Database**: MongoDB
- **ORM**: Prisma
- **Authentication**: Auth.js (NextAuth v5)
- **Validation**: Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB database (local or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   cd room-rental-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example env file and update with your values:
   ```bash
   cp .env.example .env
   ```

   Update the following variables in `.env`:
   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/room-rental?retryWrites=true&w=majority"
   AUTH_SECRET="your-super-secret-key-here"
   AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NEXT_PUBLIC_ESEWA_ENABLED="true"
   ESEWA_PRODUCT_CODE="EPAYTEST"
   ESEWA_SECRET_KEY="8gBm/:&EnhH.1/q"
   ESEWA_FORM_URL="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
   ESEWA_STATUS_URL="https://rc.esewa.com.np/api/epay/transaction/status/"
   ```

   Generate an AUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

4. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

5. **Push database schema**
   ```bash
   npm run db:push
   ```

6. **Seed the database (optional)**
   ```bash
   npm run db:seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. Open [http://localhost:3000](http://localhost:3000) in your browser

## Test Accounts

After seeding the database, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@roomrental.com | admin123 |
| Landlord | john@landlord.com | landlord123 |
| Landlord | sarah@landlord.com | landlord123 |
| User | mike@user.com | user123 |
| User | emma@user.com | user123 |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard pages
│   ├── landlord/          # Landlord dashboard pages
│   └── rooms/             # Room listing and detail pages
├── actions/               # Server actions
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   ├── layout/            # Layout components (navbar, footer, sidebars)
│   ├── rooms/             # Room-related components
│   └── ui/                # Shadcn UI components
├── lib/                   # Utility functions and configurations
│   ├── auth.ts           # Auth.js exports
│   ├── auth.config.ts    # Auth.js configuration
│   ├── db.ts             # Prisma client
│   ├── utils.ts          # Helper functions
│   └── validations.ts    # Zod schemas
├── types/                 # TypeScript type definitions
└── middleware.ts          # Auth middleware
prisma/
├── schema.prisma          # Database schema
└── seed.ts               # Database seeding script
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user

### Rooms
- `GET /api/rooms` - List rooms with filters
- `POST /api/rooms` - Create new room (Landlord)
- `GET /api/rooms/[id]` - Get room details
- `PATCH /api/rooms/[id]` - Update room (Landlord)
- `DELETE /api/rooms/[id]` - Delete room (Landlord/Admin)

### Bookings
- `GET /api/bookings` - List user bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/[id]` - Get booking details
- `PATCH /api/bookings/[id]` - Update booking status

### Users
- `GET /api/users` - List users (Admin)
- `GET /api/users/[id]` - Get user details
- `PATCH /api/users/[id]` - Update user profile
- `DELETE /api/users/[id]` - Delete user (Admin)

### Reviews
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Create review

### Payments
- `PATCH /api/payments/[bookingId]` - Update payment status/method (Admin/Landlord)
- `POST /api/payments/esewa/initiate` - Start eSewa sandbox payment for a booking
- `POST /api/payments/esewa/verify` - Verify eSewa callback/status for a booking

### Statistics
- `GET /api/admin/stats` - Admin dashboard statistics
- `GET /api/landlord/stats` - Landlord dashboard statistics

## Key Features Explained

### Role-Based Access Control (RBAC)
The platform implements three distinct user roles:
- **USER**: Can browse rooms, make bookings, write reviews
- **LANDLORD**: All user permissions + create/manage rooms, view their bookings
- **ADMIN**: Full platform access, user management, analytics

### Server Actions
The application uses Next.js Server Actions for:
- Authentication (login, register, logout)
- Room CRUD operations
- Booking management
- Review submission
- User profile updates

### Responsive Design
Fully responsive design that works seamlessly on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- AWS Amplify
- Netlify
- Railway
- DigitalOcean

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the repository.

---

Built with ❤️ using Next.js, TypeScript, and Shadcn UI
