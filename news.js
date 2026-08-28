async function loadNews() {
  const newsList = document.querySelector("#newsList");

  if (!newsList) return;

  newsList.innerHTML = "<p>⏳ در حال دریافت اخبار...</p>";

  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts?_limit=10"
    );

    if (!response.ok) {
      throw new Error("خطا در اتصال");
    }

    const data = await response.json();

    newsList.innerHTML = "";

    data.forEach(news => {
      const article = document.createElement("div");
      article.className = "news-item";

      article.innerHTML = 
        <h2>${news.title}</h2>
        <p>${news.body}</p>
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
