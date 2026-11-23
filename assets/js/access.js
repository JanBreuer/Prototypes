(function () {
  "use strict";
  const projects = Array.isArray(window.PROTOTYPE_PROJECTS) ? window.PROTOTYPE_PROJECTS : [];
  const money = { single:{48:9,7:19,30:49}, suite:{48:29,7:59,30:149}, team:{48:89,7:149,30:399} };
  const copy = {
    de:{
      navAccess:"Access-Konzept",back:"Zur Tool-Übersicht",title1:"Ein Tool. Oder die",title2:"gesamte Suite.",
      subtitle:"Erlebe, wie ein zeitlich begrenzter Zugang künftig aussehen könnte: Einzeltool, komplette Suite oder Team-Lizenz. Konfiguriere einen fiktiven Pass und erkunde den geplanten Access-Flow.",
      digitalDelivery:"Digitaler Zugang · Konzept",warningTitle:"INTERAKTIVES MOCKUP",
      warningText:"Alle Preise und Funktionen sind erfunden. Keine Konten, Zahlungsabwicklung, Lizenzen oder echten Käufe. Geplante Tools sind weiterhin nicht verfügbar.",
      chooseScopeLabel:"ACCESS MODELL",chooseScope:"Was möchtest du freischalten?",
      scopeSingle:"Single Tool",scopeSingleDesc:"Ein ausgewähltes Tool, 1 Person",scopeSingleHint:"Für den schnellen Test",
      scopeSuite:"Full Tool Suite",scopeSuiteDesc:"Alle Tools, 1 Person",scopeSuiteHint:"Für End-to-End Use Cases",
      scopeTeam:"Team Pilot",scopeTeamDesc:"Alle Tools, 5 Personen",scopeTeamHint:"Für gemeinsame Evaluation",
      toolLabel:"Welches Tool?",durationLabel:"LAUFZEIT",chooseDuration:"Wie lange brauchst du Zugriff?",days:"Tage",
      duration48:"Sprint",duration7:"Build & Compare",duration30:"Pilot",flowLabel:"EXPERIENCE PREVIEW",
      flowTitle:"So würde die Freischaltung funktionieren.",flow1Title:"Pass konfigurieren",flow1Text:"Toolumfang und Laufzeit auswählen.",
      flow2Title:"Mock-Checkout",flow2Text:"Preis und Leistungsumfang prüfen. Keine Zahlung möglich.",
      flow3Title:"Access-Dashboard",flow3Text:"Konzept: Tools, Seats, Laufzeit und Ablaufdatum zentral verwalten.",
      previewAction:"Access-Pass als Mockup ansehen",hidePreview:"Access-Pass schließen",
      passNotActive:"NICHT AKTIV",passLabel:"SO KÖNNTE DEIN ACCESS-PASS AUSSEHEN",
      passDuration:"LAUFZEIT",passSeats:"NUTZER",passFootnote:"Vorschau. Kein echter Zugang aktiviert.",
      orderLabel:"DEIN FIKTIVER PASS",demo:"DEMO",summaryTitle:"Deine Konfiguration",
      summaryScope:"Umfang",summaryTool:"Enthaltene Tools",summaryDuration:"Laufzeit",summarySeats:"Nutzer",
      examplePrice:"BEISPIELPREIS",oneOff:"einmalig · fiktiv",includedTitle:"Im Konzept enthalten",
      checkout:"Checkout · Nicht verfügbar",orderNote:"Dies ist keine Bestellung. Ein echter Checkout ist bewusst deaktiviert.",
      afterTitle:"Was eine produktive Version brauchen würde.",after1Title:"Identität & Rechte",
      after1Text:"Login, Organisation, rollenbasierte Freigaben und Seat-Verwaltung.",
      after2Title:"Lizenz & Ablauf",after2Text:"Aktivierung, Laufzeit-Timer, Verlängerung und Zugriff nach Ablauf.",
      after3Title:"Sichere Abwicklung",after3Text:"Zahlungsanbieter, Rechnungen, Datenschutzhinweise und Nutzungsbedingungen.",
      includesSingle:["Ein ausgewähltes Tool (Konzept)","1 Person","Beispiel-Exports und Szenarien"],
      includesSuite:["Alle 8 Tool-Konzepte","1 Person","Toolchain und Export-Idee"],
      includesTeam:["Alle 8 Tool-Konzepte","5 Personen","Gemeinsame Workspace-Idee"],
      toolsCount:"8 Tools",persons:"Personen",person:"Person"
    },
    en:{
      navAccess:"Access concept",back:"Back to tools",title1:"One tool. Or the",title2:"entire suite.",
      subtitle:"Explore how time-limited access might work: single tool, entire suite or team licence. Configure a fictitious pass and explore the proposed access journey.",
      digitalDelivery:"Digital access · Concept",warningTitle:"INTERACTIVE MOCKUP",
      warningText:"All prices and features are invented. No accounts, payment processing, licences or purchases exist. Planned tools remain unavailable.",
      chooseScopeLabel:"ACCESS MODEL",chooseScope:"What would you like to unlock?",
      scopeSingle:"Single Tool",scopeSingleDesc:"One selected tool, 1 person",scopeSingleHint:"For a quick test",
      scopeSuite:"Full Tool Suite",scopeSuiteDesc:"All tools, 1 person",scopeSuiteHint:"For end-to-end use cases",
      scopeTeam:"Team Pilot",scopeTeamDesc:"All tools, 5 people",scopeTeamHint:"For collaborative evaluation",
      toolLabel:"Which tool?",durationLabel:"DURATION",chooseDuration:"How long do you need access?",days:"days",
      duration48:"Sprint",duration7:"Build & Compare",duration30:"Pilot",flowLabel:"EXPERIENCE PREVIEW",
      flowTitle:"How unlocking could work.",flow1Title:"Configure pass",flow1Text:"Choose tools and duration.",
      flow2Title:"Mock checkout",flow2Text:"Review pricing and coverage. No payment is possible.",
      flow3Title:"Access dashboard",flow3Text:"Concept: manage tools, seats, duration and expiry dates.",
      previewAction:"Preview access pass",hidePreview:"Close access pass",
      passNotActive:"NOT ACTIVE",passLabel:"YOUR ACCESS PASS COULD LOOK LIKE THIS",
      passDuration:"DURATION",passSeats:"SEATS",passFootnote:"Preview. No real access activated.",
      orderLabel:"YOUR FICTIONAL PASS",demo:"DEMO",summaryTitle:"Your configuration",
      summaryScope:"Scope",summaryTool:"Included tools",summaryDuration:"Duration",summarySeats:"Seats",
      examplePrice:"EXAMPLE PRICE",oneOff:"one-off · fictional",includedTitle:"Concept includes",
      checkout:"Checkout · Unavailable",orderNote:"This is not an order. Real checkout is intentionally disabled.",
      afterTitle:"What a production version would require.",after1Title:"Identity & rights",
      after1Text:"Login, organisation, role-based permissions and seat management.",
      after2Title:"Licence & expiry",after2Text:"Activation, expiry timer, renewal and end-of-term access rules.",
      after3Title:"Secure checkout",after3Text:"Payment provider, invoices, privacy notices and terms of use.",
      includesSingle:["One selected tool (concept)","1 person","Example exports and scenarios"],
      includesSuite:["All 8 tool concepts","1 person","Toolchain and export concept"],
      includesTeam:["All 8 tool concepts","5 people","Shared workspace concept"],
      toolsCount:"8 tools",persons:"people",person:"person"
    }
  };

  let lang = window.PROTOTYPE_LANG === "en" ? "en" : "de";
  const params = new URLSearchParams(location.search);
  const selectedFromUrl = params.get("tool") || "";
  let scope = (selectedFromUrl && projects.some((p) => p.id === selectedFromUrl)) ? "single" : "suite";
  let duration = 7;
  let isPassOpen = false;
  const $ = (id) => document.getElementById(id);
  const txt = (k) => copy[lang][k] || k;
  const durationText = () => duration === 48 ? "48h" : duration + " " + txt("days");
  const selectedTool = () => projects.find((p) => p.id === $("access-tool-select").value) || projects[0];
  const scopeName = () => txt(scope === "single" ? "scopeSingle" : scope === "suite" ? "scopeSuite" : "scopeTeam");

  function initialiseToolSelect() {
    const select = $("access-tool-select");
    select.replaceChildren();
    projects.forEach((project) => {
      const option = document.createElement("option");
      option.value = project.id;
      option.textContent = project.title + (project.status === "soon" ? " (Coming Soon)" : "");
      select.appendChild(option);
    });
    if (projects.some((p) => p.id === selectedFromUrl)) select.value = selectedFromUrl;
  }

  function render() {
    document.querySelectorAll("[data-access-t]").forEach((node) => {
      if (node.dataset.accessT === "previewAction" && isPassOpen) node.textContent = txt("hidePreview");
      else node.textContent = txt(node.dataset.accessT);
    });
    document.querySelectorAll("[data-scope]").forEach((button) => {
      const selected = button.dataset.scope === scope;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    document.querySelectorAll("[data-duration]").forEach((button) => {
      const selected = Number(button.dataset.duration) === duration;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    $("tool-select-wrap").hidden = scope !== "single";
    $("summary-scope").textContent = scopeName();
    $("summary-tool").textContent = scope === "single" ? (selectedTool()?.title || "AI or Nay?") : txt("toolsCount");
    $("summary-duration").textContent = durationText();
    $("summary-seats").textContent = scope === "team" ? "5" : "1";
    $("summary-price").textContent = money[scope][duration] + " €";
    $("pass-name").textContent = scopeName() + (scope === "single" ? " · " + (selectedTool()?.title || "") : "");
    $("pass-duration").textContent = durationText();
    $("pass-seats").textContent = scope === "team" ? "5" : "1";
    const ul = $("included-list");
    ul.replaceChildren();
    const lines = copy[lang][scope === "single" ? "includesSingle" : scope === "team" ? "includesTeam" : "includesSuite"];
    lines.forEach((str) => { const li = document.createElement("li"); li.textContent = str; ul.appendChild(li); });
    $("access-pass-preview").hidden = !isPassOpen;
    $("mock-preview-toggle").setAttribute("aria-expanded", String(isPassOpen));
    document.documentElement.lang = lang;
  }

  initialiseToolSelect();
  document.querySelectorAll("[data-scope]").forEach((button) => button.addEventListener("click", () => {
    scope = button.dataset.scope; render();
  }));
  document.querySelectorAll("[data-duration]").forEach((button) => button.addEventListener("click", () => {
    duration = Number(button.dataset.duration); render();
  }));
  $("access-tool-select").addEventListener("change", render);
  $("mock-preview-toggle").addEventListener("click", () => {
    isPassOpen = !isPassOpen; render();
    if (isPassOpen) $("access-pass-preview").scrollIntoView({behavior:"smooth",block:"nearest"});
  });
  window.addEventListener("prototype:language", (event) => {
    lang = event.detail?.lang === "en" ? "en" : "de";
    render();
  });
  render();
})();