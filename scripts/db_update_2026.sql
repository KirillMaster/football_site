-- ===== Mail1: Coaches =====
-- Update Igor: position, photo, bio
UPDATE coaches SET
  "PositionRu" = 'Главный тренер',
  "PositionEn" = 'Head coach',
  "Photo" = 'https://s3.twcstorage.ru/577cc034-8ff38061-52e3-42ed-af0c-f06c744e4e66/uploads/igor_main_2026.jpg',
  "BioRu" = 'Мы прилагаем все усилия для организации стажировок, просмотров, сборов, интенсивов наших лучших игроков, ставящих перед собой максимальные цели, в клубах и академиях РПЛ и Европы, сотрудничаем с футбольными агентами с целью подписания ими первого профессионального контракта.',
  "BioEn" = '',
  "UpdatedAt" = NOW()
WHERE "NameRu" = 'Кулиев Игорь Рамизович';

-- Delete Зализняк (and his schedules will be reassigned later)
DELETE FROM schedules WHERE "CoachId" = (SELECT "Id" FROM coaches WHERE "NameRu" = 'Зализняк Андрей');
DELETE FROM coaches WHERE "NameRu" = 'Зализняк Андрей';

-- Add Кива Евгений Игоревич
INSERT INTO coaches ("Id","NameRu","NameEn","PositionRu","PositionEn","BioRu","BioEn","Certifications","SortOrder","IsActive","CreatedAt","UpdatedAt")
VALUES (
  gen_random_uuid(),
  'Кива Евгений Игоревич',
  'Evgeny Kiva',
  'Тренер',
  'Coach',
  '',
  '',
  '{}',
  2,
  true,
  NOW(),
  NOW()
);

-- ===== Mail2: Groups & Schedules =====
-- Delete old schedules and group
DELETE FROM schedules WHERE "GroupId" IN (SELECT "Id" FROM groups);
DELETE FROM groups;

-- Create U-17, U-12, U-10
INSERT INTO groups ("Id","Name","AgeRange","Level","MaxCapacity","DescriptionRu","DescriptionEn","IsActive","CreatedAt","UpdatedAt")
VALUES
  (gen_random_uuid(), 'U-17', '14-16 лет', 'all', 25,
   'Группа формируется по уровню подготовки из воспитанников 2010–2012 г.р.', '',
   true, NOW(), NOW()),
  (gen_random_uuid(), 'U-12', '8-12 лет', 'all', 25,
   'Группа формируется по уровню подготовки из воспитанников 2014–2016 г.р.', '',
   true, NOW(), NOW()),
  (gen_random_uuid(), 'U-10', '6-10 лет', 'all', 25,
   'Группа формируется по уровню подготовки из воспитанников 2016–2018 г.р.', '',
   true, NOW(), NOW());

-- Insert schedules
-- U-17 with Кулиев
WITH g AS (SELECT "Id" FROM groups WHERE "Name" = 'U-17'),
     c AS (SELECT "Id" FROM coaches WHERE "NameRu" = 'Кулиев Игорь Рамизович')
INSERT INTO schedules ("Id","GroupId","CoachId","DayOfWeek","StartTime","EndTime","Location","IsActive","CreatedAt","UpdatedAt")
SELECT gen_random_uuid(), g."Id", c."Id", dow, st::time, et::time,
       'Спорткомплекс школы №61, ул. Косарева, д.12', true, NOW(), NOW()
FROM g, c, (VALUES
  (1, '18:00', '19:30'),  -- понедельник групповая
  (2, '17:00', '18:00'),  -- вторник физподготовка
  (3, '18:00', '19:30'),  -- среда групповая
  (4, '17:00', '18:00'),  -- четверг физподготовка
  (5, '18:00', '19:30')   -- пятница групповая
) AS s(dow, st, et);

-- U-12 with Кулиев
WITH g AS (SELECT "Id" FROM groups WHERE "Name" = 'U-12'),
     c AS (SELECT "Id" FROM coaches WHERE "NameRu" = 'Кулиев Игорь Рамизович')
INSERT INTO schedules ("Id","GroupId","CoachId","DayOfWeek","StartTime","EndTime","Location","IsActive","CreatedAt","UpdatedAt")
SELECT gen_random_uuid(), g."Id", c."Id", dow, st::time, et::time,
       'Спорткомплекс школы №61, ул. Косарева, д.12', true, NOW(), NOW()
FROM g, c, (VALUES
  (2, '18:00', '19:30'),  -- вторник
  (4, '18:00', '19:30'),  -- четверг
  (6, '12:00', '13:30')   -- суббота
) AS s(dow, st, et);

-- U-10 with Кива
WITH g AS (SELECT "Id" FROM groups WHERE "Name" = 'U-10'),
     c AS (SELECT "Id" FROM coaches WHERE "NameRu" = 'Кива Евгений Игоревич')
INSERT INTO schedules ("Id","GroupId","CoachId","DayOfWeek","StartTime","EndTime","Location","IsActive","CreatedAt","UpdatedAt")
SELECT gen_random_uuid(), g."Id", c."Id", dow, st::time, et::time,
       'Спорткомплекс школы №61, ул. Косарева, д.12', true, NOW(), NOW()
FROM g, c, (VALUES
  (2, '18:00', '19:30'),
  (4, '18:00', '19:30'),
  (6, '12:00', '13:30')
) AS s(dow, st, et);

-- ===== Mail2: Pricing plans =====
UPDATE pricing_plans SET
  "FeaturesRu" = ARRAY[
    'Три занятия в неделю',
    'Групповые тренировки',
    '1–2 игры в неделю',
    'Участие во всероссийских турнирах'
  ],
  "UpdatedAt" = NOW()
WHERE "NameRu" = 'СТАНДАРТ';

UPDATE pricing_plans SET
  "FeaturesRu" = ARRAY[
    'Три занятия в неделю',
    'Одна тренировка по физической подготовке в неделю',
    '1–2 игры в неделю',
    'Участие во всероссийских турнирах'
  ],
  "UpdatedAt" = NOW()
WHERE "NameRu" = 'СТАНДАРТ+';

UPDATE pricing_plans SET
  "FeaturesRu" = ARRAY[
    'Три групповые тренировки в неделю',
    'Две тренировки по физической подготовке',
    '1–2 игры',
    'Участие во всероссийских турнирах',
    'Стажировки, просмотры в академиях и клубах партнёров в РФ, СНГ и в Европе'
  ],
  "UpdatedAt" = NOW()
WHERE "NameRu" = 'PRO';

-- Verify
SELECT "NameRu","PositionRu","SortOrder","IsActive" FROM coaches ORDER BY "SortOrder";
SELECT "Name","AgeRange","DescriptionRu" FROM groups ORDER BY "Name";
SELECT g."Name", s."DayOfWeek", s."StartTime", s."EndTime", c."NameRu"
FROM schedules s JOIN groups g ON s."GroupId"=g."Id" JOIN coaches c ON s."CoachId"=c."Id"
ORDER BY g."Name", s."DayOfWeek";
SELECT "NameRu","FeaturesRu","SortOrder" FROM pricing_plans ORDER BY "SortOrder";
