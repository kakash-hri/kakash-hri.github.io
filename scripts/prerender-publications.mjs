import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const dataUrl = new URL("assets/data/publications-data.js", root);
const pageUrl = new URL("publications.html", root);

const source = await readFile(dataUrl, "utf8");
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox, { filename: "publications-data.js" });
const publications = sandbox.window.RESEARCH_PUBLICATIONS || [];

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
    text.includes("mobility platform") ||
    text.includes("mobility-as-a-service") ||
    text.includes("shared automated vehicles") ||
    text.includes("level 2 driving")
  ) return "mobility";
  if (text.includes("video-to-video") || text.includes("siamese neural network")) return "interactive-ml";
  if (
    text.includes("trust") ||
    text.includes("transparency") ||
    text.includes("human-machine") ||
    text.includes("human-aware autonomy")
  ) return "trust";
  return "foundations";
};

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const grouped = publications.reduce((groups, paper) => {
  (groups[paper.year] ||= []).push({ ...paper, project: classify(paper.title) });
  return groups;
}, {});

const scholarUrl = (title) => `https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`;
const rendered = Object.entries(grouped)
  .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
  .map(([year, papers]) => `
            <section class="year-group">
              <h2 class="year-label">${year}<span>${papers.length} ${papers.length === 1 ? "paper" : "papers"}</span></h2>
              <div class="publication-items">
                ${papers.map((paper) => {
                  const url = paper.url || scholarUrl(paper.title);
                  return `<article class="publication">
                  <div>
                    <h3>${escapeHtml(paper.title)}</h3>
                    <div class="publication-meta">
                      <span class="publication-topic">${escapeHtml(projects[paper.project])}</span>${paper.note ? `
                      <span class="publication-topic">${escapeHtml(paper.note)}</span>` : ""}
                    </div>
                  </div>
                  <a class="publication-link" href="${escapeHtml(url)}" aria-label="Open ${escapeHtml(paper.title)}" title="Open publication">↗</a>
                </article>`;
                }).join("\n                ")}
              </div>
            </section>`)
  .join("");

const page = await readFile(pageUrl, "utf8");
const start = "          <!-- BEGIN PRERENDERED PUBLICATIONS -->";
const end = "          <!-- END PRERENDERED PUBLICATIONS -->";
const replacement = `${start}\n          <div id="publication-list" aria-live="polite">${rendered}\n          </div>\n${end}`;
if (!page.includes(start) || !page.includes(end)) throw new Error("Publication markers were not found.");
const next = page.replace(new RegExp(`${start}[\\s\\S]*?${end}`), replacement);

if (next !== page) await writeFile(pageUrl, next, "utf8");
