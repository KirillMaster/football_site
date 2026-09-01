-- One-off publish of two news items (news_1: Агафонов Ян/Белград, news_2: зал развития).
-- Media already uploaded to S3 by the publish-news workflow.
-- Idempotent: re-run safe via ON CONFLICT (Slug).

\set s3 'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads'

-- ── News 1: Агафонов Ян — трайаут в Белграде ──────────────────────────────
INSERT INTO news
  ("Id","CreatedAt","UpdatedAt","Slug","TitleRu","TitleEn","ExcerptRu","ExcerptEn",
   "ContentRu","ContentEn","CoverImage","MetaTitle","MetaDescription","Tags","IsPublished","PublishedAt")
VALUES (
  gen_random_uuid(), now(), now(),
  'agafonov-yan-trayaut-belgrad',
  'Агафонов Ян — трайаут в Белграде',
  '',
  'Один из лучших наших воспитанников Агафонов Ян с 5 по 15 июля принял участие в трайауте в Белграде (Сербия): проверил себя на фоне 18-летних парней, привлёк внимание скаутов агентства ISO и агента из Греции.',
  '',
  $html$
<p>Один из лучших наших воспитанников Агафонов Ян с 5 по 15 июля принял участие в трайауте в Белграде (Сербия).</p>
<p>Преодолев все страхи и сомнения, за 10 пролетевших как один дней он нашёл новых друзей, проверил себя на фоне 18-летних парней (в том числе из Тоттенхэма), жаждущих попасть в европейский футбол, с достоинством показал уровень нашего воспитанника, очень уверенно показал себя в контрольных играх на позиции атакующего центрального полузащитника.</p>
<p>В первую очередь для нас стояла задача понять уровень конкуренции, получить обратную связь от специалистов агентства ISO, оценить конкурентоспособность одного из лучших наших воспитанников, чтобы для себя и всех наших детей убедиться в правильности выбранного пути их развития.</p>
<p>Ян заставил обратить на себя внимание не только скаутов агентства ISO, но и агента из Греции, предложившего перебраться в один из греческих топов.</p>
<p>Несмотря на проявленный интерес и поступившие предложения, мы все вместе (Ян, родители и я, как тренер) не хотим принимать скоропалительных решений, а работаем с агентом по поиску подходящего клуба и тренера, под руководством которого он продолжит прогрессировать.</p>
<p>Родителям всех севастопольских детей ещё раз хотим сказать: ФК Арсенал не про кубки и медали, мы про индивидуальное развитие каждого ребёнка с максимальными целями.</p>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:24px">
  <img src="https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/news1_2.jpg" alt="Агафонов Ян на трайауте в Белграде" loading="lazy" style="width:100%;height:auto;border-radius:12px" />
  <img src="https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/news1_3.jpg" alt="Агафонов Ян на трайауте в Белграде" loading="lazy" style="width:100%;height:auto;border-radius:12px" />
  <img src="https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/news1_4.jpg" alt="Агафонов Ян на трайауте в Белграде" loading="lazy" style="width:100%;height:auto;border-radius:12px" />
  <img src="https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/news1_5.jpg" alt="Агафонов Ян на трайауте в Белграде" loading="lazy" style="width:100%;height:auto;border-radius:12px" />
  <img src="https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/news1_6.jpg" alt="Агафонов Ян на трайауте в Белграде" loading="lazy" style="width:100%;height:auto;border-radius:12px" />
</div>
$html$,
  '',
  'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/news1_1.jpg',
  'Агафонов Ян — трайаут в Белграде | ФК Арсенал-92',
  'Воспитанник ФК Арсенал-92 Агафонов Ян прошёл трайаут в Белграде (Сербия), привлёк внимание скаутов агентства ISO и агента из Греции.',
  ARRAY['Воспитанники','Трайаут','Европа']::text[],
  true, now()
)
ON CONFLICT ("Slug") DO UPDATE SET
  "TitleRu"=EXCLUDED."TitleRu", "ExcerptRu"=EXCLUDED."ExcerptRu",
  "ContentRu"=EXCLUDED."ContentRu", "CoverImage"=EXCLUDED."CoverImage",
  "MetaTitle"=EXCLUDED."MetaTitle", "MetaDescription"=EXCLUDED."MetaDescription",
  "Tags"=EXCLUDED."Tags", "IsPublished"=true, "UpdatedAt"=now();

