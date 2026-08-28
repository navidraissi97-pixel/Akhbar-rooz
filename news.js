[28/08/2026 7:39 am] رئیس: <!DOCTYPE html>
<html lang="fa" dir="rtl">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>اخبار روز</title>

  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      color: #222;
    }

    header {
      background: #c00;
      color: white;
      padding: 20px;
      text-align: center;
    }

    nav {
      display: flex;
      justify-content: center;
      gap: 8px;
      padding: 10px;
      background: white;
    }

    nav button {
      padding: 8px 15px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }

    nav button.active {
      background: #c00;
      color: white;
    }

    .container {
      max-width: 900px;
      margin: auto;
      padding: 15px;
    }

    .breaking {
      background: white;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 8px;
    }

    .search {
      display: flex;
      gap: 5px;
      margin-bottom: 20px;
    }

    .search input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }

    .search button {
      padding: 10px 20px;
      border: none;
      background: #c00;
      color: white;
      border-radius: 5px;
    }

    .title {
      margin-bottom: 15px;
    }

    #newsList {
      background: white;
      padding: 15px;
      border-radius: 8px;
    }

    .news-item {
      padding: 15px 0;
      border-bottom: 1px solid #ddd;
    }

    .news-item h2 {
      font-size: 20px;
      margin-top: 0;
    }

    .news-item p {
      line-height: 1.8;
    }

    footer {
      text-align: center;
      padding: 20px;
      margin-top: 30px;
      background: white;
    }
  </style>
</head>

<body>

  <header>
    <h1>اخبار روز</h1>
    <p>آخرین اخبار ایران و جهان</p>
  </header>

  <nav id="nav">
    <button class="active">همه</button>
    <button>ایران</button>
    <button>جهان</button>
    <button>ورزش</button>
    <button>فناوری</button>
  </nav>

  <div class="container">

    <div class="breaking">
      🔴 خبر فوری | تازه‌ترین رویدادهای مهم را اینجا دنبال کنید
    </div>

    <div class="search">
      <input
        id="searchInput"
        type="text"
        placeholder="جستجوی خبر..."
      >

      <button>
        جستجو
      </button>
    </div>

    <h2 class="title">آخرین اخبار</h2>

    <div id="newsList">
      <p>⏳ در حال بارگذاری اخبار...</p>
    </div>

  </div>

  <footer>
    <p>© ۱۴۰۵ — ساخته شده با ❤️ | درباره ما · تماس</p>
  </footer>

  <script>
    alert("index کار می‌کند");
  </script>

  <script src="news.js"></script>

</body>
</html>
[28/08/2026 7:46 am] رئیس: <script src="./news.js"></script>
[28/08/2026 7:48 am] رئیس: async function loadNews() {
  const newsList = document.querySelector("#newsList");

  if (!newsList) return;

  newsList.innerHTML = "<p>⏳ در حال دریافت اخبار...</p>";

  try {
    const rss = "https://en.mehrnews.com/rss/tp/575";

    const url =
      "https://api.rss2json.com/v1/api.json?rss_url=" +
      encodeURIComponent(rss);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("خطا در دریافت اخبار");
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      newsList.innerHTML = "<p>خبری پیدا نشد.</p>";
      return;
    }

    newsList.innerHTML = "";

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

      newsList.appendChild(article);
    });

  } catch (error) {
    console.error(error);

    newsList.innerHTML =
      "<p>❌ خطا در دریافت اخبار</p>";
  }
}

loadNews();
