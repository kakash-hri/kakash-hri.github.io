(() => {
  const publications = window.RESEARCH_PUBLICATIONS || [];
  const container = document.querySelector("#resume-publications");
  const count = document.querySelector("#resume-publication-count");

  if (!container) return;

  const scholarUrl = (title) =>
    `https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`;

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const grouped = publications.reduce((years, paper) => {
    (years[paper.year] ||= []).push(paper);
    return years;
  }, {});

  if (count) count.textContent = String(publications.length);

  container.innerHTML = Object.entries(grouped)
    .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
    .map(([year, papers]) => `
      <details class="resume-publication-year" ${Number(year) >= 2024 ? "open" : ""}>
        <summary>
          <strong>${year}</strong>
          <span>${papers.length} ${papers.length === 1 ? "publication" : "publications"}</span>
        </summary>
        <ol class="resume-publications-list">
          ${papers.map((paper) => `
            <li><a href="${scholarUrl(paper.title)}">${escapeHtml(paper.title)}</a>${paper.note ? ` <small>(${escapeHtml(paper.note)})</small>` : ""}</li>
          `).join("")}
        </ol>
      </details>
    `)
    .join("");
})();
