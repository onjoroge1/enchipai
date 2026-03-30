# Enchipai Mara Camp - Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn package manager

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/enchipai?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Email Service (Optional - for production)
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@enchipai.com"
EMAIL_FROM_NAME="Enchipai Mara Camp"

# File Upload (Optional - for production)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Payment Gateway (Optional - for production)
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Set Up Database

1. Create a PostgreSQL database:
```bash
createdb enchipai
# Or use your database management tool
```

2. Generate Prisma Client:
```bash
npm run db:generate
```

3. Push schema to database:
```bash
npm run db:push
```

4. Seed the database with initial data:
```bash
npm run db:seed
```

This will create:
- Admin user: `admin@enchipai.com` / `admin123`
- Guest user: `guest@example.com` / `guest123`
- 5 sample tents
- 2 sample blog posts

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Database Management

### View Database in Prisma Studio

```bash
npm run db:studio
```

### Create a Migration

```bash
npm run db:migrate
```

### Reset Database (⚠️ Warning: Deletes all data)

```bash
npx prisma migrate reset
```

## Default Credentials

After seeding:

- **Admin**: `admin@enchipai.com` / `admin123`
- **Guest**: `guest@example.com` / `guest123`

⚠️ **Change these passwords in production!**

## Project Structure

```
enchipai/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Guest dashboard
│   └── ...
├── components/            # React components
│   ├── admin/             # Admin components
│   ├── ui/                # UI components
│   └── ...
├── lib/                   # Utility functions
│   ├── prisma.ts          # Prisma client
│   ├── auth.ts            # NextAuth configuration
│   └── ...
├── prisma/                # Database schema
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed script
└── ...
```

## Next Steps

1. ✅ Phase 1: Foundation & Infrastructure (COMPLETE)
2. 🔄 Phase 2: Core User Features (IN PROGRESS)
3. 🔄 Phase 3: Admin Features - Core (IN PROGRESS)

See `ROADMAP.md` for detailed progress tracking.

## Troubleshooting

### Prisma Client Not Generated

```bash
npm run db:generate
```

### Database Connection Issues

- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify database exists

### NextAuth Issues

- Ensure `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your development URL

### Type Errors

```bash
npm run db:generate
```

This regenerates TypeScript types from your Prisma schema.

