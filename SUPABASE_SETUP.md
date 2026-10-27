# Supabase setup

1. Create a project at https://supabase.com
2. SQL Editor -> paste and run `supabase/schema.sql`
3. Project Settings -> API -> copy the Project URL and anon public key
4. `cp .env.example .env` and fill in both values
5. Authentication -> Providers -> Email: turn off "Confirm email" while developing
   (otherwise sign-up asks the user to confirm by email before logging in)
6. `npm install && npm run dev`

For deployment (Vercel/Netlify/etc.), add the same two VITE_ variables in the host's settings.
