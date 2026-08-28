"""Normalizes raw recipe data from CS50's dining API into a consistent shape.

Fields in the raw API response can be missing or use inconsistent nesting
(e.g. a macro is either an object with an "amount" or None), so this module
flattens everything into plain strings the frontend can render directly.
"""

import requests

response = requests.get("https://api.cs50.io/dining/recipes")
recipes = response.json()

def standardNutritionFacts(recipes: dict) -> [standardizedNutritionFacts, indexConversion]:
    """Build a normalized recipe list plus a recipe-id -> list-index map.

    `indexConversion` lets callers (see index.py) look up a recipe's entry in
    `standardizedNutritionFacts` by the raw recipe id used in menu items,
    since the standardized list itself is just indexed 0..n.
    """
    response = requests.get("https://api.cs50.io/dining/recipes")
    recipes = response.json()
    indexConversion = {}
    standardizedNutritionFacts = []
    for i, recipe in enumerate(recipes):
        indexConversion.update({recipe['id'] : i})
        name = recipe["name"]
        serving_size = recipe["serving_size"]
        if serving_size is None:
            pass
        calories = str(recipe["calories"])
        if calories is None:
            calories = "0"
        # Macro fields are either {"amount": ...} objects or None (missing
        # nutrition data), so normalize each one down to a plain amount.
        protein = recipe["protein"]
        if protein is not None:
            protein = protein["amount"]
        else:
            protein = "0"
        carbs = recipe["total_carb"]
        if carbs is not None:
            carbs = carbs["amount"]
        else:
            carbs = "0"
        fat = recipe["total_fat"]
        if fat is not None:
            fat = fat["amount"]
        else:
            fat = "0"
        fiber = recipe["dietary_fiber"]
        if fiber is not None:
            fiber = fiber["amount"]
        else:
            fiber = "0"
        sugar = recipe["sugars"]
        if sugar is not None:
            sugar = sugar["amount"]
        else:
            sugar = "0"
        # Allergens come back as a list of allergen names (or empty/None);
        # turn that into a {allergen: 1} lookup dict so the frontend can
        # just check `allergens.get(name)` instead of scanning a list.
        allergens = recipe["allergens"]
        if allergens is not None and len(allergens) != 0:
            pass
        else:
            allergens = "None"
        allergensDict = {}
        if allergens == "None":
            allergensDict = {"None": 1}
        else:
            for allergen in allergens:
                allergensDict.update({allergen: 1})
        newDict = {"name" : name, "serving_size" : serving_size, "calories" : calories, "protein": protein,
        "carbs" : carbs, "fat" : fat, "fiber" : fiber, "sugar" : sugar, "allergens" : allergensDict}
        standardizedNutritionFacts.append(newDict)
    return [standardizedNutritionFacts, indexConversion]
