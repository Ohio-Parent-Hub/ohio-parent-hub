"use client";

import { useCallback, useState, useTransition } from "react";

export default function CitySearchFilter() {
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    startTransition(() => {
      const normalised = value.trim().toLowerCase();
      const groups = document.querySelectorAll<HTMLElement>("[data-city-group]");
      const letterNav = document.querySelectorAll<HTMLElement>("[data-letter-nav]");

      const visibleLetters = new Set<string>();

      groups.forEach((group) => {
        const cards = group.querySelectorAll<HTMLElement>("[data-city-name]");
        let anyVisible = false;

        cards.forEach((card) => {
          const name = card.getAttribute("data-city-name")!.toLowerCase();
          const match = !normalised || name.includes(normalised);
          card.style.display = match ? "" : "none";
          if (match) anyVisible = true;
        });

        group.style.display = anyVisible ? "" : "none";
        if (anyVisible) {
          visibleLetters.add(group.getAttribute("data-city-group")!);
        }
      });

      letterNav.forEach((el) => {
        const letter = el.getAttribute("data-letter-nav")!;
        el.style.display = visibleLetters.has(letter) ? "" : "none";
      });

      const empty = document.getElementById("city-no-results");
      if (empty) empty.style.display = visibleLetters.size === 0 ? "" : "none";
    });
  }, []);

  return (
    <div className="mb-4">
      <label htmlFor="city-search" className="mb-2 block text-sm font-medium text-foreground">
        Search for a city
      </label>
      <input
        id="city-search"
        value={query}
        onChange={handleChange}
        placeholder="Start typing a city name..."
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
      />
    </div>
  );
}
