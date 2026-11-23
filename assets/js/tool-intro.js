/* Shared first-visit intro for live and concept tool pages.
 * This is a presentation layer; it does not alter underlying tool calculations.
 */
(function () {
  "use strict";

  const script = document.currentScript;
  const explicit = script && script.dataset ? script.dataset.tool : "";
  const conceptId = new URLSearchParams(window.location.search).get("tool") || "";
  const projectId = explicit || conceptId;
  const tools = Array.isArray(window.PROTOTYPE_PROJECTS) ? window.PROTOTYPE_PROJECTS : [];
  const tool = tools.find((p) => p.id === projectId);
  if (!tool) return;

  const storageKey = "magenta-lab-intro-v2-" + projectId;
  const forceIntro = new URLSearchParams(window.location.search).get("intro") === "1";
  const getLanguage = () => {
    if (window.PROTOTYPE_LANG) return window.PROTOTYPE_LANG;
    try { return localStorage.getItem("magenta-lab-lang") === "en" ? "en" : "de"; }
    catch (_) { return "de"; }
  };
  const translated = (v, lang) => (v && typeof v === "object" ? (v[lang] || v.de || "") : (v || ""));
  let overlay, dialog, opener, lastFocus;
  let lang = getLanguage();

  function setLanguage(next) {
    lang = next === "en" ? "en" : "de";
    if (typeof window.PROTOTYPE_SET_LANG === "function") window.PROTOTYPE_SET_LANG(lang);
    else { try { localStorage.setItem("magenta-lab-lang", lang); } catch (_) {} }
    if (!dialog) return;
    dialog.querySelector("[data-intro-desc]").textContent = translated(tool.intro || tool.pitch, lang);
    dialog.querySelector("[data-intro-eyebrow]").textContent = lang === "de" ? "TOOL-KURZVORSTELLUNG" : "TOOL OVERVIEW";
    dialog.querySelector("[data-intro-status]").textContent = tool.status === "live" ? (lang === "de" ? "LIVE / NUTZBAR" : "LIVE / AVAILABLE") : "CONCEPT / COMING SOON";
    dialog.querySelector("[data-intro-subhead]").textContent = lang === "de" ? "Worum geht es?" : "What is it for?";
    dialog.querySelector("[data-intro-next]").textContent = lang === "de" ? "Tool ansehen ↗" : "Explore tool ↗";
    dialog.querySelector("[data-intro-note]").textContent = tool.status === "live"
      ? (lang === "de" ? "Die Berechnungen nutzen deine Angaben und Annahmen." : "Calculations use your inputs and assumptions.")
      : (lang === "de" ? "Diese Toolseite zeigt ausschließlich ein Mockup. Noch keine Verarbeitung oder Buchung möglich." : "This tool page is a concept preview. No processing or booking is available yet.");
    dialog.querySelectorAll("[data-intro-language]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.introLanguage === lang));
    });
    if (opener) opener.textContent = lang === "de" ? "ⓘ Tool-Info" : "ⓘ Tool info";
  }

  function wasSeen() { try { return localStorage.getItem(storageKey) === "1"; } catch (_) { return false; } }
  function remember() { try { localStorage.setItem(storageKey, "1"); } catch (_) {} }

  function hide() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove("intro-open");
    remember();
    if (lastFocus && document.contains(lastFocus) && typeof lastFocus.focus === "function") lastFocus.focus();
    else if (opener) opener.focus();
  }

  function show() {
    if (!overlay) return;
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add("intro-open");
    setLanguage(getLanguage());
    const first = dialog.querySelector("[data-intro-language='" + lang + "']");
    if (first) first.focus();
  }

  function init() {
    overlay = document.createElement("div");
    overlay.className = "intro-overlay";
    overlay.hidden = true;
    overlay.innerHTML = [
      '<section class="intro-dialog" role="dialog" aria-modal="true" aria-labelledby="intro-title" aria-describedby="intro-description">',
      '<div class="intro-head"><span class="intro-kicker" data-intro-eyebrow></span>',
      '<div class="intro-language" role="group" aria-label="Language / Sprache">',
      '<button type="button" data-intro-language="de">DE</button><button type="button" data-intro-language="en">EN</button></div></div>',
      '<span class="intro-status" data-intro-status></span>',
      '<h2 id="intro-title"></h2>',
      '<p class="intro-subhead" data-intro-subhead></p>',
      '<p class="intro-description" id="intro-description" data-intro-desc></p>',
      '<div class="intro-actions"><button type="button" class="intro-continue" data-intro-dismiss data-intro-next></button></div>',
      '<p class="intro-note" data-intro-note></p>',
      '</section>'
    ].join("");
    dialog = overlay.querySelector(".intro-dialog");
    dialog.querySelector("#intro-title").textContent = tool.title;
    document.body.appendChild(overlay);
    overlay.querySelectorAll("[data-intro-language]").forEach((b) => {
      b.addEventListener("click", () => setLanguage(b.dataset.introLanguage));
    });
    overlay.querySelector("[data-intro-dismiss]").addEventListener("click", hide);
    overlay.addEventListener("click", (event) => { if (event.target === overlay) hide(); });
    overlay.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { event.preventDefault(); hide(); return; }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialog.querySelectorAll("button:not([disabled])"));
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    const ownButtons = document.querySelectorAll("[data-open-intro]");
    if (ownButtons.length) ownButtons.forEach((button) => {
      opener = button;
      button.addEventListener("click", show);
    });
    else {
      opener = document.createElement("button");
      opener.type = "button";
      opener.className = "tool-intro-reopen";
      opener.addEventListener("click", show);
      document.body.appendChild(opener);
    }
    window.MAGENTA_OPEN_TOOL_INTRO = show;
    window.addEventListener("prototype:language", (event) => {
      const next = event.detail && event.detail.lang;
      if (next && next !== lang) setLanguage(next);
    });
    setLanguage(lang);
    // A new intro revision is shown once, independently of previously dismissed versions.
    if (forceIntro || !wasSeen()) show();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();