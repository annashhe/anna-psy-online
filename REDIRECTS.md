# Редиректы anna-psy.online → новый сайт / .рф

Подтверждено Анной, 2026-08-02:
- страницы и слэши в конце URL (`/it/` и т.п.);
- таблица редиректов статей (3 → .рф, остальные пока на бренде).

## Зачем слэш в конце (`/it/` вместо `/it`)

На GitHub Pages (как у ваших .рф) страница лежит в папке:

`it/index.html` → адрес **`/it/`**

Без слэша (`/it`) сервер иногда сам делает редирект на `/it/`, иногда отдаёт 404.  
Слэш = «это папка со страницей», стабильнее для статики и единообразно с мужским/семейным сайтами.

На старой Тильде часто работало и `/it`, и `/it/`.  
На новом сайте: **канонический адрес со слэшем**; со старых `/it` без слэша тоже поставим редирект на `/it/`, чтобы ничего не потерять.

---

## Страницы

| Старый URL | Новый URL | Тип |
|------------|-----------|-----|
| `/` | `/` | тот же сайт |
| `/about` | `/about/` | тот же |
| `/privacy` | `/privacy/` | тот же (текст пока как на Тильде) |
| `/oferta` | `/oferta/` | тот же |
| `/thankyoupage` | `/thank-you-booking/` | тот же, noindex |
| `/psycholog-dlya-muzhchin` | `https://психолог-для-мужчин.рф/` | 301 |
| `/family` | `https://психолог-семейный-онлайн.рф/` | 301 |
| `/semeynyy-psikholog-kaliningrad` | `https://психолог-семейный-онлайн.рф/kaliningrad/` | 301 |
| `/psikholog-v-kaliningrade` | `/psikholog-v-kaliningrade/` | оставить; позже новый калининградский сайт |
| `/it` | `/it/` | оставить |
| `/parting` | `/parting/` | оставить |
| `/bloggers` | `/bloggers/` | оставить |
| `/vopros-psikhologu` | `/vopros-psikhologu/` | оставить |
| `/group2026` | `/group2026/` | оставить |
| `/blog` | `/blog/` | индекс |

Также: `/it` → `/it/`, `/about` → `/about/` и т.д. (без слэша → со слэшем).

---

## Статьи блога

| Старый URL | Куда | Примечание |
|------------|------|------------|
| `/blog/breakup/kak_zabyt_cheloveka` | `https://психолог-для-мужчин.рф/blog/kak-zabyt-cheloveka/` | есть на мужском |
| `/blog/self-knowledge/v_chem_smysl_zhizni` | `https://психолог-для-мужчин.рф/blog/v-chem-smysl-zhizni/` | есть на мужском |
| `/blog/self-knowledge/millenialy` | `https://психолог-семейный-онлайн.рф/blog/millenialy-kto-oni/` | есть на семейном |
| `/blog/breakup/kak-perezhit-rasstavanie` | пока **оставить на бренде** `/blog/breakup/kak-perezhit-rasstavanie/` | нет точной копии на .рф |
| `/blog/family/ya_nenavizhu_chuzhih_detey` | пока **на бренде** | нет на .рф |
| `/blog/self-knowledge/kak_perestat_vso_kontrolirovat` | пока **на бренде** | нет на .рф |
| `/blog/family/sozavisimost-emotsionalnaya-zavisimost` | пока **на бренде** | нет на .рф |
| `/blog/men/nastoyashchiy_muzhchina` | пока **на бренде** (тема мужская; позже можно перенести на мужской блог) | нет точной копии |

Дубль `/blog/v_chem_smysl_zhizni` → тот же мужской URL, что и полный путь.

---

## Юртексты (прозрачность)

На тесте и при переносе: **копирую текст privacy/oferta с Тильды как есть** (без смены смысла).  
Единственное, что позже согласуем отдельно: замена URL `anna-psy.online` внутри текста на финальные, если нужно, и сверка с .рф-редакциями. **Сейчас смысл не меняю.**
