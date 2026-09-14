interface MarkdownNode {
  type: string;
  lang?: string | null;
  value?: string;
  children?: MarkdownNode[];
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    character =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]!
  );
}

/** Preserve diagrams as text until the optional browser renderer is ready. */
export default function remarkMermaid() {
  return function transform(tree: MarkdownNode) {
    function visit(node: MarkdownNode) {
      if (node.type === "code" && node.lang === "mermaid") {
        node.type = "html";
        node.value = `<figure class="mermaid-diagram" aria-label="流程图"><pre class="mermaid-source" tabindex="0"><code>${escapeHtml(node.value ?? "")}</code></pre><figcaption class="mermaid-error" hidden></figcaption></figure>`;
        delete node.lang;
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}