-- ── News 2: Зал для физического и когнитивного развития ────────────────────
INSERT INTO news
  ("Id","CreatedAt","UpdatedAt","Slug","TitleRu","TitleEn","ExcerptRu","ExcerptEn",
   "ContentRu","ContentEn","CoverImage","MetaTitle","MetaDescription","Tags","IsPublished","PublishedAt")
VALUES (
  gen_random_uuid(), now(), now(),
  'otkrytie-zala-razvitiya',
  'Открыли зал для физического и когнитивного развития',
  '',
  'Мы открыли зал для физического и когнитивного развития — среду для функциональной подготовки по методике американского тренера Джереми Фриша, без ранней специализации и унылой работы с железом.',
  '',
  $html$
<p>Мы открыли зал для физического и когнитивного развития.</p>
<p>Джереми Фриш — американский тренер, который вернул детям ушедшую из их жизни двигательную активность с улицы в зал. Это не обычные классические модные тренажёрные залы, это среда для функциональной подготовки, развития правильных разнообразных двигательных навыков, исправления проблем с опорно-двигательным аппаратом, это базовая подготовка для любого вида спорта, исключающая раннюю ненавистную специализацию.</p>
<p>Совершенно неожиданно в эти детские залы по всей Америке пошли и их родители — вместо унылой, скучной, монотонной работы с железом теперь и они веселятся и решают свои задачи в кругу друзей.</p>
<p>Идея зрела давно, но именно Джереми Фриш и родители 4–6-летних детей, жаждущих отдать их именно в футбол, подтолкнули к открытию такого же зала для наших юных воспитанников и всех желающих севастопольцев.</p>
<p>Уже поработали с парнями из старшей команды, провели пробную групповую тренировку — всем понравилось!</p>
<p>Ждём всех желающих!</p>
<div style="display:grid;gap:16px;margin-top:24px">
  <video controls preload="metadata" playsinline style="width:100%;border-radius:12px;background:#000">
    <source src="https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/news2_vid1.mp4" type="video/mp4" />
    Ваш браузер не поддерживает воспроизведение видео.
  </video>
  <video controls preload="metadata" playsinline style="width:100%;border-radius:12px;background:#000">
    <source src="https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/news2_vid2.mp4" type="video/mp4" />
    Ваш браузер не поддерживает воспроизведение видео.
  </video>
</div>
$html$,
  '',
  'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/news2_1.jpg',
  'Открыли зал для физического и когнитивного развития | ФК Арсенал-92',
  'ФК Арсенал-92 открыл зал функциональной подготовки по методике Джереми Фриша — физическое и когнитивное развитие детей без ранней специализации.',
  ARRAY['Клуб','Инфраструктура']::text[],
  true, now()
)
ON CONFLICT ("Slug") DO UPDATE SET
  "TitleRu"=EXCLUDED."TitleRu", "ExcerptRu"=EXCLUDED."ExcerptRu",
  "ContentRu"=EXCLUDED."ContentRu", "CoverImage"=EXCLUDED."CoverImage",
  "MetaTitle"=EXCLUDED."MetaTitle", "MetaDescription"=EXCLUDED."MetaDescription",
  "Tags"=EXCLUDED."Tags", "IsPublished"=true, "UpdatedAt"=now();

SELECT "Slug","TitleRu","CoverImage","IsPublished","PublishedAt" FROM news
WHERE "Slug" IN ('agafonov-yan-trayaut-belgrad','otkrytie-zala-razvitiya');
