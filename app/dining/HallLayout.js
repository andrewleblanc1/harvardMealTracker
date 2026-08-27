"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "../Icon";

const meals = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
];

// Renders a single dining hall: meal tabs, that meal's menu, and a
// sidebar meal plan the user builds up by adding items. `id` is the hall's
// slug (used in the API call and icon lookup); `name` is the display name.
export default function HallLayout({ id, name }) {
  const [meal, setMeal] = useState("breakfast"); // which meal tab is active
  const [items, setItems] = useState([]); // menu items for the current hall+meal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState([]); // items the user has added, each with a `servings` count

  // Re-fetch the menu whenever the hall or selected meal changes. `cancelled`
  // guards against setting state after this effect has been superseded by a
  // newer one (e.g. the user switches meal tabs before the fetch resolves).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/menu?hall=${id}&meal=${meal}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setItems(data.items ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, meal]);

  // Adds an item to the plan (defaulting to 1 serving), or removes it if
  // it's already there — items are matched by name since menu items don't
  // carry a stable id from the API.
  function toggleInPlan(item) {
    setPlan((prev) =>
      prev.some((p) => p.name === item.name)
        ? prev.filter((p) => p.name !== item.name)
        : [...prev, { ...item, servings: 1}]
    );
  }

  // Updates how many servings of a planned item the user had. Non-numeric
  // or negative input is clamped to 0 rather than left invalid.
  function setServings(name, servings) {
    const value = Number(servings)
    setPlan((prev) => prev.map((p) => p.name === name
  ? { ...p, servings: Number.isFinite(value) && value > 0 ? value: 0}
    : p
  )
  );
  }
  // Unused helper kept for reference: would compute a single nutrient
  // total (e.g. nutrient(item, "calories")) scaled by servings. The totals
  // below inline this same logic per-macro instead.
  function nutrient(item, key) {
    const n = Number(String(item[key]).replace(/[^\d.]/g, "")) || 0;
    return n * (item.servings ?? 1);
  }

  // Nutrition values from the API can include units/whitespace (e.g. "12g"),
  // so each total strips non-numeric characters before multiplying by
  // servings, then rounds to one decimal place.
  const planCalories = plan.reduce(
    (sum, item) => sum + ((Math.round(10 * item.servings * Number(item.calories)) /10) || 0),
    0
  );
  const planProtein = plan.reduce(
    (sum, item) => sum + ((Math.round(10 * item.servings * Number(String(item.protein).replace(/[^\d.]/g, ""))) / 10) || 0),
    0
  );

  const planCarbs = plan.reduce(
    (sum, item) => sum + ((Math.round(10 * item.servings * Number(String(item.carbs).replace(/[^\d.]/g, ""))) / 10) || 0),
    0
  );

  const planFat = plan.reduce(
    (sum, item) => sum + ((Math.round(10 * item.servings * Number(String(item.fat).replace(/[^\d.]/g, ""))) / 10)|| 0),
    0
  );

  const planFiber = plan.reduce(
    (sum, item) => sum + ((Math.round(10 * item.servings * Number(String(item.fiber).replace(/[^\d.]/g, ""))) / 10) || 0),
    0
  );

  const planSugar = plan.reduce(
    (sum, item) => sum + ((Math.round(10 * item.servings * Number(String(item.sugar).replace(/[^\d.]/g, ""))) / 10) || 0),
    0
  );

  return (
    <div className="hall-page">
      <Link href="/" className="back-link">
        ← All dining halls
      </Link>
      <Icon id={id} name={name} />
      <h1>{name}</h1>

      <div className="meal-tabs" role="tablist" aria-label="Meal">
        {meals.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={meal === m.id}
            className={`meal-tab${meal === m.id ? " active" : ""}`}
            onClick={() => setMeal(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="hall-content">
        <div className="hall-main">
          {/* Menu list: loading/error/empty states, then the actual items. */}
          {loading && <p className="menu-status">Loading menu…</p>}
          {error && (
            <p className="menu-status menu-error">
              Couldn't load menu: {error}
            </p>
          )}
          {!loading && !error && items.length === 0 && (
            <p className="menu-status">No items found for this meal.</p>
          )}
          {!loading && !error && items.length > 0 && (
            <ul className="menu-list">
              {items.map((item, index) => {
                // allergens comes back as a {name: 1} map (see meals.py);
                // "None" is a sentinel for "no allergens" rather than a
                // real allergen, so it's filtered out of the badge list.
                const allergens = Object.keys(item.allergens ?? {}).filter(
                  (a) => a !== "None"
                );
                const added = plan.some((p) => p.name === item.name);

                return (
                  <li key={`${item.name}-${index}`} className="menu-item">
                    <div className="menu-item-header">
                      <span className="menu-item-name">{item.name}</span>
                      <span className="menu-item-serving">
                        {item.serving_size}
                      </span>
                      <span className="menu-item-calories">
                        {item.calories} cal
                      </span>
                      <button
                        type="button"
                        className={`menu-item-add${added ? " added" : ""}`}
                        aria-pressed={added}
                        aria-label={
                          added
                            ? `Remove ${item.name} from meal plan`
                            : `Add ${item.name} to meal plan`
                        }
                        onClick={() => toggleInPlan(item)}
                      >
                        {added ? "✓" : "+"}
                      </button>
                    </div>

                    <div className="menu-item-macros">
                      <span className="menu-item-macro">
                        Protein {item.protein}
                      </span>
                      <span className="menu-item-macro">
                        Carbs {item.carbs}
                      </span>
                      <span className="menu-item-macro">Fat {item.fat}</span>
                      <span className="menu-item-macro">
                        Fiber {item.fiber}
                      </span>
                      <span className="menu-item-macro">
                        Sugar {item.sugar}
                      </span>
                    </div>

                    {allergens.length > 0 && (
                      <div className="menu-item-allergens">
                        {allergens.map((allergen) => (
                          <span key={allergen} className="allergen-badge">
                            {allergen}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Sidebar: items the user has added, with editable serving counts
            and a running nutrition total across the whole plan. */}
        <aside className="meal-plan-panel">
          <h2 className="meal-plan-title">Meal Plan</h2>
          {plan.length === 0 ? (
            <p className="meal-plan-empty">
              Tap + on an item to add it here.
            </p>
          ) : (
            <>
              <ul className="meal-plan-list">
                {plan.map((item) => (
                  <li key={item.name} className="meal-plan-item">
                    <div className="meal-plan-item-info">
                    <div className="meal-plan-item-header">
                      <span className="meal-plan-item-name">{item.name}</span>
                      <input
                      type="number"
                      min="0"
                      step="0.5"
                      className="meal-plan-item-servings"
                      value={item.servings ?? 1}
                      aria-label={`Servings of ${item.name}`}
                    onChange={(e) => setServings(item.name, e.target.value)}
                    />
</div>
                    
                    <div className="meal-plan-item-macros">
                      <span className="meal-plan-item-calories">
                    {item.calories} cal, {item.protein} protein, {item.carbs} carbs, {item.fat} fat, {item.fiber} fiber, {item.sugar} sugar
                      </span>
                    </div>
                    </div>
                    <button
                      type="button"
                      className="meal-plan-item-remove"
                      aria-label={`Remove ${item.name} from meal plan`}
                      onClick={() => toggleInPlan(item)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              <div className="meal-plan-total">Total: {planCalories} cal, {planProtein} protein, {planCarbs} carbs, {planFat} fat, {planFiber} fiber, {planSugar} sugar</div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
