const newsList = document.getElementById("newsList");

if (newsList) {
  newsList.innerHTML = 
    <div class="news-item">
      <h2>خبر آزمایشی</h2>
      <p>اگر این متن را می‌بینی، سیستم نمایش اخبار آماده است.</p>
      <a href="#" target="_blank">ادامه خبر</a>
    </div>
  ;
}
