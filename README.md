# Harvard Dining

A web app for browsing Harvard dining hall menus, checking nutrition facts and
allergens, and building a running meal plan with totals for calories, protein,
carbs, fat, fiber, and sugar.

## How it works

- **Frontend** — a [Next.js](https://nextjs.org/) app (`app/`) that lists all
  Harvard dining halls, lets you pick a meal (breakfast/lunch/dinner), and
  shows that meal's menu. Adding an item to your meal plan lets you set how
  many servings you had and keeps a running nutrition total.
- **Backend** — a small [FastAPI](https://fastapi.tiangolo.com/) service
  (`app/main.py`, `app/meals.py`) that calls Harvard's CS50 dining API,
  normalizes the raw recipe data into a consistent shape, and optionally
  filters out items containing allergens you specify.
- The Next.js route `app/api/menu/route.js` sits in between as a same-origin
  proxy: the browser only ever talks to Next.js, which forwards the request
  to the FastAPI backend. This keeps the backend's URL out of client code.

```
Browser → Next.js (app/api/menu) → FastAPI (app/main.py) → CS50 Dining API
```

## Project structure

```
app/
  page.js                 Home page — grid of dining halls to choose from
  layout.js               Root HTML layout + page metadata
  Icon.js                 Dining hall icon with a fallback if the image 404s
  globals.css             All app styling
  api/menu/route.js       Next.js API route that proxies to the FastAPI backend
  dining/
    HallLayout.js         Shared UI for a single hall: meal tabs, menu list,
                           meal-plan sidebar with nutrition totals
    <hall-name>/page.js   One tiny page per dining hall that renders
                           HallLayout with that hall's id/name
  main.py                 FastAPI app — /menu endpoint, hall/meal lookups
  meals.py                Normalizes raw CS50 recipe data into a consistent
                           dict shape (name, calories, macros, allergens)
public/icons/             Dining hall photos used by Icon.js
```

## Running it locally

You need two processes running at once: the Next.js frontend and the
FastAPI backend it proxies to.

### 1. Frontend (Next.js)

```bash
npm install
npm run dev
```

This starts the app at `http://localhost:3000`.

### 2. Backend (FastAPI)

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

By default the Next.js proxy expects the backend at `http://localhost:8001`.
To point it somewhere else, set `FASTAPI_URL` (e.g. in `.env.local`):

```
FASTAPI_URL=http://localhost:8001
```

## API

`GET /api/menu` (Next.js, proxied to FastAPI's `GET /menu`)

| Param       | Required | Description                                              |
|-------------|----------|-----------------------------------------------------------|
| `hall`      | yes      | Dining hall id, e.g. `annenberg`, `adams`, `quincy`        |
| `meal`      | yes      | `breakfast`, `lunch`, or `dinner`                          |
| `date`      | no       | `YYYY-MM-DD`; defaults to today in Eastern time            |
| `allergens` | no       | Comma-separated allergens to exclude, e.g. `peanut,dairy`  |

Returns `{ "items": [ ... ] }`, where each item has `name`, `serving_size`,
`calories`, `protein`, `carbs`, `fat`, `fiber`, `sugar`, and `allergens`.

## Notes

- Menu and nutrition data comes from Harvard's CS50 dining API
  (`api.cs50.io`), so the app requires network access to that service.
- Dining hall icons live in `public/icons/<hall-id>.jpg`; if one is missing,
  `Icon.js` falls back to a colored circle with the hall's initial.

## Reflection

