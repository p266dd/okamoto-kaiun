## Getting Started

<div>
  <a href="https://okamotokaiun.com">
    <img src="https://raw.githubusercontent.com/p266dd/okamoto-kaiun/refs/heads/main/public/okamoto-brand-github.webp" alt="Okamoto Kaiun Logo" width="150" />
  </a>
</div>

This project was built using [Next.js](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/), [Better Auth](https://github.com/better-auth/better-auth), [Prisma](https://www.prisma.io/) and [Tailwind CSS](https://tailwindcss.com/).

To get started with the development environment, please make sure to install the required dependencies. Then rename the `.env-example` file to `.env` and run the following commands:

```bash
# Install dependencies
npm install

# Generate the database schema
npx prisma generate

# Push schema to database
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment Details

- Modeling Data
  - [x] User
  - [x] Staff
  - [x] Ship
  - [x] Schedule
- Data Acess Layer
  - [ ] Read
  - [ ] Modify
- Pages
  - [ ] Auth
  - [ ] TopView (Schedule)
  - [ ] Staff Manage
  - [ ] Staff Details
  - [ ] Ship Manage
  - [ ] Ship Details
  - [ ] Calculate Payroll

### Main Functionalities

1. Keep track of the boarding and unboarding of staff.
2. View past, current and future schedule.
3. Calculate staff payroll.
