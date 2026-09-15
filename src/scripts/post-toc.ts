let dispose: (() => void) | undefined;
let current: Element | null = null;

function initToc() {
  const nav = document.querySelector<HTMLElement>(".toc-nav");
  if (nav === current) return;
  dispose?.();
  current = nav;
  if (!nav) return;
  const home = document.querySelector<HTMLElement>(".toc-home")!;
  const shell = document.querySelector<HTMLElement>(".toc-shell")!;
  const dialog = document.querySelector<HTMLDialogElement>("#post-toc-dialog")!;
  const body = dialog.querySelector<HTMLElement>(".toc-dialog-body")!;
  const toggle = document.querySelector<HTMLButtonElement>(".toc-toggle")!;
  const controls = new AbortController();
  const { signal } = controls;
  const media = matchMedia("(min-width: 1200px)");
  const links = [
    ...nav.querySelectorAll<HTMLAnchorElement>("[data-heading-id]"),
  ];
  const headings = links
    .map(a => document.getElementById(a.dataset.headingId!))
    .filter((h): h is HTMLElement => !!h);
  let selected: HTMLAnchorElement | undefined;
  let frame = 0;
  let locked = false;
  function unlock() {
    if (locked) document.body.style.overflow = "";
    locked = false;
  }
  function layout() {
    dialog.close();
    unlock();
    (media.matches ? home : body).append(nav!);
    toggle.hidden = media.matches;
    document.documentElement.classList.add("toc-enabled");
  }
  layout();
  media.addEventListener("change", layout, { signal });
  toggle.addEventListener(
    "click",
    () => {
      dialog.showModal();
      document.body.style.overflow = "hidden";
      locked = true;
      (selected ?? links[0])?.focus();
    },
    { signal }
  );
  dialog
    .querySelector(".toc-close")!
    .addEventListener("click", () => dialog.close(), { signal });
  dialog.addEventListener("close", unlock, { signal });
  dialog.addEventListener(
    "click",
    event => {
      if (event.target === dialog) dialog.close();
    },
    { signal }
  );
  nav.addEventListener(
    "click",
    event => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("[data-heading-id]");
      if (!link) return;
      if (dialog.open) dialog.close();
    },
    { signal }
  );
  function update() {
    frame = 0;
    // Read heading positions together, before changing the directory DOM.
    let active = headings[0];
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top > 120) break;
      active = heading;
    }
    const next = links.find(a => a.dataset.headingId === active?.id);
    if (next === selected) return;
    selected?.removeAttribute("aria-current");
    selected = next;
    next?.setAttribute("aria-current", "location");
    const group = next?.closest<HTMLDetailsElement>(".toc-group");
    if (group) group.open = true;
    if (media.matches && next) {
      const box = next.getBoundingClientRect();
      const viewport = shell.getBoundingClientRect();
      if (box.top < viewport.top || box.bottom > viewport.bottom)
        shell.scrollTop += box.top - viewport.top - 80;
    }
  }
  const requestUpdate = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const observer = new IntersectionObserver(requestUpdate, {
    rootMargin: "-80px 0px -65% 0px",
  });
  headings.forEach(h => observer.observe(h));
  window.addEventListener("hashchange", requestUpdate, { signal });
  window.addEventListener("scroll", requestUpdate, { passive: true, signal });
  update();
  dispose = () => {
    observer.disconnect();
    controls.abort();
    cancelAnimationFrame(frame);
    dialog.close();
    unlock();
    document.documentElement.classList.remove("toc-enabled");
    current = null;
  };
}
document.addEventListener("astro:page-load", initToc);
document.addEventListener("astro:before-swap", () => {
  dispose?.();
  dispose = undefined;
});
initToc();
