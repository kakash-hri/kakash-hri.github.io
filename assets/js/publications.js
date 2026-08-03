(() => {
  const publications = window.RESEARCH_PUBLICATIONS || [];
  const list = document.querySelector("#publication-list");
  const count = document.querySelector("#result-count");
  const search = document.querySelector("#publication-search");
  const yearFilter = document.querySelector("#year-filter");
  const projectFilter = document.querySelector("#project-filter");
  const scopeButtons = Array.from(document.querySelectorAll("[data-scope]"));

  if (!list) return;

  const projects = {
    "human-ai": "Human-AI Teaming",
    prosocial: "Prosocial intelligence",
    mobility: "Adaptive mobility",
    "driver-state": "Driver state",
    trust: "Trust dynamics",
    "interactive-ml": "Interactive ML",
    foundations: "Systems foundations"
  };

  const classify = (title) => {
    const text = title.toLowerCase();

    if (
      text.includes("generative ai") ||
      text.includes("ad hoc collaboration") ||
      text.includes("ad-hoc collaboration") ||
      text.includes("too many specialists") ||
      text.includes("real-time signaling")
    ) return "human-ai";

    if (text.includes("shared control")) return "mobility";

    if (
      text.includes("prosocial") ||
      text.includes("well-being") ||
      text.includes("wellbeing") ||
      text.includes("cooperate") ||
      text.includes("reciprocate") ||
      text.includes("delivery robot") ||
      text.includes("ride report")
    ) return "prosocial";

    if (
      text.includes("situation awareness") ||
      text.includes("situational awareness") ||
      text.includes("gaze behavior") ||
      text.includes("visual sensory") ||
      text.includes("perceived discomfort")
    ) return "driver-state";

    if (
      text.includes("driving style") ||
      text.includes("takeover") ||
      text.includes("takeovers") ||
      text.includes("shared control") ||
      text.includes("mobility platform") ||
      text.includes("mobility-as-a-service") ||
      text.includes("shared automated vehicles") ||
      text.includes("level 2 driving")
    ) return "mobility";

    if (text.includes("video-to-video") || text.includes("siamese neural network")) {
      return "interactive-ml";
    }

    if (
      text.includes("trust") ||
      text.includes("transparency") ||
      text.includes("human-machine") ||
      text.includes("human-aware autonomy")
    ) return "trust";

    return "foundations";
  };

  const scholarUrl = (title) =>
    `https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`;

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  publications.forEach((paper) => {
    paper.project = classify(paper.title);
  });

  const years = [...new Set(publications.map((paper) => paper.year))].sort((a, b) => b - a);
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    yearFilter.append(option);
  });

  let activeScope = "all";

  const query = new URLSearchParams(window.location.search);
  const requestedProject = query.get("project");
  const requestedScope = query.get("scope");

  if (requestedProject && projects[requestedProject]) {
    projectFilter.value = requestedProject;
  }

  if (["all", "current", "archive"].includes(requestedScope)) {
    activeScope = requestedScope;
  }

  const syncScopeButtons = () => {
    scopeButtons.forEach((button) => {
      const isActive = button.dataset.scope === activeScope;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const render = () => {
    const term = search.value.trim().toLowerCase();
    const requestedYear = yearFilter.value;
    const requestedTopic = projectFilter.value;

    const matches = publications.filter((paper) => {
      const inScope =
        activeScope === "all" ||
        (activeScope === "current" && paper.project === "human-ai") ||
        (activeScope === "archive" && paper.project !== "human-ai");
      const matchesSearch = !term || paper.title.toLowerCase().includes(term);
      const matchesYear = !requestedYear || String(paper.year) === requestedYear;
      const matchesProject = !requestedTopic || paper.project === requestedTopic;
      return inScope && matchesSearch && matchesYear && matchesProject;
    });

    count.textContent = `${matches.length} ${matches.length === 1 ? "publication" : "publications"}`;

    if (!matches.length) {
      list.innerHTML = '<div class="empty-state"><strong>No publications match those filters.</strong><br>Try another topic, year, or search phrase.</div>';
      return;
    }

    const grouped = matches.reduce((groups, paper) => {
      (groups[paper.year] ||= []).push(paper);
      return groups;
    }, {});

    list.innerHTML = Object.entries(grouped)
      .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
      .map(([year, papers]) => `
        <section class="year-group">
          <h2 class="year-label">${year}<span>${papers.length} ${papers.length === 1 ? "paper" : "papers"}</span></h2>
          <div class="publication-items">
            ${papers.map((paper) => `
              <article class="publication">
                <div>
                  <h3>${escapeHtml(paper.title)}</h3>
                  <div class="publication-meta">
                    <span class="publication-topic">${escapeHtml(projects[paper.project])}</span>
                    ${paper.note ? `<span class="publication-topic">${escapeHtml(paper.note)}</span>` : ""}
                  </div>
                </div>
                <a class="publication-link" href="${paper.url || scholarUrl(paper.title)}" aria-label="Open ${escapeHtml(paper.title)}" title="Open publication">↗</a>
              </article>
            `).join("")}
          </div>
        </section>
      `)
      .join("");
  };

  scopeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeScope = button.dataset.scope;
      syncScopeButtons();
      render();
    });
  });

  [search, yearFilter, projectFilter].forEach((control) => {
    control.addEventListener(control === search ? "input" : "change", render);
  });

  syncScopeButtons();
  render();
})();
