let currentArticle = null;
let cleanup = () => {};
function initArticle() {
  const article = document.getElementById("article");
  if (article === currentArticle) return;
  cleanup();
  currentArticle = article;
  if (!article) return;
  const controller = new AbortController();
  const { signal } = controller;
  let frame = 0;
  const backContainer = document.getElementById("btt-btn-container");
  const backButton = document.querySelector("[data-button='back-to-top']");
  const backProgress = document.getElementById("progress-indicator");
  backButton?.addEventListener(
    "click",
    () => window.scrollTo({ top: 0, behavior: "instant" }),
    { signal }
  );
  let backVisible;

  const progress = document.createElement("div");
  progress.className = "reading-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.append(progress);
  function updateProgress() {
    frame = 0;
    const height = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${height > 0 ? Math.min(1, scrollY / height) : 0})`;
    const percent = height > 0 ? Math.min(100, (scrollY / height) * 100) : 0;
    backProgress?.style.setProperty(
      "background-image",
      `conic-gradient(var(--color-accent) ${percent}%, transparent ${percent}%)`
    );
    const visible = percent > 30;
    if (visible !== backVisible) {
      backContainer?.classList.toggle("opacity-100", visible);
      backContainer?.classList.toggle("translate-y-0", visible);
      backContainer?.classList.toggle("opacity-0", !visible);
      backContainer?.classList.toggle("translate-y-14", !visible);
      backContainer?.classList.toggle("pointer-events-none", !visible);
      if (backButton) backButton.disabled = !visible;
      backVisible = visible;
    }
  }
  document.addEventListener(
    "scroll",
    () => {
      if (!frame) frame = requestAnimationFrame(updateProgress);
    },
    { passive: true, signal }
  );
  updateProgress();
  for (const heading of article.querySelectorAll("h2, h3, h4, h5, h6")) {
    if (heading.querySelector(".heading-link")) continue;
    heading.classList.add("group");
    const link = document.createElement("a");
    link.className =
      "heading-link ms-2 no-underline opacity-75 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100";
    link.href = "#" + heading.id;
    link.setAttribute("aria-label", `链接到：${heading.textContent}`);
    link.innerHTML = '<span aria-hidden="true">#</span>';
    heading.append(link);
  }
  // CSS handles file-name offsets: do not interleave computed-style reads and writes.
  for (const block of article.querySelectorAll(
    "pre:not(.mermaid-source):not(.mermaid-diagram pre)"
  )) {
    if (block.querySelector(".copy-code")) continue;
    const wrapper = document.createElement("div");
    wrapper.className = "code-wrapper";
    block.before(wrapper);
    wrapper.append(block);
    block.tabIndex = 0;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "copy-code";
    button.textContent = "复制";
    button.setAttribute("aria-label", "复制代码");
    button.setAttribute("aria-live", "polite");
    block.append(button);
  }
  article.addEventListener(
    "click",
    async event => {
      const button =
        event.target instanceof Element
          ? event.target.closest(".copy-code")
          : null;
      if (!button) return;
      const code = button.closest("pre")?.querySelector("code");
      try {
        await navigator.clipboard.writeText(code?.textContent ?? "");
        button.textContent = "已复制";
      } catch {
        button.textContent = "复制失败，请手动选择";
      }
      setTimeout(() => {
        if (button.isConnected) button.textContent = "复制";
      }, 1500);
    },
    { signal }
  );
  /** Accessible image lightbox for article images. */
  function initLightbox() {
    const article = document.getElementById("article");
    if (!article) return;

    const prefersReducedMotion = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let overlay = null;
    let lastFocused = null;

    // Defer attribute mutations so they don't push the LCP timestamp.
    // Event listeners below use delegation and don't need the attributes to exist yet.
    requestAnimationFrame(() => {
      const images = Array.from(article.querySelectorAll("img"));
      for (const image of images) {
        if (image.closest("a")) continue;
        image.setAttribute("role", "button");
        image.setAttribute("tabindex", "0");
        image.setAttribute("aria-haspopup", "dialog");
        image.setAttribute(
          "aria-label",
          image.alt ? `放大图片：${image.alt}` : "放大图片"
        );
      }
    });

    function open(src, alt, trigger) {
      if (overlay) return;
      lastFocused = trigger ?? document.activeElement;

      overlay = document.createElement("div");
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-label", alt ? `图片预览：${alt}` : "图片预览");
      overlay.className =
        "fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/70 backdrop-blur-sm opacity-0 transition-opacity duration-200 motion-reduce:transition-none";

      const closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.setAttribute("aria-label", "关闭图片预览");
      closeButton.className =
        "absolute end-4 top-4 rounded p-2 text-3xl leading-none text-white";
      closeButton.innerHTML = "&#10005;";
      closeButton.addEventListener("click", close);

      const image = document.createElement("img");
      image.src = src;
      image.alt = "";
      image.className =
        "max-h-[90dvh] max-w-[90dvw] cursor-default object-contain";

      overlay.append(closeButton, image);
      overlay.addEventListener("click", e => {
        if (e.target === overlay && currentScale <= 1) close();
      });

      let currentScale = 1;
      let translateX = 0;
      let translateY = 0;
      let initialDist = 0;
      let initialScale = 1;
      let panStartX = 0;
      let panStartY = 0;
      let panStartTranslateX = 0;
      let panStartTranslateY = 0;
      let lastTapTime = 0;

      function applyTransform() {
        image.style.transform = `scale(${currentScale}) translate(${translateX}px, ${translateY}px)`;
      }

      function resetTransform() {
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        image.style.transform = "";
      }

      overlay.addEventListener(
        "touchstart",
        e => {
          const t = e.touches;
          if (t.length === 2) {
            initialDist = Math.hypot(
              t[1].clientX - t[0].clientX,
              t[1].clientY - t[0].clientY
            );
            initialScale = currentScale;
          } else if (t.length === 1) {
            const now = Date.now();
            if (now - lastTapTime < 300) {
              e.preventDefault();
              if (currentScale > 1) {
                resetTransform();
              } else {
                currentScale = 2;
                translateX = 0;
                translateY = 0;
                applyTransform();
              }
              lastTapTime = 0;
              panStartX = t[0].clientX;
              panStartY = t[0].clientY;
              panStartTranslateX = translateX;
              panStartTranslateY = translateY;
            } else {
              lastTapTime = now;
              if (currentScale > 1) {
                panStartX = t[0].clientX;
                panStartY = t[0].clientY;
                panStartTranslateX = translateX;
                panStartTranslateY = translateY;
              }
            }
          }
        },
        { passive: false }
      );

      overlay.addEventListener(
        "touchmove",
        e => {
          const t = e.touches;
          if (t.length === 2) {
            e.preventDefault();
            const dist = Math.hypot(
              t[1].clientX - t[0].clientX,
              t[1].clientY - t[0].clientY
            );
            currentScale = Math.min(
              4,
              Math.max(1, initialScale * (dist / initialDist))
            );
            applyTransform();
          } else if (t.length === 1) {
            if (currentScale > 1) {
              e.preventDefault();
              translateX =
                panStartTranslateX + (t[0].clientX - panStartX) / currentScale;
              translateY =
                panStartTranslateY + (t[0].clientY - panStartY) / currentScale;
              const maxX = Math.max(
                0,
                (image.clientWidth - overlay.clientWidth / currentScale) / 2
              );
              const maxY = Math.max(
                0,
                (image.clientHeight - overlay.clientHeight / currentScale) / 2
              );
              translateX = Math.min(maxX, Math.max(-maxX, translateX));
              translateY = Math.min(maxY, Math.max(-maxY, translateY));
              applyTransform();
            } else {
              e.preventDefault();
            }
          }
        },
        { passive: false }
      );

      overlay.addEventListener("touchend", e => {
        if (e.touches.length === 0 && currentScale <= 1.05) {
          resetTransform();
        }
      });

      overlay.addEventListener("touchcancel", e => {
        if (e.touches.length === 0 && currentScale <= 1.05) {
          resetTransform();
        }
      });

      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onKeyDown);
      window.__closeLightbox = close;

      requestAnimationFrame(() => overlay?.classList.add("opacity-100"));
      closeButton.focus();
    }

    function close() {
      if (!overlay) return;
      const el = overlay;
      overlay = null;
      window.__closeLightbox = null;

      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      lastFocused?.focus();
      lastFocused = null;

      if (prefersReducedMotion()) {
        el.remove();
        return;
      }
      const remove = () => el.remove();
      el.addEventListener("transitionend", remove, { once: true });
      setTimeout(remove, 250); // fallback in case transitionend never fires
      el.classList.remove("opacity-100");
    }

    function onKeyDown(e) {
      if (e.key === "Escape") {
        close();
      } else if (e.key === "Tab") {
        trapFocus(e);
      }
    }

    // Keep keyboard focus inside the open dialog.
    function trapFocus(e) {
      if (!overlay) return;
      const focusables = overlay.querySelectorAll(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    function triggerFromEvent(e) {
      const image = e.target.closest("img");
      if (!image || !article.contains(image) || image.closest("a")) return null;
      return image;
    }

    function activate(image) {
      open(image.currentSrc || image.src, image.alt, image);
    }

    article.addEventListener("click", e => {
      const image = triggerFromEvent(e);
      if (!image) return;
      e.preventDefault();
      activate(image);
    });

    article.addEventListener("keydown", e => {
      if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
      const image = triggerFromEvent(e);
      if (!image) return;
      e.preventDefault();
      activate(image);
    });
  }
  initLightbox();

  cleanup = () => {
    controller.abort();
    cancelAnimationFrame(frame);
    window.__closeLightbox?.();
    progress.remove();
    currentArticle = null;
  };
}
document.addEventListener("astro:page-load", initArticle);
document.addEventListener("astro:before-swap", () => cleanup());
initArticle();
