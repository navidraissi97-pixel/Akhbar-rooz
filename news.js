const newsList = document.getElementById("newsList");

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
      newsList.innerHTML = "<p>خبری پیدا نشد.</p>";
      return;
    }

    newsList.innerHTML = "";

    data.items.slice(0, 10).forEach(item => {
      const article = document.createElement("article");
      article.className = "news";

      article.innerHTML = 
        <span class="tag">اخبار روز</span>
        <div class="date">
          ${new Date(item.pubDate).toLocaleString("fa-IR")}
        </div>
        <h2>${item.title}</h2>
        <p>منبع: ${item.author || "Google News"}</p>
        <a class="read" href="${item.link}" target="_blank">
          ادامه خبر
        </a>
      ;

      newsList.appendChild(article);
    });

  } catch (error) {
    newsList.innerHTML =
      "<p>خطا در دریافت اخبار. دوباره تلاش کنید.</p>";
  }
}

loadNews();
