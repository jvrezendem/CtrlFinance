(() => {
  const storageKey = "ctrlfinance-theme";
  const validThemes = new Set(["light", "dark", "system"]);
  let preference = "system";

  try {
    const saved = window.localStorage.getItem(storageKey);
    if (validThemes.has(saved)) preference = saved;
  } catch {
    preference = "system";
  }

  const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches === true;
  const resolved = preference === "system" ? (systemDark ? "dark" : "light") : preference;
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.dataset.themePreference = preference;
  root.style.colorScheme = resolved;

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.content = resolved === "dark" ? "#0D0B12" : "#F7F7FA";
})();
