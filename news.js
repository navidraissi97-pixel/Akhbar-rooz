..async function loadNews() {
  const dataBox = document.querySelector(".data");

  if (!dataBox) return;

  dataBox.innerHTML = "<p>در حال دریافت اخبار...</p>";

  const rss = "https://en.mehrnews.com/rss/tp/575";

  const url =
    "https://api.rss2json.com/v1/api.json?rss_url=" +
    encodeURIComponent(rss);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      dataBox.innerHTML = "<p>خبری پیدا نشد.</p>";
      return;
    }

    dataBox.innerHTML = "";

    data.items.slice(0, 10).forEach(news => {
      const article = document.createElement("div");
      article.className = "news-item";

      article.innerHTML = 
        <h2>${news.title}</h2>
        <p>${news.description || ""}</p>
        <a href="${news.link}" target="_blank">
          ادامه خبر
        </a>
      ;

      dataBox.appendChild(article);
    });

  } catch (error) {
    console.error(error);

    dataBox.innerHTML =
      "<p>خطا در دریافت اخبار. دوباره تلاش کنید.</p>";
  }
}

loadNews();
