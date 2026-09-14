let generation = 0;
let nextId = 0;
let queue = Promise.resolve();
let library: ReturnType<typeof importMermaid> | undefined;

async function importMermaid() {
  return (await import("mermaid")).default;
}

function scheduleDiagrams() {
  const current = ++generation;
  const figures = Array.from(
    document.querySelectorAll<HTMLElement>(".mermaid-diagram")
  );
  if (!figures.length) return;

  queue = queue
    .catch(() => {})
    .then(async () => {
      if (current !== generation) return;
      try {
        library ??= importMermaid();
        const mermaid = await library;
        await document.fonts.ready;
        if (current !== generation) return;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme:
            document.documentElement.dataset.theme === "dark"
              ? "dark"
              : "default",
          fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
          flowchart: { htmlLabels: false },
          suppressErrorRendering: true,
        });

        for (const figure of figures) {
          if (current !== generation || !figure.isConnected) return;
          // MDX's highlighter may replace the original pre class.
          const source = figure.querySelector<HTMLElement>("pre");
          const error = figure.querySelector<HTMLElement>(".mermaid-error");
          if (!source || !error) continue;
          source.classList.add("mermaid-source");
          try {
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
            if (graphic?.viewBox.baseVal.width) {
              graphic.style.width = `${graphic.viewBox.baseVal.width}px`;
            }
            figure.querySelector(".mermaid-rendered")?.remove();
            figure.prepend(rendered);
            source.hidden = true;
            error.hidden = true;
          } catch {
            figure.querySelector(".mermaid-rendered")?.remove();
            source.hidden = false;
            error.textContent = "图表暂时无法渲染，以下为源码。";
            error.hidden = false;
          }
        }
      } catch {
        library = undefined;
        for (const figure of figures) {
          const error = figure.querySelector<HTMLElement>(".mermaid-error");
          if (error) {
            error.textContent = "图表加载失败，已保留源码。";
            error.hidden = false;
          }
        }
      }
    });
}

document.addEventListener("astro:page-load", scheduleDiagrams);
document.addEventListener("astro:before-swap", () => {
  generation++;
});
new MutationObserver(scheduleDiagrams).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-theme"],
});
scheduleDiagrams();
