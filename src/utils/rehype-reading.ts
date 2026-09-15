interface Node {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
}

/** Images should not compete with the text of these complete, long articles. */
export default function rehypeReading() {
  return (tree: Node) => {
    function visit(node: Node) {
      if (node.type === "element" && node.tagName === "img") {
        node.properties ??= {};
        node.properties.loading = "lazy";
        node.properties.decoding = "async";
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}
