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
  (`api/index.py`, `api/meals.py`) that calls Harvard's CS50 dining API,
  normalizes the raw recipe data into a consistent shape, and optionally
  filters out items containing allergens you specify. It's deployed as its
  own [Vercel Python serverless function](https://vercel.com/docs/frameworks/backend/fastapi) —
  Vercel builds any `api/*.py` file with an `app` FastAPI instance
  automatically, no separate server to run in production.
- The browser calls the backend directly at `/api/py/menu` (same origin, so
  there's no separate URL to expose). `next.config.js` rewrites that path to
  a local `uvicorn` process during `next dev`, since that's the only piece
  Next.js's dev server doesn't also run for you.

```
Browser → /api/py/menu → FastAPI (api/index.py) → CS50 Dining API
```

## Project structure

```
app/
  page.js                 Home page — grid of dining halls to choose from
  layout.js               Root HTML layout + page metadata
  Icon.js                 Dining hall icon with a fallback if the image 404s
  globals.css             All app styling
  dining/
    HallLayout.js         Shared UI for a single hall: meal tabs, menu list,
                           meal-plan sidebar with nutrition totals
    <hall-name>/page.js   One tiny page per dining hall that renders
                           HallLayout with that hall's id/name
api/
  index.py                FastAPI app — /api/py/menu endpoint, hall/meal
                           lookups (Vercel builds this as its own function)
  meals.py                Normalizes raw CS50 recipe data into a consistent
                           dict shape (name, calories, macros, allergens)
public/icons/             Dining hall photos used by Icon.js
next.config.js            Dev-only rewrite of /api/py/* to local uvicorn
requirements.txt          Python deps for the api/ serverless function
```

## Running it locally

You need two processes running at once: the Next.js frontend and the
FastAPI backend it calls.

### 1. Frontend (Next.js)

```bash
npm install
npm run dev
```

This starts the app at `http://localhost:3000`.

### 2. Backend (FastAPI)

```bash
pip install -r requirements.txt
cd api && uvicorn index:app --reload --port 8000
```

`next.config.js` expects the backend at `http://127.0.0.1:8000` during dev;
in production Vercel routes `/api/py/*` straight to the deployed function,
no configuration needed.

## API

`GET /api/py/menu` (FastAPI, deployed as a Vercel serverless function)

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

- Why did I build this website?
Quite simply, I recognized a problem in my everyday life that could be solved
through a personal project. Thus the prospect of creating a website that handled 
my daily struggle of having to go through numerous links (10 + links per meal)  
on the Harvard Dining website to track my calories and macronutrients throughout 
the day was very appealing. The specific new features that this website provides
are a macronutrient calculator and basic nutrition facts all on one page.
- Challenges and key decisions
The CS50 api documentation is all written in python. Thus a big challenge was
calling the api using a javascript framework like next.js. However, through 
discussions with my colleagues and my own research, I quickly found FastApi 
to solve this problem. I chose this specific web framework due to its fast speeds

Another challenge was designing the UI and coding the frontend of this app. I am
not very experienced in frontend development and designing UI since my area of 
expertise is on the backend. However, I was able to use claude to find templates 
for my frontend that greatly simplified this process and saved me countless days
of coding.
- What I would do differently
if I were to make changes, it would be to have an automated process (like a github action)
to load the menu at the beginning of each day and store it on the backend instead of 
constantly making API calls. This would speed up the loading time greatly. Other improvements
include cleaning up the user interface, adding an allergen feature, and a food diary for
users that sign in. I did not make these changes simply because the school year starts next 
week and the current version of the app accomplishes the goals I set forth at the beginning.
- What I learned
The biggest learning moments were learning how to do frontend development with react and 
next.js. I have used an html, css, and flask framework before, but for modern web 
development, this framework seemed outdated and slow. Thus it was great to finally dive into 
the deep end with next.js and fastapi. I spend two days learning how to use React and Javascript basics. 
While I will admit Claude did a lot of work on the frontend, learning how to code in next.js allowed 
me to catch bugs and make my own minor tweaks such as adding the macronutrient calculator, and allowing
users to modify servings sizes. Overall, this whole experience was greatly rewarding as it was my first
real experiment using the next.js + fastapi framework.I look forward to continuing my learning journey
through more projects in the future.




