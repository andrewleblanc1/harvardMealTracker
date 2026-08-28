"""FastAPI backend for the Harvard Dining app.

Deployed as a single Vercel Python serverless function (Vercel looks for a
`FastAPI` instance named `app` in api/index.py — see
https://vercel.com/docs/frameworks/backend/fastapi). The Next.js frontend
calls this directly at /api/py/menu; next.config.js rewrites that path to
this function in production and to a local uvicorn process in dev (see
README.md).

Exposes a single /api/py/menu endpoint. It fetches raw menu data from
Harvard's CS50 dining API, normalizes it via meals.standardNutritionFacts,
and optionally filters out items containing allergens the caller wants to
avoid.
"""

from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import FastAPI, HTTPException
from meals import standardNutritionFacts
import requests

app = FastAPI()

# CS50's API takes numeric meal/location ids rather than names, so we map the
# human-readable values used elsewhere in the app to those ids here.
mealId = {"breakfast" : 0, "lunch" : 1, "dinner" : 2}

locationId = {"adams" : 9, "annenberg" : 30, "cabot" : 5, "currier" : 38, "dunster" : 7, "eliot" : 14, "fly-by" : 29, "kirkland" : 14,
"leverett": 16, "lowell" : 15, "mather" : 7, "pforzheimer" : 5, "quincy" : 8, "winthrop" : 15}


def today_in_eastern() -> str:
    """Dining halls run on Eastern time regardless of where this function's
    server (or its UTC clock) actually runs, so "today" has to be computed in
    that zone — a naive UTC date would roll over ~4-5 hours early.
    """
    return datetime.now(ZoneInfo("America/New_York")).strftime("%Y-%m-%d")


def loadMeals(date: str, location: int, meal: int, allergens: list = []) -> list:
    """Fetch a menu from CS50's dining API and return normalized items.

    `menu` from the API is a flat list of served items that reference a
    recipe by id; recipes repeat across meals, so we de-duplicate by recipe
    and only include each distinct dish once. When `allergens` is given,
    any recipe flagged with one of those allergens is dropped entirely.
    """
    response = requests.get(
        "https://api.cs50.io/dining/menus",
        {"date": date, "location": location, "meal": meal}
    )
    menu = response.json()
    res = standardNutritionFacts(menu)
    fullMenu = res[0]
    indexConversion = res[1]
    standardizedMenu = []
    if len(allergens) == 0:
        # No allergen filter: just de-duplicate recipes and return them all.
        sett = set()
        for item in menu:
            recipeId = item['recipe']
            recipeId = indexConversion.get(recipeId)
            if recipeId not in sett:
                standardizedMenu.append(fullMenu[recipeId])
                sett.add(recipeId)
    else:
        # Allergen filter: de-duplicate recipes, then skip any recipe that
        # is flagged for one of the requested allergens.
        # Currently unused as there are not many menu items, thus
        # the current allergen labels should be fine
        # However, this has been implemented, if this feature
        # will be shipped in the future
        sett = set()
        for item in menu:
            recipeId = item['recipe']
            recipeId = indexConversion.get(recipeId)
            boo = 0
            if recipeId not in sett:
                sett.add(recipeId)
                curr = fullMenu[recipeId]
                allergies = curr.get("allergens")
                for allergen in allergens:
                    if allergies.get(allergen) == 1:
                        boo = 1
                if boo == 0:
                    standardizedMenu.append(fullMenu[recipeId])
    return standardizedMenu


@app.get("/api/py/menu")
def get_menu(hall: str, meal: str, date: str = None, allergens: str = ""):
    """Return the normalized menu for a given hall, meal, and date.

    `hall` and `meal` are validated against the lookup tables above and
    turned into the numeric ids the upstream API expects; `date` defaults to
    today in Eastern time when omitted; `allergens` is a comma-separated
    string (e.g. "peanut,dairy") that gets split into a list.
    """

    location = locationId.get(hall)
    mealNum = mealId.get(meal)
    if location is None:
        raise HTTPException(status_code=400, detail=f"Unknown hall: {hall}")
    if mealNum is None:
        raise HTTPException(status_code=400, detail=f"Unknown meal: {meal}")

    allergenList = allergens.split(",") if allergens else []
    items = loadMeals(date or today_in_eastern(), location, mealNum, allergenList)
    return {"items": items}
