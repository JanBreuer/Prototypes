(function () {
  "use strict";

  const projects = Array.isArray(window.PROTOTYPE_PROJECTS) ? window.PROTOTYPE_PROJECTS : [];
  const page = document.body.dataset.page || "";

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  document.querySelectorAll("[data-nav]").forEach(function (link) {
    if (link.dataset.nav === page) link.setAttribute("aria-current", "page");
  });

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function card(project, featured) {
    const article = el("article", featured ? "project-card project-card-featured" : "project-card");
    const detail = el("div", "project-content");
    const upper = el("div", "project-meta");
    upper.appendChild(el("span", "project-category", project.category || "Tool"));
    if (project.status) upper.appendChild(el("span", "project-status", project.status));
    detail.appendChild(upper);
    detail.appendChild(el(featured ? "h3" : "h2", "project-title", project.title || "Unbenannter Prototyp"));
    detail.appendChild(el("p", "project-description", project.description || ""));
    const tags = el("div", "project-tags");
    (project.tags || []).forEach(function (tag) { tags.appendChild(el("span", "tag", tag)); });
    detail.appendChild(tags);
    const action = el("a", "project-action", "Tool öffnen ↗");
    action.href = project.href || "#";
    action.setAttribute("aria-label", (project.title || "Tool") + " öffnen");
    detail.appendChild(action);

    const preview = el("div", "project-preview");
    preview.setAttribute("aria-hidden", "true");
    preview.appendChild(el("span", "preview-label", project.label || "WEB / PROTOTYPE"));
    preview.appendChild(el("span", "preview-symbol", project.icon || "◈"));
    preview.appendChild(el("span", "preview-bottom", "Explore ↗"));
    article.appendChild(detail);
    article.appendChild(preview);
    return article;
  }

  const featuredTarget = document.getElementById("featured-project");
  if (featuredTarget) {
    const project = projects.find(function (p) { return p.featured; }) || projects[0];
    featuredTarget.replaceChildren();
    if (project) featuredTarget.appendChild(card(project, true));
    else featuredTarget.appendChild(el("p", "empty-message", "Noch keine Prototypen eingetragen."));
  }

  const listTarget = document.getElementById("projects-list");
  const search = document.getElementById("project-search");
  const resultCount = document.getElementById("result-count");

  function render(query) {
    if (!listTarget) return;
    const value = (query || "").trim().toLocaleLowerCase("de");
    const matches = projects.filter(function (project) {
      return [project.title, project.category, project.description].concat(project.tags || [])
        .join(" ").toLocaleLowerCase("de").includes(value);
    });
    listTarget.replaceChildren();
    matches.forEach(function (project) { listTarget.appendChild(card(project, false)); });
    if (!matches.length) {
      listTarget.appendChild(el("p", "empty-message", projects.length ? "Keine passenden Tools gefunden." : "Noch keine Prototypen eingetragen."));
    }
    if (resultCount) resultCount.textContent = matches.length + (matches.length === 1 ? " Prototyp" : " Prototypen");
  }

  if (listTarget) {
    render("");
    if (search) search.addEventListener("input", function () { render(search.value); });
  }
})();
