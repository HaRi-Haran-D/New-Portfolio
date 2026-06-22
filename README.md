# Portfolio & Template

> A minimal, motion-rich personal portfolio built with React + Vite. Designed to be fast, expressive, and easy to make your own.


---

## ✨ Features

- **Smooth scroll & animations** — powered by [Lenis](https://lenis.darkroom.engineering/), [GSAP](https://gsap.com/), and [Framer Motion](https://www.framer.com/motion/)
- **Multi-page SPA** — Home, Work, About, Contact, FAQ, and individual Project pages via React Router
- **Contact form with email delivery** — serverless `/api/contact` function using [Resend](https://resend.com/)
- **Bot protection** — honeypot field on the contact form
- **Vercel-ready** — one-click deploy with correct SPA + API routing out of the box
- **Analytics & performance** — Vercel Analytics and Speed Insights pre-wired
- **Centralised data layer** — all copy, navigation, projects, FAQs, and reviews live in `src/data/` — swap your content without touching UI code

---

## 🗂️ Project Structure

```
.
├── api/                    # Vercel serverless functions (contact endpoint)
├── public/                 # Static assets (images, fonts, resume PDF)
├── src/
│   ├── components/         # Reusable UI components (NavBar, Footer, animations, …)
│   ├── data/               # All site content — edit here to personalise
│   ├── pages/              # Route-level page components
│   └── utils/              # Shared utilities
├── templates/              # Email & form-response HTML templates
├── .env.example            # Environment variable reference
├── vercel.json             # Vercel routing config
└── vite.config.js
```

---
