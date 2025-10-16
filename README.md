# 🚀 Personal Portfolio Website

A modern, full-stack portfolio website with an integrated Content Management System (CMS) built with Next.js 14, TypeScript, and PostgreSQL.


## ✨ Features

### 🎨 Frontend
- **Responsive Design** - Fully responsive across all devices
- **Smooth Animations** - Framer Motion for fluid transitions
- **Dark Theme** - Modern dark mode interface with gradient accents
- **Interactive Sidebar** - Collapsible navigation with smooth scrolling
- **Dynamic Content** - Real-time updates without page refresh

### 🔐 Admin Dashboard
- **Secure Authentication** - NextAuth.js with credential-based login
- **Content Management** - Edit About, Skills, and Projects sections
- **Real-Time Updates** - Changes reflect immediately without redeployment
- **CRUD Operations** - Full create, read, update, delete functionality
- **Protected Routes** - Admin-only access to editing features

### 🛠️ Technical Features
- **Server-Side Rendering** - Fast initial page loads with Next.js SSR
- **API Routes** - RESTful API endpoints for data operations
- **Type Safety** - Full TypeScript implementation
- **Database ORM** - Prisma for type-safe database queries
- **Optimized Images** - Next.js Image component for performance
- **SEO Optimized** - Meta tags and structured data

## 🏗️ Tech Stack

### Frontend
- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [React 18](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations

### Backend
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) - Serverless functions
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Prisma](https://www.prisma.io/) - Database ORM
- [PostgreSQL](https://www.postgresql.org/) - Database

### Deployment
- [Vercel](https://vercel.com/) - Hosting and CI/CD
- [Vercel Postgres](https://vercel.com/storage/postgres) - Database hosting

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (local or hosted)
- Git

### Clone Repository
```bash
git clone https://github.com/RohitCds/portfolio.git
cd portfolio
```

### Install Dependencies
```bash
npm install
```

### Environment Setup
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/portfolio"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Admin Credentials (for development)
ADMIN_EMAIL="your-email@example.com"
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### Database Setup
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository

3. **Configure Environment Variables**
   - Add all variables from `.env` file
   - Update `NEXTAUTH_URL` to your production URL

4. **Deploy**
   - Click "Deploy"
   - Your site will be live at `your-project.vercel.app`

### Database Migration
If using Vercel Postgres:
```bash
# Update DATABASE_URL in Vercel environment variables
# Then run migrations
npx prisma db push
```

## 📁 Project Structure

```
portfolio/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── about/        # About section API
│   │   │   ├── auth/         # NextAuth configuration
│   │   │   ├── projects/     # Projects CRUD API
│   │   │   └── skills/       # Skills CRUD API
│   │   ├── about/
│   │   │   └── edit/         # About section editor
│   │   ├── projects/
│   │   │   └── edit/         # Projects editor
│   │   ├── skills/
│   │   │   └── edit/         # Skills editor
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/
│   │   └── Sidebar.tsx       # Navigation sidebar
│   └── generated/
│       └── prisma/           # Generated Prisma client
├── prisma/
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
├── .env                      # Environment variables (not in repo)
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🔑 Admin Access

### Login
1. Navigate to `/admin-login-9271`
2. Enter admin credentials
3. Access edit buttons in each section

### Features
- **About Section**: Edit personal bio and information
- **Skills Section**: Add, edit, delete skills by category
- **Projects Section**: Manage project portfolio with links

## 🎯 Key Features Explained

### Dynamic Content Management
All content is stored in PostgreSQL and can be updated through the admin interface without requiring redeployment.

### Authentication Flow
- Uses NextAuth.js with secure session management
- Protected API routes with middleware
- Admin-only edit buttons visible after authentication

### Database Schema
```prisma
model Skill {
  id       Int    @id @default(autoincrement())
  category String
  name     String
  order    Int    @default(0)
}

model Project {
  id          Int      @id @default(autoincrement())
  title       String
  description String
  techStack   String
  link        String?
  createdAt   DateTime @default(now())
}

model AboutMe {
  id        Int      @id @default(autoincrement())
  content   String   @db.Text
  updatedAt DateTime @updatedAt
}
```

## 🛣️ Roadmap

- [ ] Add blog functionality
- [ ] Implement contact form with email notifications
- [ ] Add analytics dashboard
- [ ] Dark/light theme toggle
- [ ] Add project filtering and search
- [ ] Implement image upload for projects
- [ ] Add testimonials section



## 👤 Author

**Rohit Shroff**
- LinkedIn: [linkedin.com/in/rohit-shroff](https://linkedin.com/in/rohit-shroff/)
- GitHub: [@RohitCds](https://github.com/RohitCds)
- Portfolio: 
- Email: rohitshroff02@gmail.com

