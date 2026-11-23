// One source of truth for the portfolio, concept pages and intro dialogs.
// All paths are relative to the GitHub Pages project root. No API or backend required.
window.PROTOTYPE_PROJECTS = [
  {
    id:"ai-or-nay", title:"AI or Nay?", stage:"Evaluate", category:"Business Case", icon:"€",
    description:{de:"KI-Investitionen fundiert bewerten: Kosten, Zeitersparnis, Szenarien und ROI.",en:"Evaluate AI investments: cost, time savings, scenarios and ROI."},
    pitch:{de:"Ein geführter Business Case für KI-Anwendungen mit transparenten Annahmen, Prozesskosten und Wirtschaftlichkeitsvergleich.",en:"A guided AI business case with transparent assumptions, process costs and economic comparisons."},
    tags:["AI ROI","FinOps","Assessment"], href:"tools/ai-or-nay/",status:"live",featured:true,
    intro:{de:"Erfasse Personal-, Prozess- und KI-Kosten, vergleiche Alternativen und analysiere die Wirtschaftlichkeit eines Use Cases. Die Ergebnisse hängen von deinen Eingaben und Annahmen ab.",en:"Enter staffing, process and AI costs, compare alternatives and analyse the economics of a use case. Results depend on your inputs and assumptions."}
  },
  {
    id:"agent-necessary",title:"Agent or Not?",stage:"Decide",category:"Agent Architecture",icon:"◇",
    description:{de:"Prüft, ob ein Agent überhaupt nötig ist, und skizziert eine geeignete Zielarchitektur.",en:"Decides whether an agent is necessary and sketches a suitable architecture."},
    pitch:{de:"Entscheidungsbaum zwischen Regeln, Workflow, KI-Assistent und Agent. Mit Autonomie-, Risiko- und Kontrollpunkten.",en:"Decision tree for rules, workflows, AI assistants and agents, including autonomy, risk and control points."},
    tags:["Agent vs. Workflow","Architecture","Governance"],href:"tools/coming-soon/?tool=agent-necessary",status:"soon",
    intro:{de:"Beschreibe Aufgaben, Variabilität, Toolzugriff und Risiko. Das geplante Tool empfiehlt eine passende Automatisierungsarchitektur statt pauschal einen Agenten.",en:"Describe tasks, variability, tool access and risk. The proposed tool recommends an appropriate automation architecture, not automatically an agent."},
    inputs:[["Aufgabenvariabilität","Task variability","Mittel","Medium"],["Toolzugriff","Tool access","Interne APIs","Internal APIs"],["Fehlertoleranz","Error tolerance","Niedrig","Low"]],
    output:{de:"Regelbasierter Workflow mit KI-Unterstützung und Freigabepunkt",en:"Rule-based workflow with AI assistance and approval checkpoint"},
    steps:{de:["Aufgabe strukturieren","Autonomiebedarf einschätzen","Architektur + Guardrails"],en:["Structure the task","Assess autonomy needs","Architecture + guardrails"]},next:"model-router"
  },
  {
    id:"model-router",title:"Model Routing Lab",stage:"Optimize",category:"Efficiency",icon:"⇄",
    description:{de:"Verteilt Aufgaben konzeptionell auf Modelle nach Qualität, Kosten, Latenz und Risiko.",en:"Explores model selection by quality, cost, latency and risk."},
    pitch:{de:"Routing-Regeln für einfache, komplexe und sensible Aufgaben mit Kosten- und Qualitäts-Szenarien.",en:"Routing rules for simple, complex and sensitive tasks, with cost and quality scenarios."},
    tags:["Model Routing","Latency","Cost"],href:"tools/coming-soon/?tool=model-router",status:"soon",
    intro:{de:"Ordne Aufgaben nach Komplexität und Anforderungen. Eine künftige Simulation zeigt, wann welches Modell sinnvoll ist und wann ein Fallback greift.",en:"Classify tasks by complexity and requirements. A future simulation will show appropriate models and fallback rules."},
    inputs:[["Zielgröße","Target metric","Kosten + Qualität","Cost + quality"],["Anfrageklassen","Request classes","3 Klassen","3 classes"],["Fallback","Fallback","Aktiv","Enabled"]],
    output:{de:"Einfach → kleines Modell · komplex → leistungsstarkes Modell · kritisch → Review",en:"Simple → small model · complex → capable model · critical → review"},
    steps:{de:["Anfragen klassifizieren","Routing-Regeln festlegen","Qualität und Kosten evaluieren"],en:["Classify requests","Set routing rules","Evaluate quality and cost"]},next:"harness-builder"
  },
  {
    id:"harness-builder",title:"AI Harness Builder",stage:"Design",category:"Engineering",icon:"⌘",
    description:{de:"Entwirft eine robuste KI-Ausführungsumgebung mit Tools, Evals, Logs und Guardrails.",en:"Designs a robust AI execution setup with tools, evals, logs and guardrails."},
    pitch:{de:"Aus einem Use Case entsteht ein nachvollziehbarer Systementwurf: Eingaben, Tools, Policies, Fehlerbehandlung und Evaluierung.",en:"Turn a use case into a traceable system design: inputs, tools, policies, error handling and evaluation."},
    tags:["Harness","Guardrails","Evaluations"],href:"tools/coming-soon/?tool=harness-builder",status:"soon",
    intro:{de:"Konfiguriere konzeptionell den sicheren Rahmen um ein Modell: Toolzugriff, Prüfungen, Versionierung, Beobachtbarkeit und menschliche Freigaben.",en:"Conceptually configure the system around a model: tool access, checks, versioning, observability and human approvals."},
    inputs:[["Werkzeuge","Tools","API + Suche","API + search"],["Monitoring","Monitoring","Traces + Kosten","Traces + cost"],["Kontrollen","Controls","Review + Retry","Review + retry"]],
    output:{de:"Eingabe → Policy → Modell + Tools → Evals → Freigabe → Logging",en:"Input → policy → model + tools → evals → approval → logging"},
    steps:{de:["Toolzugriffe definieren","Evals und Policies einbauen","Architektur dokumentieren"],en:["Define tool access","Add evals and policies","Document architecture"]},next:"prompt-studio"
  },
  {
    id:"prompt-studio",title:"Prompt Design Studio",stage:"Design",category:"Prompt Engineering",icon:"{ }",
    description:{de:"Erzeugt strukturierte, testbare Prompts für Menschen oder maschinenlesbare Schnittstellen.",en:"Creates structured, testable prompts for humans or machine-readable interfaces."},
    pitch:{de:"Zwei Ausgabemodi: kompakte Human-Briefs mit Deep Dives und deterministische Maschinenverträge mit Schema und Tests.",en:"Two output modes: concise human briefs with deep dives and deterministic machine contracts with schemas and tests."},
    tags:["Human / Machine","Schema","Evaluation"],href:"tools/coming-soon/?tool=prompt-studio",status:"soon",
    intro:{de:"Wähle Zielgruppe, gewünschtes Ergebnis, Constraints und Prüfregeln. Das geplante Tool optimiert Darstellung und Testbarkeit, nicht eine Garantie für deterministische Modellantworten.",en:"Choose audience, desired result, constraints and tests. The proposed tool improves structure and testability, not a guarantee of deterministic model output."},
    inputs:[["Zielgruppe","Audience","Mensch / Maschine","Human / machine"],["Ausgabeformat","Output format","Brief / JSON","Brief / JSON"],["Validierung","Validation","Schema + Beispiele","Schema + examples"]],
    output:{de:"Ziel → Kontext → Regeln → Ausgabeformat → Prüffälle + Deep Dive",en:"Goal → context → rules → output format → test cases + deep dive"},
    steps:{de:["Ergebnis definieren","Human-/Machine-Modus wählen","Prompt und Prüffälle erzeugen"],en:["Define desired outcome","Choose human/machine mode","Generate prompt and test cases"]},next:"maturity-navigator"
  },
  {
    id:"maturity-navigator",title:"AI Maturity Navigator",stage:"Assess",category:"Strategy",icon:"◎",
    description:{de:"Bewertet KI-Reife entlang Daten, Governance, Menschen, Prozessen und Technologie.",en:"Assesses AI readiness across data, governance, people, processes and technology."},
    pitch:{de:"Kurzes Reifegrad-Assessment mit priorisierten Maßnahmen statt einer isolierten Zahl ohne Handlungsempfehlung.",en:"A concise maturity assessment prioritising action instead of producing a score without next steps."},
    tags:["Maturity","Readiness","Next Steps"],href:"tools/coming-soon/?tool=maturity-navigator",status:"soon",
    intro:{de:"Bewerte wenige nachvollziehbare Dimensionen und erhalte eine priorisierte Maßnahmenliste mit Abhängigkeiten.",en:"Assess a small set of transparent dimensions and receive a prioritised list of actions with dependencies."},
    inputs:[["Datenbasis","Data foundation","Entwickelnd","Developing"],["Governance","Governance","Teilweise","Partial"],["Enablement","Enablement","Im Aufbau","In progress"]],
    output:{de:"Zuerst Datenqualität + Verantwortlichkeiten, danach Pilotierung und Skalierung",en:"Start with data quality + ownership, then piloting and scaling"},
    steps:{de:["Reifeindikatoren bewerten","Engpässe priorisieren","Nächste Schritte ableiten"],en:["Assess maturity indicators","Prioritise bottlenecks","Derive next steps"]},next:"roadmap-builder"
  },
  {
    id:"roadmap-builder",title:"AI Roadmap Builder",stage:"Plan",category:"Strategy",icon:"↗",
    description:{de:"Übersetzt Maßnahmen und Use Cases in eine realistische, abhängige Umsetzungsroadmap.",en:"Turns actions and use cases into a realistic roadmap with dependencies."},
    pitch:{de:"Priorisierung nach Wert, Aufwand, Risiken und Abhängigkeiten mit phasenweiser Planung und klaren Entscheidungspunkten.",en:"Prioritisation by value, effort, risk and dependencies with phased planning and clear decision gates."},
    tags:["Roadmap","Prioritization","Delivery"],href:"tools/coming-soon/?tool=roadmap-builder",status:"soon",
    intro:{de:"Sammle Maßnahmen und Use Cases, ergänze Aufwand, Nutzen und Abhängigkeiten und erzeuge eine umsetzbare erste Roadmap.",en:"Collect actions and use cases, add effort, value and dependencies and create a feasible first roadmap."},
    inputs:[["Zeithorizont","Horizon","2 Quartale","2 quarters"],["Initiativen","Initiatives","6 Vorhaben","6 initiatives"],["Priorität","Priority","Wert + Machbarkeit","Value + feasibility"]],
    output:{de:"Q1: Grundlagen + Pilot → Q2: Validierung + Skalierungsentscheid",en:"Q1: foundation + pilot → Q2: validation + scaling decision"},
    steps:{de:["Maßnahmen sammeln","Abhängigkeiten prüfen","Phasen und Verantwortliche planen"],en:["Collect initiatives","Check dependencies","Plan phases and owners"]},next:"toolchain-composer"
  },
  {
    id:"toolchain-composer",title:"AI Toolchain Composer",stage:"Connect",category:"Workflow",icon:"⤳",
    description:{de:"Verbindet Entscheidungen, Architektur, Prompts, Reifegrad und Roadmap zu einem Ablauf.",en:"Connects decisions, architecture, prompts, maturity and roadmap into one workflow."},
    pitch:{de:"Ein Orchestrierungs-Mockup mit wiederverwendbaren Artefakten, Übergaben und Prüfpunkten zwischen allen Tools.",en:"An orchestration concept with reusable artefacts, hand-offs and checkpoints between tools."},
    tags:["Toolchain","Orchestration","Integration"],href:"tools/coming-soon/?tool=toolchain-composer",status:"soon",
    intro:{de:"Verknüpfe geplante Module zu einer durchgängigen Journey: Evaluate → Decide → Design → Assess → Plan. Es handelt sich um ein Konzept, nicht um eine bestehende Integration.",en:"Connect proposed modules in one journey: Evaluate → Decide → Design → Assess → Plan. This is a concept, not an existing integration."},
    inputs:[["Startpunkt","Starting point","Use Case","Use case"],["Module","Modules","7 verknüpft","7 connected"],["Übergaben","Hand-offs","Strukturierte Artefakte","Structured artefacts"]],
    output:{de:"Business Case → Agentenentscheidung → Routing / Harness → Prompt → Reifegrad → Roadmap",en:"Business case → agent decision → routing / harness → prompt → maturity → roadmap"},
    steps:{de:["Module auswählen","Ergebnisse strukturiert übergeben","End-to-End-Plan prüfen"],en:["Choose modules","Transfer structured results","Review end-to-end plan"]},next:"ai-or-nay"
  }
];
