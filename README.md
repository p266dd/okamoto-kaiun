## Getting Started

<div>
  <a href="https://okamotokaiun.com">
    <img src="https://raw.githubusercontent.com/p266dd/okamoto-kaiun/refs/heads/main/public/okamoto-brand-github.webp" alt="Okamoto Kaiun Logo" width="150" />
  </a>
</div>

This project was built using [Next.js](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/), [Prisma](https://www.prisma.io/) and [Tailwind CSS](https://tailwindcss.com/).

To get started with the development environment, please make sure to install the required dependencies. Then rename the `.env-example` file to `.env` and add the provided details, then run the following commands:

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
  - [x] Read
  - [x] Modify
- Pages
  - [x] Auth Session
  - [x] Auth Screens
    - [x] Sanitize Params
  - [ ] Auth actions
  - [ ] TopView (Schedule)
  - [ ] Staff Manage
  - [ ] Ship Manage
  - [ ] Calculate Payroll

### Main Functionalities

1. Keep track of the boarding and unboarding of staff.
2. View past, current and future schedule.
3. Calculate staff payroll.
