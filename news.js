const newsList = document.getElementById("newsList");

let allNews = [];
let currentFilter = "همه";

// فیدهای ایرانی - هر دستبندی چند فید مختلف برای تنوع
const FEEDS = {
  "ایران": [
    "https://www.irna.ir/fa/rss.aspx?kind=-1",
    "https://www.farsnews.ir/rss"
  ],
  "ورزش": [
    "https://www.varzesh3.com/rss/allnews",
    "https://www.isna.ir/rss/sport"
  ],
  "فناوری": [
    "https://www.isna.ir/rss/tech",
    "https://www.mehrnews.com/rss/ID=25"
  ],
  "جهان": [
    "https://www.irna.ir/fa/rss.aspx?kind=10",
    "https://www.tasnimnews.ir/rss/feed/2"
  ]
};

// گرفتن یک فید با timeout
async function fetchFeed(url) {
  try {
    const apiUrl = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map(item => ({
      title: item.title || "بدون عنوان",
      link: item.link || "#",
      author: (data.feed && data.feed.title) ? data.feed.title : "خبرگزاری",
      pubDate: item.pubDate ? new Date(item.pubDate) : new Date()
    }));
  } catch (e) {
    console.warn("Feed failed:", url, e);
    return [];
  }
}

async function loadNews() {
  const sources = Object.values(FEEDS).flat();
  const results = await Promise.all(sources.map(fetchFeed));
  const flat = results.flat();

  // حذف تکراری بر اساس عنوان
  const seen = new Set();
  allNews = flat.filter(n => {
    if (seen.has(n.title)) return false;
    seen.add(n.title);
    return true;
  })
  .sort((a, b) => b.pubDate - a.pubDate) // مرتب‌سازی از جدید به قدیم
  .slice(0, 30)
  .map((n, i) => ({ ...n, id: i, category: guessCategory(n.title) }));

  if (!allNews.length) {
    newsList.innerHTML =
      "<p class='no-result'>⚠️ نتوانستیم به فیدها وصل شویم. اینترنتت رو چک کن یا بعداً امتحان کن.</p>";
    return;
  }
  renderNews(allNews);
}

function guessCategory(title = "") {
  const t = title.toLowerCase();
  if (/(فوتبال|والیبال|بازی|تیم|لیگ|قهرمان|مربی|بازیکن|ورزش|پرسپولیس|استقلال|تراکتور|سپاهان|پیروزی|گل|مسابقه|جام)/.test(t)) return "ورزش";
  if (/(گوشی|اپلیکیشن|هوش مصنوعی|تراشه|فناوری|دیجیتال|کامپیوتر|نرم‌افزار|اینترنت|اپل|سامسونگ|هوشمند|ربات|chatgpt|دیجیتال|اپ)/.test(t)) return "فناوری";
  if (/(ایران|تهران|دولت|مجلس|وزیر|رئیس‌جمهور|انتخابات|کشور|داخلی|استان|شهر|بارانه|سبد کالا|یارانه|قیمت|بازار|دلار|سکه|اقتصاد)/.test(t)) return "ایران";
  return "جهان";
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
  const filtered = category === "همه"
    ? allNews
    : allNews.filter(n => n.category === category);
  renderNews(filtered);
}

function showAll() { filterNews("همه"); }

function searchNews() {
  const q = document.getElementById("searchInput").value.trim();
  const base = currentFilter === "همه"
    ? allNews
    : allNews.filter(n => n.category === currentFilter);
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
