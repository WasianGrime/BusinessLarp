const UP = [
  "{name} announces pivot to AI-powered blockchain synergy",
  "{name} CEO says \"circle back\" 412 times on earnings call; analysts thrilled",
  "{name} replaces entire board with one LinkedIn influencer",
  "{name} rebrands logo from blue to a slightly different blue",
  "{name} reports record Q3 vibes",
  "Leaked memo confirms {name} has \"moved the needle\"",
  "{name} achieves company-wide inbox zero",
  "{name} adds \"Web4\" to its website footer",
  "{name} intern's spreadsheet accidentally becomes a unicorn",
  "{name} declares every Friday a \"deep work\" day; productivity up 0.2%",
  "{name} unveils roadmap consisting entirely of the word \"leverage\"",
  "{name} beats earnings expectations it set itself",
];

const DOWN = [
  "{name} CFO caught using Comic Sans in investor deck",
  "{name} admits \"disruption\" was a typo",
  "{name} all-hands meeting runs six hours over",
  "{name} intern replies-all to 40,000 employees",
  "{name} return-to-office mandate met with mass \"per my last email\"",
  "Audit finds {name} synergy levels \"merely adequate\"",
  "{name} pizza party fails to restore morale",
  "{name} CEO's motivational post gets ratioed",
  "{name} discovers its KPIs were measuring KPIs",
  "{name} loses Wi-Fi password, operations halted",
  "{name} quarterly report just says \"we tried\"",
  "{name} mascot quits to become a thought leader",
];

export function makeHeadline(name: string, up: boolean): string {
  const pool = up ? UP : DOWN;
  return pool[Math.floor(Math.random() * pool.length)].replace("{name}", name);
}
