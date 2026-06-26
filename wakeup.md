# Wakeup Guide: Deploy HaFi Serve Rwanda Online

## 1. Domain and email setup

### Free or low-cost domain options
- Cloudflare Registrar: often the cheapest reliable domain provider.
- Namecheap: standard domains can start at about $1–$2 for the first year for `.xyz`, `.online`, or `.site`.
- Freenom: may offer free domains like `.tk`, `.ml`, `.ga`, `.cf`, `.gq`, but these are not always ideal for email trust.

> If you have no money, the safest path is to use a low-cost domain from Namecheap or Cloudflare Registrar. Free domains are possible, but email deliverability and trust may be worse.

### Why your NameEU.org free domain may still be blocked
- Resend will only send to other recipients when you use a verified domain.
- Temporary or free domains often need manual approval and can be delayed or rejected.
- If NameEU.org has not replied, Resend cannot verify it, so email sending remains blocked.
- This is why your app can send only to your own Resend account and not to hotel owner emails.

### Can Supabase handle this without a domain?
- Supabase can host your backend and store data, but it does not replace the need for a verified email sender domain.
- Your frontend and backend can be hosted on Supabase/Vercel, but Resend still needs a verified `FROM_EMAIL` domain to send real emails.
- So: yes, Supabase can host the app, but no, it cannot bypass Resend's domain verification requirement.

### Recommended path if you need a working email system now
- Best: buy a cheap domain like `yourhotelplatform.online` or `yourhotelplatform.xyz`.
- Cheap domains usually cost between $1 and $5 for the first year.
- After buying, verify it in Resend and set `FROM_EMAIL` to something like `noreply@yourdomain.com`.

### If you still want to try free domains
- Freenom offers free domains but may not be trusted for email.
- Free domains can work for a website, but not always for sending business emails.
- If you try another free provider, make sure Resend can verify the domain before relying on it.

### Estimated cost again
- Cheap domains: $1–$5 for first year on promotional offers.
- Standard domains: $8–$15 per year for `.com`, `.net`, `.org`.
- Renewals may cost more than the first year.

### What you need after buying a domain
1. Verify the domain in Resend.
2. Add the DNS records Resend gives you.
3. Set `FROM_EMAIL` in the backend to a verified address on that domain.

Example:
- `noreply@yourdomain.com`
- `support@yourdomain.com`

---

## 2. Backend email config to update

### Files to change
- `supabase/functions/server/index.tsx`

### What to update once domain is ready
- In Resend dashboard: add and verify `yourdomain.com`.
- Set `FROM_EMAIL` to a verified sender address, for example:
  - `noreply@yourdomain.com`
  - `orders@yourdomain.com`

When deployed, the email code will use:
```ts
const fromEmail = Deno.env.get("FROM_EMAIL") || "HaFi Serve Rwanda <onboarding@resend.dev>";
```

So in production you should set:
- `RESEND_API_KEY`
- `FROM_EMAIL`

---

## 3. GitHub and Vercel hosting steps

### 3.1 Prepare GitHub repository
1. Create a new repository on GitHub.
2. In your project folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial HaFi Serve Rwanda project"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

### 3.2 Deploy to Vercel
1. Go to `https://vercel.com` and sign in.
2. Create a new project from GitHub and select your repository.
3. In Vercel project settings, add environment variables:
   - `RESEND_API_KEY`
   - `FROM_EMAIL`
4. If you use Supabase Edge Functions, Vercel can host the frontend and your Supabase project hosts the backend.

### 3.3 If you only need the frontend live
- Vercel can serve the React app directly.
- The backend email function remains on Supabase Edge Functions or another server.

---

## 4. Commands to run locally

### Install dependencies
```bash
cd "c:\Users\Admin\Desktop\Hotel Discovery Platform"
pnpm install
```

### Run locally
```bash
pnpm dev
```

### Build for production
```bash
pnpm build
```

---

## 5. What to do if you shut down your PC

Your website stays live if deployed to Vercel or another online host. Local PC power does not matter once the app is deployed.

If you want the backend email function live too, use Supabase Edge Functions or a similar hosted backend service.

---

## 6. Full checklist for going live

- [ ] Buy or get a domain
- [ ] Verify the domain in Resend
- [ ] Set `FROM_EMAIL` to a verified address
- [ ] Set `RESEND_API_KEY` in environment variables
- [ ] Push code to GitHub
- [ ] Connect GitHub repo to Vercel
- [ ] Set env vars in Vercel
- [ ] Deploy the frontend
- [ ] Confirm emails work with hotel owner addresses

---

## 7. Recommended path if you want free or cheap hosting
- Frontend: Vercel free tier
- Backend: Supabase free tier for functions
- Email: Resend free trial, then verified domain

---

## 8. Helpful notes
- Free domain providers exist but not great for email.
- Best reliable option: Cloudflare or Namecheap cheap domain.
- After domain verification, you can send to any hotel email address.
