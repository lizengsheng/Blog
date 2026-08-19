/* eslint-disable no-console */

const DEFAULT_SITE = "https://lizengsheng.github.io/Blog/";
const startUrl = new URL(process.argv[2] ?? DEFAULT_SITE);
const sitePrefix = startUrl.pathname.endsWith("/")
  ? startUrl.pathname
  : `${startUrl.pathname}/`;

const siteRoot = new URL(startUrl);
siteRoot.pathname = sitePrefix;
siteRoot.search = "";
siteRoot.hash = "";

const seedPaths = [
  "",
  "404.html",
  "rss.xml",
  "sitemap-index.xml",
  "robots.txt",
];
const pendingInternal = seedPaths.map(path => new URL(path, siteRoot));
const queuedInternal = new Set(pendingInternal.map(withoutFragment));
const checkedInternal = new Map();
const externalSources = new Map();
const fragmentChecks = [];
const brokenInternal = [];

const ignoredProtocols = new Set(["data:", "javascript:", "mailto:", "tel:"]);

function withoutFragment(url) {
  const copy = new URL(url);
  copy.hash = "";
  return copy.href;
}

function isInternal(url) {
  return url.origin === startUrl.origin && url.pathname.startsWith(sitePrefix);
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function addExternal(url, source) {
  const sources = externalSources.get(url.href) ?? new Set();
  sources.add(source);
  externalSources.set(url.href, sources);
}

function addUrl(rawValue, sourceUrl) {
  const value = decodeHtml(rawValue.trim());
  if (!value || (value.startsWith("#") && value === "#")) return;

  let url;
  try {
    url = new URL(value, sourceUrl);
  } catch {
    brokenInternal.push({
      url: value,
      source: sourceUrl,
      reason: "URL 无法解析",
    });
    return;
  }

  if (ignoredProtocols.has(url.protocol)) return;
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  if (!isInternal(url)) {
    addExternal(url, sourceUrl);
    return;
  }

  if (url.hash) {
    fragmentChecks.push({
      page: withoutFragment(url),
      fragment: decodeURIComponent(url.hash.slice(1)),
      source: sourceUrl,
    });
  }

  const fetchUrl = withoutFragment(url);
  if (!queuedInternal.has(fetchUrl)) {
    queuedInternal.add(fetchUrl);
    pendingInternal.push(new URL(fetchUrl));
  }
}

function extractHtmlLinks(html, pageUrl) {
  const attributePattern = /\b(?:href|src)\s*=\s*["']([^"']+)["']/giu;
  for (const match of html.matchAll(attributePattern))
    addUrl(match[1], pageUrl);

  const srcsetPattern = /\bsrcset\s*=\s*["']([^"']+)["']/giu;
  for (const match of html.matchAll(srcsetPattern)) {
    for (const candidate of match[1].split(",")) {
      const url = candidate.trim().split(/\s+/u)[0];
      if (url) addUrl(url, pageUrl);
    }
  }
}

function extractIds(html) {
  const ids = new Set();
  const idPattern = /\b(?:id|name)\s*=\s*["']([^"']+)["']/giu;
  for (const match of html.matchAll(idPattern)) ids.add(decodeHtml(match[1]));
  return ids;
}

async function fetchWithTimeout(url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": "Li-Zengsheng-Blog-Link-Checker/1.0" },
        signal: AbortSignal.timeout(15_000),
      });
      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || attempt === 3) return response;
      await response.body?.cancel();
    } catch (error) {
      lastError = error;
      if (attempt === 3) throw error;
    }
    await new Promise(resolve => setTimeout(resolve, attempt * 250));
  }
  throw lastError;
}

while (pendingInternal.length > 0) {
  const url = pendingInternal.shift();
  const source = url.href;
  try {
    const response = await fetchWithTimeout(url);
    const contentType = response.headers.get("content-type") ?? "";
    const result = { status: response.status, ids: new Set(), contentType };
    checkedInternal.set(source, result);

    if (!response.ok) {
      brokenInternal.push({
        url: source,
        source: "站内巡检",
        reason: `HTTP ${response.status}`,
      });
      await response.body?.cancel();
      continue;
    }

    if (contentType.includes("text/html")) {
      const html = await response.text();
      result.ids = extractIds(html);
      extractHtmlLinks(html, source);
    } else {
      await response.body?.cancel();
    }
  } catch (error) {
    checkedInternal.set(source, { status: 0, ids: new Set(), contentType: "" });
    brokenInternal.push({
      url: source,
      source: "站内巡检",
      reason: error.message,
    });
  }
}

for (const check of fragmentChecks) {
  const page = checkedInternal.get(check.page);
  if (
    page?.status >= 200 &&
    page.status < 400 &&
    !page.ids.has(check.fragment)
  ) {
    brokenInternal.push({
      url: `${check.page}#${encodeURIComponent(check.fragment)}`,
      source: check.source,
      reason: "目标锚点不存在",
    });
  }
}

const externalEntries = [...externalSources.entries()];
const externalResults = [];
let externalIndex = 0;

async function checkExternalWorker() {
  while (externalIndex < externalEntries.length) {
    const [url, sources] = externalEntries[externalIndex++];
    try {
      const response = await fetchWithTimeout(url);
      const status = response.status;
      await response.body?.cancel();
      let category = "ok";
      if ([401, 403, 405, 429].includes(status) || status >= 500)
        category = "unverifiable";
      else if (status >= 400) category = "broken";
      externalResults.push({ url, status, category, sources: [...sources] });
    } catch (error) {
      externalResults.push({
        url,
        status: 0,
        category: "unverifiable",
        reason: error.message,
        sources: [...sources],
      });
    }
  }
}

await Promise.all(
  Array.from(
    { length: Math.min(6, externalEntries.length) },
    checkExternalWorker
  )
);

const brokenExternal = externalResults.filter(
  result => result.category === "broken"
);
const unverifiableExternal = externalResults.filter(
  result => result.category === "unverifiable"
);

console.log(`站点：${startUrl.href}`);
console.log(`站内页面与资源：${checkedInternal.size}`);
console.log(`外部 HTTP(S) 链接：${externalResults.length}`);
console.log(`站内失效：${brokenInternal.length}`);
console.log(`外部失效：${brokenExternal.length}`);
console.log(`外部无法自动验证：${unverifiableExternal.length}`);

for (const item of brokenInternal) {
  console.log(`BROKEN INTERNAL ${item.url} <- ${item.source} (${item.reason})`);
}
for (const item of brokenExternal) {
  console.log(`BROKEN EXTERNAL ${item.url} (HTTP ${item.status})`);
  console.log(`  来源：${item.sources.join(", ")}`);
}
for (const item of unverifiableExternal) {
  const reason = item.status ? `HTTP ${item.status}` : item.reason;
  console.log(`UNVERIFIABLE ${item.url} (${reason})`);
  console.log(`  来源：${item.sources.join(", ")}`);
}

if (brokenInternal.length > 0 || brokenExternal.length > 0)
  process.exitCode = 1;
