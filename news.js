async function loadNews() {
  const newsList = document.getElementById("newsList");

  if (!newsList) return;

  newsList.innerHTML = "<p>⏳ در حال دریافت اخبار...</p>";

  try {
    const rss = "https://www.isna.ir/rss";

    const url =
      "https://api.rss2json.com/v1/api.json?rss_url=" +
      encodeURIComponent(rss);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("خطا در دریافت اخبار");
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error("خبری پیدا نشد");
    }

    newsList.innerHTML = "";

    data.items.slice(0, 10).forEach(news => {
      const article = document.createElement("div");
      article.className = "news-item";

      article.innerHTML = 
        <h2>${news.title}</h2>
        <p>${news.description || ""}</p>
        <a href="${news.link}" target="_blank" rel="noopener">
          ادامه خبر
        </a>
      ;

      newsList.appendChild(article);
    });

  } catch (error) {
    console.error(error);

    newsList.innerHTML = 
      <div class="news-item">
        <h2>⚠️ دریافت اخبار انجام نشد</h2>
        <p>لطفاً چند لحظه بعد دوباره صفحه را باز کنید.</p>
      </div>
    ;
  }
}

loadNews();
