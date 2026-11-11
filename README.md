# CENB · Suprem Poker bot control room

A project of its own, at **cenb.suprempoker.com**. It serves the panel and passes every panel request to the poker server's CENB interface (`https://suprempoker.com/api/cenb/...`), where the bots play.

CENB keeps no data of its own. The CENB sign-in, the bots and the house limits live on the poker server. No npm dependencies; Node 22.

## Run locally

```
PORT=3101 POKER_URL=http://localhost:3100 node server.js
```

## Coolify

1. New resource → this GitHub repository → Build Pack **Dockerfile**, port **3000**.
2. Domain: `https://cenb.suprempoker.com`.
3. No environment variables are needed. `POKER_URL` defaults to `https://suprempoker.com`.
4. No persistent storage is needed.

DNS (Hostinger): `A` record `cenb` → the server IP.

## First visit

The panel shows **"Krijo hyrjen e CENB"**:

1. Confirm once with the center's poker username and password.
2. Choose the CENB username (default `cenb`) and a password of at least 12 characters.

After that, only the CENB username and password open CENB. The password is changed in **Limitet → Fjalëkalimi i CENB**.
