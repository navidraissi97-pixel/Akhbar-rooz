const newsList = document.getElementById("newsList");

let allNews = [];
let currentFilter = "همه";

async function loadNews() {
  try {
    const url =
      "https://api.rss2json.com/v1/api.json?rss_url=" +
      encodeURIComponent(
        "https://news.google.com/rss?hl=fa&gl=IR&ceid=IR:fa"
      );

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      newsList.innerHTML = "<p class='no-result'>خبری پیدا نشد.</p>";
      return;
    }

    allNews = data.items.slice(0, 20).map((item, i) => ({
      id: i,
      title: item.title || "بدون عنوان",
      link: item.link || "#",
      author: (item.author && item.author.trim()) || "Google News",
      pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      category: guessCategory(item.title)
    }));

    renderNews(allNews);

  } catch (error) {
    console.error(error);
    newsList.innerHTML =
      "<p class='no-result'>⚠️ خطا در دریافت اخبار. دوباره تلاش کنید.</p>";
  }
}

function guessCategory(title = "") {
  const t = title.toLowerCase();
  if (/(فوتبال|والیبال|بازی|تیم|لیگ|قهرمان|مربی|بازیکن|ورزش)/.test(t)) return "ورزش";
  if (/(گوشی|اپلیکیشن|هوش مصنوعی|تراشه|فناوری|دیجیتال|کامپیوتر|نرم‌افزار|اینترنت|اپل|سامسونگ|گوگل|مایکروسافت|chatgpt|gpt)/.test(t)) return "فناوری";
  if (/(ایران|تهران|دولت|مجلس|وزیر|رئیس‌جمهور|انتخابات|کشور|داخلی|استان|شهر)/.test(t)) return "ایران";
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
      </article>
    `;
  }).join("");
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

function showAll() {
  filterNews("همه");
}

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
