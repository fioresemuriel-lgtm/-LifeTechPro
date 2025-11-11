(function () {
  const cfg = JSON.parse(localStorage.getItem("agroscan_cfg")) || {};

  if (cfg.color)
    document.documentElement.style.setProperty("--card", cfg.color);

  if (cfg.name)
    document.querySelectorAll("header h1").forEach(h=> h.textContent = cfg.name);

  if (cfg.fontSize)
    document.body.style.fontSize = cfg.fontSize;

  if (cfg.modo === "escuro") document.body.classList.add("dark");
  else document.body.classList.remove("dark");

  // set HTML lang attribute if provided
  if (cfg.lang) document.documentElement.lang = cfg.lang;
})();
