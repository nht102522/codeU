# CodeU

Run the frontend and backend in separate terminals from the project root.

Frontend:

```sh
cd client
npm install
npm run dev
```

Open http://localhost:5173 (or the URL Vite prints if that port is occupied).

Backend:

```sh
cd server
npm install
npm run server
```

The API defaults to http://localhost:4000. `npm start` also runs the backend,
without automatic restarts. Configure `MONGODB_URL` in `server/.env`; the backend
connects to MongoDB before it starts listening. Set `VITE_BACKEND_URL` in
`client/.env` to `http://localhost:4000` for local development. Restart Vite after
changing environment variables.

Email verification also needs `SENDER_EMAIL` and either `BREVO_API_KEY` (Brevo
HTTP API) or `SMTP_USER` plus `SMTP_PASS` (SMTP) in `server/.env`. The HTTP API
takes priority when its key is configured. SMTP defaults to
`smtp-relay.brevo.com:587` with STARTTLS; optional `SMTP_HOST` and `SMTP_PORT`
override the relay settings. `SMTP_PASS` must be an SMTP key, which is separate
from a Brevo API key. `SENDER_NAME` is optional. Restart the backend after
changing environment variables. Hosted servers that block SMTP ports should
use `BREVO_API_KEY`.

The Python editor runs Python 3.14 in a browser worker using a pinned Pyodide
runtime. The first run downloads the runtime from jsDelivr and needs an internet
connection; it needs no code execution API key or backend connection. Expand
**Standard input** to supply values for `input()`, one value per line, before
clicking **Run Code**. Use **Stop** to cancel execution. Runs have a 10-second
execution limit and a 64 KB output limit, and each run starts with a clean
interpreter and virtual filesystem. Python programs cannot access files on your
computer; example data files must be created in the program.

Other language options still use the external Piston service, whose hosted API
requires authorization. They report an unavailable-runner message when access
is denied. See [Piston's public API notice](https://github.com/engineer-man/piston#public-api).

Build the frontend for production with `cd client` followed by `npm run build`.
Run the runner lifecycle regression tests with `npm test` in `client`.
