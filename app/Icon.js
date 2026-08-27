'use client';

import { useState } from "react";

// Shows /icons/<id>.jpg if it exists; otherwise falls back to a colored
// circle with the hall's initial so a missing icon never looks broken.
export default function Icon({ id, name, className = "hall-icon" }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={className.replace("hall-icon", "hall-icon-fallback")}>
        {name?.[0] ?? "?"}
      </div>
    );
  }

  return (
    <img
      src={`/icons/${id}.jpg`}
      alt={`${name} icon`}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
