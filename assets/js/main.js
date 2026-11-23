(function () {
  "use strict";

  const projects = Array.isArray(window.PROTOTYPE_PROJECTS) ? window.PROTOTYPE_PROJECTS : [];
  const page = document.body.dataset.page || "";
  const translations = {
    de: {
      skip:"Zum Inhalt springen",navHome:"Start",navTools:"Tools",navJourney:"Toolchain",
      heroTag:"Ideas. Tools. Impact.",heroLine1:"Weniger Buzzwords.",heroLine2:"Mehr Wirkung.",
      heroText:"Von der ersten KI-Idee bis zur belastbaren Roadmap. Interaktive Tools und Konzepte für bessere, nachvollziehbare Entscheidungen.",
      discover:"Tools entdecken",journeyLink:"Die Toolchain ansehen",oneLive:"1 Live-Tool",sevenConcepts:"7 Konzepte in Planung",
      heroVisualNote:"Ein vernetzter Werkzeugkasten statt isolierter KI-Experimente.",
      featuredTitle:"Direkt ausprobieren.",featuredSub:"Ein echter Business Case statt Bauchgefühl.",allTools:"Alle Tools",
      connected:"CONNECTED THINKING",journeyTitle:"Von der Frage zur Umsetzung.",
      journeySub:"Die geplanten Tools bauen fachlich aufeinander auf und teilen perspektivisch strukturierte Ergebnisse.",
      journey1:"Wirtschaftlichkeit prüfen",journey2:"Architektur auswählen",journey3:"Routing, Harness und Prompt",journey4:"Reifegrad und Prioritäten",
      conceptDisclaimer:"Die Toolchain ist ein Produktkonzept. Nur AI or Nay ist derzeit funktional; alle weiteren Module sind Vorschauen.",
      disclaimer:"Unabhängige Prototypensammlung im Telekom-inspirierten Design. Keine offizielle Produkt- oder Buchungsseite.",
      footerTools:"Tool-Übersicht ↗",footerHome:"Startseite ↗",
      catalogTitle1:"Tools für",catalogTitle2:"echte Wirkung.",catalogLead:"Ein produktives Tool. Sieben konkrete Produktideen. Alle ausgerichtet auf KI-Effizienz, gute Architektur und messbaren Nutzen.",
      chipLive:"Live nutzbar",chipSoon:"Coming-Soon-Mockups",overviewLabel:"OVERVIEW",catalogSub:"Alle Anwendungen",
      searchLabel:"Tools durchsuchen",searchPlaceholder:"Tools durchsuchen",filterAll:"Alle",filterLive:"Live",filterSoon:"Coming Soon",
      backTools:"Zurück zu allen Tools",soonStamp:"CONCEPT / COMING SOON",mockLabel:"ILLUSTRATIVES PRODUKTKONZEPT",
      conceptPreview:"So könnte das Tool aussehen.",illustrative:"Beispielansicht",exampleOutput:"BEISPIELHAFTE AUSGABE",
      mockFootnote:"Keine echte Verarbeitung oder Berechnung. Alle Angaben in dieser Vorschau sind beispielhaft.",
      plannedFlow:"GEPLANTER ABLAUF",stepsTitle:"Vom Input zur Entscheidung",connectedTool:"CONNECTED TOOL",nextTitle:"Wie geht es weiter?",
      ideaTitle:"Die Idee dahinter",accessEyebrow:"ACCESS CONCEPT",accessTitle:"So könnte der Zugang aussehen.",
      accessLead:"Reine Preis- und Lizenzideen zur Illustration. Keine echten Angebote, Buchungen oder Zahlungen.",
      oneTime:"einmalig",plan48:"48 Stunden Zugang zu einem Tool und Beispiel-Exports.",
      plan7:"Sieben Tage Zugang, gespeicherte Entwürfe und Variantenvergleich.",
      planTeam:"Teamzugang, gemeinsame Ergebnisse und strukturierte Exportformate.",
      notAvailable:"Nicht verfügbar",
      pricingNote:"* Alle Preise sind vollständig fiktive Mockup-Werte. Keine Kaufabwicklung, Zugangsverwaltung, Accounts oder Backend.",
      moreToolsTitle:"Noch mehr Ideen entdecken.",toolInfo:"Tool-Info ⓘ",
      countOne:"Prototyp",countMany:"Prototypen",empty:"Keine passenden Tools gefunden.",open:"Tool öffnen",
      preview:"Produktvorschau",soon:"Coming Soon",live:"Live",nextPrefix:"Weiter mit",
      catalogAccessTitle:"Ein Tool oder die ganze Suite?",catalogAccessText:"Konfiguriere Laufzeit, Toolumfang und fiktive Lizenzpreise im interaktiven Access-Studio.",catalogAccessButton:"Access-Konzept entdecken",
      homeAccessTitle:"Ein Tool testen oder die gesamte Suite?",homeAccessText:"Erlebe ein fiktives Lizenzmodell mit Toolauswahl, Laufzeiten und einem digitalen Access-Pass.",homeAccessButton:"Access-Modell ansehen",
      teaserTitle:"Einzeltool, Suite oder Team-Pass?",teaserBody:"Erstelle ein fiktives Access-Modell für dieses Tool: Wähle Laufzeit und Umfang, sieh einen Beispielpreis und erkunde den digitalen Pass.",
      teaserDisclaimer:"Reines Mockup. Keine echte Buchung oder Freischaltung.",teaserFrom:"BEISPIEL AB",teaserDepends:"Je nach Umfang und Dauer",teaserButton:"Access konfigurieren"
    },
    en: {
      skip:"Skip to content",navHome:"Home",navTools:"Tools",navJourney:"Toolchain",
      heroTag:"Ideas. Tools. Impact.",heroLine1:"Less buzz.",heroLine2:"More impact.",
      heroText:"From an AI idea to an actionable roadmap. Interactive tools and concepts for more transparent, better decisions.",
      discover:"Explore tools",journeyLink:"Explore the toolchain",oneLive:"1 live tool",sevenConcepts:"7 concepts in progress",
      heroVisualNote:"A connected toolbox instead of isolated AI experiments.",
      featuredTitle:"Ready to explore.",featuredSub:"A real business case instead of a gut feeling.",allTools:"All tools",
      connected:"CONNECTED THINKING",journeyTitle:"From question to delivery.",
      journeySub:"The proposed tools form a connected workflow and could exchange structured outputs in the future.",
      journey1:"Assess the business case",journey2:"Select architecture",journey3:"Routing, harness and prompts",journey4:"Maturity and priorities",
      conceptDisclaimer:"The toolchain is a product concept. Only AI or Nay currently works; all other modules are previews.",
      disclaimer:"Independent prototype collection inspired by Telekom's magenta visual style. Not an official product or booking site.",
      footerTools:"Tool overview ↗",footerHome:"Homepage ↗",
      catalogTitle1:"Tools for",catalogTitle2:"real impact.",catalogLead:"One live tool. Seven specific product concepts, focused on AI efficiency, sound architecture and measurable value.",
      chipLive:"Ready to use",chipSoon:"Coming-soon mockups",overviewLabel:"OVERVIEW",catalogSub:"All applications",
      searchLabel:"Search tools",searchPlaceholder:"Search tools",filterAll:"All",filterLive:"Live",filterSoon:"Coming Soon",
      backTools:"Back to all tools",soonStamp:"CONCEPT / COMING SOON",mockLabel:"ILLUSTRATIVE PRODUCT CONCEPT",
      conceptPreview:"What the tool could look like.",illustrative:"Sample view",exampleOutput:"EXAMPLE OUTPUT",
      mockFootnote:"No real processing or calculation. All content in this preview is illustrative.",
      plannedFlow:"PROPOSED FLOW",stepsTitle:"From input to decision",connectedTool:"CONNECTED TOOL",nextTitle:"What's next?",
      ideaTitle:"The idea",accessEyebrow:"ACCESS CONCEPT",accessTitle:"What access could look like.",
      accessLead:"Illustrative pricing and licensing ideas only. No real offers, bookings or payments.",
      oneTime:"one-off",plan48:"48-hour access to one tool and example exports.",
      plan7:"Seven-day access, saved drafts and scenario comparisons.",
      planTeam:"Team access, shared results and structured export formats.",
      notAvailable:"Unavailable",
      pricingNote:"* All prices are entirely fictitious mockup values. No checkout, access management, accounts or backend exist.",
      moreToolsTitle:"Discover more concepts.",toolInfo:"Tool info ⓘ",
      countOne:"prototype",countMany:"prototypes",empty:"No matching tools found.",open:"Open tool",
      preview:"Concept preview",soon:"Coming Soon",live:"Live",nextPrefix:"Continue with",
      catalogAccessTitle:"One tool or the whole suite?",catalogAccessText:"Explore durations, scope and fictional licence prices in our interactive access studio.",catalogAccessButton:"Explore access concept",
      homeAccessTitle:"Try one tool or the entire suite?",homeAccessText:"Explore a fictional licensing model with tool choice, durations and a digital access pass.",homeAccessButton:"View access concept",
      teaserTitle:"Single tool, full suite or team pass?",teaserBody:"Configure a fictional access model for this tool: choose duration and scope, see an example price and explore a digital pass.",
      teaserDisclaimer:"Mockup only. No real booking or activation.",teaserFrom:"EXAMPLE FROM",teaserDepends:"Depends on scope and duration",teaserButton:"Configure access"
    }
  };

  function getLang() {
    try { return localStorage.getItem("magenta-lab-lang") === "en" ? "en" : "de"; }
    catch (_) { return "de"; }
  }
  let lang = getLang();
  let activeFilter = "all";
  const tr = (key) => translations[lang][key] || key;
  const loc = (value) => (typeof value === "object" && value !== null) ? (value[lang] || value.de || "") : (value || "");

  function el(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = String(content);
    return node;
  }

  function createCard(project, featured) {
    const article = el("article", (featured ? "project-card is-featured" : "project-card") + (project.status === "soon" ? " is-concept" : " is-live"));
    const body = el("div", "project-body");
    const meta = el("div", "project-meta");
    meta.appendChild(el("span", "category-label", project.category || "AI"));
    const status = el("span", project.status === "live" ? "status status-live" : "status status-soon", project.status === "live" ? tr("live") : tr("soon"));
    meta.appendChild(status);
    body.appendChild(meta);
    const title = el("h3", "project-title", project.title);
    if (project.id === "ai-or-nay") title.appendChild(el("span", "ai-roi-subtitle", " - Calculate the ROI of your AI use-case"));
    body.appendChild(title);
    body.appendChild(el("p", "project-description", loc(project.description)));
    const tags = el("div", "project-tags");
    (project.tags || []).forEach((item) => tags.appendChild(el("span", "project-tag", item)));
    body.appendChild(tags);
    const link = el("a", "project-link");
    link.href = project.href;
    link.textContent = project.status === "live" ? tr("open") + " ↗" : tr("preview") + " ↗";
    link.setAttribute("aria-label", project.title + " – " + (project.status === "live" ? tr("open") : tr("preview")));
    body.appendChild(link);

    const visual = el("div", "card-visual");
    visual.setAttribute("aria-hidden", "true");
    visual.appendChild(el("span", "visual-overline", (project.stage || "Explore").toUpperCase() + " / " + (project.status === "live" ? "ACTIVE" : "CONCEPT")));
    visual.appendChild(el("span", "visual-icon", project.icon || "◇"));
    const micro = el("div", "visual-bars");
    [68,43,84,56,90].forEach((width) => { const bar = el("span"); bar.style.width = width + "%"; micro.appendChild(bar); });
    visual.appendChild(micro);
    article.appendChild(body);
    article.appendChild(visual);
    return article;
  }

  function renderCards() {
    const featured = document.getElementById("featured-project");
    if (featured) {
      featured.replaceChildren();
      const p = projects.find((x) => x.featured) || projects[0];
      if (p) featured.appendChild(createCard(p, true));
    }
    const list = document.getElementById("projects-list");
    if (!list) return;
    const query = (document.getElementById("project-search")?.value || "").trim().toLocaleLowerCase(lang);
    const matching = projects.filter((p) => {
      if (activeFilter !== "all" && p.status !== activeFilter) return false;
      const all = [p.title,p.category,p.stage,loc(p.description),loc(p.pitch),...(p.tags || [])].join(" ").toLocaleLowerCase(lang);
      return all.includes(query);
    });
    list.replaceChildren();
    matching.forEach((p) => list.appendChild(createCard(p, false)));
    if (matching.length === 0) list.appendChild(el("p", "empty-message", tr("empty")));
    const counter = document.getElementById("result-count");
    if (counter) counter.textContent = matching.length + " " + (matching.length === 1 ? tr("countOne") : tr("countMany"));
  }

  function renderComing() {
    if (page !== "coming") return;
    const id = new URLSearchParams(window.location.search).get("tool") || "";
    const project = projects.find((p) => p.id === id && p.status === "soon");
    if (!project) {
      document.getElementById("coming-title").textContent = tr("soon");
      document.getElementById("coming-pitch").textContent = lang === "de" ? "Für dieses Tool gibt es noch kein Mockup. Zurück zur Übersicht." : "No mockup exists for this tool. Return to the overview.";
      document.getElementById("concept-output").textContent = "—";
      return;
    }
    document.title = project.title + " · Coming Soon | Magenta Lab";
    document.getElementById("coming-stage").textContent = (project.stage || "AI").toUpperCase() + " / " + (project.category || "CONCEPT").toUpperCase();
    document.getElementById("coming-title").textContent = project.title;
    document.getElementById("coming-pitch").textContent = loc(project.pitch);
    document.getElementById("concept-idea").textContent = loc(project.intro);
    const inputs = document.getElementById("concept-inputs");
    inputs.replaceChildren();
    (project.inputs || []).forEach((input) => {
      const block = el("div", "mock-field");
      block.appendChild(el("span", "mock-field-label", input[lang === "de" ? 0 : 1]));
      block.appendChild(el("strong", "mock-field-value", input[lang === "de" ? 2 : 3]));
      inputs.appendChild(block);
    });
    document.getElementById("concept-output").textContent = loc(project.output);
    const steps = document.getElementById("concept-steps");
    steps.replaceChildren();
    ((project.steps && project.steps[lang]) || []).forEach((text) => steps.appendChild(el("li", "", text)));
    const accessLink = document.getElementById("concept-access-link");
    if (accessLink) accessLink.href = "../../access.html?tool=" + encodeURIComponent(project.id);
    const next = projects.find((p) => p.id === project.next);
    const link = document.getElementById("next-tool");
    if (next) { link.href = "../../" + next.href; link.textContent = tr("nextPrefix") + ": " + next.title + " ↗"; }
    else { link.href = "../../prototypes.html"; link.textContent = tr("allTools") + " ↗"; }
  }

  function updateLanguage() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-t]").forEach((node) => { node.textContent = tr(node.dataset.t); });
    document.querySelectorAll("[data-t-placeholder]").forEach((node) => { node.setAttribute("placeholder", tr(node.dataset.tPlaceholder)); });
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === lang));
    });
    document.querySelectorAll("[data-nav]").forEach((link) => {
      if (link.dataset.nav === page) link.setAttribute("aria-current", "page");
    });
    renderCards();
    renderComing();
    window.PROTOTYPE_LANG = lang;
    window.dispatchEvent(new CustomEvent("prototype:language", { detail: { lang: lang } }));
  }

  window.PROTOTYPE_SET_LANG = function (value) {
    lang = value === "en" ? "en" : "de";
    try { localStorage.setItem("magenta-lab-lang", lang); } catch (_) {}
    updateLanguage();
  };

  document.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () => window.PROTOTYPE_SET_LANG(button.dataset.language));
  });
  document.getElementById("project-search")?.addEventListener("input", renderCards);
  document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", function () {
    activeFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.filter === activeFilter);
      b.setAttribute("aria-pressed", String(b.dataset.filter === activeFilter));
    });
    renderCards();
  }));
  document.querySelectorAll("[data-year]").forEach((node) => { node.textContent = String(new Date().getFullYear()); });
  updateLanguage();
})();