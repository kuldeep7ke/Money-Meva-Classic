Money Meva is a local-first personal finance web app built with Next.js.

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Production

```bash
npm run build
npm run start
```

## Shareable Web App Package

Create a runnable zip package:

```powershell
npm run package:webapp
```

The package is written to `dist/money-meva-webapp-v2.1.0.0.zip`. Users can extract it, run `node server.js`, and open `http://localhost:3000`.

User data is stored in browser local storage. To share or move data between users/devices, use `Settings > Export JSON` and `Settings > Import JSON`.

## Sample Data

A compatible sample-data bookmarklet is available at `scripts/sample-data-bookmarklet.txt`. It adds demo transactions, goals, reminders, and adjustments for the currently logged-in local user.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
