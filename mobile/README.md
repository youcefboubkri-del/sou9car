# Sou9Car Mobile

Native iOS + Android app for Sou9Car, built with **Expo SDK 58** and **Expo Router**.
It talks to the same Next.js API as the website (`../src/app/api`), so there is no separate backend.

## Features (v1)

| Tab | What it does |
| --- | --- |
| **Annonces** | Browse listings with infinite scroll and pull-to-refresh, search, body-type chips, plus a full filter sheet (brand, city, price, year, mileage, fuel, gearbox, sort) |
| **Favoris** | Saved cars. The heart syncs across every screen |
| **Vendre** | 3-step listing wizard: vehicle → photos (gallery or camera, resized on device) → price & details |
| **Messages** | Conversations with unread badges; the chat polls every 5 s while it's open |
| **Profil** | Account, my listings (mark sold / delete), contact support, links to wallet / verification on the web |

Listing detail has a photo gallery, specs, credit info, seller card, Share, and Message / Call / WhatsApp actions.

## Run it

```bash
cd mobile
npm install
npx expo start            # scan the QR code with Expo Go, or press i / a for a simulator
```

By default the app uses the production API (`https://sou9car.ma`, set in `app.json → extra.apiUrl`).
To use your local backend instead:

```bash
# terminal 1 — repo root
npm run dev                                  # Next.js on :3002

# terminal 2
cd mobile
EXPO_PUBLIC_API_URL=http://<your-LAN-IP>:3002 npx expo start
```

Use your computer's LAN IP, not `localhost`: on a phone, `localhost` is the phone itself.

## Checks

```bash
npm run typecheck
npm run lint
```

## Build & publish (EAS)

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile preview --platform android   # installable APK for testers
npx eas-cli@latest build --profile production --platform all    # store builds
npx eas-cli@latest submit --platform all
```

Bundle IDs are `ma.sou9car.app` on both platforms (see `app.json`).

## How auth works

The website uses an httpOnly `session` cookie. The app sends `x-sou9car-client: mobile` on login/register,
so the API also returns the JWT in the JSON body. The app keeps it in `expo-secure-store` and sends
`Authorization: Bearer <token>`. `getSession()` in `src/lib/auth.ts` accepts either a cookie or a Bearer token,
so every existing API route works for both clients without changes.

## Project layout

```
src/
  app/                 # routes (Expo Router)
    (tabs)/            # Annonces, Favoris, Vendre, Messages, Profil
    listing/[id].tsx   # listing detail
    conversation/[id].tsx
    filters.tsx, login.tsx, register.tsx, my-listings.tsx
  components/          # CarCard, FavoriteButton, AuthGate, ui primitives
  lib/                 # api client, auth/favorites/filters contexts, constants, formatting
```

`src/lib/constants.ts` mirrors the enum values and labels in the web app's `src/lib/utils.ts`.
Keep the two in sync.

## Known gaps / next steps

- **Push notifications** for new messages (expo-notifications + a token column on `User`)
- **Real-time chat**: it polls today because the backend has no websocket/SSE yet
- **Image hosting**: photos are stored as base64 data URLs in the DB (same as the web form). Moving to object storage (S3/R2/Vercel Blob) would cut payload sizes a lot
- Wallet, escrow, inspections and boosts currently open on the website
- App icon & splash still use the Expo defaults. Replace the files in `assets/`
