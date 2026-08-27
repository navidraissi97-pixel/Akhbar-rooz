name: دریافت اخبار ایرانی

on:
  schedule:
    - cron: '*/15 * * * *'        # هر ۱۵ دقیقه
  workflow_dispatch:

jobs:
  fetch-news:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: دریافت فیدها
        run: |
          mkdir -p ./_feeds

          fetch_feed() {
            local url="$1"
            local source="$2"
            local file="_feeds/${source}.xml"
            echo "📡 $source ..."
            curl -sL --max-time 15 -A "Mozilla/5.0" "$url" -o "$file" 2>/dev/null || echo "" > "$file"
          }

          fetch_feed "https://www.irna.ir/fa/rss.aspx?kind=-1"        "irna-main"
          fetch_feed "https://www.isna.ir/rss"                         "isna-main"
          fetch_feed "https://www.farsnews.ir/rss"                     "fars-main"
          fetch_feed "https://www.tasnimnews.ir/rss/feed/0"            "tasnim-main"
          fetch_feed "https://www.varzesh3.com/rss/allnews"            "varzesh3"
          fetch_feed "https://www.isna.ir/rss/sport"                   "isna-sport"
          fetch_feed "https://www.mehrnews.com/rss/ID=25"              "mehr-tech"
          fetch_feed "https://www.isna.ir/rss/tech"                    "isna-tech"
          fetch_feed "https://www.irna.ir/fa/rss.aspx?kind=10"         "irna-world"
          fetch_feed "https://www.tasnimnews.ir/rss/feed/2"            "tasnim-world"

      - name: ساخت news.json
        run: |
          node -e "
          const fs = require('fs');
          const path = require('path');
          const seen = new Set();
          const items = [];
          const feedsDir = '_feeds';
          if (!fs.existsSync(feedsDir)) { fs.writeFileSync('news.json', '[]'); process.exit(0); }
          for (const f of fs.readdirSync(feedsDir)) {
            const xml = fs.readFileSync(path.join(feedsDir, f), 'utf8');
            const source = f.replace('.xml','');
            const itemMatches = [...xml.matchAll(/<item[\\s\\S]*?<\\/item>/g)];
            for (const m of itemMatches) {
              const block = m[0];
              const get = (tag) => {
                const r = block.match(new RegExp('<'+tag+'[^>]*>([\\s\\S]*?)<\\/'+tag+'>'));
                return r ? r[1].replace(/<!\\[CDATA\\[|\\]\\]>/g,'').replace(/\\s+/g,' ').trim() : '';
              };
              const title = get('title');
              const link  = get('link') || get('guid');
              const date  = get('pubDate') || get('dc:date') || get('published');
              if (!title || seen.has(title)) continue;
              seen.add(title);
              items.push({ title: title.slice(0,200), link, author: source, pubDate: date, category: 'ایران' });
            }
          }
          items.sort((a,b) => new Date(b.pubDate||0) - new Date(a.pubDate||0));
          fs.writeFileSync('news.json', JSON.stringify(items.slice(0,80), null, 2));
          console.log('✅ تعداد خبر:', items.length);
          "

      - name: حدس دسته
        run: |
          node -e "
          const fs = require('fs');
          const news = JSON.parse(fs.readFileSync('news.json','utf8'));
          const cat = (t='') => {
            t = t.toLowerCase();
            if (/(فوتبال|والیبال|تیم|لیگ|قهرمان|مربی|بازیکن|ورزش|پرسپولیس|استقلال|تراکتور|سپاهان|گل|مسابقه|جام|بسکتبال|کشتی|تنیس)/.test(t)) return 'ورزش';
            if (/(گوشی|اپلیکیشن|هوش مصنوعی|تراشه|فناوری|دیجیتال|کامپیوتر|نرم‌افزار|اینترنت|اپل|سامسونگ|ربات|chatgpt)/.test(t)) return 'فناوری';
            if (/(ایران|تهران|مجلس|وزیر|دولت|انتخابات|استان|یارانه|سبد کالا|قیمت|بازار|دلار|سکه|اقتصاد|تورم)/.test(t)) return 'ایران';
            return 'جهان';
          };
          for (const n of news) n.category = cat(n.title);
          fs.writeFileSync('news.json', JSON.stringify(news, null, 2));
          "
          rm -rf _feeds

      - name: ثبت تغییرات
        run: |
          git config user.name "news-bot"
          git config user.email "bot@users.noreply.github.com"
          git add news.json
          git diff --staged --quiet || git commit -m "🤖 بروزرسانی خودکار اخبار - $(date -u +'%Y-%m-%d %H:%M')"
          git push
