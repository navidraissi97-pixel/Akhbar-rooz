async function loadNews() {
  const dataBox = document.querySelector(".data");

  if (!dataBox) return;

  dataBox.innerHTML = "<p>در حال تست...</p>";

  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts?_limit=5"
    );

    const data = await response.json();

    dataBox.innerHTML = "";

    data.forEach(news => {
      const article = document.createElement("div");
      article.className = "news-item";

      article.innerHTML = 
        <h2>${news.title}</h2>
        <p>${news.body}</p>
      ;

      dataBox.appendChild(article);
    });

  } catch (error) {
    console.error(error);
    dataBox.innerHTML = "<p>اتصال برقرار نشد.</p>";
  }
}

loadNews();
