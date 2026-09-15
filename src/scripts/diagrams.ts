let generation = 0;
let nextId = 0;
let queue = Promise.resolve();
let library: ReturnType<typeof importMermaid> | undefined;
let observer: IntersectionObserver | undefined;
let figures: HTMLElement[] = [];
let mounted: Element | null = null;
const nearby = new Set<HTMLElement>();

async function importMermaid() {
  return (await import("mermaid")).default;
}
function theme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "default";
}
function renderFigure(figure: HTMLElement) {
  const current = generation;
  const color = theme();
  queue = queue
    .catch(() => {})
    .then(async () => {
      if (
        current !== generation ||
        !figure.isConnected ||
        figure.dataset.diagramTheme === color
      )
        return;
      const source = figure.querySelector<HTMLElement>("pre");
      const error = figure.querySelector<HTMLElement>(".mermaid-error");
      if (!source || !error) return;
      source.classList.add("mermaid-source");
      figure.setAttribute("aria-busy", "true");
      try {
        library ??= importMermaid().catch(error => {
          library = undefined;
          throw error;
        });
        const mermaid = await library;
        if (current !== generation || !figure.isConnected) return;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: color,
          fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
          flowchart: { htmlLabels: false },
          suppressErrorRendering: true,
        });
        const { svg } = await mermaid.render(
          `diagram-${++nextId}`,
          source.querySelector("code")?.textContent ?? ""
        );
        if (current !== generation || !figure.isConnected) return;
        const rendered = document.createElement("div");
        rendered.className = "mermaid-rendered";
        rendered.tabIndex = 0;
        rendered.setAttribute("role", "group");
        rendered.setAttribute("aria-label", "流程图，可横向滚动查看");
        rendered.innerHTML = svg;
        const graphic = rendered.querySelector("svg");
        if (graphic?.viewBox.baseVal.width)
          graphic.style.width = `${graphic.viewBox.baseVal.width}px`;
        figure.querySelector(".mermaid-rendered")?.remove();
        figure.prepend(rendered);
        source.hidden = true;
        error.hidden = true;
        figure.dataset.diagramTheme = color;
      } catch {
        if (current !== generation || !figure.isConnected) return;
        figure.querySelector(".mermaid-rendered")?.remove();
        source.hidden = false;
        error.textContent = "图表暂时无法渲染，以下为源码。";
        error.hidden = false;
        figure.dataset.diagramTheme = color;
      } finally {
        figure.removeAttribute("aria-busy");
      }
    });
}
function mount() {
  const article = document.getElementById("article");
  if (article === mounted) return;
  disconnect();
  mounted = article;
  figures = [
    ...(article?.querySelectorAll<HTMLElement>(".mermaid-diagram") ?? []),
  ];
  if (!figures.length) return;
  observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        const figure = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          nearby.add(figure);
          renderFigure(figure);
        } else nearby.delete(figure);
      }
    },
    { rootMargin: "400px" }
  );
  figures.forEach(figure => observer!.observe(figure));
}
function disconnect() {
  generation++;
  observer?.disconnect();
  nearby.clear();
  mounted = null;
  figures = [];
}
document.addEventListener("astro:page-load", mount);
document.addEventListener("astro:before-swap", disconnect);
new MutationObserver(() => {
  generation++;
  nearby.forEach(renderFigure);
}).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-theme"],
});
mount();
