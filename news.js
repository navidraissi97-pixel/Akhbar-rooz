const newsList = document.getElementById("newsList");

let allNews = [];
let currentFilter = "همه";

// چند CORS proxy برای اینکه اگه یکی کار نکرد، بقیه امتحان بشن
const PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?",
  "https://api.codetabs.com/v1/proxy?quest="
];

// فیدهای ایرانی - فیدهایی که معمولاً در دسترس هستن
const FEEDS = [
  { url: "https://www.irna.ir/fa/rss.aspx?kind=-1",  cat: "ایران",   source: "ایرنا" },
  { url: "https://www.isna.ir/rss",                 cat: "ایران",   source: "ایسنا" },
  { url: "https://www.farsnews.ir/rss",             cat: "ایران",   source: "فارس" },
  { url: "https://www.tasnimnews.ir/rss/feed/0",    cat: "ایران",   source: "تسنیم" },
  { url: "https://www.varzesh3.com/rss/allnews",    cat: "ورزش",    source: "ورزش ۳" },
  { url: "https://www.isna.ir/rss/sport",           cat: "ورزش",    source: "ایسنا ورزشی" },
  { url: "https://www.mehrnews.com/rss/ID=25",      cat: "فناوری",  source: "مهر فناوری" },
  { url: "https://www.isna.ir/rss/tech",            cat: "فناوری",  source: "ایسنا فناوری" },
  { url: "https://www.irna.ir/fa/rss.aspx?kind=10", cat: "جهان",    source: "ایرنا جهان" },
  { url: "https://www.tasnimnews.ir/rss/feed/2",    cat: "جهان",    source: "تسنیم جهان" }
];

// تبدیل XML به آرایه
function parseRSS(xmlText, defaultCategory, sourceName) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "text/xml");
  const items = xml.querySelectorAll("item, entry");
  const result = [];
  items.forEach(item => {
    const title = item.querySelector("title")?.textContent?.trim() || "";
    const link  = item.querySelector("link")?.textContent?.trim() ||
                  item.querySelector("link")?.getAttribute("href") || "#";
    const pubDateRaw = item.querySelector("pubDate")?.textContent ||
                       item.querySelector("published")?.textContent ||
                       item.querySelector("dc\\:date")?.textContent || "";
    const pubDate = pubDateRaw ? new Date(pubDateRaw) : new Date();
    if (title) {
      result.push({
        title,
        link,
        author: sourceName,
        pubDate,
        category: defaultCategory
      });
    }
  });
  return result;
}

async function fetchWithProxy(feedUrl) {
  for (const proxy of PROXIES) {
    try {
      const url = proxy + encodeURIComponent(feedUrl);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) continue;
      const text = await res.text();
      if (text.includes("<rss") || text.includes("<feed")) {
        return text;
      }
    } catch (e) {
      console.warn("Proxy failed:", proxy, e);
    }
  }
  return null;
}

async function loadNews() {
  newsList.innerHTML = "<p class='no-result'>⏳ در حال دریافت اخبار از خبرگزاری‌های ایرانی...</p>";

  const promises = FEEDS.map(async feed => {
    const xml = await fetchWithProxy(feed.url);
    if (!xml) return [];
    return parseRSS(xml, feed.cat, feed.source);
  });

  const results = await Promise.allSettled(promises);
  const flat = results
    .filter(r => r.status === "fulfilled")
    .map(r => r.value)
    .flat();

  // حذف تکراری بر اساس عنوان
  const seen = new Set();
  allNews = flat
    .filter(n => {
      if (seen.has(n.title)) return false;
      seen.add(n.title);
      return true;
    })
    .sort((a, b) => b.pubDate - a.pubDate)
    .slice(0, 40)
    .map((n, i) => ({ ...n, id: i }));

  if (!allNews.length) {
    newsList.innerHTML =
      "<p class='no-result'>⚠️ نتوانستیم به فیدها وصل شویم.<br>" +
      "ممکنه اینترنتت بلاک کرده باشه. یه VPN امتحان کن یا چند دقیقه بعد بیا.</p>";
    return;
  }
  renderNews(allNews);
}

function renderNews(list) {
  if (!list.length) {
    newsList.innerHTML = "<p class='no-result'>🔍 خبری با این مشخصات پیدا نشد.</p>";
    return;
  }
  newsList.innerHTML = list.map(item => {
    const tagClass =
      item.category === "ایران"   ? "tag-iran"  :
      item.category === "جهان"   ? "tag-world" :
      item.category === "ورزش"  ? "tag-sport" :
                                   "tag-tech";
    const dateStr = isNaN(item.pubDate)
      ? "بدون تاریخ"
      : item.pubDate.toLocaleString("fa-IR", { dateStyle: "short", timeStyle: "short" });
    return `
      <article class="news" data-category="${item.category}">
        <span class="tag ${tagClass}">${item.category}</span>
        <span class="date">📅 ${dateStr}</span>
        <h2>${escapeHtml(item.title)}</h2>
        <p>منبع: ${escapeHtml(item.author)}</p>
        <a class="read" href="${item.link}" target="_blank" rel="noopener noreferrer">
          ادامه خبر ←
        </a>
      </article>`;
  }).join("");
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function filterNews(category) {
  setActiveBtn(category);
  currentFilter = category;
  document.getElementById("searchInput").value = "";
  const filtered = category === "همه" ? allNews : allNews.filter(n => n.category === category);
  renderNews(filtered);
}

function showAll() { filterNews("همه"); }

function searchNews() {
  const q = document.getElementById("searchInput").value.trim();
  const base = currentFilter === "همه" ? allNews : allNews.filter(n => n.category === currentFilter);
  if (!q) { renderNews(base); return; }
  const result = base.filter(n =>
    n.title.includes(q) || n.author.includes(q) || n.category.includes(q)
  );
  renderNews(result);
}

function setActiveBtn(category) {
  document.querySelectorAll("#nav button").forEach(btn => {
    btn.classList.toggle("active", btn.textContent.trim() === category);
  });
}

loadNews();
