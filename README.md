## Getting Started

<div style="background-color: #007aff; padding: 30px;">
<p style="text-align: center; display: block;">
  <a href="https://okamotokaiun.com">
    <img src="https://raw.githubusercontent.com/p266dd/okamoto-kaiun/refs/heads/main/public/company_logo.png" alt="Okamoto Kaiun Logo" width="150" />
  </a>
</p>
</div>
<div style="height: 80px; margin-bottom: 40px; background-image= url('https://raw.githubusercontent.com/p266dd/okamoto-kaiun/refs/heads/main/public/footer_wave.png')"></div>

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

* Modeling Data
  * [ ] User
  * [ ] Staff
  * [ ] Ship
  * [ ] Schedule
* Data Acess Layer
  * [ ] Read
  * [ ] Modify
* Pages
  * [ ] Auth
  * [ ] TopView (Schedule)
  * [ ] Staff Manage
  * [ ] Staff Details
  * [ ] Ship Manage
  * [ ] Ship Details
  * [ ] Calculate Payroll

### Main Functionalities

1. Keep track of the boarding and unboarding of staff.
2. View past, current and future schedule.
3. Calculate staff payroll.
