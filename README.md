# Sci Lezioni

App per maestri di sci: login, registrazione lezioni (inizio, fine, pausa, luogo), sincronizzazione su Google Calendar, calendario admin e export Excel mensile per il calcolo paga.

Stack: **Next.js 14**, **Prisma**, **PostgreSQL**, deploy su **Railway**.

## Funzionalità

- Accesso distinto per **maestro** e **admin**
- Form lezione: ora inizio, ora fine, pausa in minuti, luogo, note
- Ore nette = (fine − inizio) − pausa
- Evento creato/aggiornato/eliminato su **Google Calendar** (service account)
- Admin: calendario mensile di tutte le lezioni
- Admin: download Excel per utente/mese (ore e importo)
- Admin: creazione account maestri e tariffa oraria

## Account di prova (dopo lo seed)

| Ruolo   | Email             | Password    |
|---------|-------------------|-------------|
| Admin   | admin@scuola.it   | admin123    |
| Maestro | mario@scuola.it   | maestro123  |

Cambia subito le password in produzione.

## Avvio in locale

1. Installa PostgreSQL e crea un database `sci_lezioni`.
2. Copia le variabili:

```bash
cp .env.example .env
```

3. Installa e avvia:

```bash
npm install
npx prisma migrate deploy
npx tsx prisma/seed.ts
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Repository GitHub

```bash
cd sci-lezioni
git init
git add .
git commit -m "Prima versione Sci Lezioni"
gh repo create sci-lezioni --private --source=. --remote=origin --push
```

Oppure crea il repo vuoto su GitHub e:

```bash
git remote add origin git@github.com:TUO-USER/sci-lezioni.git
git branch -M main
git push -u origin main
```

## Deploy su Railway

1. Crea un progetto su [Railway](https://railway.app) → **New** → **GitHub Repo** → seleziona `sci-lezioni`.
2. **+ New** → **Database** → **PostgreSQL**.
3. Sul servizio Next.js, in **Variables**:
   - `DATABASE_URL` = reference a `Postgres.DATABASE_URL`
   - `AUTH_SECRET` = stringa lunga casuale
   - `GOOGLE_CALENDAR_ID` = id del calendario (opzionale)
   - `GOOGLE_SERVICE_ACCOUNT_JSON` = JSON del service account in **una riga** (opzionale)
4. **Settings → Deploy**:
   - Pre-deploy command: `npx prisma migrate deploy`
   - Start command (se non usi `railway.toml`): `npx prisma generate && npm run start`
5. Genera un dominio pubblico in **Settings → Networking**.

Al primo avvio lo seed crea admin e un maestro di esempio.

### Nota su `standalone`

`next.config.mjs` usa `output: "standalone"`. Se lo start command di Railway non trova `server.js`, usa:

```
npx prisma migrate deploy && npm run start
```

## Google Calendar

1. Google Cloud Console → nuovo progetto → abilita **Google Calendar API**.
2. IAM → **Service account** → crea → scarica la chiave JSON.
3. Apri il calendario della scuola → Impostazioni → Condividi con `...@....iam.gserviceaccount.com` con permesso **Apporta modifiche agli eventi**.
4. Copia l’**ID calendario** (spesso l’indirizzo del calendario).
5. Incolla ID e JSON in Railway **oppure** nella pagina Admin → Maestri.

Senza queste variabili l’app funziona lo stesso: le lezioni restano nel database e nel calendario interno.

## Calcolo paga (Excel)

Colonne: data, giorno, inizio, fine, pausa, luogo, note, ore nette, tariffa, importo.  
Foglio *Riepilogo* con totale ore e totale da pagare.

## Sicurezza

- Cambia `AUTH_SECRET` e le password seed.
- Non committare `.env` né il JSON del service account.
- Per una scuola reale valuta 2FA e reset password via email.
