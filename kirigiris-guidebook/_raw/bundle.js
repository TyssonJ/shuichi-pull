(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e){return String(e??``).replace(/[&<>"']/g,e=>{switch(e){case`&`:return`&amp;`;case`<`:return`&lt;`;case`>`:return`&gt;`;case`"`:return`&quot;`;case`'`:return`&#39;`;default:return e}})}var t=`/guidebook/`;function n(e){return t+(e.startsWith(`/`)?e.slice(1):e)}var r=[`ru`,`en`,`es`],i={ru:{code:`ru`,autonym:`Русский`,plural:`slavic3`,collation:`ru`,dataDir:null,glossary:null,mapArt:`ru`,legalDoc:`ru`},en:{code:`en`,autonym:`English`,plural:`romance2`,collation:`en`,dataDir:`data/en`,glossary:`data/i18n/glossary.ru-en.json`,mapArt:`en`,legalDoc:`en`},es:{code:`es`,autonym:`Español`,plural:`romance2`,collation:`es`,dataDir:`data/es`,glossary:`data/i18n/glossary.ru-es.json`,mapArt:`en`,legalDoc:`es`}};function a(e){return typeof e==`string`&&r.includes(e)}function o(e){return i[e]}function s(e){return e!==`ru`}function c(e,t){let n=i[e].dataDir;return n===null?null:`${n}/${t}`}var l=`shinri.locale`,u=`locale-change`;function d(){try{let e=localStorage.getItem(l);return a(e)?e:null}catch{return null}}function f(){let e=new URLSearchParams(location.search).get(`lang`);return a(e)?e:d()||`ru`}function p(e){try{localStorage.setItem(l,e)}catch{}let t=new URLSearchParams(location.search);t.set(`lang`,e);let n=t.toString(),r=`${location.pathname}${n?`?${n}`:``}${location.hash}`;history.replaceState(history.state,``,r),document.documentElement.lang=e,window.dispatchEvent(new CustomEvent(u,{detail:e}))}function m(){let e=new URLSearchParams(location.search).get(`lang`),t=f();if(a(e))try{localStorage.setItem(l,t)}catch{}return document.documentElement.lang=t,t}var h=[`intro`,`gameloop`,`controls`,`commands`,`maps`,`items`,`weapons`,`crafting`,`repairs`,`detective`,`cast`,`achievements`,`faq`],g={"shell.search.placeholder":`Поиск по гайду, картам, предметам...`,"shell.search.srLabel":`Глобальный поиск`,"shell.nav.aria":`Разделы`,"shell.brand.subtitle":`Danganronpa Online`,"shell.brand.title":`Shinri Trial Guidebook`,"shell.brand.toTop":`К началу страницы`,"shell.status.versionPrefix":`Актуально для Shinri Trial v`,"shell.status.updatedPrefix":`Обновлено `,"shell.status.aria":`Актуальность гайда`,"shell.uv.title":`УФ-фонарик курсора`,"shell.uv.label":`УФ-фонарик`,"shell.disclaimer.aria":`Дисклеймер`,"shell.disclaimer.text":`Часть информации может содержать неточности или устаревшие данные. Если вы заметили ошибку — сообщите нам, мы исправим.`,"shell.disclaimer.discord":`Discord`,"shell.disclaimer.telegram":`Telegram`,"shell.disclaimer.youtube":`YouTube`,"shell.disclaimer.discordAria":`Открыть Discord-канал`,"shell.disclaimer.telegramAria":`Открыть Telegram-канал`,"shell.disclaimer.youtubeAria":`Открыть YouTube-канал`,"shell.disclaimer.youtubeHref":`https://www.youtube.com/@kirigirispress`,"shell.scaffold.pending":`раздел готовится.`,"shell.footer.title":`Shinri Trial Guidebook / Справочник по Shinri Trial`,"shell.footer.thanks":`Отдельная благодарность команде Shinri Trial — предоставленные медиа-серверы позволили собрать данные по механикам, спавнам и таймингам, которые легли в основу этого гайдбука, и ускорили разработку в разы. Спасибо!`,"shell.footer.affiliation":`Это коммьюнити-гайдбук. Проект не является официальным источником новостей, анонсов и информации по Shinri Trial.`,"shell.footer.legal.privacy":`Политика конфиденциальности`,"shell.footer.legal.eula":`Пользовательское соглашение`,"shell.footer.legal.support":`Поддержка`,"shell.footer.legal.close":`Закрыть`,"shell.hero.subhead":`Многопользовательский социальный триллер во вселенной Danganronpa.`,"shell.hero.ctaPrimary":`Начать с введения`,"shell.hero.ctaSecondary":`К предметам`,"shell.hero.statsAria":`Статистика`,"shell.hero.statStudents":`учеников`,"shell.hero.statPhases":`фазы`,"shell.hero.statWinConditions":`условия победы`,"shell.nav.intro.label":`Введение`,"shell.nav.intro.summary":`Правила, фазы и условия победы.`,"shell.nav.gameloop.label":`Игровой цикл`,"shell.nav.gameloop.summary":`Структура раунда: мирное время, убийство, расследование, суд.`,"shell.nav.controls.label":`Управление и механики`,"shell.nav.controls.summary":`Клавиши, голос, бой, инвентарь и взаимодействия с GIF-демонстрациями.`,"shell.nav.commands.label":`Команды чата`,"shell.nav.commands.summary":`Полный список команд чата и их синтаксис.`,"shell.nav.maps.label":`Карта академии`,"shell.nav.maps.summary":`Планы этажей и быстрые точки ориентира.`,"shell.nav.items.label":`Предметы`,"shell.nav.items.summary":`Лут из контейнеров, статичные спавны, шансы и категории.`,"shell.nav.weapons.label":`Оружие`,"shell.nav.weapons.summary":`Урон, эффекты и Монокума-файл по каждому оружию.`,"shell.nav.crafting.label":`Крафт`,"shell.nav.crafting.summary":`Рецепты крафта оружия из подобранных деталей.`,"shell.nav.repairs.label":`Починка`,"shell.nav.repairs.summary":`Этапы починки и наборы деталей для мирного выхода.`,"shell.nav.detective.label":`Тактика детектива`,"shell.nav.detective.summary":`Контрплан детектива и сбор улик после убийства.`,"shell.nav.cast.label":`Персонажи`,"shell.nav.cast.summary":`Шестнадцать учеников академии.`,"shell.nav.achievements.label":`Достижения`,"shell.nav.achievements.summary":`Все внутриигровые достижения: условия получения и награда в Осколках надежды.`,"shell.nav.faq.label":`FAQ`,"shell.nav.faq.summary":`Частые вопросы про Shinri Trial: как начать, термины, советы новичкам.`,"faq.search.label":`Поиск по FAQ`,"faq.search.placeholder":`Поиск по вопросам…`,"faq.search.clearAria":`Очистить поиск`,"faq.search.empty":`Ничего не найдено. Попробуйте другой запрос.`,"shell.promo.label":`Промокод:`,"shell.promo.note":`Введите в Shinri Trial до 5 уровня — получите приятный внутриигровой бонус и помогите нам понять, насколько полезен гайдбук.`,"shell.promo.copyAria":`Скопировать промокод KPRESS`},ee={"items.heading":`Предметы`,"items.search.placeholder":`Поиск: предмет, ID, контейнер, локация, категория…`,"items.sort.label":`сортировка`,"items.sort.name":`Название`,"items.sort.rarity":`Редкость`,"items.sort.category":`Категория`,"items.sort.asc":`По возрастанию`,"items.sort.desc":`По убыванию`,"items.filter.category":`категория`,"items.filter.branch":`ветка`,"items.filter.rarity":`редкость`,"items.filter.floor":`этаж`,"items.mode.aria":`Режим отображения предметов`,"items.mode.items":`По предметам`,"items.mode.locations":`По локациям`,"items.col.container":`контейнер`,"items.col.location":`локация`,"items.col.floor":`этаж`,"items.col.qty":`кол-во`,"items.col.chance":`шанс`,"items.col.item":`предмет`,"items.col.stack":`стак`,"items.stack.no":`Нестак.`,"items.chip.static":`Статично`,"items.noLocationData":`Нет данных о местоположении.`,"items.meta.weight":`вес`,"items.meta.durability":`прочность`,"items.meta.charge":`заряд`,"items.meta.damageType":`урон:`,"items.meta.requiresTool":`требуется:`,"items.meta.effect":`эффект`,"items.meta.mechanics":`механика`,"items.vendor.monoshop":`Моношоп`,"items.vendor.vending":`Автомат`,"items.mech.hunger":`сытость`,"items.mech.hp":`здоровье`,"items.mech.vigor":`бодрость`,"items.mech.buff":`бафф`,"items.mech.cures":`снимает`,"items.mech.extra":`прочее`,"items.craft.label":`крафт`,"items.craft.chance":`шанс`,"items.shop.currencyUnit":`м.`,"items.shops.title":`Магазины`,"items.shops.vendorsCount":`торговых точек`,"items.shops.positionsCount":`позиций`,"items.cleaning.title":`Расход заряда на уборку улик`,"items.cleaning.col.target":`Улика`,"items.cleaning.col.total":`Всего`,"items.cleaning.col.perUse":`За тик`,"items.cleaning.col.ticks":`Тиков`,"items.effects.title":`Эффекты`,"items.effects.negative":`Негативные`,"items.effects.positive":`Позитивные`,"items.effects.negCount":`негативных`,"items.effects.posCount":`позитивных`,"items.effects.durationSec":`сек`,"items.loc.noPhoto":`без фото`,"items.loc.photoOnly":`только фото`,"items.loc.floorUnknownTitle":`Этаж неизвестен`,"items.loc.floorUnknownBadge":`этаж неизвестен`,"items.loc.itemsShort":`предм.`,"items.loc.staticInItemsMode":`Статичные спавны (крафтовые/уникальные предметы) отображаются в режиме «По предметам».`,"items.loc.staticBannerPrefix":`Ещё`,"items.loc.staticBannerSuffixOne":`предмет`,"items.loc.staticBannerSuffixFew":`предмета`,"items.loc.staticBannerSuffixMany":`предметов`,"items.loc.staticBannerTail":`без контейнера — смотрите «По предметам».`,"items.noResults":`Ничего не найдено.`,"items.egg.feat":`102 электрошоковые ловушки за одну игру`,"items.egg.quote":`то что делает вьетнамский солдат на верстаке — дело вьетнамского солдата`,"items.egg.bonusHint":`скрытый экспонат`,"items.egg.bonusCta":`Смотреть доказательство`},_={"weapons.heading":`Оружие`,"weapons.sort.label":`Сортировка`,"weapons.sort.default":`По умолчанию`,"weapons.sort.alpha":`По алфавиту`,"weapons.sort.damage":`По урону`,"weapons.sort.effects":`По эффектам`,"weapons.rail.aria":`Список оружия`,"weapons.matrix.attackType":`Тип атаки`,"weapons.matrix.aria":`Матрица атак`,"weapons.cell.none":`—`,"weapons.cell.notProvided":`Не предусмотрен`,"weapons.cell.openFile":`Открыть файл`,"weapons.effect.label":`Эффект`,"weapons.effect.bleed":`Кровотечение`,"weapons.effect.bleedDetail":`Кровотечение (первые 3 тика −5 HP, далее −10 HP; тик раз в 10 сек)`,"weapons.flag.bleed.title":`Вызывает кровотечение`,"weapons.cell.bleed.title":`Кровотечение`,"weapons.cell.ohko.title":`Убивает с одного удара`,"weapons.cell.ohko.chip":`1 удар`,"weapons.cell.crit.prefix":`крит`,"weapons.cell.crit.titleSuffix":`критический урон:`,"weapons.dossier.openInItems":`Открыть в разделе «Предметы»`,"weapons.stealth.aria":`Скрытное убийство`,"weapons.stealth.title":`Скрытное убийство`,"weapons.forensic.tag":`Файл монокумы`,"weapons.forensic.critRare":`Редкий критический урон:`,"weapons.hazards.heading":`Альтернативные способы убийства`,"weapons.hazards.testingNotice":`⚠️ Тайминги сейчас тестируются — информация будет обновляться по мере нахождения неточностей.`,"weapons.throwing.title":`Метательное оружие`,"weapons.traps.title":`Ловушки`,"weapons.traps.metric.damage":`урон`,"weapons.poisons.title":`Яды`,"weapons.poisons.metric.poisoning":`отравление`,"weapons.poisons.metric.action":`действие`,"weapons.poisons.metric.effect":`эффект`,"weapons.poisons.metric.sideEffect":`побочный дебафф`,"weapons.poisons.metric.cures":`снимают`,"weapons.poisons.table.real":`ИРЛ`,"weapons.poisons.table.ingame":`Игр`,"weapons.poisons.timing.onset":`Принял → Воздействие`,"weapons.poisons.timing.ttd":`Воздействие → Смерть`,"weapons.poisons.timing.wake":`Воздействие → Пробуждение`,"weapons.poisons.timing.total":`Принял → Смерть`,"weapons.poisons.notes.title":`Как работают яды`,"weapons.poisons.tests.title":`Результаты тестов`,"weapons.poisons.tests.run":`Тест`,"weapons.poisons.tests.col.character":`Персонаж`,"weapons.poisons.tests.col.poisoned":`Отравление`,"weapons.poisons.tests.col.onset":`Действие яда`,"weapons.poisons.tests.col.delta":`Промежуток`,"weapons.poisons.tests.col.wake":`Пробуждение`,"weapons.temp.stagesCount":`стадий`,"weapons.temp.deathLabel":`смерть`,"weapons.temp.stages":`Стадии`,"weapons.temp.table.stage":`Стадия`,"weapons.temp.table.temp":`Темп.`,"weapons.temp.table.effects":`Эффекты`,"weapons.temp.timingsFromEntry":`Тайминги от входа`,"weapons.temp.unconsciousness":`Этапы потери сознания`,"weapons.temp.real":`ИРЛ`,"weapons.temp.ingame":`Игр`,"weapons.temp.equipment":`Экипировка`,"weapons.forensics.title":`Криминалистика`,"weapons.forensics.deaths":`Описания смертей`,"weapons.forensics.markers":`Дополнительные маркеры`,"weapons.forensics.subtitleDeaths":`описаний смерти`,"weapons.forensics.subtitleMods":`модификаторов`,"weapons.forensics.shotCaption":`как выглядит в монокума-файле`,"weapons.forensics.shotZoom":`Увеличить: `,"weapons.forensics.shotToggle":`Показать скриншот`,"weapons.forensics.variantsToggle":`Подробности по типу оружия`},v={"crafting.heading":`Крафт`,"crafting.col.item":`Предмет`,"crafting.col.ingredients":`Ингредиенты`,"crafting.col.description":`Описание`,"crafting.recipesCount":`рецепт.`,"crafting.tool.allRequire.prefix":`Для крафтов на станции`,"crafting.tool.allRequire.suffix":`требуется:`,"crafting.tool.someRequire.prefix":`Часть рецептов на станции`,"crafting.tool.someRequire.suffix":`требует:`,"crafting.tool.openTitle.prefix":`Открыть`,"crafting.tool.openTitle.suffix":`в разделе Предметы`,"crafting.tool.requiredTitle":`Требуется инструмент:`,"crafting.tool.openSentence":`. Открыть в разделе Предметы`,"crafting.row.weight":`вес`,"crafting.row.weightTitle":`Вес`,"crafting.row.chance":`шанс`,"crafting.row.chanceTitle":`Шанс крафта`,"crafting.row.yieldTitle":`Выход за один крафт`,"crafting.row.openItem":`Открыть`,"crafting.row.ingredientsAria":`Ингредиенты`,"crafting.row.recipesAria":`Рецепты`},te={"commands.heading":`Команды чата`,"commands.lightbox.close":`Закрыть`,"commands.ph.message":`сообщение`,"commands.ph.action":`действие`,"commands.ph.nick":`ник`,"commands.alt.one":`Альтернатива`,"commands.alt.many":`Альтернативы`,"commands.toggle.show":`Показать пример`,"commands.toggle.hide":`Скрыть пример`,"commands.demoOf":`Демонстрация команды `,"commands.zoom":`Увеличить: `,"commands.radius.title":`Радиус слышимости`,"commands.radius.units":`юнитов`,"commands.radius.zoomCode":`Радиусы команд чата`,"commands.radius.figureAlt":`Радиусы слышимости команд чата`,"commands.metagame.aria":`Правило 4.5 — Метагейм`,"commands.metagame.title":`Правило 4.5 — Использование неролевой информации (MG)`,"commands.metagame.body":`Запрещено передавать, получать или использовать информацию, полученную вне игрового процесса (PM/SMS/LOOC/Discord и другие сторонние источники), для влияния на игровые действия или решения персонажа.`,"commands.metagame.punishment":`Наказание: предупреждение / бан 5–20 дней.`,"commands.metagame.note":`PM и SMS — не ролевой чат, передача любой РП-информации через них запрещена.`,"commands.desc.ic":`Говорить от первого лица — IC-чат (ролевой чат, от имени персонажа).`,"commands.desc.me":`Ролевое действие от 1-го лица.`,"commands.desc.it":`Ролевое действие, описывающее объект или обстановку (3-е лицо).`,"commands.desc.globalIt":`Анонимное ролевое действие (3-е лицо) — имя персонажа не отображается.`,"commands.desc.try":`Ролевое действие со случайным исходом (УДАЧНО / НЕУДАЧНО).`,"commands.desc.roll":`Случайное число, видят ближайшие игроки.`,"commands.desc.w":`Персонаж говорит шёпотом (ролевой чат, малый радиус).`,"commands.desc.y":`Персонаж кричит (ролевой чат, большой радиус).`,"commands.desc.sms":`Анонимное глобальное нон-RP сообщение (неролевое, вне персонажа).`,"commands.desc.pm":`Личное нон-RP сообщение другому игроку (неролевое, вне персонажа).`,"commands.desc.reply":`Ответить на последнее PM.`,"commands.desc.looc":`Нон-RP сообщение, видят ближайшие игроки.`,"commands.desc.report":`Жалоба администратору.`},y={"controls.heading":`Управление и механики`,"controls.mechanics.heading":`Механики`,"controls.mechanics.intro":`Наведите курсор на карточку, чтобы посмотреть GIF, либо нажмите для увеличения. «Подробнее» открывает полный текст.`,"controls.mechanics.more":`Подробнее`,"controls.mechanics.demoOf":`Демонстрация: `,"controls.mechanics.zoom":`Увеличить: `,"controls.mechanics.cardsCountSuffix":`карточек`},ne={"repairs.heading":`Починка`,"repairs.headerTitle":`Починка · мирный путь`,"repairs.stage":`ЭТАП`,"repairs.tool.label":`Инструмент · не расходуется`,"repairs.item.openPrefix":`Открыть `,"repairs.item.openSuffix":` в разделе Предметы`,"repairs.stage.goToPrefix":`Перейти к `,"repairs.stageFallback":`Этап`,"repairs.tips.title":`Подсказки`,"repairs.tips.subtitle":`Советы по сбору и починке`,"repairs.tip":`СОВЕТ`,"repairs.tip.example":`пример`,"repairs.capsule.boardingTitle":`Разблокировка и посадка`,"repairs.capsule.unlock":`После открытия дверей капсулы разблокируются через 1 минуту реального времени.`,"repairs.capsule.scan":`Ожидание сканирования — 1 минута реального времени.`,"repairs.capsule.board":`Чтобы занять капсулу: подойдите и зажмите`,"repairs.capsule.carry":`Если несёте другого игрока на руках — зажмите`,"repairs.capsule.carrySuffix":`, чтобы поместить его в капсулу.`,"repairs.capsule.tableSummary":`Таблица соотношений выживших и капсул`,"repairs.capsule.colSurvivors":`Выживших`,"repairs.capsule.colCapsules":`Капсул`,"repairs.capsule.autoWin":`автоматическая победа`,"repairs.capsule.figureAlt1":`Комната с капсулами спасения (вид 1, 4 этаж)`,"repairs.capsule.figureAlt2":`Комната с капсулами спасения (вид 2, 4 этаж)`},re={"cast.heading":`Персонажи`,"cast.summary.charactersOf":`персонажей из вселенной Danganronpa.`,"cast.summary.clickHint":`Клик по стартовому предмету откроет его в разделе «Предметы».`,"cast.group.countSuffix":`персон.`,"cast.startingItems":`стартовые предметы`,"cast.item.openPrefix":`Открыть `,"cast.item.openSuffix":` в разделе Предметы`},ie={"detective.heading":`Тактика детектива`,"detective.notice.timings":`⚠️ Тайминги сейчас тестируются — информация будет обновляться по мере нахождения неточностей.`,"detective.notice.guidance":`💡 Гайд не нужно соблюдать до последней буквы — это набор приёмов, а не чек-лист. Использовать всё разом — душно и скучно: бери только то, что подходит конкретной ситуации, и не превращай роль детектива в работу. Главное — играть в удовольствие.`,"detective.chips.aria":`Фазы протокола`,"detective.chip.itemsOne":`пункт`,"detective.chip.itemsFew":`пункта`,"detective.chip.itemsMany":`пунктов`,"detective.dialogue.objection":`ВОЗРАЖЕНИЕ!`,"detective.dialogue.important":`ВАЖНО`,"detective.evidence.title":`Каталог улик`,"detective.evidence.shotCaption":`как выглядит в игре`,"detective.evidence.shotZoom":`Увеличить: `,"detective.evidence.shotToggle":`Показать скриншот`,"detective.egg.ark.match":`Совпадение установлено`,"detective.egg.ark.line":`Отпечаток снят с корпуса гранаты. Дело продолжается.`,"detective.monokuma.title":`Монокума-ивенты`,"detective.monokuma.tipsTitle":`Тайминги и блокнот`,"detective.monokuma.spotsTitle":`Точки телепорта по этажам`,"detective.monokuma.spotsZoom":`Увеличить: `,"detective.monokuma.broadcastsTitle":`Примеры вещаний Монокумы`,"detective.notebook.heading":`Шаблон блокнота детектива`,"detective.notebook.instructions":`Скопируй и вставь в свой in-game блокнот (CTRL+C, CTRL+V).`,"detective.notebook.preface":`Шаблон блокнота детектива может показаться оверкиллом и отпугнуть новичка — но не спешите отказываться от роли. В полном виде он заполняется разве что в идеальных условиях, а в большинстве игр хватает отпечатков и монокума-ивентов.`,"detective.notebook.copyAria":`Скопировать шаблон в буфер обмена`,"detective.notebook.copyIdle":`Скопировать в буфер`,"detective.notebook.copyDone":`Скопировано ✓`,"detective.notebook.copyError":`Не удалось — выделите вручную`,"detective.rule.r43.body":`4.3 Неролевое поведение (NonRP)

Запрещены действия, которые противоречат модели поведения реального человека в представленных обстоятельствах, нарушают атмосферу игрового мира или не имеют под собой логического обоснования.

Также запрещено откровенно абсурдное поведение, превращающее ролевой процесс в фарс и разрушающее погружение других участников.

К NonRP относятся:
• Совершение бессмысленных, шутовских или неадекватных действий (например, танцы на месте убийства, раздевание без причины и т.д).
• Обсуждение технических проблем, лагов или реальной жизни в IC (игровом) чате.

🚫 Наказание: предупреждение / исключение из игры / бан 1–30 дней.
💡 Примечание: если вы хотите сообщить о технической проблеме или обсудить что-то не относящееся к игре — используйте специальный OOC-чат (например, / или /ooc).`},ae={"category.Ресурс":`Ресурс`,"category.Расходник":`Расходник`,"category.Инструмент":`Инструмент`,"category.Оружие":`Оружие`,"category.Оружие/Инструмент":`Оружие/Инструмент`,"category.Снаряжение":`Снаряжение`,"category.Стартовый предмет":`Стартовый предмет`,"category.Прочее":`Прочее`,"branch.Универсальные":`Универсальные`,"branch.Еда":`Еда`,"branch.Медицина":`Медицина`,"branch.Инженерия":`Инженерия`,"branch.Прочее":`Прочее`,"rarity.Обычный":`Обычный`,"rarity.Необычный":`Необычный`,"rarity.Редкий":`Редкий`,"rarity.Очень редкий":`Очень редкий`,"rarity.Легендарный":`Легендарный`,"filter.all":`Все`},oe={"search.empty":`Ничего не найдено`,"search.location":`локация`},b={"errors.loadFailed":`Не удалось загрузить данные.`,"errors.loadFailedPrefix":`Не удалось загрузить `},se={"localeSwitcher.aria":`Язык интерфейса`,"localeSwitcher.selectLanguage":`Переключить язык на`},ce={"chrome.returnPill.prefix":`← Назад`,"chrome.returnPill.repairs":`в Починку`,"chrome.returnPill.crafting":`в Крафт`,"chrome.returnPill.cast":`к Персонажам`,"chrome.returnPill.detective":`к тактике детектива`,"chrome.returnPill.maps":`к картам`,"chrome.returnPill.commands":`к командам`,"chrome.returnPill.controls":`к управлению`,"chrome.returnPill.gameloop":`к игровому циклу`,"chrome.returnPill.intro":`во введение`,"chrome.returnPill.fallbackPrefix":`назад в раздел «`,"chrome.returnPill.fallbackSuffix":`»`,"chrome.lightbox.dialog":`Просмотр изображения`,"chrome.lightbox.close":`Закрыть`,"chrome.lightbox.prev":`Предыдущее`,"chrome.lightbox.next":`Следующее`,"chrome.search.resultsAria":`Результаты поиска`,"chrome.search.loading":`Загрузка индекса…`,"chrome.search.loadError":`Не удалось загрузить поисковый индекс.`,"chrome.search.retry":`Повторить`,"chrome.search.noMatches":`нет совпадений`,"chrome.search.emptyPrefix":`Ничего не найдено по запросу `,"chrome.search.emptySuffix":`.`,"chrome.search.kind.section":`раздел`,"chrome.search.kind.item":`предмет`,"chrome.search.kind.container":`контейнер`,"chrome.search.kind.location":`локация`,"chrome.search.kind.repair":`ремонт`,"chrome.search.kind.detective":`детектив`,"chrome.search.kind.character":`персонаж`,"chrome.search.kind.weapon":`оружие`,"chrome.search.count.one":`совпадение`,"chrome.search.count.few":`совпадения`,"chrome.search.count.many":`совпадений`,"chrome.tooltip.weight":`вес`},le={"gameloop.phase.figureAltPrefix":`Иллюстрация фазы `,"gameloop.phase.zoomPrefix":`Увеличить: фаза `,"gameloop.phase.1.title":`Повседневная жизнь`,"gameloop.phase.2.title":`Преступление`,"gameloop.phase.3.title":`Расследование`,"gameloop.phase.4.title":`Суд Истины`,"gameloop.phase.word":`Фаза`,"gameloop.time.heading":`Игровое время`,"gameloop.time.colReal":`Реальное время`,"gameloop.time.colGame":`В игре`,"gameloop.time.calculator":`Калькулятор`,"gameloop.time.directionAria":`Направление пересчёта`,"gameloop.time.dirIrlToGame":`ИРЛ → Игра`,"gameloop.time.dirGameToIrl":`Игра → ИРЛ`,"gameloop.time.inputPlaceholder":`напр. 1 ч 30 мин 26 сек, или 5 мин, или 1:30:00`,"gameloop.time.inputDefault":`1 ч`,"gameloop.time.unitsHint":`Поддерживаемые единицы: с / сек / s · м / мин / m · ч / час / h · сут / д / d.`,"gameloop.time.ofGame":`игрового`,"gameloop.time.ofReal":`реального`,"gameloop.time.unit.day":`сут`,"gameloop.time.unit.hour":`ч`,"gameloop.time.unit.min":`мин`,"gameloop.time.unit.sec":`сек`},ue={"maps.disclaimer.aria":`Уточнение по карте`,"maps.disclaimer.body":`Ниже — сравнение оригинальной карты Академии Пика Надежды (Danganronpa) и карты Shinri Trial: видно, что осталось прежним и что изменилось на каждом этаже.`,"maps.zoom":`Увеличить: `,"maps.1f_school.label":`1 этаж · Школа`,"maps.1f_school.caption":`1 этаж · школьный блок — THH и Shinri Trial`,"maps.1f_dorms.label":`1 этаж · Общежитие`,"maps.1f_dorms.caption":`1 этаж · общежитие — THH и Shinri Trial`,"maps.2f_school.label":`2 этаж · Школа`,"maps.2f_school.caption":`2 этаж · школьный блок — THH и Shinri Trial`,"maps.2f_dorms.label":`2 этаж · Общежитие`,"maps.2f_dorms.caption":`2 этаж · общежитие — THH и Shinri Trial`,"maps.3f.label":`3 этаж`,"maps.3f.caption":`3 этаж — THH и Shinri Trial`,"maps.4f.label":`4 этаж`,"maps.4f.caption":`4 этаж — THH и Shinri Trial`,"maps.5f.label":`5 этаж`,"maps.5f.caption":`5 этаж — THH и Shinri Trial`},de={"calculator.ariaLabel":`Калькулятор крафта`,"calculator.heading":`Калькулятор крафта`,"calculator.hint":`Выберите крафтовый предмет и количество — калькулятор посчитает суммарное сырьё (базовые материалы) с раскрытием вложенных рецептов.`,"calculator.field.item":`Предмет`,"calculator.field.quantity":`Количество`,"calculator.input.placeholder":`Начните вводить название…`,"calculator.listbox.ariaLabel":`Крафтовые предметы`,"calculator.empty.notFound":`Ничего не найдено`,"calculator.empty.pickItem":`Выберите крафтовый предмет из списка, чтобы увидеть расчёт.`,"calculator.empty.pickItemQty":`Выберите крафтовый предмет из списка и укажите количество (≥ 1).`,"calculator.section.stations":`Станции:`,"calculator.node.craftsOne":`крафт`,"calculator.node.craftsFew":`крафта`,"calculator.node.craftsMany":`крафтов`,"calculator.node.produced":`шт.`,"calculator.section.tools":`Инструменты:`,"calculator.result.titlePrefix":`Сырьё для`,"calculator.tree.toggle":`Разбор рецепта`,"calculator.raw.toggle":`Итоговое сырьё`,"calculator.tool.openTitle.prefix":`Открыть`,"calculator.tool.openTitle.suffix":`в разделе Предметы`},fe={"donate.trigger.label":`Поддержать проект`,"donate.trigger.aria":`Поддержать проект — открыть меню поддержки`,"donate.modal.title":`Поддержать проект`,"donate.modal.close":`Закрыть`,"donate.menu.intro":`Оформите подписку на нашем Boosty — выберите уровень поддержки. Спасибо, что помогаете делать гайдбук лучше!`,"donate.menu.choose":`Оформить на Boosty`,"donate.menu.custom":`Разовый донат на Boosty`,"donate.menu.allIncluded":`Всё включено`,"donate.menu.perMonth":`/мес`,"donate.tier.t1.name":`Ученик`,"donate.tier.t2.name":`Детектив`,"donate.tier.t3.name":`Абсолют`,"donate.perk.early-video":`Ранний доступ к видео`,"donate.perk.honor-list":`Доска почёта`,"donate.perk.discord-role":`Особая роль в Discord`,"donate.perk.discord-chat":`Приватный Discord-чат`,"donate.perk.achilles-pawtograph":`Фотографии Ахиллеса и персональная сигна`},pe={"videos.nav.label":`Видео`,"videos.strip.aria":`Видеогайды с нашего YouTube-канала`,"videos.strip.title":`Видеогайды`,"videos.strip.sub":`Новое на канале Kirigiri’s Press — разборы механик и гайды`,"videos.strip.channelBtn":`Смотреть канал`,"videos.strip.endcard":`Все видео на канале`,"videos.strip.prevAria":`Прокрутить видео назад`,"videos.strip.nextAria":`Прокрутить видео вперёд`,"videos.section.label":`Видео по разделу`,"videos.chapter.label":`Фрагмент видео по теме`,"videos.card.playAria":`Смотреть видео`},x={"achievements.intro":`Полный список внутриигровых достижений с условиями получения и наградой в Осколках надежды. Категории — как в самой игре.`,"achievements.nav.label":`Категории`,"achievements.nav.aria":`Категории достижений`,"achievements.nav.all":`Все`,"achievements.tiers.label":`Медали`,"achievements.tier.1":`Бронза`,"achievements.tier.2":`Серебро`,"achievements.tier.3":`Золото`,"achievements.tier.4":`Платина`,"achievements.reward.unit":`Осколки надежды`,"achievements.condition.srLabel":`Условие получения: `,"achievements.count.srLabel":`достижений`},me={"giveaway.aria":`Анонс розыгрыша`,"giveaway.badge":`Розыгрыш`,"giveaway.title":`5 игровых копий Garry’s Mod в подарок`,"giveaway.intro":`Под последним видео было много комментариев «выглядит круто, но нет гарриса» — исправляем. Разыгрываем 5 игровых копий Garry’s Mod, чтобы вы наконец сами зашли и поиграли в Shinri Trial | Danganronpa Online.`,"giveaway.howTo.heading":`Как участвовать`,"giveaway.step.youtube":`Подпишись на наш YouTube — засчитывается любой канал:`,"giveaway.step.youtubeRu":`RU-канал`,"giveaway.step.youtubeEn":`EN-канал`,"giveaway.step.discord":`Зайди на наш Discord-сервер:`,"giveaway.step.discordJoin":`Discord-сервер`,"giveaway.step.react":`Нажми 🎉 в канале #розыгрыши`,"giveaway.draw":`Итоги — 22 июля. Бот выберет 5 победителей случайно. Мы сами напишем победителям в личные сообщения (только с аккаунтов @mediocreative и @KayZz1): вы присылаете скрин подписки и ссылку на Steam, и мы дарим игру подарком.`,"giveaway.safety":`Мы свяжемся с победителями ТОЛЬКО с этих аккаунтов: @mediocreative, @KayZz1. Мы НИКОГДА не просим оплату, данные входа или пароль от Steam — только ссылку на ваш профиль. Любой, кто просит что-то ещё, — мошенник.`,"giveaway.ps":`И маленькая личная просьба. Мне нужно дойти до 500 подписчиков на RU-канале — на этой отметке меня официально примут в медиа-партнёры Shinri Trial, и я смогу делать для вас ещё больше контента и розыгрышей. Если подпишетесь именно на RU — вы реально поможете добежать до цели (но для розыгрыша EN тоже засчитывается, так что без разницы!).`,"giveaway.cta":`Зайти в Discord`,"giveaway.close":`Закрыть`},he=`modulepreload`,S=function(e){return`/guidebook/`+e},ge={},C=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=S(t,n),t in ge)return;ge[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:he,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},_e={...g,...ee,..._,...v,...te,...y,...ne,...re,...ie,...ae,...oe,...b,...se,...ce,...le,...ue,...de,...fe,...pe,...x,...me},w={en:()=>C(()=>import(`./messages.en-Cc77RKpy.js`).then(e=>e.EN),[]),es:()=>C(()=>import(`./messages.es-D9ZmJYBr.js`).then(e=>e.ES),[])},ve=new Map([[`ru`,_e]]),ye=_e,be=`ru`;async function xe(e){let t=ve.get(e);if(t)return ye=t,be=e,t;let n=await w[e]();return ve.set(e,n),ye=n,be=e,n}function T(){return be}function E(e){return ye[e]}async function Se(){let e=f();return await xe(e),e}var Ce=[{id:`intro`,num:`00`,href:`#intro`,icon:`i`},{id:`gameloop`,num:`01`,href:`#gameloop`,icon:`↻`},{id:`controls`,num:`02`,href:`#controls`,icon:`⌘`},{id:`commands`,num:`03`,href:`#commands`,icon:`>`},{id:`maps`,num:`04`,href:`#maps`,icon:`⌖`},{id:`items`,num:`05`,href:`#items`,icon:`◈`},{id:`weapons`,num:`06`,href:`#weapons`,icon:`⚔`},{id:`crafting`,num:`07`,href:`#crafting`,icon:`⚒`},{id:`repairs`,num:`08`,href:`#repairs`,icon:`⚙`},{id:`detective`,num:`09`,href:`#detective`,icon:`?`},{id:`cast`,num:`10`,href:`#cast`,icon:`+`},{id:`achievements`,num:`11`,href:`#achievements`,icon:`★`},{id:`faq`,num:`12`,href:`#faq`,icon:`¶`}];if(Ce.length!==h.length||Ce.some((e,t)=>e.id!==h[t]))throw Error(`section-meta NAV_CHROME is out of sync with i18n SECTION_IDS`);var we=[{id:`videos`,num:`▶`,icon:`▶`,labelKey:`videos.nav.label`}];function Te(e){let t=Ae().get(e);if(t)return t;let n=we.find(t=>t.id===e);if(n)return{num:n.num,label:E(n.labelKey),summary:``,icon:n.icon}}function Ee(){return Ce.map(e=>({id:e.id,num:e.num,href:e.href,icon:e.icon,label:E(`shell.nav.${e.id}.label`),summary:E(`shell.nav.${e.id}.summary`)}))}function De(){return new Map(Ee().map(e=>[e.id,{num:e.num,label:e.label,summary:e.summary,icon:e.icon}]))}var Oe=null,ke=null;function Ae(){let e=T();return(!Oe||ke!==e)&&(Oe=De(),ke=e),Oe}typeof window<`u`&&window.addEventListener(u,()=>{Oe=null});var je={get:e=>Ae().get(e),has:e=>Ae().has(e),values:()=>Ae().values(),get size(){return Ae().size}};function D(e){let t=je.get(e);if(!t)throw Error(`Unknown section id: ${e}`);return t}var Me=r,Ne=`[data-locale-switcher]`,Pe=`button[data-locale]`;function Fe(e){return o(e).autonym}function Ie(){let t=f(),n=Me.map(n=>{let r=n===t,i=Fe(n),a=`${E(`localeSwitcher.selectLanguage`)} ${i}`;return`
      <button type="button"
              class="locale-switcher__option"
              data-locale="${n}"
              aria-pressed="${r?`true`:`false`}"
              aria-label="${e(a)}">
        <span aria-hidden="true">${e(i)}</span>
      </button>`}).join(``);return`
    <div class="locale-switcher" role="group" data-locale-switcher
         aria-label="${e(E(`localeSwitcher.aria`))}">
      ${n}
    </div>`}function Le(e){let t=e.querySelector(Ne);if(!t)return{dispose(){}};let n=!1,r=e=>{t.querySelectorAll(Pe).forEach(t=>{t.setAttribute(`aria-pressed`,t.dataset.locale===e?`true`:`false`)})},i=e=>{e!==f()&&(p(e),r(e))},o=e=>{if(n)return;let r=e.target;if(!(r instanceof Element))return;let o=r.closest(Pe);if(!o||!t.contains(o))return;let s=o.dataset.locale;a(s)&&i(s)},s=e=>{if(n)return;let r=e.key;if(r!==`ArrowLeft`&&r!==`ArrowRight`&&r!==`ArrowUp`&&r!==`ArrowDown`)return;let a=e.target;if(!(a instanceof Element))return;let o=a.closest(Pe);if(!o||!t.contains(o))return;let s=f(),c=Me[(Me.indexOf(s)+(r===`ArrowLeft`||r===`ArrowUp`?-1:1)+Me.length)%Me.length];c&&(e.preventDefault(),i(c),t.querySelector(`${Pe}[data-locale="${c}"]`)?.focus())},c=()=>{n||r(f())};return t.addEventListener(`click`,o),t.addEventListener(`keydown`,s),window.addEventListener(u,c),{dispose(){n||(n=!0,t.removeEventListener(`click`,o),t.removeEventListener(`keydown`,s),window.removeEventListener(u,c))}}}var Re={"$schema-comment":"Curation list for the class-roster hero marquee. Each entry names a source folder + filename under assets/characters/. Run `py -3 scripts/archive/build-hero-portraits.py` after editing to rebuild assets/hero/portrait-NN.webp.",recipe:{max_width:480,webp_quality:75,output_dir:`assets/hero`,output_pattern:`portrait-NN.webp`},portraits:[{n:`00`,cast:`GD`,folder:`GD characters/Аканэ Овари`,source:`vote_sprite.png`},{n:`01`,cast:`GD`,folder:`GD characters/Бьякуя Тогами`,source:`vote_sprite.png`},{n:`02`,cast:`GD`,folder:`GD characters/Гандам Танака`,source:`vote_sprite.png`},{n:`03`,cast:`GD`,folder:`GD characters/Ибуки Миода`,source:`vote_sprite.png`},{n:`04`,cast:`GD`,folder:`GD characters/Казуичи Сода`,source:`vote_sprite.png`},{n:`05`,cast:`GD`,folder:`GD characters/Махиру Коидзуми`,source:`vote_sprite.png`},{n:`06`,cast:`GD`,folder:`GD characters/Микан Цумики`,source:`vote_sprite.png`},{n:`07`,cast:`GD`,folder:`GD characters/Нагито Комаэда`,source:`vote_sprite.png`},{n:`08`,cast:`GD`,folder:`GD characters/Нэкомару Нидай`,source:`vote_sprite.png`},{n:`09`,cast:`GD`,folder:`GD characters/Пеко Пекояма`,source:`vote_sprite.png`},{n:`10`,cast:`GD`,folder:`GD characters/Соня Невермайнд`,source:`vote_sprite.png`},{n:`11`,cast:`GD`,folder:`GD characters/Тэрутэру Ханамура`,source:`vote_sprite.png`},{n:`12`,cast:`GD`,folder:`GD characters/Фуюхико Кузурю`,source:`vote_sprite.png`},{n:`13`,cast:`GD`,folder:`GD characters/Хаджимэ Хината`,source:`vote_sprite.png`},{n:`14`,cast:`GD`,folder:`GD characters/Хиёко Сайонджи`,source:`vote_sprite.png`},{n:`15`,cast:`GD`,folder:`GD characters/Чиаки Нанами`,source:`vote_sprite.png`},{n:`16`,cast:`KH`,folder:`KH characters/K1-B0`,source:`vote_sprite.png`},{n:`17`,cast:`KH`,folder:`KH characters/Анджи Ёнага`,source:`vote_sprite.png`},{n:`18`,cast:`KH`,folder:`KH characters/Гонта Гокухара`,source:`vote_sprite.png`},{n:`19`,cast:`KH`,folder:`KH characters/Кайто Момота`,source:`vote_sprite.png`},{n:`20`,cast:`KH`,folder:`KH characters/Каэде Акамацу`,source:`vote_sprite.png`},{n:`21`,cast:`KH`,folder:`KH characters/Кируми Тоджо`,source:`vote_sprite.png`},{n:`22`,cast:`KH`,folder:`KH characters/Кокичи Ома`,source:`vote_sprite.png`},{n:`23`,cast:`KH`,folder:`KH characters/Корекиё Шингуджи`,source:`vote_sprite.png`},{n:`24`,cast:`KH`,folder:`KH characters/Маки Харукава`,source:`vote_sprite.png`},{n:`25`,cast:`KH`,folder:`KH characters/Миу Ирума`,source:`vote_sprite.png`},{n:`26`,cast:`KH`,folder:`KH characters/Рёма Хоши`,source:`vote_sprite.png`},{n:`27`,cast:`KH`,folder:`KH characters/Рантаро Амами`,source:`vote_sprite.png`},{n:`28`,cast:`KH`,folder:`KH characters/Тенко Чабашира`,source:`vote_sprite.png`},{n:`29`,cast:`KH`,folder:`KH characters/Химико Юмено`,source:`vote_sprite.png`},{n:`30`,cast:`KH`,folder:`KH characters/Цумуги Широганэ`,source:`vote_sprite.png`},{n:`31`,cast:`KH`,folder:`KH characters/Шуичи Сайхара`,source:`vote_sprite.png`},{n:`32`,cast:`THH`,folder:`THH characters/Аой Асахина`,source:`vote_sprite.png`},{n:`33`,cast:`THH`,folder:`THH characters/Бьякуя Тогами`,source:`vote_sprite.png`},{n:`34`,cast:`THH`,folder:`THH characters/Джунко Эношима (аналитик)`,source:`vote_sprite.png`},{n:`35`,cast:`THH`,folder:`THH characters/Джунко Эношима (модница)`,source:`vote_sprite.png`},{n:`36`,cast:`THH`,folder:`THH characters/Кёко Киригири`,source:`vote_sprite.png`},{n:`37`,cast:`THH`,folder:`THH characters/Киётака Ишимару`,source:`vote_sprite.png`},{n:`38`,cast:`THH`,folder:`THH characters/Леон Кувата`,source:`vote_sprite.png`},{n:`39`,cast:`THH`,folder:`THH characters/Макото Наэги`,source:`vote_sprite.png`},{n:`40`,cast:`THH`,folder:`THH characters/Мондо Овада`,source:`vote_sprite.png`},{n:`41`,cast:`THH`,folder:`THH characters/Мукуро Икусаба`,source:`vote_sprite.png`},{n:`42`,cast:`THH`,folder:`THH characters/Сакура Огами`,source:`vote_sprite.png`},{n:`43`,cast:`THH`,folder:`THH characters/Саяка Майзоно`,source:`vote_sprite.png`},{n:`44`,cast:`THH`,folder:`THH characters/Селестия Люденберг`,source:`vote_sprite.png`},{n:`45`,cast:`THH`,folder:`THH characters/Токо Фукава`,source:`vote_sprite.png`},{n:`46`,cast:`THH`,folder:`THH characters/Хифуми Ямада`,source:`vote_sprite.png`},{n:`47`,cast:`THH`,folder:`THH characters/Чихиро Фуджисаки`,source:`vote_sprite.png`},{n:`48`,cast:`THH`,folder:`THH characters/Ясухиро Хагакурэ`,source:`vote_sprite.png`},{n:`49`,cast:`UDG`,folder:`UDG characters/Джатаро Кемури`,source:`vote_sprite.png`},{n:`50`,cast:`UDG`,folder:`UDG characters/Комару Наэги`,source:`vote_sprite.png`},{n:`51`,cast:`UDG`,folder:`UDG characters/Котоко Уцуги`,source:`vote_sprite.png`},{n:`52`,cast:`UDG`,folder:`UDG characters/Масару Даймон`,source:`vote_sprite.png`},{n:`53`,cast:`UDG`,folder:`UDG characters/Монака Това`,source:`vote_sprite.png`},{n:`54`,cast:`UDG`,folder:`UDG characters/Нагиса Шингецу`,source:`vote_sprite.png`},{n:`55`,cast:`Zero`,folder:`Zero characters/Рёко Отонаши`,source:`vote_sprite.png`}]},ze=`1.8.2`,Be=`2026-08-22`;function Ve(e){let[t=1970,n=1,r=1]=Be.split(`-`).map(Number),i=new Date(Date.UTC(t,n-1,r));try{return new Intl.DateTimeFormat(e,{year:`numeric`,month:`long`,day:`numeric`,timeZone:`UTC`}).format(i)}catch{return Be}}var He=Re.portraits;function Ue(t){let r=Ee();t.innerHTML=`
    <div class="page-root">
      ${Qe()}
      <div class="guide-shell md:grid md:grid-cols-[240px_1fr] md:min-h-screen">
        <aside class="section-rail bg-surface border-b border-line md:border-b-0 md:border-r md:sticky md:top-0 md:h-screen md:flex md:flex-col">
          <div class="section-rail__brand p-5 border-b border-line">
            <div class="flex items-center gap-2.5">
              <a href="#top" data-scroll-top aria-label="${e(E(`shell.brand.toTop`))}" class="shrink-0">
                <img src="${n(`assets/favicon.png`)}" alt="Shinri Trial" class="brand-logo" width="36" height="36" />
              </a>
              <p class="text-[10px] font-mono uppercase text-dim leading-tight">${e(E(`shell.brand.subtitle`))}</p>
            </div>
            <p class="section-rail__brand-title mt-2.5 font-display text-lg font-bold text-ink">${e(E(`shell.brand.title`))}</p>
            ${Je()}
          </div>
          <nav class="section-rail__nav hidden p-3 md:block md:flex-1" aria-label="${e(E(`shell.nav.aria`))}">
            <ul class="space-y-1">
              ${Ke()}${r.map(Ye).join(``)}
            </ul>
          </nav>
          <div class="nav-promo">
            <p class="nav-promo__head">
              <span class="nav-promo__label">${e(E(`shell.promo.label`))}</span>
              <button type="button" class="nav-promo__code" id="nav-promo-code" data-copy="KPRESS"
                      aria-label="${e(E(`shell.promo.copyAria`))}"><span class="nav-promo__code-text">KPRESS</span></button>
            </p>
            <p class="nav-promo__note">${e(E(`shell.promo.note`))}</p>
          </div>
          <div class="nav-donate">
            <button type="button" class="nav-donate__btn" data-donate
                    aria-label="${e(E(`donate.trigger.aria`))}">
              <svg class="nav-donate__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span class="nav-donate__label">${e(E(`donate.trigger.label`))}</span>
            </button>
          </div>
        </aside>
        <div class="min-w-0">
          <header class="command-bar sticky top-0 z-30 border-b border-line bg-page/90 px-4 py-3 backdrop-blur md:px-8">
            <div class="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label class="command-search flex min-w-0 flex-1 items-center gap-3 rounded border border-line bg-card px-3 py-2 text-sm">
                <span class="font-mono text-cyan" aria-hidden="true">⌕</span>
                <span class="sr-only">${e(E(`shell.search.srLabel`))}</span>
                <input id="guide-search" type="search" placeholder="${e(E(`shell.search.placeholder`))}"
                       class="min-w-0 flex-1 bg-transparent text-ink placeholder-dim outline-none" />
              </label>
              <div class="flex items-center gap-3 text-[11px] font-mono uppercase">
                <span id="section-breadcrumb" class="section-breadcrumb" aria-live="polite">
                  <span class="section-breadcrumb__num">${e(r[0]?.num??`00`)}</span>
                  <span class="section-breadcrumb__sep" aria-hidden="true">›</span>
                  <span class="section-breadcrumb__label">${e(r[0]?.label??``)}</span>
                </span>
                <span class="status-pill hidden" id="guide-search-status" role="status"></span>
                ${Ie()}
                <button type="button" class="uv-toggle uv-toggle--bar" id="uv-toggle"
                        aria-pressed="false"
                        title="${e(E(`shell.uv.title`))}">
                  <svg class="uv-toggle__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <rect x="3" y="10" width="9" height="4" rx="0.8"/>
                    <path d="M12 8.2l4-1.6v10.8l-4-1.6z"/>
                    <path d="M17 7l2.6-1v12l-2.6-1z" opacity="0.55"/>
                    <path d="M21 8l1.8-0.6v9.2l-1.8-0.6z" opacity="0.32"/>
                  </svg>
                  <span class="uv-toggle__label">${e(E(`shell.uv.label`))}</span>
                  <span class="uv-toggle__state" data-uv-state aria-hidden="true">OFF</span>
                </button>
              </div>
            </div>
            <div class="mobile-nav-wrap md:hidden">
              <nav class="mobile-nav-scroll flex gap-2 overflow-x-auto pb-1" aria-label="${e(E(`shell.nav.aria`))}">
                ${qe()}${r.map(Xe).join(``)}
              </nav>
            </div>
          </header>
          <main class="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10">
            <aside class="site-disclaimer" role="note" aria-label="${e(E(`shell.disclaimer.aria`))}">
              <p class="site-disclaimer__text">
                ${e(E(`shell.disclaimer.text`))}
              </p>
              <div class="site-disclaimer__actions">
                <a class="site-disclaimer__btn site-disclaimer__btn--discord"
                   href="https://discord.gg/yKhYkZd5Xy"
                   target="_blank" rel="noopener noreferrer"
                   aria-label="${e(E(`shell.disclaimer.discordAria`))}">
                  <svg class="site-disclaimer__btn-icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" fill-rule="evenodd">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                  </svg>
                  <span>${e(E(`shell.disclaimer.discord`))}</span>
                </a>
                <a class="site-disclaimer__btn site-disclaimer__btn--telegram"
                   href="https://t.me/+ypmRFGw3X_5mOTky"
                   target="_blank" rel="noopener noreferrer"
                   aria-label="${e(E(`shell.disclaimer.telegramAria`))}">
                  <svg class="site-disclaimer__btn-icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" fill-rule="evenodd">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span>${e(E(`shell.disclaimer.telegram`))}</span>
                </a>
                <a class="site-disclaimer__btn site-disclaimer__btn--youtube"
                   href="${e(E(`shell.disclaimer.youtubeHref`))}"
                   target="_blank" rel="noopener noreferrer"
                   aria-label="${e(E(`shell.disclaimer.youtubeAria`))}">
                  <svg class="site-disclaimer__btn-icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" fill-rule="evenodd">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>${e(E(`shell.disclaimer.youtube`))}</span>
                </a>
              </div>
            </aside>
            <!-- Video strip scaffold: content is owned by src/views/video-strip.ts
                 (mounted via the locale-remount harness). It lives in the shell so
                 scroll-spy's boot-time section[id] snapshot includes #videos. -->
            <section id="videos" class="video-strip scroll-mt-24" data-view="videos"></section>
            <div class="guide-sections mt-12 space-y-16">
              ${r.map((e,t)=>(t>0?`<hr class="section-divider" aria-hidden="true">`:``)+Ze(e)).join(``)}
            </div>
            <footer class="mt-20 space-y-2 border-t border-line pt-6 text-xs text-dim">
              <p>${e(E(`shell.footer.title`))}</p>
              <p>
                ${e(E(`shell.footer.thanks`))}
              </p>
              <p>${e(E(`shell.footer.affiliation`))}</p>
              <p class="site-legal">
                <button type="button" class="site-legal__link" data-legal="privacy">${e(E(`shell.footer.legal.privacy`))}</button>
                &nbsp;·&nbsp;
                <button type="button" class="site-legal__link" data-legal="eula">${e(E(`shell.footer.legal.eula`))}</button>
                &nbsp;·&nbsp;
                ${e(E(`shell.footer.legal.support`))}: <a href="mailto:gundanronpa@kirigiris.press">gundanronpa@kirigiris.press</a>
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  `,Le(t),We(t)}function We(e){let t=e.querySelector(`#nav-promo-code`);if(!t)return;let n;t.addEventListener(`click`,()=>{let e=t.dataset.copy??``;navigator.clipboard?.writeText(e).catch(()=>{}),t.classList.add(`is-copied`),n&&clearTimeout(n),n=setTimeout(()=>t.classList.remove(`is-copied`),1400)})}function Ge(t=document){let n=Ee(),r=(e,n)=>{let r=t.querySelector(e);r&&(r.textContent=n)},i=(e,n,r)=>{let i=t.querySelector(e);i&&i.setAttribute(n,r)};i(`[data-scroll-top]`,`aria-label`,E(`shell.brand.toTop`)),r(`.section-rail__brand .flex p`,E(`shell.brand.subtitle`)),r(`.section-rail__brand-title`,E(`shell.brand.title`)),i(`[data-release-status]`,`aria-label`,E(`shell.status.aria`)),r(`[data-release-version]`,E(`shell.status.versionPrefix`)+ze);let a=t.querySelector(`[data-release-updated]`);a&&(a.innerHTML=`${e(E(`shell.status.updatedPrefix`))}<time datetime="${e(Be)}">${e(Ve(o(f()).collation))}</time>`);let s=t.querySelector(`.section-rail nav`);if(s){s.setAttribute(`aria-label`,E(`shell.nav.aria`));let e=s.querySelector(`ul`);e&&(e.innerHTML=Ke()+n.map(Ye).join(``))}let c=t.querySelector(`.mobile-nav-wrap nav`);c&&(c.setAttribute(`aria-label`,E(`shell.nav.aria`)),c.innerHTML=qe()+n.map(Xe).join(``)),i(`.nav-donate__btn`,`aria-label`,E(`donate.trigger.aria`)),r(`.nav-donate__label`,E(`donate.trigger.label`)),r(`.nav-promo__label`,E(`shell.promo.label`)),r(`.nav-promo__note`,E(`shell.promo.note`)),i(`#nav-promo-code`,`aria-label`,E(`shell.promo.copyAria`)),i(`#uv-toggle`,`title`,E(`shell.uv.title`)),r(`#uv-toggle .uv-toggle__label`,E(`shell.uv.label`)),r(`.command-search .sr-only`,E(`shell.search.srLabel`)),i(`#guide-search`,`placeholder`,E(`shell.search.placeholder`)),i(`.site-disclaimer`,`aria-label`,E(`shell.disclaimer.aria`)),r(`.site-disclaimer__text`,E(`shell.disclaimer.text`)),i(`.site-disclaimer__btn--discord`,`aria-label`,E(`shell.disclaimer.discordAria`)),r(`.site-disclaimer__btn--discord span`,E(`shell.disclaimer.discord`)),i(`.site-disclaimer__btn--telegram`,`aria-label`,E(`shell.disclaimer.telegramAria`)),r(`.site-disclaimer__btn--telegram span`,E(`shell.disclaimer.telegram`)),i(`.site-disclaimer__btn--youtube`,`aria-label`,E(`shell.disclaimer.youtubeAria`)),i(`.site-disclaimer__btn--youtube`,`href`,E(`shell.disclaimer.youtubeHref`)),r(`.site-disclaimer__btn--youtube span`,E(`shell.disclaimer.youtube`));let l=t.querySelectorAll(`main footer p`);l[0]&&(l[0].textContent=E(`shell.footer.title`)),l[1]&&(l[1].textContent=E(`shell.footer.thanks`)),l[2]&&(l[2].textContent=E(`shell.footer.affiliation`));let u=t.querySelector(`.site-legal`);u&&(u.innerHTML=`<button type="button" class="site-legal__link" data-legal="privacy">${e(E(`shell.footer.legal.privacy`))}</button> &nbsp;·&nbsp; <button type="button" class="site-legal__link" data-legal="eula">${e(E(`shell.footer.legal.eula`))}</button> &nbsp;·&nbsp; ${e(E(`shell.footer.legal.support`))}: <a href="mailto:gundanronpa@kirigiris.press">gundanronpa@kirigiris.press</a>`),r(`.hero__subhead`,E(`shell.hero.subhead`)),r(`.hero__cta--primary`,E(`shell.hero.ctaPrimary`)),r(`.hero__cta--secondary`,E(`shell.hero.ctaSecondary`));let d=t.querySelector(`.hero__stat-strip`);d&&(d.setAttribute(`aria-label`,E(`shell.hero.statsAria`)),d.innerHTML=`<span><b>16</b> ${e(E(`shell.hero.statStudents`))}</span><span class="hero__stat-sep" aria-hidden="true">·</span><span><b>4</b> ${e(E(`shell.hero.statPhases`))}</span><span class="hero__stat-sep" aria-hidden="true">·</span><span><b>3</b> ${e(E(`shell.hero.statWinConditions`))}</span>`);for(let e of n){let n=t.querySelector(`section#${CSS.escape(e.id)}`);n&&n.setAttribute(`data-section-title`,e.label)}}function Ke(){return`
    <li>
      <a href="#videos" data-nav-link
         class="guide-nav-item guide-nav-item--videos flex items-baseline gap-3 rounded px-3 py-2.5 text-sm text-mute transition">
        <span class="font-mono text-xs w-6 shrink-0 text-right" aria-hidden="true">▶</span>
        <span class="truncate">${e(E(`videos.nav.label`))}</span>
      </a>
    </li>
  `}function qe(){return`
    <a href="#videos" data-nav-link
       class="guide-nav-item guide-nav-item--videos mobile-chip shrink-0 rounded border border-line bg-card px-3 py-2 text-xs text-mute transition">
      <span class="font-mono text-dim" aria-hidden="true">▶</span>
      ${e(E(`videos.nav.label`))}
    </a>
  `}function Je(){let t=o(f()).collation;return`
    <p class="release-status" data-release-status aria-label="${e(E(`shell.status.aria`))}">
      <span class="release-status__version" data-release-version>${e(E(`shell.status.versionPrefix`)+ze)}</span>
      <span class="release-status__sep" aria-hidden="true">·</span>
      <span class="release-status__updated" data-release-updated>${e(E(`shell.status.updatedPrefix`))}<time datetime="${e(Be)}">${e(Ve(t))}</time></span>
    </p>`}function Ye(t){return`
    <li>
      <a href="${t.href}" data-nav-link
         class="guide-nav-item flex items-baseline gap-3 rounded px-3 py-2.5 text-sm text-mute transition">
        <span class="font-mono text-xs text-dim w-6 shrink-0 tabular-nums text-right">${t.num}</span>
        <span class="truncate">${e(t.label)}</span>
      </a>
    </li>
  `}function Xe(t){return`
    <a href="${t.href}" data-nav-link
       class="guide-nav-item mobile-chip shrink-0 rounded border border-line bg-card px-3 py-2 text-xs text-mute transition">
      <span class="font-mono text-dim">${t.num}</span>
      ${e(t.label)}
    </a>
  `}function Ze(t){let n=t.href.slice(1);return`<section id="${n}" class="guide-section scroll-mt-24" data-view="${n}" data-section-title="${e(t.label)}">
    <p class="text-dim italic">${e(t.label)} — ${e(E(`shell.scaffold.pending`))}</p>
  </section>`}function Qe(){let t=He.map((e,t)=>t);for(let e=t.length-1;e>0;e--){let n=Math.floor(Math.random()*(e+1));[t[e],t[n]]=[t[n],t[e]]}let r=(e,t)=>{let r=He[e],i=t<2?`loading="eager" fetchpriority="high"`:`loading="lazy" decoding="async"`;return`<img class="hero__portrait" src="${n(`assets/hero/portrait-${r.n}.webp`)}" alt="" width="480" height="480" ${i} data-fallback="remove" />`};return`
    <section class="hero" aria-labelledby="hero-wordmark">
      <div class="hero__collage" aria-hidden="true">
        <div class="hero__marquee">
          <div class="hero__marquee-track">
            ${t.map((e,t)=>r(e,t)).join(``)}${t.map(e=>r(e,99)).join(``)}
          </div>
        </div>
      </div>
      <div class="hero__mask" aria-hidden="true"></div>
      <div class="hero__content">
        <h1 id="hero-wordmark" class="hero__wordmark">SHINRI TRIAL</h1>
        <p class="hero__subhead">${e(E(`shell.hero.subhead`))}</p>
        <div class="hero__cta-row">
          <a class="hero__cta hero__cta--primary" href="#intro">${e(E(`shell.hero.ctaPrimary`))}</a>
          <a class="hero__cta hero__cta--secondary" href="#items">${e(E(`shell.hero.ctaSecondary`))}</a>
        </div>
      </div>
      <div class="hero__stat-strip" aria-label="${e(E(`shell.hero.statsAria`))}">
        <span><b>16</b> ${e(E(`shell.hero.statStudents`))}</span>
        <span class="hero__stat-sep" aria-hidden="true">·</span>
        <span><b>4</b> ${e(E(`shell.hero.statPhases`))}</span>
        <span class="hero__stat-sep" aria-hidden="true">·</span>
        <span><b>3</b> ${e(E(`shell.hero.statWinConditions`))}</span>
      </div>
    </section>
  `}var $e=[`is-active`,`text-accent`,`bg-card`],et=`text-mute`,tt=null;function nt(){let e=Array.from(document.querySelectorAll(`section[id]`)),t=Array.from(document.querySelectorAll(`a[data-nav-link]`)),n=document.querySelector(`.section-breadcrumb__num`),r=document.querySelector(`.section-breadcrumb__label`),i=document.querySelector(`.section-rail`);if(e.length===0||t.length===0)return;let a=e[0]&&parseFloat(getComputedStyle(e[0]).scrollMarginTop)||96;function o(){let o=window.scrollY+a+2,s=0;for(let t=0;t<e.length;t++)e[t].offsetTop<=o&&(s=t);let c=e[s]?.id??``;for(let e of t){let t=e.getAttribute(`href`)===`#`+c;for(let n of $e)e.classList.toggle(n,t);e.classList.toggle(et,!t),t?e.setAttribute(`aria-current`,`true`):e.removeAttribute(`aria-current`)}let l=Te(c);if(l&&n&&r&&(n.textContent=l.num,r.textContent=l.label),i&&e.length>0){let t=e[s],n=e[s+1],r=t.offsetTop,a=(n?n.offsetTop:document.documentElement.scrollHeight-window.innerHeight)-r,o=a>0?Math.max(0,Math.min(1,(window.scrollY-r)/a)):0,c=Math.max(0,Math.min(1,(s+o)/e.length));i.style.setProperty(`--scroll-progress`,String(c))}}window.addEventListener(`scroll`,o,{passive:!0}),window.addEventListener(`hashchange`,o),typeof ResizeObserver<`u`&&new ResizeObserver(()=>o()).observe(document.body),tt=o,o()}function rt(){tt&&tt()}function it(){document.addEventListener(`click`,e=>{let t=e.target;if(!(t instanceof HTMLElement))return;let n=t.closest(`a[href^="#"]`);if(!n)return;let r=n.getAttribute(`href`);if(!r)return;if(n.hasAttribute(`data-scroll-top`)){e.preventDefault(),history.pushState&&history.pushState(null,``,location.pathname+location.search),ot(0,350);return}if(r===`#`||r.startsWith(`#`)===!1)return;let i=document.querySelector(r);i&&(e.preventDefault(),history.pushState?history.pushState(null,``,location.pathname+location.search+r):location.hash=r,at(i,350))})}function at(e,t){st({getStartY:()=>window.scrollY,getTargetY:()=>e.getBoundingClientRect().top+window.scrollY-(parseFloat(getComputedStyle(e).scrollMarginTop)||96),now:()=>performance.now(),schedule:e=>requestAnimationFrame(e),scrollTo:e=>window.scrollTo(0,e)},t)}function ot(e,t){let n=window.scrollY,r=e-n,i=performance.now();function a(e){let o=e-i,s=Math.min(o/t,1),c=1-(1-s)**4;window.scrollTo(0,n+r*c),s<1&&requestAnimationFrame(a)}requestAnimationFrame(a)}function st(e,t){let n=e.getStartY(),r=e.now();function i(a){let o=a-r,s=Math.min(o/t,1),c=1-(1-s)**4,l=e.getTargetY();e.scrollTo(n+(l-n)*c),s<1&&e.schedule(i)}e.schedule(i)}function ct(e){let t=()=>{n||(e.scrollIntoView(),window.dispatchEvent(new Event(`scroll`)))},n=!1;if(t(),typeof ResizeObserver>`u`)return;let r=[`pointerdown`,`wheel`,`keydown`],i=0,a=0,o=()=>{if(!n){n=!0,s.disconnect(),window.clearTimeout(i),window.clearTimeout(a);for(let e of r)window.removeEventListener(e,o);window.removeEventListener(`load`,c)}},s=new ResizeObserver(t);s.observe(document.body);for(let e of r)window.addEventListener(e,o,{passive:!0});let c=()=>{window.clearTimeout(a),a=window.setTimeout(o,400)};document.readyState===`complete`?c():window.addEventListener(`load`,c),i=window.setTimeout(o,12e3)}var O=null,k=null,A=null,lt=null,ut=null,dt=null,ft=null;function pt(){return k||(k=document.createElement(`div`),k.className=`lb-overlay`,k.setAttribute(`role`,`dialog`),k.setAttribute(`aria-modal`,`true`),k.setAttribute(`aria-label`,E(`chrome.lightbox.dialog`)),k.setAttribute(`aria-hidden`,`true`),k.tabIndex=-1,k.innerHTML=`
    <button type="button" class="lb-close" aria-label="${E(`chrome.lightbox.close`)}">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    <button type="button" class="lb-prev" aria-label="${E(`chrome.lightbox.prev`)}">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <button type="button" class="lb-next" aria-label="${E(`chrome.lightbox.next`)}">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
    <div class="lb-stage">
      <img class="lb-img" alt="" draggable="false" />
    </div>
    <div class="lb-meta">
      <div class="lb-caption" aria-live="polite"></div>
      <span class="lb-counter" aria-live="polite"></span>
    </div>
  `,document.body.appendChild(k),A=k.querySelector(`.lb-img`),lt=k.querySelector(`.lb-counter`),ft=k.querySelector(`.lb-caption`),ut=k.querySelector(`.lb-prev`),dt=k.querySelector(`.lb-next`),k.addEventListener(`click`,e=>{let t=e.target;if(t===k){vt();return}if(t.closest(`.lb-stage`)&&!t.closest(`.lb-img`)){vt();return}t.closest(`.lb-close`)?vt():t.closest(`.lb-prev`)?gt(-1):t.closest(`.lb-next`)&&gt(1)}),k)}function mt(e){if(!O||!A||!lt||!ft||!ut||!dt)return;let t=O.items[O.index];if(!t)return;A.src=t.src,A.alt=t.alt,lt.textContent=O.items.length>1?`${O.index+1} / ${O.items.length}`:``,ft.textContent=t.alt||``;let n=O.items.length<=1;if(ut.hidden=n,dt.hidden=n,A.classList.remove(`lb-img-enter`,`lb-img-enter-left`,`lb-img-enter-right`),A.offsetWidth,e===-1?A.classList.add(`lb-img-enter-left`):e===1?A.classList.add(`lb-img-enter-right`):A.classList.add(`lb-img-enter`),O.items.length>1){let e=O.items[(O.index+1)%O.items.length],t=O.items[(O.index-1+O.items.length)%O.items.length];e&&ht(e.src),t&&ht(t.src)}}function ht(e){let t=new Image;t.src=e}function gt(e){!O||O.items.length<=1||(O.index=(O.index+e+O.items.length)%O.items.length,mt(e))}function _t(e,t,n){e.length!==0&&(pt(),O={items:e,index:t,previousFocus:n},document.body.classList.add(`lb-locked`),k.setAttribute(`aria-hidden`,`false`),requestAnimationFrame(()=>{k.classList.add(`lb-open`),mt(0),k.querySelector(`.lb-close`)?.focus({preventScroll:!0})}))}function vt(){if(!O||!k)return;k.classList.remove(`lb-open`),k.setAttribute(`aria-hidden`,`true`),document.body.classList.remove(`lb-locked`);let e=O.previousFocus;O=null,setTimeout(()=>e?.focus({preventScroll:!0}),0)}function yt(e){O&&(e.key===`Escape`?(e.preventDefault(),vt()):e.key===`ArrowLeft`?(e.preventDefault(),gt(-1)):e.key===`ArrowRight`?(e.preventDefault(),gt(1)):e.key===`Tab`&&(e.preventDefault(),k?.querySelector(`.lb-close`)?.focus({preventScroll:!0})))}var bt=0,xt=!1;function St(e){if(!O)return;let t=e.touches[0];t&&(bt=t.clientX,xt=!0)}function Ct(e){if(!O||!xt)return;xt=!1;let t=e.changedTouches[0];if(!t)return;let n=t.clientX-bt;Math.abs(n)>50&&gt(n<0?1:-1)}function wt(e){let t=e.dataset.lightboxGroup,n;n=t?Array.from(document.querySelectorAll(`[data-lightbox-group="${CSS.escape(t)}"]`)):[e];let r=[],i=0;for(let t of n){let n=t.dataset.lightboxSrc??(t instanceof HTMLImageElement?t.src:``);if(!n)continue;let a=t.dataset.lightboxAlt??(t instanceof HTMLImageElement?t.alt:``);t===e&&(i=r.length),r.push({src:n,alt:a})}return{items:r,index:i}}var Tt=!1;function Et(){Tt||(Tt=!0,document.addEventListener(`click`,e=>{let t=e.target?.closest(`[data-lightbox]`);if(!t)return;e.preventDefault();let{items:n,index:r}=wt(t);_t(n,r,document.activeElement)}),document.addEventListener(`keydown`,yt),document.addEventListener(`touchstart`,St,{passive:!0}),document.addEventListener(`touchend`,Ct,{passive:!0}))}var j=null,Dt=null,Ot=null,kt=null,At=!1;function jt(e){return E(e===`privacy`?`shell.footer.legal.privacy`:`shell.footer.legal.eula`)}function Mt(){return j||(j=document.createElement(`div`),j.className=`legal-modal`,j.setAttribute(`role`,`dialog`),j.setAttribute(`aria-modal`,`true`),j.setAttribute(`aria-hidden`,`true`),j.tabIndex=-1,j.innerHTML=`
    <div class="legal-modal__panel" role="document">
      <header class="legal-modal__head">
        <h2 class="legal-modal__title" id="legal-modal-title"></h2>
        <button type="button" class="legal-modal__close" aria-label="${E(`shell.footer.legal.close`)}">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </header>
      <div class="legal-modal__body"></div>
    </div>
  `,j.setAttribute(`aria-labelledby`,`legal-modal-title`),document.body.appendChild(j),Dt=j.querySelector(`.legal-modal__title`),Ot=j.querySelector(`.legal-modal__body`),j.addEventListener(`click`,e=>{let t=e.target;(t===j||t.closest(`.legal-modal__close`))&&It()}),j)}var Nt={ru:()=>C(()=>import(`./legal-BZbcaIbP.js`).then(e=>e.LEGAL_DOCS),[]),en:()=>C(()=>import(`./legal.en-CmMqJLET.js`).then(e=>e.LEGAL_DOCS_EN),[]),es:()=>C(()=>import(`./legal.es-BQq8wpip.js`).then(e=>e.LEGAL_DOCS_ES),[])},Pt=new Map;async function Ft(e){let t=o(T()).legalDoc,n=Pt.get(t);n||(n=await Nt[t](),Pt.set(t,n));let r=n[e];r&&(Mt(),kt=document.activeElement,Dt&&(Dt.textContent=jt(e)),Ot&&(Ot.innerHTML=r.body,Ot.scrollTop=0),At=!0,document.body.classList.add(`legal-modal-locked`),j.setAttribute(`aria-hidden`,`false`),requestAnimationFrame(()=>{j.classList.add(`legal-modal--open`),j.querySelector(`.legal-modal__close`)?.focus({preventScroll:!0})}))}function It(){if(!At||!j)return;At=!1,j.classList.remove(`legal-modal--open`),j.setAttribute(`aria-hidden`,`true`),document.body.classList.remove(`legal-modal-locked`);let e=kt;kt=null,setTimeout(()=>e?.focus({preventScroll:!0}),0)}function Lt(e){At&&(e.key===`Escape`?(e.preventDefault(),It()):e.key===`Tab`&&(e.preventDefault(),j?.querySelector(`.legal-modal__close`)?.focus({preventScroll:!0})))}var Rt=!1;function zt(){Rt||(Rt=!0,document.addEventListener(`click`,e=>{let t=e.target?.closest(`[data-legal]`);if(!t)return;let n=t.dataset.legal;n!==`privacy`&&n!==`eula`||(e.preventDefault(),Ft(n).catch(e=>{}))}),document.addEventListener(`keydown`,Lt))}var Bt=`shinri:uv`,Vt=1500;function Ht(){try{return localStorage.getItem(Bt)!==`off`}catch{return!0}}function Ut(e){try{localStorage.setItem(Bt,e?`on`:`off`)}catch{}}function Wt(e,t){e.dataset.disabled=t?`false`:`true`,t||e.classList.remove(`is-active`),document.documentElement.dataset.uv=t?`on`:`off`}function Gt(e,t){e.classList.toggle(`is-on`,t),e.setAttribute(`aria-pressed`,t?`true`:`false`);let n=e.querySelector(`[data-uv-state]`);n&&(n.textContent=t?`ON`:`OFF`)}function Kt(){if(typeof window>`u`||!window.matchMedia(`(hover: hover) and (pointer: fine)`).matches||window.matchMedia(`(prefers-reduced-motion: reduce)`).matches)return;let e=document.createElement(`div`);e.className=`cursor-halo`,e.setAttribute(`aria-hidden`,`true`),document.body.appendChild(e);let t=Ht();Wt(e,t);let n=document.getElementById(`uv-toggle`);n&&(Gt(n,t),n.addEventListener(`click`,()=>{t=!t,Ut(t),Wt(e,t),Gt(n,t)}));let r,i=document.documentElement,a=0,o=0,s=0,c=0,l=!1,u=()=>{l=!1,e.style.setProperty(`--mx`,`${a}px`),e.style.setProperty(`--my`,`${o}px`),i.style.setProperty(`--uv-x`,`${s}px`),i.style.setProperty(`--uv-y`,`${c}px`),e.classList.add(`is-active`),r!==void 0&&window.clearTimeout(r),r=window.setTimeout(()=>e.classList.remove(`is-active`),Vt)};window.addEventListener(`pointermove`,e=>{t&&(a=e.clientX,o=e.clientY,s=e.clientX+window.scrollX,c=e.clientY+window.scrollY,l||(l=!0,window.requestAnimationFrame(u)))},{passive:!0})}var qt=[{top:620,side:`right`,offset:70,text:`11037`,style:`graffiti`,rotate:-14},{top:1900,side:`left`,offset:340,text:`horse a`,style:`scribble`,rotate:9},{top:3400,side:`right`,offset:110,text:`SEESAW EFFECT`,style:`stamp`,rotate:-5},{top:5200,side:`left`,offset:290,text:`but can you spell the word knife?`,style:`marker`,rotate:-11,href:`https://www.youtube.com/watch?v=P3Ah0CUMbVU`},{top:7400,side:`right`,offset:80,text:`Цой жив`,style:`graffiti`,rotate:7},{top:9800,side:`left`,offset:320,text:`Алиса или Лена?`,style:`scribble`,rotate:-8},{top:11200,side:`right`,offset:95,text:`MEAT ON THE BONE`,style:`stamp`,rotate:-7},{anchor:{selector:`.character-card[data-character-id="Джунко Эношима|Абсолютный аналитик"]`,placement:`right`,gap:48},text:`ПРИВЕТ ОТ ОТВРАТНО`,style:`scribble`,rotate:11},{top:13500,side:`right`,offset:56,text:`здесь могла быть ваша реклама`,style:`stamp`,rotate:3},{top:16500,side:`left`,offset:300,text:`tell em Naegi!`,style:`marker`,rotate:13},{top:17800,side:`right`,offset:220,text:`67`,style:`graffiti`,rotate:-6,href:`https://www.youtube.com/watch?v=dQw4w9WgXcQ`},{top:19e3,side:`right`,offset:90,text:`Кьёко ванлав <3`,style:`graffiti`,rotate:-9},{anchor:{selector:`.character-card[data-character-id="Селестия Люденберг|Абсолютный азартный игрок"]`,placement:`right`,gap:48},text:`Ронпаголик мы будем скучать`,style:`marker`,rotate:-7},{bottom:48,side:`left`,offset:310,text:`Теперь ты смешарик`,style:`marker`,rotate:8}];function Jt(e){let t=e.href?document.createElement(`a`):document.createElement(`div`);if(t.className=`uv-egg uv-egg--${e.style}`,e.anchor?t.style.visibility=`hidden`:e.bottom===void 0?t.style.top=`${e.top??0}px`:t.style.bottom=`${e.bottom}px`,e.anchor||(e.side===`left`?t.style.left=`${e.offset??0}px`:t.style.right=`${e.offset??0}px`),t.style.setProperty(`--rot`,`${e.rotate}deg`),t.textContent=e.text,e.href){let n=t;n.href=e.href,n.target=`_blank`,n.rel=`noopener noreferrer`,n.classList.add(`uv-egg--link`)}return t}function Yt(){if(typeof window>`u`||(console.log(`%cCLAUDE.MD%c — if you searched for this, you are gay`,`font-weight:700;color:#ff2e88`,``),!window.matchMedia(`(hover: hover) and (pointer: fine)`).matches)||window.matchMedia(`(prefers-reduced-motion: reduce)`).matches)return;let e=document.createElement(`div`);e.className=`uv-eggs-layer`,e.setAttribute(`aria-hidden`,`true`);let t=[];for(let n of qt){let r=Jt(n);n.anchor&&t.push({el:r,anchor:n.anchor}),e.appendChild(r)}document.body.appendChild(e),t.length>0&&Xt(t)}function Xt(e){let t=()=>{for(let{el:t,anchor:n}of e){let e=document.querySelector(n.selector);if(!e){t.style.visibility=`hidden`;continue}let r=e.getBoundingClientRect();if(r.width<1||r.height<1){t.style.visibility=`hidden`;continue}let i=n.gap??40,a=r.top+window.scrollY+r.height/2+(n.dy??0);if(t.style.top=`${Math.round(a-14)}px`,n.placement===`right`){let e=t.getBoundingClientRect().width||180,n=document.documentElement.clientWidth,a=r.right+window.scrollX+i,o=window.scrollX+n-e-16;t.style.left=`${Math.round(Math.max(window.scrollX+16,Math.min(a,o)))}px`,t.style.right=``}else t.style.right=`${Math.round(document.documentElement.clientWidth-(r.left+window.scrollX)+i)}px`,t.style.left=``;t.style.visibility=``}},n=0,r=()=>{n||=window.setTimeout(()=>{n=0,t()},60)};t(),window.setTimeout(r,400),window.setTimeout(r,1500),window.addEventListener(`resize`,r),new MutationObserver(r).observe(document.body,{childList:!0,subtree:!0})}var Zt=new Map([[`Защищённый флэш-накопитель`,`Защищённый флеш-накопитель`],[`Сырой бекон`,`Бекон`],[`Записка с кодом #34`,`Записка с кодом №34`],[`Кулинарный справочник`,`Кулинарный справочник Академии`],[`Конфиденциальное досье`,`Конфиденциальное досье Академии`]]),Qt=new Map([[`Бекон`,`Сырой бекон`],[`Записка с кодом №34`,`Записка с кодом #34`],[`Кулинарный справочник Академии`,`Кулинарный справочник`],[`Конфиденциальное досье Академии`,`Конфиденциальное досье`]]),$t=new Map([[`NoctiScope v0.1`,[`ПНВ`,`NVG`,`Прибор ночного видения`,`night vision`]]]),en=/\s*\(для ремонта необходим предмет\)\s*$/,tn=n(`assets/icons/`),nn=new Set([`Голод`,`Отравление`,`Кровотечение`,`Сонливость`,`Перелом ноги`,`Дезориентация`,`Перегрев`,`Перегруз`,`Переохлаждение`,`Бафф`,`Дебафф`,`Абсолютная сопротивляемость`,`Грязная обувь`,`Кровавая обувь`,`Окровавленные руки`]),rn=new Set([`Кровавая_раковина`,`Лужа_крови`,`След_взрыва`,`Отпечаток_пальцев`,`Профиль_отпечатка_пальцев`,`Профиль_следа_от_обуви`]);function an(e){return nn.has(e)?`effects`:rn.has(e)?`evidence`:`items`}function on(e){return e.replace(en,``)}function sn(e,t){let n=on(e);return t[n]??n}function M(e,t){let n=sn(e,t);return`${tn}${an(n)}/${encodeURIComponent(n)}.png`}var cn=/\s*×\d+$/;function ln(e){return e.replace(cn,``).trim()}function un(e,t){let n=ln(e);if(t[n])return t[n];let r=Object.keys(t),i=r.find(e=>n.startsWith(e.replace(/\s*\(.*\)$/,``)))??r.find(e=>{let t=e.split(` — `)[0];return t!==void 0&&n.includes(t)})??r.find(e=>{let t=e.split(` (`)[0];return t!==void 0&&n.includes(t)});return i?t[i]??null:null}var dn=n(`assets/characters/`),fn={"Danganronpa: Trigger Happy Havoc":`THH characters`,"Danganronpa 2: Goodbye Despair":`GD characters`,"Danganronpa V3: Killing Harmony":`KH characters`,"Ultra Despair Girls":`UDG characters`,"Danganronpa Zero":`Zero characters`},pn={sprite:`vote_sprite.png`,ico:`vote_ico.png`,pixel:`pixel_sprite.png`};function mn(e,t,n,r=`sprite`){let i=fn[n];if(!i)return null;let a=e;return e===`Джунко Эношима`&&(t===`Абсолютная модница`?a=`Джунко Эношима (модница)`:t===`Абсолютный аналитик`&&(a=`Джунко Эношима (аналитик)`)),`${dn}${encodeURI(`${i}/${a}/${pn[r]}`)}`}function hn(e,t){return`${e}|${t}`}function gn(e,t,n,r=`sprite_1`){let i=_n(e,t,n,r);return i?`${dn}${encodeURI(i)}`:null}function _n(e,t,n,r=`sprite_1`){let i=fn[n];if(!i)return null;let a=e;return e===`Джунко Эношима`&&(t===`Абсолютная модница`?a=`Джунко Эношима (модница)`:t===`Абсолютный аналитик`&&(a=`Джунко Эношима (аналитик)`)),`${i}/${a}/ct_${r}.png`}var vn={},yn={};function bn(e){if(!e){vn={},yn={};return}vn={...e.items,...e.locations,...e.statusEffects,...e.characters,...e.talents},yn={};for(let[e,t]of Object.entries(vn))t&&t!==`I18N_REVIEW_NEEDED`&&!(t in yn)&&(yn[t]=e)}function N(e){if(!s(T()))return e;let t=vn[e];return t&&t!==`I18N_REVIEW_NEEDED`?t:e}function xn(e){return yn[e]??e}function P(e,t,n){let r=o(n??T()).collation;return e.localeCompare(t,r)}function Sn(){let e={};for(let t of h)e[t]=E(`shell.nav.${t}.label`);return e}function F(e,t){return{id:e,label:t[e]??e}}function Cn(e,t,r={},i={},a){let o=[],s=e.locationColors??{},c=Sn();for(let e of Object.keys(c)){let t=F(e,c);o.push({id:`section:${e}`,kind:`section`,label:t.label,sublabel:``,sectionId:e,sectionLabel:t.label})}let l=new Set;for(let t of e.items){if(t.placeholder===!0)continue;l.add(t.name);let e=Zt.get(t.name);e&&l.add(e);let n=t.category,i=Object.keys(t.spawns),a=i.join(` `),s=i.map(N).join(` `);o.push({id:`item:${t.name}`,kind:`item`,label:N(t.name),sublabel:n,sectionId:`items`,sectionLabel:F(`items`,c).label,innerQuery:t.name,extraHaystack:`${t.name} ${n} ${a} ${s} ${t.note??``} ${($t.get(t.name)??[]).join(` `)}`,iconUrl:M(t.name,r)})}let u=new Map;for(let e of t)for(let t of e.drops){if(l.has(t.itemName)){let n=u.get(t.itemName);n?n.locations.add(e.location??``):u.set(t.itemName,{itemId:t.itemId,locations:new Set([e.location??``])});continue}let n=u.get(t.itemName);n?n.locations.add(e.location??``):u.set(t.itemName,{itemId:t.itemId,locations:new Set([e.location??``])})}for(let[e,t]of u)l.has(e)||o.push({id:`item:${e}`,kind:`item`,label:N(e),sublabel:t.itemId??``,sectionId:`items`,sectionLabel:F(`items`,c).label,innerQuery:e,extraHaystack:`${e} ${t.itemId??``} ${[...t.locations].join(` `)} ${[...t.locations].map(N).join(` `)} ${($t.get(e)??[]).join(` `)}`,iconUrl:M(e,r)});for(let e of t){let t=e.containerName??e.sourceTitle,r=N(e.location??``),a=[r,e.floor].filter(Boolean).join(` · `),s={id:`container:${e.sourceId}`,kind:`container`,label:t,sublabel:a,sectionId:`items`,sectionLabel:F(`items`,c).label,innerQuery:t,extraHaystack:`${e.sourceTitle??``} ${e.location??``} ${r} ${e.floor??``}`},l=e.image;if(l)s.iconUrl=l;else if(e.location&&i[e.location]?.containers?.length){let r=t.toLowerCase(),a=i[e.location].containers.find(e=>r.includes(e.name.toLowerCase())||e.name.toLowerCase().includes(r))?.images[0];a&&(s.iconUrl=n(`assets/${a}`))}o.push(s)}let d=new Set;for(let e of t)e.location&&d.add(e.location);for(let e of d){let t={id:`location:${e}`,kind:`location`,label:N(e),sublabel:E(`search.location`),sectionId:`items`,sectionLabel:F(`items`,c).label,innerQuery:e,extraHaystack:e},r=i[e]?.panoramas?.[0];if(r)t.iconUrl=n(`assets/${r}`);else{let n=un(e,s);n?.bg&&(t.iconColor=n.bg)}o.push(t)}for(let t of e.repairs){let e=t.presets.flatMap(e=>e.items.flatMap(e=>[e.name,N(e.name)])).join(` `);o.push({id:`repair:${t.name??t.title}`,kind:`repair`,label:t.title,sublabel:t.name??``,sectionId:`repairs`,sectionLabel:F(`repairs`,c).label,extraHaystack:`${t.note??``} ${e}`})}for(let t of e.detectiveProtocol.phases)for(let e of t.items){let n=e.subItems?.join(` `)??``;o.push({id:`detective:${t.id}:${e.text}`,kind:`detective`,label:e.text,sublabel:t.title,sectionId:`detective`,sectionLabel:F(`detective`,c).label,extraHaystack:n})}for(let t of e.cast??[])for(let e of t.characters){let n=(e.startingItems??[]).map(e=>e.name).join(` `),r=mn(e.name,e.talent,t.game,`ico`),i=hn(e.name,e.talent),a={id:`cast:${i}`,kind:`character`,label:N(e.name),sublabel:N(e.talent),sectionId:`cast`,sectionLabel:F(`cast`,c).label,extraHaystack:`${e.name} ${e.talent} ${N(e.talent)} ${n} ${t.game}`,targetSelector:`[data-character-id="${i}"]`};r&&(a.iconUrl=r),o.push(a)}if(a){let e={Нож:`Кухонный нож`};for(let t of a.weapons){let n=e[t.name]??t.name,i=[t.bleed?`кровотечение`:``,t.ohko?`OHKO`:``].filter(Boolean).join(` `);o.push({id:`weapon:${t.id}`,kind:`weapon`,label:N(t.name),sublabel:N(t.damageType),sectionId:`weapons`,sectionLabel:F(`weapons`,c).label,extraHaystack:`${t.name} ${t.damageType} ${i}`,iconUrl:M(n,r),targetSelector:`[data-weapon-id="${t.id}"]`})}}return o}var wn=/[\p{L}\p{N}]+/gu;function I(e){return e.replace(/ё/g,`е`).replace(/Ё/g,`Е`)}function L(e){return I(e.toLowerCase()).match(wn)??[]}function Tn(e){let t=[];return{loose:L(e.replace(/"([^"]*)"/g,(e,n)=>(t.push(...L(n)),` `))),exact:t}}function En(e,t,n,r,i){let a=[...r.loose,...r.exact];if(a.length===0)return 0;let o=I(e.toLowerCase()),s=I(t.toLowerCase()),c=I(n.toLowerCase()),l=L(e);for(let e of r.loose)if(!o.includes(e)&&!s.includes(e)&&!c.includes(e))return 0;if(r.exact.length>0){let e=new Set([...l,...L(t),...L(n)]);for(let t of r.exact)if(!e.has(t))return 0}let u=10;o.includes(i)&&(u+=50),o.startsWith(i)&&(u+=30);let d=a[0];return d&&l.some(e=>e.startsWith(d))&&(u+=20),a.every(e=>o.includes(e))&&(u+=5),u-=Math.max(0,l.length-a.length)*.1,u}function Dn(e,t,n){let r=I(t.trim().toLowerCase());if(!r)return[];let i=Tn(r);if(i.loose.length===0&&i.exact.length===0)return[];let a=[];for(let t of e){let e=En(t.label,t.sublabel,t.extraHaystack??``,i,r);e>0&&a.push({entry:t,score:e})}a.sort((e,t)=>t.score===e.score?P(e.entry.label,t.entry.label):t.score-e.score);let o=a.slice(0,n),s=h,c=new Map;for(let e of o){let t=e.entry.sectionId,n=c.get(t);n||(n={sectionId:t,sectionLabel:e.entry.sectionLabel,results:[]},c.set(t,n)),n.results.push(e)}return[...c.values()].sort((e,t)=>s.indexOf(e.sectionId)-s.indexOf(t.sectionId))}function On(t,n){let r=L(n);if(r.length===0)return e(t);let i=[...new Set(r)].sort((e,t)=>t.length-e.length).map(kn).join(`|`);if(!i)return e(t);let a=RegExp(`(${i})`,`giu`),o=I(t),s=``,c=0;for(let n of o.matchAll(a)){let r=n.index??0;s+=e(t.slice(c,r)),s+=`<mark>${e(t.slice(r,r+n[0].length))}</mark>`,c=r+n[0].length}return s+=e(t.slice(c)),s}function kn(e){return e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`)}function An(){return typeof window>`u`||typeof window.matchMedia!=`function`?`smooth`:window.matchMedia(`(prefers-reduced-motion: reduce)`).matches?`auto`:`smooth`}function jn(e,t){if(o(T()).plural===`romance2`)return e===1?t.one:t.many;let n=e%10,r=e%100;return n===1&&r!==11?t.one:n>=2&&n<=4&&(r<12||r>14)?t.few:t.many}var Mn=20;function Nn(e){switch(e){case`section`:return E(`chrome.search.kind.section`);case`item`:return E(`chrome.search.kind.item`);case`container`:return E(`chrome.search.kind.container`);case`location`:return E(`chrome.search.kind.location`);case`repair`:return E(`chrome.search.kind.repair`);case`detective`:return E(`chrome.search.kind.detective`);case`character`:return E(`chrome.search.kind.character`);case`weapon`:return E(`chrome.search.kind.weapon`)}}function Pn(t){return t.iconUrl?`<img src="${e(t.iconUrl)}" alt="" loading="lazy" class="search-row__icon" data-fallback-class="search-row__icon" />`:t.iconColor?`<span class="search-row__icon search-row__icon--chip" style="background:#${e(t.iconColor)}"></span>`:`<span class="search-row__icon" aria-hidden="true"></span>`}function Fn(e,t,n){let r=e.closest(`label, .command-search`)??e.parentElement;if(!r)return;getComputedStyle(r).position===`static`&&(r.style.position=`relative`);let i=document.createElement(`div`);i.className=`search-dropdown`,i.id=e.id?`${e.id}-listbox`:`search-dropdown-listbox`,i.setAttribute(`role`,`listbox`),i.setAttribute(`aria-label`,E(`chrome.search.resultsAria`)),i.hidden=!0,r.appendChild(i),e.setAttribute(`role`,`combobox`),e.setAttribute(`aria-controls`,i.id),e.setAttribute(`aria-autocomplete`,`list`),e.setAttribute(`aria-expanded`,`false`);let a={input:e,panel:i,status:n,loader:t,index:null,loadPromise:null,groups:[],flatRows:[],activeIndex:-1,open:!1};e.addEventListener(`focus`,()=>{In(a).catch(()=>{}),e.value.trim()&&R(a)}),e.addEventListener(`input`,()=>{R(a)}),e.addEventListener(`keydown`,t=>{if(!a.open){t.key===`ArrowDown`&&e.value.trim()&&(t.preventDefault(),R(a));return}if(t.key===`ArrowDown`)t.preventDefault(),Vn(a,1);else if(t.key===`ArrowUp`)t.preventDefault(),Vn(a,-1);else if(t.key===`Enter`){let e=a.flatRows[a.activeIndex];e&&(t.preventDefault(),Wn(a,e))}else t.key===`Escape`&&(t.preventDefault(),e.value?(e.value=``,R(a)):Un(a))}),i.addEventListener(`mousedown`,e=>{if(e.target.closest(`[data-search-retry]`)){e.preventDefault(),R(a);return}let t=e.target.closest(`[data-row-id]`);if(!t)return;e.preventDefault();let n=t.dataset.rowId,r=a.flatRows.find(e=>e.id===n);r&&Wn(a,r)}),i.addEventListener(`mousemove`,e=>{let t=e.target.closest(`[data-row-id]`);if(!t)return;let n=a.flatRows.findIndex(e=>e.id===t.dataset.rowId);n>=0&&n!==a.activeIndex&&(a.activeIndex=n,Bn(a))}),document.addEventListener(`mousedown`,e=>{a.open&&(r.contains(e.target)||Un(a))}),window.addEventListener(u,()=>{a.index=null,a.loadPromise=null,a.open&&R(a)})}function In(e){return e.index?Promise.resolve(e.index):(e.loadPromise||=e.loader().then(t=>(e.index=t,t),t=>{throw e.loadPromise=null,t}),e.loadPromise)}async function R(e){if(!e.input.value.trim()){Un(e),e.status&&(e.status.textContent=``,e.status.classList.add(`hidden`));return}let t;try{e.index||Rn(e),t=await In(e)}catch{zn(e),e.status&&(e.status.textContent=E(`chrome.search.loadError`),e.status.classList.remove(`hidden`));return}let n=e.input.value.trim();if(!n){Un(e);return}if(e.groups=Dn(t,n,Mn),e.flatRows=e.groups.flatMap(e=>e.results.map(e=>e.entry)),e.activeIndex=e.flatRows.length>0?0:-1,Ln(e,n),Hn(e),e.status){let t=e.flatRows.length;t===0?e.status.textContent=E(`chrome.search.noMatches`):e.status.textContent=`${t} ${Gn(t)}`,e.status.classList.remove(`hidden`)}}function Ln(t,n){if(t.groups.length===0){t.panel.innerHTML=`
      <div class="search-dropdown__empty">
        ${e(E(`chrome.search.emptyPrefix`))}<strong>${e(n)}</strong>${e(E(`chrome.search.emptySuffix`))}
      </div>
    `;return}let r=0,i=t.groups.map(i=>{let a=i.results.map(i=>{let a=i.entry,o=a.sublabel?`<span class="search-row__sub">${e(a.sublabel)}</span>`:``;return`
            <button type="button" id="${`${t.panel.id}-opt-${r++}`}" class="search-row" data-row-id="${e(a.id)}" role="option" aria-selected="false">
              ${Pn(a)}
              <span class="search-row__kind">${e(Nn(a.kind))}</span>
              <span class="search-row__main">
                <span class="search-row__label">${On(a.label,n)}</span>
                ${o}
              </span>
            </button>
          `}).join(``);return`
        <div class="search-dropdown__group">
          <div class="search-dropdown__group-head">${e(i.sectionLabel)}</div>
          ${a}
        </div>
      `}).join(``);t.panel.innerHTML=i,Bn(t)}function Rn(t){t.input.removeAttribute(`aria-activedescendant`),t.panel.innerHTML=`
    <div class="search-dropdown__empty">${e(E(`chrome.search.loading`))}</div>
  `,Hn(t)}function zn(t){t.groups=[],t.flatRows=[],t.activeIndex=-1,t.input.removeAttribute(`aria-activedescendant`),t.panel.innerHTML=`
    <div class="search-dropdown__empty search-dropdown__error" role="alert">
      ${e(E(`chrome.search.loadError`))}
      <button type="button" class="search-dropdown__retry" data-search-retry>
        ${e(E(`chrome.search.retry`))}
      </button>
    </div>
  `,Hn(t)}function Bn(e){let t=e.panel.querySelectorAll(`[data-row-id]`),n=e.flatRows[e.activeIndex]?.id,r=``;t.forEach(e=>{let t=e.dataset.rowId===n;e.classList.toggle(`is-active`,t),e.setAttribute(`aria-selected`,String(t)),t&&(r=e.id,e.scrollIntoView({block:`nearest`}))}),r?e.input.setAttribute(`aria-activedescendant`,r):e.input.removeAttribute(`aria-activedescendant`)}function Vn(e,t){if(e.flatRows.length===0)return;let n=e.flatRows.length;e.activeIndex=(e.activeIndex+t+n)%n,Bn(e)}function Hn(e){e.panel.hidden=!1,e.open=!0,e.input.setAttribute(`aria-expanded`,`true`)}function Un(e){e.panel.hidden=!0,e.open=!1,e.input.setAttribute(`aria-expanded`,`false`),e.input.removeAttribute(`aria-activedescendant`)}function Wn(e,t){Un(e),e.input.blur();let n=t.targetSelector?document.querySelector(t.targetSelector):null,r=n??document.getElementById(t.sectionId),i=n?.closest(`details`);if(i&&!i.open&&(i.open=!0),r&&r.scrollIntoView({behavior:An(),block:`start`}),n&&(n.classList.add(`search-target-pulse`),n.addEventListener(`animationend`,()=>n.classList.remove(`search-target-pulse`),{once:!0})),t.innerQuery&&t.sectionId===`items`){let e=document.querySelector(`#items-search`);e&&setTimeout(()=>{let n=t.kind===`location`||t.kind===`container`?`#items-btn-loc`:`#items-btn-items`,r=document.querySelector(n);r&&!r.classList.contains(`bg-accent`)&&r.click(),e.value=t.innerQuery,e.dispatchEvent(new Event(`input`,{bubbles:!0}))},50)}}function Gn(e){return jn(e,{one:E(`chrome.search.count.one`),few:E(`chrome.search.count.few`),many:E(`chrome.search.count.many`)})}var Kn=n(`data/data.json`),qn=n(`data/icon-map.json`);function Jn(e,t){let r=c(e,t);return r===null?null:n(r)}var Yn=new Map;function z(e=T()){let t=Yn.get(e);if(t)return t;let n=Xn(e).catch(t=>{throw Yn.delete(e),t});return Yn.set(e,n),n}async function Xn(e){let t=await fetch(Kn);if(!t.ok)throw Error(`${Kn} HTTP ${t.status}`);let n=await t.json(),r=Jn(e,`data.json`);if(r===null)return n;let i=await Zn(r);return i?Qn(n,i):n}async function Zn(e){try{let t=await fetch(e);return t.ok?await t.json():null}catch{return null}}function Qn(e,t){let n=new Map(t.items.map(e=>[e.name,e])),r=e.items.map(e=>n.get(e.name)??e),i={...t,items:r};return t.repairs&&e.repairs&&(i.repairs=t.repairs.map((t,n)=>{let r=e.repairs[n]?.title;return r===void 0?t:{...t,_titleRU:r}})),i}async function B(){try{let e=await fetch(qn);return e.ok?await e.json():{}}catch{return{}}}var $n=n(`data/media.json`);async function er(e=T()){try{let e=await fetch($n);return e.ok?await e.json():{}}catch{return{}}}async function tr(e=T()){let t=o(e).glossary;if(t===null)return null;let r=n(t);try{let e=await fetch(r);return e.ok?await e.json():null}catch{return null}}var nr=n(`data/drop-rates.json`);async function V(){let e=await fetch(nr);if(!e.ok)throw Error(`${nr} HTTP ${e.status}`);return await e.json()}var rr=n(`data/weapons.json`),ir=new Map;function ar(e=T()){let t=ir.get(e);if(t)return t;let n=or(e).catch(t=>{throw ir.delete(e),t});return ir.set(e,n),n}async function or(e){let t=c(e,`weapons.json`);if(t!==null){let e=await sr(n(t));if(e)return e}let r=await fetch(rr);if(!r.ok)throw Error(`${rr} HTTP ${r.status}`);return await r.json()}async function sr(e){try{let t=await fetch(e);return t.ok?await t.json():null}catch{return null}}function cr(e,t,n){e.rarity&&(t.rarity=e.rarity),e.weight&&(t.weight=e.weight),e.effect&&(t.effect=e.effect),e.description&&(t.description=e.description),e.durability&&(t.durability=e.durability),e.charge&&(t.charge=e.charge),e.damageType&&(t.damageType=e.damageType),e.requiresTool&&(t.requiresTool=e.requiresTool),e.craft&&(t.craft=e.craft),e.placeholder===!0&&(t.placeholder=!0),e.mechanics&&(t.mechanics=e.mechanics),e.cleaning&&(t.cleaning=e.cleaning),e.shop&&(t.shop=e.shop),e.id&&!t.itemId&&(t.itemId=e.id),n&&(n.effect!==void 0&&t.effect!==void 0&&(t._effectRU=t.effect,t.effect=n.effect),n.description!==void 0&&(t.description=n.description),n.note!==void 0&&(t.note=n.note),n.charge!==void 0&&(t.charge=n.charge),n.mechanics&&t.mechanics&&(t.mechanics={...t.mechanics},n.mechanics.buff!==void 0&&(t.mechanics.buff=n.mechanics.buff),n.mechanics.extra!==void 0&&(t.mechanics.extra=n.mechanics.extra),n.mechanics.hp!==void 0&&(t.mechanics.hp=n.mechanics.hp),n.mechanics.hunger!==void 0&&(t.mechanics.hunger=n.mechanics.hunger),n.mechanics.vigor!==void 0&&(t.mechanics.vigor=n.mechanics.vigor),n.mechanics.cures!==void 0&&(t.mechanics.cures=n.mechanics.cures)),n.cleaning!==void 0&&(t.cleaning=n.cleaning))}function lr(e,t,n,r,i){let a=e=>{let t=e.location??e.sourceTitle,n=i?.[t];return n&&n!==`I18N_REVIEW_NEEDED`?n:t},o=(e,t)=>({source:e,drop:t,locationLabel:a(e)}),s=new Map;for(let t of e)for(let e of t.drops){let n=s.get(e.itemName);n?n.drops.push(o(t,e)):s.set(e.itemName,{name:e.itemName,itemId:e.itemId,category:`Прочее`,branch:`Прочее`,note:null,drops:[o(t,e)],staticSpawns:null})}let c=new Set;for(let e of t.items){let t=Zt.get(e.name)??e.name,r=s.get(t),i=n?.get(e.name);if(r)r.category=e.category,r.branch=e.branch,r.note=e.note||null,cr(e,r,i),c.add(t);else{let t=Object.keys(e.spawns).length>0,n={name:e.name,itemId:null,category:e.category,branch:e.branch,note:e.note||null,drops:[],staticSpawns:t?e.spawns:null};cr(e,n,i),s.set(e.name,n)}}for(let[e,t]of Qt){let n=s.get(e);n&&(n.name=t)}if(r)for(let e of s.values()){let t=r[e.name];t&&t!==`I18N_REVIEW_NEEDED`?(e._nameRU=e.name,e.name=t):e._nameRU=e.name}return[...s.values()].sort((e,t)=>P(e.name,t.name,r?void 0:`ru`))}function ur(e,t){let n=new Map;for(let e of t)n.set(e.sourceId,e.containerName);for(let t of e){let e=n.get(t.sourceId);e&&(t.containerNameRU=e)}return e}async function dr(e){let t=c(e,`drop-rates.json`);if(t===null)return V();try{let e=await fetch(n(t));if(!e.ok)return V();let r=await e.json();try{ur(r,await V())}catch{}return r}catch{return V()}}var fr=new Map;function pr(e=T()){let t=fr.get(e);if(t)return t;let n=_r(e).catch(t=>{throw fr.delete(e),t});return fr.set(e,n),n}var mr=new Map;function hr(e){let t=mr.get(e);return t||(t=tr(e),mr.set(e,t)),t}async function gr(e=T()){await pr(e),s(e)&&bn(await hr(e))}async function _r(e){let[t,n,r,i]=await Promise.all([dr(e),z(`ru`),B(),er(e)]),a,o,c,l;if(s(e)){let[t,n]=await Promise.all([z(e),hr(e)]);l=t,n&&(o=n.items,c=n.locations),a=new Map;for(let e of t.items){let t={};if(e.effect!==void 0&&(t.effect=e.effect),e.description!==void 0&&(t.description=e.description),e.note!==void 0&&(t.note=e.note),e.charge!==void 0&&(t.charge=e.charge),e.mechanics){let n={};e.mechanics.buff!==void 0&&(n.buff=e.mechanics.buff),e.mechanics.extra!==void 0&&(n.extra=e.mechanics.extra),e.mechanics.hp!==void 0&&(n.hp=e.mechanics.hp),e.mechanics.hunger!==void 0&&(n.hunger=e.mechanics.hunger),e.mechanics.vigor!==void 0&&(n.vigor=e.mechanics.vigor),e.mechanics.cures&&e.mechanics.cures.length&&(n.cures=e.mechanics.cures),Object.keys(n).length>0&&(t.mechanics=n)}e.cleaning&&(t.cleaning=e.cleaning),a.set(e.name,t)}}let u=lr(t,n,a,o,c),d=l??n,f={items:u,locationColors:n.locationColors,iconMap:r,mediaMap:i};return d.statusEffects&&(f.statusEffects=d.statusEffects),d.shops&&(f.shops=d.shops),f}function vr(e){let t=e.margin??8,n=e.gap??6,{triggerRect:r,tooltipSize:i,viewport:a}=e,o=a.height-r.bottom,s=r.top,c=o>=i.height+n+t||o>=s?`below`:`above`,l=c===`below`?r.bottom+n:Math.max(t,r.top-n-i.height),u=(r.left+r.right)/2-i.width/2,d=a.width-i.width-t;return u>d&&(u=d),u<t&&(u=t),{x:u,y:l,placement:c}}var yr=4e3,br=null,xr=0;function Sr(e){if(!Cr())return!1;let t=e.target;if(!(t instanceof Element))return!1;let n=t.closest(`[data-item-name]`);if(!n)return!1;let r=n.getAttribute(`data-item-name`);return r?!(br===r&&Date.now()-xr<yr):!1}function Cr(){return typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(hover: none)`).matches}function wr(e){if(typeof document>`u`)return;let t=Tr(),n=null;function r(r){let i=r.getAttribute(`data-item-name`);if(!i)return;let a=e.getItem(i);if(!a)return;t.innerHTML=Dr(a,e.iconMap),t.style.visibility=`hidden`,t.style.display=`block`;let o=r.getBoundingClientRect(),s=t.getBoundingClientRect(),c=vr({triggerRect:{top:o.top,bottom:o.bottom,left:o.left,right:o.right},tooltipSize:{width:s.width,height:s.height},viewport:{width:window.innerWidth,height:window.innerHeight}});t.style.left=`${c.x}px`,t.style.top=`${c.y}px`,t.style.visibility=`visible`,n&&n!==r&&n.removeAttribute(`aria-describedby`),r.setAttribute(`aria-describedby`,t.id),n=r}function i(){t.style.display=`none`,t.innerHTML=``,n?.removeAttribute(`aria-describedby`),n=null}Cr()?document.body.addEventListener(`click`,e=>{let t=e.target;if(!(t instanceof Element))return;let n=t.closest(`[data-item-name]`);if(!n)return;let a=n.getAttribute(`data-item-name`);if(!a)return;let o=Date.now();br===a&&o-xr<yr?(br=null,xr=0,i()):(e.preventDefault(),e.stopPropagation(),br=a,xr=o,r(n))},!0):(document.body.addEventListener(`pointerover`,e=>{let t=e.target;if(!(t instanceof Element))return;let i=t.closest(`[data-item-name]`);!i||i===n||r(i)}),document.body.addEventListener(`pointerout`,e=>{if(!n)return;let t=e.relatedTarget;t instanceof Node&&n.contains(t)||i()})),document.body.addEventListener(`focusin`,e=>{let t=e.target;if(!(t instanceof Element))return;let i=t.closest(`[data-item-name]`);!i||i===n||r(i)}),document.body.addEventListener(`focusout`,e=>{if(!n)return;let t=e.relatedTarget;t instanceof Node&&n.contains(t)||i()}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&i()}),window.addEventListener(`scroll`,i,{passive:!0}),window.addEventListener(`hashchange`,i),document.addEventListener(`click`,e=>{if(!n)return;let r=e.target;r instanceof Node&&(n.contains(r)||t.contains(r))||i()})}function Tr(){let e=document.getElementById(`item-tooltip`);if(e instanceof HTMLDivElement)return e;let t=document.createElement(`div`);return t.id=`item-tooltip`,t.setAttribute(`role`,`tooltip`),t.style.cssText=[`position:fixed`,`z-index:60`,`display:none`,`pointer-events:none`,`max-width:280px`,`padding:10px 12px`,`border-radius:6px`,`border:1px solid var(--color-line, #2a2f3a)`,`background:var(--color-surface, #161922)`,`color:var(--color-ink, #e7eaf2)`,`font-size:12px`,`line-height:1.4`,`box-shadow:0 8px 24px rgba(0,0,0,0.35)`].join(`;`),document.body.appendChild(t),t}var Er={Обычный:`rarity--common`,Необычный:`rarity--uncommon`,Редкий:`rarity--rare`,"Очень редкий":`rarity--very-rare`,Легендарный:`rarity--legendary`};function Dr(t,n){let r=t._nameRU??t.name,i=M(r,n),a=r.slice(0,3),o=e(t.name),s=[];if(t.rarity){let n=Er[t.rarity]??`rarity--common`;s.push(`<span class="rarity-chip ${n}">${e(E(`rarity.`+t.rarity))}</span>`)}t.weight&&s.push(`<span class="text-xs text-dim">${e(E(`chrome.tooltip.weight`))} ${e(t.weight)}</span>`);let c=t.category?`<span class="text-[10px] uppercase tracking-wider text-mute border border-line/60 rounded px-1 py-0.5">${e(E(`category.`+t.category))}</span>`:``,l=Or(t),u=l?`<p class="text-xs text-mute mt-1.5" style="margin:6px 0 0">${e(l)}</p>`:``;return`
    <div style="display:flex;align-items:center;gap:8px">
      <img src="${i}" alt="${e(a)}" loading="lazy" width="24" height="24" style="width:24px;height:24px;object-fit:contain" data-fallback="hide" />
      <strong style="font-weight:600">${o}</strong>
    </div>
    ${s.length?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;align-items:center">${s.join(``)}</div>`:``}
    ${c?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">${c}</div>`:``}
    ${u}
  `}function Or(e){let t=e.effect||e.description||e.note||``;if(!t)return``;let n=t.split(/(?<=[.!?])\s/)[0]??t;return n.length>140?n.slice(0,137)+`…`:n}function kr(e=document){e.addEventListener(`error`,t=>{let n=t.target;if(!(n instanceof HTMLImageElement))return;let r=n.getAttribute(`data-fallback-src`);if(r!==null){n.removeAttribute(`data-fallback-src`),n.src=r;return}let i=n.getAttribute(`data-fallback-class`);if(i!==null){let t=e.createElement(`span`);t.className=i;let r=n.getAttribute(`data-fallback-text`);r!==null&&(t.textContent=r),n.replaceWith(t);return}let a=n.getAttribute(`data-fallback`);if(a===null)return;if(a===`remove-parent`){n.parentElement?.remove();return}if(a===`hide`){n.style.display=`none`;return}let o=n.getAttribute(`data-fallback-parent-class`);o!==null&&n.parentElement?.classList.add(o),n.remove()},!0)}var Ar=`items.returnOrigin`,jr=`items:return-origin-changed`,Mr={repairs:`chrome.returnPill.repairs`,crafting:`chrome.returnPill.crafting`,cast:`chrome.returnPill.cast`,detective:`chrome.returnPill.detective`,maps:`chrome.returnPill.maps`,commands:`chrome.returnPill.commands`,controls:`chrome.returnPill.controls`,gameloop:`chrome.returnPill.gameloop`,intro:`chrome.returnPill.intro`};function Nr(){try{let e=sessionStorage.getItem(Ar);if(!e)return null;let t=JSON.parse(e);if(typeof t.sectionId==`string`&&typeof t.scrollY==`number`&&typeof t.title==`string`)return t}catch{}return null}function Pr(e){try{sessionStorage.setItem(Ar,JSON.stringify(e))}catch{}}function Fr(){try{sessionStorage.removeItem(Ar)}catch{}}var Ir=null;function Lr(){if(typeof document>`u`)return;let e=zr();Ir=e,document.body.addEventListener(`click`,e=>{if(Sr(e))return;let t=e.target;if(!(t instanceof Element))return;let n=t.closest(`[data-item-name]`);if(!n)return;let r=n.closest(`section[id]`);if(!r)return;let i=r.id;if(i===`items`)return;let a=r.dataset.sectionTitle??i;Pr({sectionId:i,scrollY:window.scrollY,title:a}),setTimeout(()=>window.dispatchEvent(new CustomEvent(jr)),0)},!0),e.addEventListener(`click`,()=>{let t=Nr();if(!t){Vr(e);return}let n=document.querySelector(`#items-search`);n&&n.value!==``&&(n.value=``,n.dispatchEvent(new Event(`input`,{bubbles:!0})));let r=document.getElementById(t.sectionId);history.pushState(null,``,`${location.pathname}${location.search}#${t.sectionId}`);let i=An(),a=r?.closest(`details`);a&&!a.open&&(a.open=!0),r&&r.scrollIntoView({behavior:i,block:`start`}),window.scrollTo({top:t.scrollY,behavior:i}),Fr(),Br(e)});let t=()=>Br(e);window.addEventListener(`hashchange`,t),window.addEventListener(`popstate`,t),window.addEventListener(jr,t),document.body.addEventListener(`click`,t=>{let n=t.target;if(!(n instanceof Element))return;let r=n.closest(`a[href^="#"]`);r&&(r.getAttribute(`href`)===`#items`&&Fr(),setTimeout(()=>Br(e),0))}),Br(e)}function Rr(){Ir&&Br(Ir)}function zr(){let e=document.getElementById(`return-pill`);if(e instanceof HTMLButtonElement)return e;let t=document.createElement(`button`);return t.id=`return-pill`,t.type=`button`,t.className=`fixed bottom-6 right-6 z-40 rounded-full border border-line bg-card px-4 py-2 text-sm text-ink shadow-lg hover:bg-surface focus:outline-none focus:ring-2 focus:ring-accent`,t.style.minHeight=`44px`,t.style.display=`none`,document.body.appendChild(t),t}function Br(e){let t=window.location.hash===`#items`,n=Nr();if(t&&n){let t=Mr[n.sectionId],r=t?E(t):`${E(`chrome.returnPill.fallbackPrefix`)}${n.title}${E(`chrome.returnPill.fallbackSuffix`)}`,i=E(`chrome.returnPill.prefix`),a=i.replace(/^[←\s]+/,``);e.textContent=`${i} ${r}`,e.setAttribute(`aria-label`,`${a} ${r}`),e.style.display=`inline-flex`}else Vr(e),!t&&n&&Fr()}function Vr(e){e.style.display=`none`}var Hr=`https://boosty.to/kirigirispress/donate`,Ur=[{id:`t1`,amountRub:199,amountUsd:3,perkKeys:[`early-video`,`discord-chat`],url:`https://boosty.to/kirigirispress/purchase/4005125?ssource=DIRECT&share=subscription_link`,patreonUrl:`https://www.patreon.com/checkout/kirigirispressglobal?rid=29120744`},{id:`t2`,amountRub:499,amountUsd:7,perkKeys:[`early-video`,`honor-list`,`discord-role`,`discord-chat`],url:`https://boosty.to/kirigirispress/purchase/4005126?ssource=DIRECT&share=subscription_link`,patreonUrl:`https://www.patreon.com/checkout/kirigirispressglobal?rid=29120755`},{id:`t3`,amountRub:999,amountUsd:14,perkKeys:[`early-video`,`honor-list`,`discord-role`,`achilles-pawtograph`,`discord-chat`],flagship:!0,url:`https://boosty.to/kirigirispress/purchase/4005129?ssource=DIRECT&share=subscription_link`,patreonUrl:`https://www.patreon.com/checkout/kirigirispressglobal?rid=29120781`}];function Wr(e){return s(e)?{tierHref:e=>e.patreonUrl??`https://www.patreon.com/kirigirispressglobal`,tierAmount:e=>e.amountUsd,currency:`usd`}:{tierHref:e=>e.url??`https://boosty.to/kirigirispress`,tierAmount:e=>e.amountRub,currency:`rub`,oneTimeUrl:Hr}}function Gr(e){return`${Math.trunc(e).toString().replace(/\B(?=(\d{3})+(?!\d))/g,` `)} ₽`}function Kr(e){return`$${Math.trunc(e)}`}var qr=[`a[href]`,`button:not([disabled])`,`input:not([disabled])`,`select:not([disabled])`,`textarea:not([disabled])`,`[tabindex]:not([tabindex="-1"])`].join(`, `);function Jr(e,t){if(e.key!==`Tab`)return;let n=Array.from(t.querySelectorAll(qr)).filter(e=>!e.closest(`[hidden]`));if(n.length===0){e.preventDefault(),t.focus({preventScroll:!0});return}let r=n[0],i=n[n.length-1];if(!r||!i)return;let a=document.activeElement,o=a!==null&&t.contains(a);e.shiftKey?(!o||a===r)&&(e.preventDefault(),i.focus({preventScroll:!0})):(!o||a===i)&&(e.preventDefault(),r.focus({preventScroll:!0}))}var H=null,Yr=null,Xr=!1;function Zr(e){return E(`donate.tier.${e}.name`)}function Qr(t,n,r){let i=t.perkKeys.map(t=>`<li>${e(E(`donate.perk.${t}`))}</li>`).join(``),a=t.flagship?`<span class="donate-tier__badge">${e(E(`donate.menu.allIncluded`))}</span>`:``,o=String(n+1).padStart(2,`0`),s=r.currency===`usd`?Kr(r.tierAmount(t)):Gr(r.tierAmount(t));return`
    <div class="donate-tier${t.flagship?` donate-tier--flagship`:``}">
      ${a}
      <div class="donate-tier__head">
        <span class="donate-tier__name"><span class="donate-tier__num" aria-hidden="true">${o}</span>${e(Zr(t.id))}</span>
        <span class="donate-tier__price">${e(s)}<span class="donate-tier__per">${e(E(`donate.menu.perMonth`))}</span></span>
      </div>
      <ul class="donate-tier__perks">${i}</ul>
      <a class="donate-tier__cta" data-tier="${t.id}"
         href="${r.tierHref(t)}" target="_blank" rel="noopener noreferrer">${e(E(`donate.menu.choose`))}</a>
    </div>
  `}function $r(){return H||(H=document.createElement(`div`),H.className=`donate-modal`,H.setAttribute(`role`,`dialog`),H.setAttribute(`aria-modal`,`true`),H.setAttribute(`aria-hidden`,`true`),H.setAttribute(`aria-labelledby`,`donate-modal-title`),H.tabIndex=-1,document.body.appendChild(H),H.addEventListener(`click`,e=>{let t=e.target;(t===H||t.closest(`[data-donate-close]`))&&ri()}),H.addEventListener(`click`,e=>{e.target.closest(`[data-tier], [data-donate-custom]`)&&ri()}),H)}function ei(){if(!H)return;let t=Wr(T()),n=t.oneTimeUrl?`<a class="donate-tier__custom" data-donate-custom
         href="${t.oneTimeUrl}" target="_blank" rel="noopener noreferrer">${e(E(`donate.menu.custom`))}</a>`:``;H.innerHTML=`
    <div class="donate-modal__panel" role="document">
      <header class="donate-modal__head">
        <h2 class="donate-modal__title" id="donate-modal-title">${e(E(`donate.modal.title`))}</h2>
        <button type="button" class="donate-modal__close" data-donate-close
                aria-label="${e(E(`donate.modal.close`))}">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </header>
      <div class="donate-modal__body">
        <p class="donate-modal__intro">${e(E(`donate.menu.intro`))}</p>
        <div class="donate-tiers">
          ${Ur.map((e,n)=>Qr(e,n,t)).join(``)}
          ${n}
        </div>
      </div>
    </div>
  `}function ti(e){if(Xr){if(e.key===`Escape`){e.preventDefault(),ri();return}H&&Jr(e,H)}}function ni(){$r(),ei(),Yr=document.activeElement,Xr=!0,document.body.classList.add(`donate-modal-locked`),H.setAttribute(`aria-hidden`,`false`),document.addEventListener(`keydown`,ti),requestAnimationFrame(()=>{H.classList.add(`donate-modal--open`),(H.querySelector(`[data-tier]`)??H).focus({preventScroll:!0})})}function ri(){if(!Xr||!H)return;Xr=!1,H.classList.remove(`donate-modal--open`),H.setAttribute(`aria-hidden`,`true`),document.body.classList.remove(`donate-modal-locked`),document.removeEventListener(`keydown`,ti);let e=Yr;Yr=null,setTimeout(()=>e?.focus({preventScroll:!0}),0)}var ii=!1;function ai(){ii||(ii=!0,document.addEventListener(`click`,e=>{e.target?.closest(`[data-donate]`)&&(e.preventDefault(),ni())}))}var oi=`gmod-2026-07`,si=Date.parse(`2026-07-22T12:00:00+05:00`),ci=`shinri.giveaway.${oi}.dismissed`,li=`https://www.youtube.com/@kirigirispress`,ui=`https://www.youtube.com/@kirigirispressglobal`,di=`https://discord.gg/x6SEvQSD2f`,fi=`https://discord.com/channels/1504848403064950865/1527544555518300302`,pi=550,U=null,mi=null,hi=!1;function gi(e){if(e.dismissed||e.now>si)return!1;let t=new URLSearchParams(e.search);if(t.has(`donate`)||t.has(`id`))return!1;let n=e.hash.replace(/^#/,``);return!(n&&n!==`top`)}function _i(){try{return sessionStorage.getItem(ci)===`1`}catch{return!1}}function vi(){try{sessionStorage.setItem(ci,`1`)}catch{}}function yi(t,n=``){return`<li class="giveaway-modal__step">${e(t)}${n}</li>`}function bi(t,n){return` <a class="giveaway-modal__link" href="${t}" target="_blank" rel="noopener noreferrer">${e(n)}</a>`}function xi(t,n){let r=o(t).autonym,i=`${E(`localeSwitcher.selectLanguage`)} ${r}`;return`<button type="button" class="giveaway-modal__lang-opt" data-giveaway-lang="${t}"
            aria-pressed="${t===n?`true`:`false`}"
            aria-label="${e(i)}"><span aria-hidden="true">${t.toUpperCase()}</span></button>`}function Si(){if(!U)return;let t=T(),n=E(`giveaway.ps`),i=n?`<p class="giveaway-modal__ps">${e(n)}</p>`:``;U.innerHTML=`
    <div class="giveaway-modal__panel" role="document">
      <div class="giveaway-modal__head">
        <div class="giveaway-modal__lang" role="group" aria-label="${e(E(`localeSwitcher.aria`))}">
          ${r.map(e=>xi(e,t)).join(`
          `)}
        </div>
        <button type="button" class="giveaway-modal__close" data-giveaway-close
                aria-label="${e(E(`giveaway.close`))}">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <div class="giveaway-modal__body">
        <p class="giveaway-modal__badge"><span aria-hidden="true">🎁</span> ${e(E(`giveaway.badge`))}</p>
        <h2 class="giveaway-modal__title" id="giveaway-modal-title">${e(E(`giveaway.title`))}</h2>
        <p class="giveaway-modal__intro">${e(E(`giveaway.intro`))}</p>

        <h3 class="giveaway-modal__subhead">${e(E(`giveaway.howTo.heading`))}</h3>
        <ul class="giveaway-modal__steps">
          ${yi(E(`giveaway.step.youtube`),bi(li,E(`giveaway.step.youtubeRu`))+bi(ui,E(`giveaway.step.youtubeEn`)))}
          ${yi(E(`giveaway.step.discord`),bi(di,E(`giveaway.step.discordJoin`)))}
          ${yi(E(`giveaway.step.react`))}
        </ul>

        <p class="giveaway-modal__draw">${e(E(`giveaway.draw`))}</p>
        <p class="giveaway-modal__safety">${e(E(`giveaway.safety`))}</p>
        ${i}

        <a class="giveaway-modal__cta" href="${fi}" target="_blank" rel="noopener noreferrer">${e(E(`giveaway.cta`))}</a>
      </div>
    </div>
  `}function Ci(){return U||(U=document.createElement(`div`),U.className=`giveaway-modal`,U.setAttribute(`role`,`dialog`),U.setAttribute(`aria-modal`,`true`),U.setAttribute(`aria-hidden`,`true`),U.setAttribute(`aria-labelledby`,`giveaway-modal-title`),U.setAttribute(`aria-label`,E(`giveaway.aria`)),U.tabIndex=-1,document.body.appendChild(U),U.addEventListener(`click`,e=>{let t=e.target,n=t.closest(`[data-giveaway-lang]`);if(n){let e=n.dataset.giveawayLang;a(e)&&wi(e);return}(t===U||t.closest(`[data-giveaway-close]`))&&Di()}),U)}async function wi(e){if(e!==T()){try{await xe(e)}catch{return}hi&&(p(e),Si(),U?.setAttribute(`aria-label`,E(`giveaway.aria`)),U?.querySelector(`[data-giveaway-lang="${e}"]`)?.focus({preventScroll:!0}))}}function Ti(e){if(hi){if(e.key===`Escape`){e.preventDefault(),Di();return}U&&Jr(e,U)}}function Ei(){Ci(),Si(),mi=document.activeElement,hi=!0,document.body.classList.add(`giveaway-modal-locked`),U.setAttribute(`aria-hidden`,`false`),document.addEventListener(`keydown`,Ti),requestAnimationFrame(()=>{U.classList.add(`giveaway-modal--open`),U.querySelector(`[data-giveaway-close]`)?.focus({preventScroll:!0})})}function Di(){if(!hi||!U)return;hi=!1,vi(),U.classList.remove(`giveaway-modal--open`),U.setAttribute(`aria-hidden`,`true`),document.body.classList.remove(`giveaway-modal-locked`),document.removeEventListener(`keydown`,Ti);let e=mi;mi=null,setTimeout(()=>e?.focus({preventScroll:!0}),0)}var Oi=!1;function ki(){Oi||(Oi=!0,!(typeof document>`u`)&&gi({now:Date.now(),dismissed:_i(),search:location.search,hash:location.hash})&&window.setTimeout(Ei,pi))}function W(t,n){let{num:r,label:i}=D(t);return`
    <header class="mb-8">
      <span class="text-xs font-mono text-dim tabular-nums">${r}</span>
      <h2 class="text-3xl font-bold text-ink mt-2">${e(i)}</h2>
    </header>
    <div class="bg-card border border-red rounded p-4 text-red text-sm">
      ${e(E(`errors.loadFailedPrefix`))}data/data.json: ${e(String(n))}
    </div>
  `}function G({num:t,title:n,summary:r}){let i=r?`<p class="section-header-cover__summary">${e(r)}</p>`:``;return`
    <header class="section-header-cover">
      <span class="section-header-cover__num tabular-nums" aria-hidden="true">${e(t)}</span>
      <div class="section-header-cover__body">
        <div class="section-header-cover__title-row">
          <h2 class="section-header-cover__title">${e(n)}</h2>
        </div>
        ${i}
      </div>
    </header>
  `}function Ai({id:e,num:t,title:n,summary:r,bodyHtml:i}){let a=document.getElementById(e);if(!a)return;let o={num:t,title:n};r!==void 0&&(o.summary=r),a.innerHTML=`
    ${G(o)}
    <div class="prose-shinri">${i}</div>
  `}var ji=Object.assign({"../../content/en/controls.md":()=>C(()=>import(`./controls-Ckp_vptP.js`),[]),"../../content/en/faq.md":()=>C(()=>import(`./faq-DQulVIVF.js`),[]),"../../content/en/gameloop.md":()=>C(()=>import(`./gameloop-wFoNopPh.js`),[]),"../../content/en/intro.md":()=>C(()=>import(`./intro-CDnyeQj7.js`),[]),"../../content/es/controls.md":()=>C(()=>import(`./controls-DS8zWMqX.js`),[]),"../../content/es/faq.md":()=>C(()=>import(`./faq-CPwfZLeT.js`),[]),"../../content/es/gameloop.md":()=>C(()=>import(`./gameloop-DWaMrx_D.js`),[]),"../../content/es/intro.md":()=>C(()=>import(`./intro-CcC9JJX3.js`),[]),"../../content/ru/controls.md":()=>C(()=>import(`./controls-ZEI00OC0.js`),[]),"../../content/ru/faq.md":()=>C(()=>import(`./faq-BOJQuKex.js`),[]),"../../content/ru/gameloop.md":()=>C(()=>import(`./gameloop-BBQwLE4e.js`),[]),"../../content/ru/intro.md":()=>C(()=>import(`./intro-DKNAATQ7.js`),[])}),Mi=Object.assign({"../../content/en/detective-notebook.txt":()=>C(()=>import(`./detective-notebook-BJCI97n7.js`).then(e=>e.default),[]),"../../content/es/detective-notebook.txt":()=>C(()=>import(`./detective-notebook-8mNQ2aVk.js`).then(e=>e.default),[]),"../../content/ru/detective-notebook.txt":()=>C(()=>import(`./detective-notebook-BKYOPfNp.js`).then(e=>e.default),[])});function Ni(e,t,n){return`../../content/${e}/${t}.${n}`}async function Pi(e,t=T()){let n=ji[Ni(t,e,`md`)]??ji[Ni(`ru`,e,`md`)];if(!n)throw Error(`No prose for "${e}" in ${t} or ru`);return(await n()).default}async function Fi(e,t=T()){let n=Mi[Ni(t,e,`txt`)]??Mi[Ni(`ru`,e,`txt`)];if(!n)throw Error(`No raw text for "${e}" in ${t} or ru`);return await n()}async function Ii(){return Pi(`intro`)}async function Li(){let e=document.getElementById(`intro`);if(!e)return;let t=!1,n;try{n=await Ii()}catch(n){!t&&document.body.contains(e)&&(e.innerHTML=W(`intro`,n));return}if(t)return;let r=D(`intro`);return Ai({id:`intro`,num:r.num,title:r.label,summary:r.summary,bodyHtml:n}),{dispose(){t=!0}}}var K=(e,t=`0 0 24 24`)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${t}" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,Ri=K(`<path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>`),zi=K(`<circle cx="11" cy="14" r="7"/><path d="M16 9l2-2"/><path d="M18 7l1.5-1.5"/><path d="M18 7l2 .5"/><path d="M18 7l-.5-2"/>`),Bi=K(`<path d="M9 3h6"/><path d="M9 3v6L4 19a2 2 0 0 0 1.8 3h12.4A2 2 0 0 0 20 19l-5-10V3"/><circle cx="12" cy="16" r="1.5"/>`),Vi=K(`<path d="M12 3c0 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 1 1 3 2 3-3z"/>`),Hi=K(`<path d="M12 2v20"/><path d="M2 12h20"/><path d="M5 5l14 14"/><path d="M19 5L5 19"/><path d="M9 4l3 3 3-3"/><path d="M9 20l3-3 3 3"/><path d="M4 9l3 3-3 3"/><path d="M20 9l-3 3 3 3"/>`),Ui=K(`<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/>`),Wi=K(`<path d="M12 2v6"/><path d="M12 16v6"/><path d="M2 12h6"/><path d="M16 12h6"/><path d="M5 5l4 4"/><path d="M15 15l4 4"/><path d="M19 5l-4 4"/><path d="M9 15l-4 4"/>`),Gi=K(`<circle cx="10" cy="10" r="6"/><path d="M20 20l-5-5"/><circle cx="10" cy="10" r="1.5" fill="currentColor" stroke="none"/>`),Ki=K(`<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`),qi=K(`<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.9 4.9l1.4 1.4"/><path d="M17.7 17.7l1.4 1.4"/><path d="M4.9 19.1l1.4-1.4"/><path d="M17.7 6.3l1.4-1.4"/>`),Ji=K(`<path d="M14.5 2l7.5 7.5-4 4-7.5-7.5z"/><path d="M10.5 9.5L3 17l4 4 7.5-7.5"/><path d="M5 19l3-3"/>`),Yi=K(`<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M11 6v10"/><path d="M6 11h10"/>`),Xi=K(`<path d="M12 3v18"/><path d="M5 21h14"/><path d="M6 6h12"/><path d="M6 6l-3 7a3 3 0 0 0 6 0z"/><path d="M18 6l-3 7a3 3 0 0 0 6 0z"/>`),Zi=K(`<path d="M12 22V12"/><path d="M12 12c0-4 3-7 7-7-1 4-3 7-7 7z"/><path d="M12 12c0-3-2-6-5-6 .5 3 2 6 5 6z"/>`),Qi=K(`<path d="M3 12c2-3 5-4 9-4 3 0 5 1 7 3-1 3-3 5-7 5-3 0-6-1-9-4z"/><path d="M9 8c0-2 1-4 3-4"/><path d="M14 11l3 5"/><path d="M17 16h-3"/>`),$i=K(`<path d="M5 17l14-10"/><path d="M5 7l14 10"/><circle cx="12" cy="12" r="9"/>`),ea=K(`<path d="M3 9l2-5h14l2 5"/><path d="M3 9v11h18V9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M9 20v-6h6v6"/>`),ta=K(`<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c1 .8 1.5 2 1.5 3.3h5c0-1.3.5-2.5 1.5-3.3A7 7 0 0 0 12 2z"/>`),na=[{patterns:[`суток`,`сутки`,`сут`,`days`,`day`,`d`,`д`],seconds:86400},{patterns:[`часов`,`часа`,`час`,`hours`,`hour`,`hr`,`h`,`ч`],seconds:3600},{patterns:[`минут`,`мин`,`minutes`,`minute`,`min`,`m`,`м`],seconds:60},{patterns:[`секунд`,`секунды`,`сек`,`seconds`,`second`,`secs`,`sec`,`s`,`с`],seconds:1}];function ra(e,t=`min`){let n=e.trim().toLowerCase();if(!n)return null;let r=n.split(`:`).map(e=>e.trim());if(r.length>=2&&r.every(e=>/^\d+(?:[.,]\d+)?$/.test(e))){let e=r.map(e=>Number.parseFloat(e.replace(`,`,`.`)));return e.some(e=>!Number.isFinite(e))?null:r.length===3?(e[0]??0)*3600+(e[1]??0)*60+(e[2]??0):(e[0]??0)*60+(e[1]??0)}let i=0,a=!1;for(let e of n.matchAll(/(\d+(?:[.,]\d+)?)\s*([a-zа-яё]*)/giu)){let n=e[1];if(!n)continue;let r=Number.parseFloat(n.replace(`,`,`.`));if(!Number.isFinite(r))continue;let o=ia((e[2]??``).trim(),t);o!==null&&(i+=r*o,a=!0)}return a?i:null}function ia(e,t){if(!e)return t===`sec`?1:t===`min`?60:3600;for(let t of na)if(t.patterns.includes(e))return t.seconds;for(let t of na)for(let n of t.patterns)if(e.startsWith(n))return t.seconds;return null}var aa={day:`сут`,hour:`ч`,min:`мин`,sec:`сек`};function oa(e,t,n=aa){if(e<=0)return`0 ${n.sec} ${t}`;let r=Math.floor(e/86400),i=e-r*86400,a=Math.floor(i/3600),o=i-a*3600,s=Math.floor(o/60),c=Math.round(o-s*60),l=[];return r&&l.push(`${r} ${n.day}`),a&&l.push(`${a} ${n.hour}`),s&&l.push(`${s} ${n.min}`),c&&!r&&!a&&l.push(`${c} ${n.sec}`),`${l.join(` `)||`0 ${n.sec}`} ${t}`}var sa=`\\d+(?:[.,]\\d+)?\\s+(?:игр\\.?\\s+|игровых\\s+|реальных\\s+|ИРЛ\\s+)?(?:сек\\.?(?:унд[ыау]?)?|мин\\.?(?:ут[ыау]?)?|час[аов]*|ч(?=\\b|\\s|[.,;:)]))`,ca=`${sa}(?:\\s+${sa})*(?:\\s+(?:ИРЛ|игрового\\s+времени|реального\\s+времени))?`,la=`(?:\\s*\\(\\s*(?:≈\\s*)?(${ca})\\s*\\))?`,ua=RegExp(`\\b(${ca})${la}`,`giu`),da=/^<span\b[^>]*class="[^"]*\btime-chip\b[^"]*"/i,fa=/^<span\b[^>]*class="[^"]*\bno-time-chip\b[^"]*"/i,pa=/^<\/span\s*>/i;function ma(e){return/(?:игр\.|игрового|игровых)/iu.test(e)}function ha(e){return ra(e.replace(/игрового\s+времени/giu,` `).replace(/реального\s+времени/giu,` `).replace(/игровых?/giu,` `).replace(/реальных?/giu,` `).replace(/игр\.?/giu,` `).replace(/ИРЛ/gu,` `).replace(/\s+/g,` `).trim(),`sec`)}function ga(e){return e.replace(/&/g,`&amp;`).replace(/"/g,`&quot;`).replace(/</g,`&lt;`)}function _a(e){let t=0;return e.replace(/<[^>]+>|[^<]+/g,e=>e.startsWith(`<`)?(da.test(e)||fa.test(e)?t++:t>0&&pa.test(e)&&t--,e):t>0?e:e.replace(ua,(e,t,n)=>{let r=ma(t),i=n?ma(n):!1,a,o;if(n)r?(a=t,o=n):i?(a=n,o=t):(a=t,o=n);else{let e=ha(t);e==null?(a=t,o=``):r?(a=t,o=oa(e/72,`реального`)):(a=t,o=oa(e*72,`игрового`))}return o?`<span class="time-chip" data-tooltip="${ga(o)}" tabindex="0">${a}</span>`:`<span class="time-chip">${a}</span>`}))}function va(e){e&&(e.innerHTML=_a(e.innerHTML))}var q=null,ya=null;function ba(){if(q&&document.body.contains(q))return;let t=document.createElement(`div`);t.className=`cmd-lightbox`,t.setAttribute(`role`,`dialog`),t.setAttribute(`aria-modal`,`true`),t.setAttribute(`aria-hidden`,`true`),t.hidden=!0,t.innerHTML=`
    <div class="cmd-lightbox__backdrop" data-lightbox-dismiss></div>
    <div class="cmd-lightbox__frame" role="document">
      <button
        type="button"
        class="cmd-lightbox__close"
        aria-label="${e(E(`commands.lightbox.close`))}"
        data-lightbox-dismiss
      >×</button>
      <figure class="cmd-lightbox__figure">
        <img class="cmd-lightbox__img" alt="" />
        <figcaption class="cmd-lightbox__caption"></figcaption>
      </figure>
    </div>
  `,document.body.appendChild(t),q=t,t.addEventListener(`click`,e=>{let t=e.target;t instanceof Element&&t.closest(`[data-lightbox-dismiss]`)&&Ca()}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&q&&!q.hidden&&(e.preventDefault(),Ca())})}function xa(e){e.addEventListener(`click`,e=>{let t=e.target;if(!(t instanceof Element))return;let n=t.closest(`[data-gif-expand]`);n&&(e.preventDefault(),Sa(n))})}function Sa(e){if(!q)return;let t=e.dataset.gifSrc??``,n=e.dataset.gifAlt??``,r=e.dataset.gifCode??``,i=q.querySelector(`.cmd-lightbox__img`),a=q.querySelector(`.cmd-lightbox__caption`);i&&(i.src=t,i.alt=n),a&&(a.textContent=r),q.hidden=!1,q.setAttribute(`aria-hidden`,`false`),document.body.classList.add(`cmd-lightbox-open`),ya=e,q.querySelector(`.cmd-lightbox__close`)?.focus()}function Ca(){if(!q)return;let e=q.querySelector(`.cmd-lightbox__img`);e&&(e.removeAttribute(`src`),e.alt=``),q.hidden=!0,q.setAttribute(`aria-hidden`,`true`),document.body.classList.remove(`cmd-lightbox-open`),ya?.focus(),ya=null}var wa=n(`data/videos.json`),Ta=null;function Ea(){return Ta||=fetch(wa).then(e=>{if(!e.ok)throw Error(`${wa} HTTP ${e.status}`);return e.json()}).catch(e=>{throw Ta=null,e}),Ta}function Da(e,t){return t===`ru`?e.ru:e.en}function Oa(e,t,n,r){let i=e.find(e=>e.id===t);if(!i)return null;let a=Da(i,r).chapters?.find(e=>e.id===n);return a?{video:i,chapter:a}:null}function ka(e,t){return e.filter(e=>e.sections.includes(t))}function Aa(e){let t=Math.max(0,Math.floor(e)),n=Math.floor(t/3600),r=Math.floor(t%3600/60),i=t%60,a=n>0?String(r).padStart(2,`0`):String(r),o=String(i).padStart(2,`0`);return n>0?`${n}:${a}:${o}`:`${a}:${o}`}function ja(t,n=``,r){let i=Da(t,T()),a=`https://i.ytimg.com/vi/${encodeURIComponent(i.videoId)}/hqdefault.jpg`,o=r?.title??i.title,s=r?.badge??Aa(i.durationSeconds),c=r?` data-video-start="${String(r.startSeconds)}"`:``;return`
    <button type="button"
            class="video-card${n?` ${n}`:``}"
            data-video-embed
            data-video-id="${e(i.videoId)}"
            data-video-title="${e(o)}"${c}
            aria-label="${e(E(`videos.card.playAria`))}: ${e(o)}">
      <span class="video-card__thumb">
        <img src="${a}" alt="" width="480" height="360" loading="lazy" decoding="async" />
        <span class="video-card__duration">${e(s)}</span>
        <span class="video-card__play" aria-hidden="true"></span>
      </span>
      <span class="video-card__meta">
        <span class="video-card__title">${e(o)}</span>
      </span>
    </button>
  `}function Ma(t){for(let n of Array.from(t.querySelectorAll(`[data-video-embed]`)))n.addEventListener(`click`,()=>{let t=n.dataset.videoId,r=n.dataset.videoTitle??``;if(!t)return;let i=Number.parseInt(n.dataset.videoStart??``,10),a=Number.isFinite(i)&&i>0?`&start=${String(i)}`:``,o=document.createElement(`div`);o.className=`${n.className} video-card--playing`,o.innerHTML=`
        <span class="video-card__thumb video-card__thumb--live">
          <iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(t)}?autoplay=1${a}"
                  title="${e(r)}"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowfullscreen></iframe>
        </span>
        <span class="video-card__meta">
          <span class="video-card__title">${e(r)}</span>
        </span>
      `,n.replaceWith(o)})}async function Na(t,n,r){let i;try{i=Oa(await Ea(),n,r,T())}catch{t.remove();return}if(!document.body.contains(t))return;if(!i){t.remove();return}let{video:a,chapter:o}=i,s=`${Aa(o.startSeconds)} – ${Aa(o.endSeconds)}`;t.innerHTML=`
    <p class="section-videos__label">${e(E(`videos.chapter.label`))}</p>
    <div class="section-videos__row">
      ${ja(a,`video-card--inline`,{startSeconds:o.startSeconds,badge:s,title:o.label})}
    </div>
  `,Ma(t)}async function Pa(t,n){let r=t.querySelector(`[data-videos-host]`);if(!r)return;let i;try{i=ka(await Ea(),n)}catch{r.remove();return}if(document.body.contains(r)){if(i.length===0){r.remove();return}r.innerHTML=`
    <p class="section-videos__label">${e(E(`videos.section.label`))}</p>
    <div class="section-videos__row">
      ${i.map(e=>ja(e,`video-card--inline`)).join(``)}
    </div>
  `,Ma(r)}}function Fa(e){switch(e){case 1:return E(`gameloop.phase.1.title`);case 2:return E(`gameloop.phase.2.title`);case 3:return E(`gameloop.phase.3.title`);case 4:return E(`gameloop.phase.4.title`);default:return``}}async function Ia(){return Pi(`gameloop`)}async function La(){let e=document.getElementById(`gameloop`);if(!e)return;let t,n;try{[t,n]=await Promise.all([z(),Ia()])}catch(t){document.body.contains(e)&&(e.innerHTML=W(`gameloop`,t));return}if(!document.body.contains(e))return;let r=D(`gameloop`),{html:i}=Va(n);e.innerHTML=`
    ${G({num:r.num,title:r.label,summary:r.summary})}
    <div class="prose-shinri gameloop-prose">${i}</div>
    ${Za(t.detectiveMechanics)}
    <div class="section-videos" data-videos-host></div>
  `,Pa(e,`gameloop`),va(e.querySelector(`.gameloop-prose`));let a=e.querySelector(`details.phase-block#phase-4`);if(a){let e=document.createElement(`div`);e.className=`section-videos section-videos--chapter`,a.append(e),Na(e,`detective-basics`,`class-trial`)}Qa(e);let o=Ra(e);return ba(),xa(e),o}function Ra(e){let t=new Set(za.map(e=>e.id)),n=()=>{let n=window.location.hash.replace(/^#/,``);if(!t.has(n))return;let r=e.querySelector(`details.phase-block#${CSS.escape(n)}`);r&&!r.open&&(r.open=!0)};n(),window.addEventListener(`hashchange`,n);let r=!1;return{dispose(){r||(r=!0,window.removeEventListener(`hashchange`,n))}}}var za=[{num:1,id:`phase-1`,icon:qi,emojiTag:`🌞`,variant:`daily`},{num:2,id:`phase-2`,icon:Ji,emojiTag:`🔪`,variant:`crime`},{num:3,id:`phase-3`,icon:Yi,emojiTag:`🔍`,variant:`investigation`},{num:4,id:`phase-4`,icon:Xi,emojiTag:`⚖️`,variant:`trial`}],Ba=[{emojiTag:`🔪`,variant:`crime`,icon:Ji},{emojiTag:`🌱`,variant:`peace`,icon:Zi},{emojiTag:`🕊`,variant:`survivors`,icon:Qi},{emojiTag:`☠`,variant:`loss`,icon:$i}];function Va(e){let t=new DOMParser().parseFromString(`<div>${e}</div>`,`text/html`),n=t.body.firstElementChild;if(!n)return{html:e,phaseTaglines:{}};let r=Ga(n);return Ka(n,t,r),Ua(n,t),Ha(n,t),Ja(n,t),{html:n.innerHTML,phaseTaglines:r}}function Ha(t,n){let r=Ya(t,`h2`,`📖`);if(!r)return;let i=r.nextElementSibling;if(!i||i.tagName!==`OL`)return;let a=Array.from(i.querySelectorAll(`:scope > li`));if(a.length===0)return;let o=[`var(--color-cyan)`,`var(--color-green)`,`var(--color-yellow)`,`var(--color-accent)`,`var(--color-red)`],s=e=>o[Math.min(o.length-1,Math.round(e/Math.max(1,a.length-1)*(o.length-1)))],c=a.map((t,n)=>{let r=(t.textContent??``).trim();return`
      <li class="chapter-card" style="--chapter-accent: ${s(n)}">
        <span class="chapter-card__num" aria-hidden="true">${n+1}</span>
        <span class="chapter-card__title">${e(r)}</span>
      </li>`}),l=n.createElement(`ol`);l.className=`chapter-grid`,l.innerHTML=c.join(``);let u=n.createElement(`h2`);u.id=`chapters`,u.className=`gameloop-section-heading`,u.textContent=Xa(r.textContent??``),r.replaceWith(u),i.replaceWith(l)}function Ua(t,r){for(let i of za){let a=t.querySelector(`details.phase-block#${i.id}`);if(!a)continue;let o=a.querySelector(`:scope > summary`);if(!o)continue;let s=`assets/generated/gameloop-phase${i.num}`,c=Fa(i.num),l=`${E(`gameloop.phase.figureAltPrefix`)}${i.num}: ${c}`,u=`${E(`gameloop.phase.zoomPrefix`)}${i.num} — ${c}`,d=r.createElement(`figure`);d.className=`phase-block__figure phase-block__figure--${i.variant}`,d.innerHTML=`
      <button type="button"
              class="phase-block__figure-btn"
              data-gif-expand
              data-gif-src="${e(n(`${s}-960.webp`))}"
              data-gif-alt="${e(l)}"
              data-gif-code="${e(E(`gameloop.phase.word`))} ${i.num} · ${e(c)}"
              aria-label="${e(u)}">
        <img src="${e(n(`${s}-640.webp`))}"
             srcset="${e(n(`${s}-320.webp`))} 320w, ${e(n(`${s}-640.webp`))} 640w, ${e(n(`${s}-960.webp`))} 960w"
             sizes="(min-width: 768px) 720px, 100vw"
             width="960" height="540"
             alt="${e(l)}"
             loading="lazy" decoding="async" />
        <span class="phase-block__figure-zoom" aria-hidden="true">⤢</span>
      </button>
    `,a.insertBefore(d,o.nextSibling)}}var Wa=`🧭`;function Ga(e){let t={},n=Ya(e,`h2`,Wa)??Array.from(e.querySelectorAll(`h2`)).find(e=>{let t=(e.textContent??``).trim().toLowerCase();return t.startsWith(`фазы главы`)||t.startsWith(`chapter phases`)});if(!n)return t;let r=n.nextElementSibling;if(r?.tagName===`UL`){for(let e of Array.from(r.querySelectorAll(`li`))){let n=(e.textContent??``).trim().match(/^\D*?(\d+)\s*·[^—–-]*[—–-]\s*(.+)$/);if(n){let e=n[1],r=n[2]?.trim()??``;e&&r&&(t[`phase-${e}`]=r)}}r.remove()}return n.remove(),t}function Ka(e,t,n){for(let r of za){let i=Ya(e,`h2`,r.emojiTag);if(!i)continue;let a=t.createElement(`details`);a.className=`phase-block phase-block--${r.variant}`,a.id=r.id;let o=qa(t,r,i,n[r.id]??``);a.appendChild(o);let s=[],c=i.nextSibling;for(;c&&!(c.nodeType===Node.ELEMENT_NODE&&c.tagName===`H2`);)s.push(c),c=c.nextSibling;for(let e of s)a.appendChild(e);i.parentNode?.insertBefore(a,i),i.remove()}}function qa(t,n,r,i){let a=Xa(r.textContent??``),o=a.replace(/^(?:Фаза|Phase)\s+\d+\s*·\s*/i,``)||a,s=t.createElement(`summary`);s.className=`phase-block__cover`;let c=i?`<span class="phase-block__tagline">${e(i)}</span>`:``;return s.innerHTML=`
    <span class="phase-block__num">${n.num}</span>
    <span class="phase-block__glyph" aria-hidden="true">${n.icon}</span>
    <span class="phase-block__heading">
      <span class="phase-block__title">${e(o)}</span>
      ${c}
    </span>
    <span class="phase-block__chevron" aria-hidden="true">▾</span>
  `,s}function Ja(t,n){let r=Ya(t,`h2`,`🏆`);if(!r)return;let i=[],a=r.nextElementSibling;for(;a&&a.tagName!==`H2`;)i.push(a),a=a.nextElementSibling;let o=[];for(let t of Ba){let n=i.find(e=>e.tagName===`H3`&&(e.textContent??``).trim().startsWith(t.emojiTag));if(!n)continue;let r=Xa(n.textContent??``),a=[],s=n.nextElementSibling;for(;s&&s.tagName!==`H3`&&s.tagName!==`H2`;)a.push(s),s=s.nextElementSibling;let c=a.map(e=>e.outerHTML).join(``);o.push(`
      <article class="win-card win-card--${t.variant}">
        <header class="win-card__head">
          <span class="win-card__glyph" aria-hidden="true">${t.icon}</span>
          <h4 class="win-card__title">${e(r)}</h4>
        </header>
        <div class="win-card__body prose-shinri">${c}</div>
      </article>
    `)}if(o.length===0)return;let s=n.createElement(`div`);s.className=`win-grid`,s.innerHTML=o.join(``);let c=n.createElement(`h2`);c.id=`win-conditions`,c.className=`gameloop-section-heading`,c.textContent=Xa(r.textContent??``),r.parentNode?.insertBefore(c,r),r.parentNode?.insertBefore(s,r);for(let e of[r,...i])e.remove()}function Ya(e,t,n){let r=e.querySelectorAll(t);for(let e of Array.from(r))if((e.textContent??``).trim().startsWith(n))return e;return null}function Xa(e){return e.trim().replace(/^[^\p{L}\d]+/u,``).trim()}function Za(t){if(!t?.timeCoefficient)return``;let n=t.timeCoefficient,r=n.examples.map(t=>`
      <tr class="game-time__row">
        <td class="game-time__from">${e(t.from)}</td>
        <td class="game-time__arrow" aria-hidden="true">→</td>
        <td class="game-time__to">${e(t.to)}</td>
      </tr>`).join(``),i=(n.notes??[]).map(t=>`<li>${e(t)}</li>`).join(``);return`
    <section class="game-time mt-8" aria-labelledby="game-time-heading">
      <h3 id="game-time-heading" class="game-time__heading">
        <span class="game-time__icon" aria-hidden="true">${Ki}</span>
        ${e(E(`gameloop.time.heading`))}
      </h3>
      <p class="game-time__formula">${e(n.formula)}</p>

      <table class="game-time__table">
        <thead>
          <tr><th>${e(E(`gameloop.time.colReal`))}</th><th></th><th>${e(E(`gameloop.time.colGame`))}</th></tr>
        </thead>
        <tbody>${r}</tbody>
      </table>

      ${i?`<ul class="game-time__notes">${i}</ul>`:``}

      <details class="game-time__converter">
        <summary class="game-time__converter-summary">
          <span class="game-time__converter-label">${e(E(`gameloop.time.calculator`))}</span>
        </summary>
        <div class="game-time__converter-body">
          <div class="game-time__direction" role="tablist" aria-label="${e(E(`gameloop.time.directionAria`))}">
            <button type="button" id="game-time-dir-irl" class="game-time__dir-btn is-active" data-dir="irl-to-game" role="tab" aria-selected="true">
              ${e(E(`gameloop.time.dirIrlToGame`))}
            </button>
            <button type="button" id="game-time-dir-game" class="game-time__dir-btn" data-dir="game-to-irl" role="tab" aria-selected="false">
              ${e(E(`gameloop.time.dirGameToIrl`))}
            </button>
          </div>
          <input
            type="text"
            id="game-time-input"
            class="game-time__input"
            placeholder="${e(E(`gameloop.time.inputPlaceholder`))}"
            value="${e(E(`gameloop.time.inputDefault`))}"
            spellcheck="false"
            autocomplete="off"
          />
          <output id="game-time-output" class="game-time__output">—</output>
          <p class="game-time__hint">${e(E(`gameloop.time.unitsHint`))}</p>
        </div>
      </details>
    </section>
  `}function Qa(e){let t=e.querySelector(`#game-time-input`),n=e.querySelector(`#game-time-output`),r=Array.from(e.querySelectorAll(`.game-time__dir-btn`));if(!t||!n||r.length===0)return;let i=`irl-to-game`,a={day:E(`gameloop.time.unit.day`),hour:E(`gameloop.time.unit.hour`),min:E(`gameloop.time.unit.min`),sec:E(`gameloop.time.unit.sec`)};function o(){if(!t||!n)return;let e=ra(t.value,`min`);if(e===null){n.textContent=`—`;return}i===`irl-to-game`?n.textContent=oa(e*72,E(`gameloop.time.ofGame`),a):n.textContent=oa(e/72,E(`gameloop.time.ofReal`),a)}for(let e of r)e.addEventListener(`click`,()=>{let t=e.dataset.dir;if(!(!t||t===i)){i=t;for(let t of r){let n=t===e;t.classList.toggle(`is-active`,n),t.setAttribute(`aria-selected`,n?`true`:`false`)}o()}});t.addEventListener(`input`,o),o()}var $a=[{title:`Основы управления`,rows:[{combo:[{kind:`cluster`,layout:`wasd`}],label:`Перемещение персонажа`},{combo:[{key:`Shift`},{key:`W / WA / WD`,variant:`wide`}],label:`Бег`},{combo:[{key:`Space`}],label:`Прыжок`},{combo:[{key:`Space`},{key:`Ctrl`}],label:`Высокий прыжок`,note:`Перепрыгнуть через препятствия, где простой прыжок не помогает.`},{combo:[{key:`Ctrl`}],label:`Присед`},{combo:[{key:`Z`}],label:`Лечь на пол`},{combo:[{key:`Alt`},{key:`E`}],label:`Сесть на плоскую поверхность`,subRows:[{combo:[{key:`Space`}],label:`Встать`}]},{combo:[{key:`Alt`},{kind:`icon`,icon:`mouse-wheel`,label:`Колесо мыши`}],label:`Сменить позу сидения`},{combo:[{key:`ЛКМ`,variant:`abbr`}],label:`Перетащить предмет (удерживание на предмете)`},{combo:[{key:`H`}],label:`Колесо действий: эмоции, анимации, кубики, описание персонажа`,subRows:[{combo:[{key:`ЛКМ`,variant:`abbr`}],label:`Подтвердить выбор`},{combo:[{key:`ПКМ`,variant:`abbr`}],label:`Закрыть открытое меню`}]},{combo:[{key:`E`}],label:`Подобрать предмет`},{combo:[{key:`G`}],label:`Присмотреться к окружению или предмету`,subRows:[{combo:[{key:`F`}],label:`Сохранить улику (труп или след ловушки/гранаты)`}]}]},{title:`Голосовой чат`,rows:[{combo:[{key:`X`}],label:`Голосовой чат`},{combo:[{key:`X`},{key:`Shift`}],label:`Слышно на большем радиусе`},{combo:[{key:`X`},{key:`Alt`}],label:`Слышно на меньшем радиусе`}]}],eo=`assets/gifs/Controls/`,to=[{title:`Передвижение и камера`,items:[{id:`wasd_walk_shift`,gif:`wasd_walk_shift.gif`,title:`Передвижение`,body:[{kind:`p`,text:`W, A, S, D — движение в соответствующих направлениях. Зажмите SHIFT для бега.`}]},{id:`ctrl`,gif:`CTRL.gif`,title:`Приседание`,body:[{kind:`p`,text:`Зажмите CTRL, чтобы присесть.`}]},{id:`z`,gif:`Z.gif`,title:`Лечь`,body:[{kind:`p`,text:`Нажмите Z, чтобы лечь.`}]},{id:`space`,gif:`space.gif`,title:`Прыжок`,body:[{kind:`p`,text:`SPACE — обычный прыжок. CTRL + SPACE — высокий прыжок, позволяет преодолевать более высокие препятствия.`}]},{id:`r`,gif:`R.gif`,title:`Прицел`,body:[{kind:`p`,text:`Нажмите R, чтобы включить или выключить прицел.`}]},{id:`f1`,gif:`F1.gif`,title:`Переключение вида`,body:[{kind:`p`,text:`Нажмите F1, чтобы переключиться между видом от первого и третьего лица.`}]}]},{title:`Голос, анимации и эмоции`,items:[{id:`mic_radius`,gif:`mic_radius.gif`,title:`Микрофон и радиус голоса`,body:[{kind:`p`,text:`X — средний радиус слышимости. ALT + X — маленький радиус. SHIFT + X — максимальный радиус.`},{kind:`ul`,intro:`Радиус слышимости:`,items:[`ALT + X — 200 юнитов`,`X — 300 юнитов`,`SHIFT + X — 760 юнитов`]},{kind:`figure`,src:`assets/diagrams/voice-radius.jpg`,alt:`Радиусы слышимости голосового чата`,caption:`Радиусы голосового чата`}]},{id:`animation`,gif:`animation.gif`,title:`Меню анимаций`,body:[{kind:`p`,text:`Зажмите H, чтобы открыть меню анимаций и выбрать нужную. ESC — закрыть меню.`}]},{id:`animation_cam`,gif:`animation_cam.gif`,title:`Управление камерой в анимации`,body:[{kind:`p`,text:`F1 — смена вида. В режиме от третьего лица: двигайте мышь для поворота камеры, колесо мыши — приближение/удаление.`}]},{id:`emotes`,gif:`emotes.gif`,title:`Эмоции`,body:[{kind:`p`,text:`Зажмите H, чтобы открыть колесо эмоций, и выберите нужную эмоцию курсором.`}]},{id:`emote_wheel`,gif:`emote_wheel.gif`,title:`Колесо эмоций и анимаций`,body:[{kind:`p`,text:`Зажмите H для открытия колеса, наведитесь на нужный раздел и выберите ЛКМ. В колесе доступны четыре раздела:`},{kind:`ul`,items:[`Анимации — танцы, стойки и жесты персонажа`,`Эмоции — выражения лица персонажа`,`Бросить кости — бросок кубиков`,`Описание персонажа — текст под именем, который можно изменить по своему усмотрению`]}]},{id:`roll`,gif:`roll.gif`,title:`Бросок кубиков`,body:[{kind:`p`,text:`Зажмите H, выберите «Бросить кости» и нажмите ЛКМ. Результат броска отображается в чате и виден всем игрокам.`},{kind:`p`,text:`В RP бросок кубиков используется для определения исходов действий — по запросу ГМ-а (гейм-мастера) или по договорённости между игроками. Например, попытка убедить другого персонажа в чём-либо или исход любого другого действия, результат которого должен решить случай. Чем выше выпавшее число — тем удачнее исход.`}]},{id:`description`,gif:`description.gif`,title:`Описание персонажа`,body:[{kind:`p`,text:`Зажмите H, выберите «Описание персонажа» и нажмите ЛКМ. Кликните ЛКМ в текстовое поле и введите описание — до 110 символов. Нажмите Ок для сохранения или Сбросить статус для очистки.`},{kind:`p`,text:`При наведении на персонажа описание отображается между именем и фамилией персонажа и никнеймом игрока.`}]}]},{title:`Взаимодействие`,items:[{id:`wheel_of_interaction`,gif:`wheel_of_interaction.gif`,title:`Колесо взаимодействий`,body:[{kind:`p`,text:`Зажмите E на персонаже или предмете, чтобы открыть колесо взаимодействий и выбрать доступное действие.`}]},{id:`hug`,gif:`hug.gif`,title:`Обнять`,body:[{kind:`p`,text:`Зажмите E на другом игроке и выберите «Обнять» в колесе взаимодействий.`}]},{id:`carry`,gif:`carry.gif`,title:`Взять на руки / посадить на плечи`,body:[{kind:`p`,text:`Зажмите E на игроке, в колесе взаимодействий выберите «Взять на руки» или «Посадить на плечи». SPACE — отпустить игрока.`}]},{id:`push`,gif:`push.gif`,title:`Толкнуть`,body:[{kind:`p`,text:`Наведитесь на игрока и зажмите E для вызова колеса взаимодействий, затем нажмите ЛКМ на «Толкнуть».`}]},{id:`lmb_hold`,gif:`lmb_hold.gif`,title:`Перетащить предмет`,body:[{kind:`p`,text:`Зажмите ЛКМ на предмете и перемещайте мышью, чтобы изменить его положение.`}]},{id:`alt_e`,gif:`alt_e.gif`,title:`Предпросмотр посадки`,body:[{kind:`p`,text:`Зажмите ALT и двигайте мышью (ЛКМ/ПКМ), чтобы настроить ориентацию персонажа перед посадкой. Колесо мыши — сменить позу сидения. E — подтвердить. CTRL — переключить вид камеры.`}]},{id:`inspect`,gif:`inspect.gif`,title:`Осмотр персонажа`,body:[{kind:`p`,text:`Наведитесь на персонажа и нажмите T — откроется окно осмотра, где видно его снаряжение: головной убор, одежда, перчатки и обувь. Закрыть окно — ЛКМ.`},{kind:`p`,text:`Это может пригодиться в расследовании: например, можно выяснить, у кого есть прибор ночного видения или перчатки.`}]},{id:`pickup`,gif:`pickup.gif`,title:`Подбор предмета`,body:[{kind:`p`,text:`Наведитесь на предмет — появится небольшая карточка/окно с его наименованием, количеством, редкостью, категорией, описанием и весом. Нажмите E чтобы подобрать. Предмет сразу окажется в инвентаре — это подтверждается уведомлением в правом верхнем углу экрана.`}]},{id:`feeding`,gif:`feeding.gif`,title:`Кормление`,body:[{kind:`p`,text:`ПКМ по еде в инвентаре → «Добавить в меню кормления». После этого в колесе быстрых действий (E) появляется кнопка «Покормить» со списком выбранной еды. Выбранный игрок получает уведомление и может согласиться или отказаться — если соглашается, запускается процесс приёма пищи.`},{kind:`callout`,tone:`warn`,text:`Игрока в стяжках или наручниках можно покормить насильно, без согласия — так убийца скармливает жертве отравленную еду.`}]}]},{title:`Двери, сейфы и контейнеры`,items:[{id:`door_interact`,gif:`door_interact.gif`,title:`Взаимодействие с дверью`,body:[{kind:`p`,text:`ЛКМ на дверь — постучать. Если есть звонок — нажмите E, чтобы позвонить. Зажмите E — откроется колесо взаимодействий: открыть дверь обычно или тихо. Нажмите E на открытую незапертую дверь — откроется без меню. F — отпереть или запереть дверь ключом.`}]},{id:`lockpick`,gif:`lockpick.gif`,title:`Взлом отмычками`,body:[{kind:`p`,text:`У двери зажмите E, в колесе взаимодействий выберите «Взломать». Появится мини-игра: движением мыши вверх поднимайте пины. Как только все пины окажутся в подвешенном состоянии — нажмите ЛКМ, чтобы провернуть цилиндр. Отмычки ломаются при промахе мышью или раннем нажатии ЛКМ. ПКМ — отменить взлом.`}]},{id:`crowbar_door`,gif:`crowbar_door.gif`,title:`Взлом двери ломом`,body:[{kind:`p`,text:`Держа лом, нажмите ПКМ на дверь, чтобы вскрыть её.`}]},{id:`unlock_safe`,gif:`unlock_safe.gif`,title:`Сейф`,body:[{kind:`p`,text:`Наведитесь на сейф и зажмите E — появится колесо взаимодействий с вариантами «Открыть» и «Отпереть/Запереть». По умолчанию сейф заперт. Нажмите ЛКМ на нужном действии — в левом нижнем углу появится подтверждение: «Теперь контейнер не заперт» или «Теперь контейнер заперт».`},{kind:`p`,text:`Вместимость сейфа — до 15 кг. Если сейф заперт и у вас нет ключа от комнаты, придётся вскрывать его отмычками — запустится мини-игра взлома, аналогичная взлому закрытой двери.`}]}]},{title:`Инвентарь и предметы`,items:[{id:`equipment`,gif:`equipment.gif`,title:`Надеть снаряжение`,body:[{kind:`p`,text:`Откройте инвентарь клавишей I. Наведите на предмет и нажмите ПКМ, чтобы вызвать контекстное меню — выберите «Экипировать». Либо перетащите предмет в нужный слот или дважды нажмите ЛКМ. F — включить/выключить фонарик.`}]},{id:`split_items`,gif:`split_items.gif`,title:`Перемещение и разделение предметов`,body:[{kind:`p`,text:`Зажмите SHIFT + ЛКМ на стопке предметов, чтобы разделить её. Отпустите ЛКМ — появится ползунок выбора количества. ЛКМ — подтвердить.`}]},{id:`inventory_scroll`,gif:`inventory_scroll.gif`,title:`Выбор предмета и настройка скролла`,body:[{kind:`p`,text:`Клавиша 1 — руки. Клавиши 2, 3 — предметы из соответствующих слотов. Зажмите ПКМ — достать кулаки, ЛКМ — удар. Для включения меню выбора предмета: откройте меню ESC → Garry's Mod → снимите галочку «Быстрая смена оружия». После этого при выборе слота появится меню выбора предмета — колесом мыши выберите нужный и подтвердите ЛКМ. ПКМ — отменить выбор.`}]},{id:`inventory`,gif:`inventory.gif`,title:`Инвентарь`,body:[{kind:`p`,text:`Нажмите I для открытия инвентаря. Он разделён на три части.`},{kind:`p`,text:`Слева — три вкладки: «Состояние» (здоровье, выносливость, сытость, бодрость, температура и эффекты), «Личность» (звание и пол определяются выбранным персонажем; отпечаток пальца и след обуви — уникальные для каждой игры) и «Внешность» (визуальные настройки одежды и аксессуаров — только внешний вид, на геймплей не влияет). Ползунки перетаскиваются зажатием ЛКМ вправо или кликом ЛКМ у края шкалы (0 — отменить, 1 — применить). Сверху отображается имя персонажа.`},{kind:`p`,text:`По центру — слоты экипировки: головной убор (NoctiScope v0.1, мешок), одежда (Тёплая куртка «Плюшевый Мрак»), перчатки (перчатки, одноразовые перчатки), обувь (пока пусто), а также слот для плаща — туда надевается только маскировка. Здесь же можно посмотреть и покрутить модельку персонажа.`},{kind:`p`,text:`Справа — инвентарь. Наведитесь на предмет — появится информация о нём. ПКМ по предмету — контекстное меню с действиями. Зажмите ЛКМ и перетащите предмет в слот экипировки, в контейнер или за пределы окна (выбросить). Двойной ЛКМ быстро перемещает предмет между инвентарём и открытым контейнером.`},{kind:`p`,text:`Сортировка: кнопка ↑↓ — по алфавиту (А→Я / Я→А), весу (лёгкие/тяжёлые вперёд) или новизне (новые/старые вперёд). Вторая кнопка — фильтр по категории: Все предметы, Еда, Медицина, Инженерия, Универсальные, Снаряжение, Прочее.`},{kind:`p`,text:`Внизу — шкала вместимости: белая зона — норма, жёлтая — перегрузка, красная — сильная перегрузка (замедляет движение и бой). При полном заполнении невозможно двигаться. Вместимость зависит от персонажа: например, у Некомару, Гонты, Сакуры и К1-В0 она выше, у Чихиро, Нагисы, Котоко и Монаки — ниже.`},{kind:`p`,text:`Над инвентарём три кнопки: Инвентарь, Задания и Рецепты. В разделе рецептов можно закрепить нужный предмет булавкой — тогда в правой части экрана отобразится список недостающих ингредиентов. Рецепты, для которых хватает ресурсов, показываются первыми.`}]},{id:`inventory_actions`,gif:`inventory_actions.gif`,title:`Действия с предметами в инвентаре и контейнере`,body:[{kind:`p`,text:`При открытии контейнера (E) слева отображается ваш инвентарь, справа — содержимое контейнера. Сверху в каждом окне есть кнопки сортировки. Снизу — шкала вместимости контейнера и кнопка «Забрать всё».`},{kind:`ul`,intro:`Перемещение предметов:`,items:[`Двойной ЛКМ — быстро переместить предмет между инвентарём и контейнером`,`Зажать ЛКМ и перетащить — переместить в нужное место вручную`,`CTRL + зажать ЛКМ — выделить несколько предметов, отпустить ЛКМ (не отпуская CTRL), затем снова зажать ЛКМ на любом из выделенных и перетащить всё сразу`,`Перетащить предмет за пределы окон — выбросить на пол`]},{kind:`ul`,intro:`Контекстное меню (ПКМ по предмету):`,items:[`Выпить / Съесть / Использовать — применить предмет`,`Отравить — добавить яд или снотворное в предмет (доступно при наличии соответствующего предмета в инвентаре)`,`Выбросить — положить предмет на пол`,`Положить — предпросмотр размещения предмета в мире. Красный — нельзя положить, жёлтый — можно`,`Осмотреть — текстовое описание, тип предмета. При наличии УФ-фонарика можно проанализировать предмет (окровавлен, протёрт, отпечаток и т.д.) и снять отпечатки`,`Экипировать — надеть предмет или поместить оружие в слот. Также можно зажать ЛКМ и перетащить оружие в слот напрямую`]},{kind:`p`,text:`При наведении на предмет отображается его наименование, редкость, вес, эффекты и описание.`},{kind:`callout`,tone:`tip`,text:`Прокручивайте содержимое контейнеров во время расследования — улики могут быть спрятаны на самом дне.`}]}]},{title:`Бой`,items:[{id:`attack`,gif:`attack.gif`,title:`Атака`,body:[{kind:`p`,text:`Клавиши 2 или 3 (в зависимости от слота экипировки) — достать оружие. ЛКМ — обычный удар. ПКМ — альтернативный удар. Зажмите ЛКМ и отпустите — тяжёлый удар с размаху. Зажмите ПКМ — достать кулаки, ЛКМ — удар кулаком.`},{kind:`p`,text:`Кулаки наносят 8–12 единиц урона за удар (одинаково для всех персонажей), но не наносят урон при 20% HP и ниже — убить кулаками нельзя.`}]},{id:`stealth_kill`,gif:`stealth_kill.gif`,title:`Скрытное убийство`,body:[{kind:`p`,text:`Для совершения скрытного убийства необходимо наличие оружия. Подкрадитесь к персонажу сзади и зажмите F — начнётся анимация скрытного убийства.`},{kind:`p`,text:`Важно: направление вашего взгляда определяет, по какой части тела будет нанесён удар. Это место повреждения отобразится в монокума-файле жертвы.`}]},{id:`stun`,gif:`stun.gif`,title:`Оглушение`,body:[{kind:`p`,text:`Наведитесь на игрока и зажмите E для вызова колеса взаимодействий, выберите «Оглушить» ЛКМ. Начнётся анимация оглушения.`},{kind:`p`,text:`После того как персонаж упал, подойдите к телу и зажмите E — откроется колесо с вариантами: взять на руки, обыскать, убить. Нажмите ESC чтобы закрыть колесо без действия. Нажмите F чтобы поднять тело на руки. Если не предпринять никаких действий — через некоторое время персонаж сам очнётся.`},{kind:`callout`,tone:`warn`,text:`Не атакуйте в лоб — персонаж сможет легко отбить нападение.`}]},{id:`fight_back`,gif:`fight_back.gif`,title:`Отбить нападение`,body:[{kind:`p`,text:`Когда на вас нападают, появляется надпись «Отбиться от нападения» и кнопка F с таймером — у вас есть всего 1 секунда. Если не успеть — вас оглушат или убьют.`},{kind:`p`,text:`При успешном отбитии противник падает. С упавшим игроком можно взаимодействовать: нажмите E — обыскать или убить, зажмите F — поднять нападавшего. Если не предпринять ничего — то упавший сам может подняться на ноги зажав Space.`}]},{id:`failed_attack`,gif:`failed_attack.gif`,title:`Неудачное нападение`,body:[{kind:`p`,text:`Если противник успел отбить нападение — вы падаете на пол. Зажмите SPACE чтобы подняться самостоятельно, либо дождитесь пока противник сжалится и поднимет вас на ноги. Пока вы лежите — вы беззащитны: вас могут обыскать или того хуже — убить. Поэтому впредь будьте аккуратнее и действуйте наверняка — нападайте со спины или хотя бы сбоку!`}]}]},{title:`Обмен и обыск`,items:[{id:`trade_offer`,gif:`trade_offer.gif`,title:`Предложение обмена`,body:[{kind:`p`,text:`Наведитесь на игрока и зажмите E для вызова колеса взаимодействий, затем нажмите ЛКМ на «Обмен». В открывшемся окне зажмите ЛКМ и перетащите нужный предмет из инвентаря в область обмена, либо сделайте двойной ЛКМ. Когда выбрали всё необходимое — нажмите «Предложить».`},{kind:`p`,text:`Полученные в ходе обмена предметы отображаются в правом верхнем углу экрана.`}]},{id:`trade_accept`,gif:`trade_accept.gif`,title:`Принятие обмена`,body:[{kind:`p`,text:`Когда другой игрок предлагает вам обмен, в правом верхнем углу экрана появится уведомление — нажмите Y чтобы принять или N чтобы отказаться.`},{kind:`p`,text:`В окне обмена отображается: сверху — что предлагает вам другой игрок, снизу — что отдаёте вы. Чтобы добавить предмет — зажмите ЛКМ и перетащите его из инвентаря в нижнюю область, либо сделайте двойной ЛКМ. Когда оба игрока выбрали нужные предметы — нажмите «Предложить» для завершения обмена.`}]},{id:`search_offer`,gif:`search_offer.gif`,title:`Предложение обыска`,body:[{kind:`p`,text:`Наведитесь на игрока и зажмите E для вызова колеса взаимодействий, затем нажмите ЛКМ на «Обыскать». Начнётся процесс обыска — по завершении шкалы откроется окно с вашим инвентарём и карманами игрока.`},{kind:`p`,text:`Вы можете забрать предметы, положить свои или просто осмотреть содержимое. Чаще всего обыск проводится в ходе расследования — чтобы убедиться, что у игрока нет ничего подозрительного или окровавленного.`}]},{id:`search_accept`,gif:`search_accept.gif`,title:`Согласие на обыск`,body:[{kind:`p`,text:`Когда другой игрок хочет вас обыскать, в правом верхнем углу появится уведомление — нажмите Y чтобы разрешить или N чтобы отказаться. У обыскивающего игрока отобразится надпись «Обыскивает тело».`},{kind:`p`,text:`Если обыскивать сзади или сбоку — разрешение не потребуется, однако жертва услышит характерный звук.`},{kind:`p`,text:`Во время обыска другой игрок может передать вам предметы или незаметно забрать что-то из ваших карманов. Позволяйте себя обыскивать только тем, кому доверяете.`}]}]},{title:`Бытовое и крафт`,items:[{id:`washing`,gif:`washing.gif`,title:`Мытьё рук, оружия, раковины и уборка крови`,body:[{kind:`p`,text:`Подойдите к раковине и зажмите E, чтобы помыть руки. Возьмите оружие или швабру в руки и зажмите F у раковины, чтобы помыть их. Зажатое F у раковины также очищает её от крови. Возьмите швабру (2 или 3 в зависимости от слота экипировки) и зажмите ЛКМ, чтобы протереть кровь на полу.`}]},{id:`workbench`,gif:`workbench.gif`,title:`Верстак / Медицинский верстак / Кухонная плита`,body:[{kind:`p`,text:`Нажмите E на верстаке, медицинском верстаке или кухонной плите, чтобы открыть окно изготовления предмета.`}]},{id:`cooking`,gif:`cooking.gif`,title:`Готовка еды`,body:[{kind:`p`,text:`Подойдите к кухонной плите и нажмите E. В открывшемся меню выберите рецепт ЛКМ, затем нажмите ЛКМ — «Создать предмет» и подтвердите ещё раз ЛКМ. Если у вас несколько наборов ингредиентов для одного блюда, появится ползунок — зажмите ЛКМ и потяните вправо, чтобы выбрать нужное количество порций.`},{kind:`p`,text:`Готовка идёт автоматически. В это время можно открывать инвентарь, лутать контейнеры и прыгать — но не бегать, иначе готовка отменится и придётся начинать заново. Также нельзя выходить за радиус действия плиты. Если прервать процесс на середине — ничего не получите, всё сначала. Готовый предмет (еда) автоматически оказывается в инвентаре.`},{kind:`p`,text:`Чтобы закрепить рецепт и следить за нужными ингредиентами (отображается в правой части экрана), наведитесь на рецепт и нажмите ЛКМ на иконку булавки.`}]}]},{title:`Монопад`,items:[{id:`monopad_overview`,title:`Что это такое`,body:[{kind:`p`,text:`Монопад — персональное устройство ученика Академии. Через него можно пользоваться мессенджером, вести заметки и работать с загруженными данными.`}]},{id:`monopad_appearance`,title:`Интерфейс и оформление`,body:[{kind:`p`,text:`Доступны базовое оформление и цветовые схемы «Киберпанк» и «Династия».`},{kind:`ul`,items:[`Облик выбирается в хабе и сохраняется между сессиями.`,`Выбранный облик виден другим игрокам — и в руках персонажа, и со стороны.`,`Во время активной игры менять облик нельзя.`]}]},{id:`monopad_messenger`,title:`Мессенджер`,body:[{kind:`p`,text:`Поддерживает личные переписки, групповые чаты с аватарками и системные сообщения. В групповом чате может состоять до 6 игроков.`},{kind:`ul`,items:[`В существующий групповой чат можно приглашать новых участников и возвращать ранее исключённых, пока не достигнут лимит.`,`При выходе или исключении участника в группе появляется системное уведомление.`,`В начале игры появляется системный чат «Убийственная игра».`,`В длинных переписках доступен слайдер прокрутки.`,`Контекстное меню открывается ПКМ по чату или кнопкой «…».`]},{kind:`callout`,tone:`warn`,text:`Сообщения не доставляются погибшим игрокам и тем, у кого Монопада нет на руках.`}]},{id:`monopad_notes`,title:`Заметки`,body:[{kind:`p`,text:`Заметки создаются во время расследования — в них удобно фиксировать всё, что пригодится на суде.`},{kind:`p`,text:`Заметку можно прикрепить к улике.`}]},{id:`monopad_downloads`,title:`Загрузка данных`,body:[{kind:`p`,text:`С помощью флешек и накопителей данных можно скачать информацию с Монопада другого игрока.`},{kind:`p`,text:`После загрузки полученные чаты и заметки можно просмотреть.`}]}],gallery:{title:`Как выглядит Монопад`,images:[{src:`assets/monopad/menu.webp`,alt:`Главное меню Монопада`,caption:`Главное меню`},{src:`assets/monopad/messenger.webp`,alt:`Мессенджер Монопада`,caption:`Мессенджер`},{src:`assets/monopad/notes.webp`,alt:`Заметки в Монопаде`,caption:`Заметки`},{src:`assets/monopad/downloads-drive.webp`,alt:`Загруженные данные: заполненная флешка`,caption:`Загруженные данные: заполненная флешка`},{src:`assets/monopad/downloads-protected.webp`,alt:`Загруженные данные: защищённый накопитель`,caption:`Загруженные данные: защищённый накопитель`}]}},{title:`Классный суд`,items:[{id:`trial_energy`,title:`Энергия и действия`,body:[{kind:`p`,text:`Суд длится 15 минут реального времени. У каждого игрока есть запас энергии — изначально ноль, — который заполняется со временем, победами в дебатах и согласием от других игроков. Энергия тратится на четыре действия.`},{kind:`ul`,items:[`Инициировать голосование — 100 энергии`,`Вызвать на дебаты — 100 энергии (при победе полностью восстанавливается)`,`Перебить — 50 энергии (у всех на экране проигрывается короткая анимация с вашим персонажем)`,`Показать согласие — 15 энергии (на игроке, на котором сфокусирована камера, снизу появляется надпись о согласии; согласие также повышает энергию — чаще всего им копят на голосование)`]},{kind:`p`,text:`100 энергии восстанавливаются за 195 секунд реального времени — примерно +1 энергия каждые 2 секунды.`},{kind:`ul`,intro:`Управление действиями:`,items:[`Листать варианты — колесо мыши, WASD или стрелки вверх/вниз`,`Активировать выбранное — E, G или Enter`]}]},{id:`trial_camera`,title:`Камера и спрайты`,body:[{kind:`p`,text:`Камера на суде следит за тем, кто удерживает кнопку голосового чата; остальные стоят в очереди.`},{kind:`p`,text:`В правой части экрана можно выбрать спрайт, который отображается на суде: сменить — ЛКМ в любой момент, добавить в избранное — ПКМ.`}]},{id:`trial_evidence`,title:`Предъявление улик`,body:[{kind:`p`,text:`Улики и предметы из инвентаря предъявляют через инвентарь: ПКМ по предмету → «Предъявить как улику». Улики вроде монокума-файла, лужи крови или следов ловушек — через красную кнопку «Улики» слева: выбрать улику → «Предъявить улику». В обоих случаях у всех игроков проигрывается анимация, и улика попадает в общий список, где её можно рассмотреть подробнее.`},{kind:`p`,text:`Если осмотреть предмет УФ-фонариком и получить свойство (например, «окровавленный отпечаток Y»), то при предъявлении этого предмета все игроки на суде увидят данное свойство.`},{kind:`p`,text:`Блокнот с отпечатками тоже можно предъявить — он сохранится в материалах прошлых дел; другие игроки открывают его кнопкой C → «Открыть старые материалы дела».`}]},{id:`trial_debates`,title:`Дебаты`,body:[{kind:`p`,text:`На суде есть два вида дебатов.`},{kind:`p`,text:`Перекрёстные дебаты — дуэль один на один. Остальные молчат, но могут писать в чат (сообщения отображаются розовым текстом — «шум») и голосовать за победителя. Победитель восстанавливает 100 энергии. Запустить может любой игрок со 100 энергии, затем нужно выбрать оппонента. Длительность — 2 минуты; инициатор может завершить дебаты в любой момент.`},{kind:`p`,text:`Скрам-дебаты — запускаются при ничьей в голосовании: каждому игроку по очереди даётся 20 секунд на свою версию. Если ничья случается трижды подряд — Очернённый побеждает автоматически.`}]}]}],no=`assets/gifs/Controls/posters/`,ro={en:()=>C(()=>import(`./controls-data.en-j6bDM1a6.js`),[]),es:()=>C(()=>import(`./controls-data.es-B4Y9ZFiK.js`),[])};async function io(){let e=T();if(s(e)){let t=await ro[e]();return{groups:t.GROUPS,mechanicGroups:t.MECHANIC_GROUPS}}return{groups:$a,mechanicGroups:to}}async function ao(){let e=document.getElementById(`controls`);if(!e)return;let t=D(`controls`),n=!1,r,i;try{({groups:r,mechanicGroups:i}=await io())}catch(t){!n&&document.body.contains(e)&&(e.innerHTML=W(`controls`,t));return}if(!(n||!document.body.contains(e)))return e.innerHTML=`
    ${G({num:t.num,title:t.label,summary:t.summary})}
    <div class="space-y-6">
      ${r.map(so).join(``)}
    </div>
    ${mo(i)}
  `,ba(),xa(e),oo(e),va(e),{dispose(){n=!0}}}function oo(e){let t=e.querySelectorAll(`.mech-card__media`);t.length!==0&&typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(hover: hover) and (pointer: fine)`).matches&&t.forEach(e=>{let t=e.querySelector(`img[data-gif-src]`);if(!t)return;let n=t.dataset.gifSrc,r=t.dataset.posterSrc;!n||!r||(e.addEventListener(`mouseenter`,()=>{t.getAttribute(`src`)!==n&&(t.src=n),e.dataset.gifPlaying=`true`}),e.addEventListener(`mouseleave`,()=>{t.getAttribute(`src`)!==r&&(t.src=r),delete e.dataset.gifPlaying}))})}function so(t){return`
    <article class="bg-card border border-line rounded-lg p-5">
      <h3 class="text-base font-semibold text-ink mb-4 font-display tracking-wide uppercase text-sm">${e(t.title)}</h3>
      <ul class="space-y-2">
        ${t.rows.map(co).join(``)}
      </ul>
    </article>
  `}function co(t){let n=t.combo.map(fo).join(`<span class="kbd-plus" aria-hidden="true">+</span>`),r=t.repeat?`<span class="kbd-repeat" aria-hidden="true">${e(t.repeat)}</span>`:``,i=t.subRows&&t.subRows.length>0?`<ul class="ctrl-row__subrows">${t.subRows.map(lo).join(``)}</ul>`:``,a=t.note?`<p class="ctrl-note">${e(t.note)}</p>`:``;return`
    <li class="ctrl-row">
      <div class="ctrl-row__combo">
        <span class="kbd-group">${n}${r}</span>
        <span class="ctrl-row__label">${e(t.label)}</span>
      </div>
      ${i}
      ${a}
    </li>
  `}function lo(t){return`
    <li class="ctrl-row__subrow">
      <span class="kbd-group">${t.combo.map(fo).join(`<span class="kbd-plus" aria-hidden="true">+</span>`)}</span>
      <span class="ctrl-row__label">${e(t.label)}</span>
    </li>
  `}var uo=`<svg xmlns="http://www.w3.org/2000/svg" width="1.7em" height="1.2em" viewBox="0 0 28 20" fill="none" aria-hidden="true" focusable="false"><rect x="2.5" y="1.5" width="11" height="17" rx="5.5" stroke="currentColor" stroke-width="1.4"/><rect x="7" y="4" width="2" height="5" rx="1" fill="currentColor"/><path d="M18 8 L21.5 4.5 L25 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 12 L21.5 15.5 L25 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;function fo(t){if(`kind`in t)switch(t.kind){case`cluster`:return po();case`icon`:return`<kbd class="kbd kbd--icon" aria-label="${e(t.label)}">${uo}</kbd>`}return`<kbd class="${t.variant===`abbr`?`kbd kbd--abbr`:t.variant===`wide`?`kbd kbd--wide`:`kbd`}">${e(t.key)}</kbd>`}function po(){return`<span class="kbd-cluster kbd-cluster--wasd" role="group" aria-label="W, A, S, D"><kbd class="kbd kbd--wasd-w">W</kbd><kbd class="kbd">A</kbd><kbd class="kbd">S</kbd><kbd class="kbd">D</kbd></span>`}function mo(t){return`
    <div class="mech-section">
      <h2 class="mech-section__heading">${e(E(`controls.mechanics.heading`))}</h2>
      <p class="mech-section__intro">${e(E(`controls.mechanics.intro`))}</p>
      ${t.map(ho).join(``)}
    </div>
  `}function ho(t){let n=t.items.length;return`
    <details class="mech-group">
      <summary class="mech-group__head">
        <span class="mech-group__accent" aria-hidden="true"></span>
        <h3 class="mech-group__title">${e(t.title)}</h3>
        <span class="mech-group__count" aria-label="${n} ${e(E(`controls.mechanics.cardsCountSuffix`))}">${n}</span>
        <span class="mech-group__chevron" aria-hidden="true">▾</span>
      </summary>
      <div class="mech-grid">
        ${t.items.map(_o).join(``)}
      </div>
      ${go(t)}
    </details>
  `}function go(t){let r=t.gallery;if(!r||r.images.length===0)return``;let i=r.images.map(t=>`
      <figure class="mech-gallery__fig">
        <button
          type="button"
          class="mech-gallery__zoom"
          data-gif-expand
          data-gif-src="${e(n(t.src))}"
          data-gif-alt="${e(t.alt)}"
          data-gif-code="${e(t.caption)}"
          aria-label="${e(E(`controls.mechanics.demoOf`)+t.caption)}">
          <img src="${e(n(t.src))}" alt="${e(t.alt)}" loading="lazy" decoding="async" data-fallback="remove" />
        </button>
        <figcaption>${e(t.caption)}</figcaption>
      </figure>`).join(``);return`
    <details class="mech-gallery">
      <summary class="mech-gallery__summary">${e(r.title)} <span class="mech-gallery__count">${r.images.length}</span></summary>
      <div class="mech-gallery__grid">${i}</div>
    </details>
  `}function _o(t){let r=t.body.find(e=>e.kind===`p`),i=r?t.body.slice(t.body.indexOf(r)+1):t.body,a=r?`<p class="mech-card__hook">${e(r.text)}</p>`:``,o=i.length>0?`<details class="mech-card__details"><summary class="mech-card__summary">${e(E(`controls.mechanics.more`))}</summary><div class="mech-card__more">${i.map(vo).join(``)}</div></details>`:``,s=``;if(t.gif){let r=n(eo+encodeURIComponent(t.gif)),i=t.gif.replace(/\.gif$/i,``),a=n(no+encodeURIComponent(`${i}.webp`)),o=`${E(`controls.mechanics.demoOf`)}${t.title}`;s=`
      <button
        type="button"
        class="mech-card__media"
        data-gif-expand
        data-gif-src="${e(r)}"
        data-gif-alt="${e(o)}"
        data-gif-code="${e(t.title)}"
        aria-label="${e(E(`controls.mechanics.zoom`)+o)}"
      >
        <img src="${e(a)}" data-gif-src="${e(r)}" data-poster-src="${e(a)}" alt="${e(o)}" loading="lazy" decoding="async" />
        <span class="mech-card__zoom" aria-hidden="true">⤢</span>
      </button>`}return`
    <article class="mech-card${t.gif?``:` mech-card--nomedia`}" id="mech-${e(t.id)}">
      ${s}
      <div class="mech-card__body">
        <h4 class="mech-card__title">${e(t.title)}</h4>
        ${a}
        ${o}
      </div>
    </article>
  `}function vo(t){switch(t.kind){case`p`:return`<p class="mech-card__p">${e(t.text)}</p>`;case`ul`:return`${t.intro?`<p class="mech-card__p">${e(t.intro)}</p>`:``}<ul class="mech-card__list">${t.items.map(t=>`<li>${e(t)}</li>`).join(``)}</ul>`;case`callout`:{let n=t.tone===`warn`?`⚠️`:`💡`;return`<aside class="mech-callout mech-callout--${t.tone}"><span class="mech-callout__icon" aria-hidden="true">${n}</span><span>${e(t.text)}</span></aside>`}case`figure`:{let r=n(t.src),i=t.caption??t.alt,a=t.caption?`<figcaption class="mech-card__figcaption">${e(t.caption)}</figcaption>`:``;return`
        <figure class="mech-card__figure">
          <button
            type="button"
            class="mech-card__figure-btn"
            data-gif-expand
            data-gif-src="${e(r)}"
            data-gif-alt="${e(t.alt)}"
            data-gif-code="${e(i)}"
            aria-label="${e(E(`controls.mechanics.zoom`)+t.alt)}">
            <img src="${e(r)}" alt="${e(t.alt)}" loading="lazy" decoding="async" />
            <span class="mech-card__figure-zoom" aria-hidden="true">⤢</span>
          </button>
          ${a}
        </figure>
      `}}}var yo=`assets/gifs/Chat commands/`,bo=[{code:`Y + {msg}`,descKey:`commands.desc.ic`,gif:`cmd_ic_chat.gif`},{code:`/me + {act}`,descKey:`commands.desc.me`,gif:`cmd_me.gif`},{code:`/it + {act}`,descKey:`commands.desc.it`,gif:`cmd_it.gif`,alternatives:[`/do + {act}`]},{code:`//it + {act}`,descKey:`commands.desc.globalIt`,gif:`cmd_global_it.gif`},{code:`/try + {act}`,descKey:`commands.desc.try`,gif:`cmd_try.gif`},{code:`/roll`,descKey:`commands.desc.roll`,gif:`cmd_roll.gif`},{code:`/w + {msg}`,descKey:`commands.desc.w`,gif:`cmd_w.gif`},{code:`/y + {msg}`,descKey:`commands.desc.y`,gif:`cmd_y.gif`},{code:`!sms * + {msg}`,descKey:`commands.desc.sms`,gif:`cmd_sms.gif`},{code:`!pm + {nick} + {msg}`,descKey:`commands.desc.pm`,gif:`cmd_pm.gif`},{code:`!reply + {msg}`,descKey:`commands.desc.reply`},{code:`/looc + {msg}`,descKey:`commands.desc.looc`,gif:`cmd_looc.gif`,alternatives:[`/ + {msg}`,`/b + {msg}`,`/ooc + {msg}`]},{code:`/// + {msg}`,descKey:`commands.desc.report`,gif:`cmd_report.gif`,alternatives:[`@ + {msg}`]}];function xo(e){return e.replace(/\{msg\}/g,E(`commands.ph.message`)).replace(/\{act\}/g,E(`commands.ph.action`)).replace(/\{nick\}/g,E(`commands.ph.nick`))}function So(t){let n=/^([A-Z])(\s.*)?$/.exec(t);if(n){let t=n[1],r=n[2]??``,i=r?`<code class="cmd-chip">${e(xo(r.trimStart()))}</code>`:``;return`<span class="cmd-syntax"><kbd class="kbd kbd--key">${e(t)}</kbd>${i}</span>`}return`<code class="cmd-chip">${e(xo(t))}</code>`}function Co(){let e=document.getElementById(`commands`);if(!e)return;let t=D(`commands`);e.innerHTML=`
    ${G({num:t.num,title:t.label,summary:t.summary})}
    <div class="cmd-grid">
      ${bo.map(wo).join(``)}
    </div>
    ${Eo()}
    ${Do()}
  `,To(e),ba(),xa(e)}function wo(t){let r=t.alternatives&&t.alternatives.length>0?`<p class="cmd-card__alt"><span class="cmd-card__alt-label">${e(t.alternatives.length>1?E(`commands.alt.many`):E(`commands.alt.one`))}:</span> ${t.alternatives.map(t=>`<code class="cmd-chip cmd-chip--alt">${e(xo(t))}</code>`).join(` `)}</p>`:``,i=`${E(`commands.demoOf`)}${xo(t.code)}`,a=``,o=``;if(t.gif){let r=n(yo+encodeURIComponent(t.gif));a=`
        <button
          type="button"
          class="cmd-card__toggle"
          aria-expanded="false"
          data-gif-toggle
          data-gif-src="${e(r)}"
          data-gif-alt="${e(i)}"
        >
          <span class="cmd-card__toggle-icon" aria-hidden="true">▶</span>
          <span class="cmd-card__toggle-label">${e(E(`commands.toggle.show`))}</span>
        </button>`,o=`
      <div class="cmd-card__media" hidden>
        <button
          type="button"
          class="cmd-card__media-trigger"
          data-gif-expand
          data-gif-src="${e(r)}"
          data-gif-alt="${e(i)}"
          data-gif-code="${e(xo(t.code))}"
          aria-label="${e(E(`commands.zoom`)+i)}"
        >
          <img alt="" loading="lazy" decoding="async" />
          <span class="cmd-card__media-zoom" aria-hidden="true">⤢</span>
        </button>
      </div>`}return`
    <article class="cmd-card" data-gif-open="false">
      <div class="cmd-card__body">
        ${So(t.code)}
        <p class="cmd-card__desc">${e(E(t.descKey))}</p>
        ${r}
        ${a}
      </div>
      ${o}
    </article>
  `}function To(e){e.addEventListener(`click`,e=>{let t=e.target;if(!(t instanceof Element))return;let n=t.closest(`[data-gif-toggle]`);if(!n)return;let r=n.closest(`.cmd-card`);if(!r)return;let i=r.querySelector(`.cmd-card__media`),a=i?.querySelector(`img`);if(!i||!a)return;let o=r.dataset.gifOpen!==`true`;r.dataset.gifOpen=String(o),n.setAttribute(`aria-expanded`,String(o));let s=n.querySelector(`.cmd-card__toggle-label`);if(s&&(s.textContent=E(o?`commands.toggle.hide`:`commands.toggle.show`)),o){let e=n.dataset.gifSrc??``;a.alt=n.dataset.gifAlt??``,a.src=e,i.hidden=!1}else a.removeAttribute(`src`),a.alt=``,i.hidden=!0})}function Eo(){let t=n(`assets/diagrams/chat-commands-radius.jpg`),r=E(`commands.radius.figureAlt`),i=e(E(`commands.radius.units`));return`
    <article class="radius-panel" aria-labelledby="cmd-radius-heading">
      <div class="radius-panel__body">
        <h3 id="cmd-radius-heading" class="radius-panel__title">${e(E(`commands.radius.title`))}</h3>
        <ul class="radius-panel__list">
          <li><code class="cmd-chip">/w</code> — 225 ${i}</li>
          <li><kbd class="kbd">Y</kbd> (IC), <code class="cmd-chip">/me</code>, <code class="cmd-chip">/it</code>, <code class="cmd-chip">//it</code>, <code class="cmd-chip">/try</code>, <code class="cmd-chip">/roll</code>, <code class="cmd-chip">/looc</code> — 300 ${i}</li>
          <li><code class="cmd-chip">/y</code> — 405 ${i}</li>
        </ul>
      </div>
      <button
        type="button"
        class="radius-panel__figure"
        data-gif-expand
        data-gif-src="${e(t)}"
        data-gif-alt="${e(r)}"
        data-gif-code="${e(E(`commands.radius.zoomCode`))}"
        aria-label="${e(E(`commands.zoom`)+r)}">
        <img src="${e(t)}" alt="${e(r)}" loading="lazy" decoding="async" />
        <span class="radius-panel__zoom" aria-hidden="true">⤢</span>
      </button>
    </article>
  `}function Do(){return`
    <aside class="cmd-callout" role="note" aria-label="${e(E(`commands.metagame.aria`))}">
      <header class="cmd-callout__head">
        <span class="cmd-callout__icon" aria-hidden="true">⚠️</span>
        <h3 class="cmd-callout__title">${e(E(`commands.metagame.title`))}</h3>
      </header>
      <p class="cmd-callout__body">
        ${e(E(`commands.metagame.body`))}
      </p>
      <ul class="cmd-callout__list">
        <li><span class="cmd-callout__bullet cmd-callout__bullet--ban" aria-hidden="true">🚫</span> ${e(E(`commands.metagame.punishment`))}</li>
        <li><span class="cmd-callout__bullet cmd-callout__bullet--note" aria-hidden="true">💡</span> ${e(E(`commands.metagame.note`))}</li>
      </ul>
    </aside>
  `}var Oo=[{key:`1f_school`,labelKey:`maps.1f_school.label`,captionKey:`maps.1f_school.caption`},{key:`1f_dorms`,labelKey:`maps.1f_dorms.label`,captionKey:`maps.1f_dorms.caption`},{key:`2f_school`,labelKey:`maps.2f_school.label`,captionKey:`maps.2f_school.caption`},{key:`2f_dorms`,labelKey:`maps.2f_dorms.label`,captionKey:`maps.2f_dorms.caption`},{key:`3f`,labelKey:`maps.3f.label`,captionKey:`maps.3f.caption`},{key:`4f`,labelKey:`maps.4f.label`,captionKey:`maps.4f.caption`},{key:`5f`,labelKey:`maps.5f.label`,captionKey:`maps.5f.caption`}];function ko(){let t=document.getElementById(`maps`);if(!t)return;let n=D(`maps`);t.innerHTML=`
    ${G({num:n.num,title:n.label,summary:n.summary})}
    <aside class="map-disclaimer" role="note" aria-label="${e(E(`maps.disclaimer.aria`))}">
      <span class="map-disclaimer__icon" aria-hidden="true">ℹ</span>
      <p class="map-disclaimer__body">
        ${e(E(`maps.disclaimer.body`))}
      </p>
    </aside>
    <div class="map-tabs-wrap mb-6">
      <div class="map-tabs-scroll flex gap-x-4 border-b border-line" id="map-tabs">
        ${Oo.map((e,t)=>Ao(e,t===0)).join(``)}
      </div>
    </div>
    <div id="map-panels">
      ${Oo.map((e,t)=>jo(e,t===0)).join(``)}
    </div>
    <div class="section-videos" data-videos-host></div>
  `,Pa(t,`maps`),ba(),t.dataset.lightboxWired||(xa(t),t.dataset.lightboxWired=`true`);let r=t.querySelector(`#map-tabs`),i=t.querySelector(`#map-panels`);r.addEventListener(`click`,e=>{let t=e.target;if(!(t instanceof HTMLElement))return;let n=t.dataset.map;n&&(r.querySelectorAll(`button[data-map]`).forEach(e=>{let t=e.dataset.map===n;e.classList.toggle(`text-ink`,t),e.classList.toggle(`border-accent`,t),e.classList.toggle(`text-mute`,!t),e.classList.toggle(`border-transparent`,!t)}),i.querySelectorAll(`[data-map-panel]`).forEach(e=>{e.classList.toggle(`hidden`,e.dataset.mapPanel!==n)}))})}function Ao(t,n){let r=n?`text-ink border-accent`:`text-mute border-transparent`;return`<button data-map="${e(t.key)}" class="text-sm font-semibold pb-3 border-b-2 transition-colors hover:text-ink shrink-0 whitespace-nowrap ${r}">${e(E(t.labelKey))}</button>`}function jo(t,r){let i=encodeURIComponent(`${t.key}.${o(T()).mapArt}`),a=E(t.captionKey);return`
    <div data-map-panel="${e(t.key)}" class="${r?``:`hidden`}">
      <button
        type="button"
        class="map-panel__zoom"
        data-gif-expand
        data-gif-src="${n(`assets/maps/${i}.png`)}"
        data-gif-alt="${e(a)}"
        data-gif-code="${e(a)}"
        aria-label="${e(E(`maps.zoom`)+a)}">
        <picture>
          <source
            type="image/webp"
            srcset="${n(`assets/generated/${i}-320.webp`)} 320w, ${n(`assets/generated/${i}-640.webp`)} 640w, ${n(`assets/generated/${i}-960.webp`)} 960w"
            sizes="(max-width: 1024px) 100vw, 960px"
          />
          <img src="${n(`assets/maps/${i}.png`)}" alt="${e(a)}" loading="lazy" decoding="async"
               sizes="(max-width: 1024px) 100vw, 960px"
               class="w-full h-auto rounded-lg" />
        </picture>
      </button>
    </div>
  `}function J(t){let n=t.fallbackText===void 0?``:` data-fallback-text="${e(t.fallbackText)}"`,r=t.attrs?` ${t.attrs}`:``;return`<img src="${t.url}" alt="${e(t.alt)}" loading="lazy" class="${t.className}"${r} data-fallback-class="${e(t.fallbackClass)}"${n} />`}function Mo(t){let n=t.qtyHtml??``,r=J(t.icon),i=t.qtyFirst?`${r}${n}${t.nameHtml}`:`${r}${t.nameHtml}${n}`;return`<button type="button" class="${t.chipClass}" data-item-name="${e(t.itemName)}" title="${e(t.title)}">${i}</button>`}function Y(t){return`
    <summary class="hazard-card__summary hazard-card__summary--${t.variant}">
      <span class="hazard-card__icon" aria-hidden="true">${t.icon}</span>
      <span class="hazard-card__title-block">
        <span class="hazard-card__title">${e(t.title)}</span>
        <span class="hazard-card__subtitle">${e(t.subtitle)}</span>
      </span>
      <span class="hazard-card__count">${e(t.count)}</span>
    </summary>
  `}function X(e,t,n){let r=e.querySelector(t);if(!r){let e=n?` (${n})`:``;throw Error(`mustQuery: no element matches \`${t}\`${e}`)}return r}function No(e){let t=e.optionValue??(e=>e.dataset.value),n=t=>{let n=e.trigger(),r=e.panel();!n||!r||(r.hidden=!t,n.setAttribute(`aria-expanded`,t?`true`:`false`))},r=()=>{let t=e.panel();return t?Array.from(t.querySelectorAll(`[role="option"]`)):[]},i=r=>{let i=r.target;if(!(i instanceof Element))return;let a=e.trigger(),o=e.panel();if(!(!a||!o)){if(a.contains(i)){n(o.hidden);return}if(o.contains(i)){let r=i.closest(`[role="option"]`),a=r?t(r):void 0;a!==void 0&&(e.onSelect(a),n(!1),e.trigger()?.focus());return}o.hidden||n(!1)}},a=i=>{let a=e.panel();if(!(!a||a.hidden)){if(i.key===`Escape`){n(!1),e.trigger()?.focus();return}if(i.key===`ArrowDown`||i.key===`ArrowUp`){i.preventDefault();let a=r();if(a.length===0)return;let o=a[(a.findIndex(e=>e.getAttribute(`aria-selected`)===`true`)+(i.key===`ArrowDown`?1:-1)+a.length)%a.length],s=o?t(o):void 0;s!==void 0&&(e.onSelect(s),n(!0),(document.activeElement===null||document.activeElement===document.body)&&e.trigger()?.focus())}}};return document.addEventListener(`click`,i),document.addEventListener(`keydown`,a),{setOpen:n,dispose(){document.removeEventListener(`click`,i),document.removeEventListener(`keydown`,a)}}}function Po(e){return E(`category.${e}`)}function Fo(e){return E(`branch.${e}`)}function Io(e){return E(`rarity.${e}`)}function Lo(e){return e===`__unknown`?E(`items.loc.floorUnknownBadge`):N(e)}var Ro=`Электрошоковая ловушка`,zo=`https://www.youtube.com/watch?v=Ub4CXCygU_k`,Bo=5,Vo=3e3,Ho=6e3;function Uo(e){return(e._nameRU??e.name)===Ro}function Wo(){if(document.querySelector(`.frizyyy-burst`))return;let t=document.createElement(`div`);t.className=`frizyyy-burst`,t.setAttribute(`role`,`dialog`),t.setAttribute(`aria-label`,`frizyyy`),t.innerHTML=`
    <div class="frizyyy-burst__flash" aria-hidden="true"></div>
    <svg class="frizyyy-burst__bolts" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polyline points="50,50 44,38 49,30 42,18 46,6 44,0"></polyline>
      <polyline points="50,50 62,44 68,34 78,30 82,18 88,12"></polyline>
      <polyline points="50,50 64,56 70,68 80,72 84,84 92,92"></polyline>
      <polyline points="50,50 52,64 46,74 52,86 48,94 50,100"></polyline>
      <polyline points="50,50 36,58 30,68 20,72 16,84 8,90"></polyline>
      <polyline points="50,50 38,44 32,34 22,30 18,18 10,10"></polyline>
    </svg>
    <div class="frizyyy-burst__card">
      <div class="frizyyy-burst__name">frizyyy</div>
      <div class="frizyyy-burst__feat">${e(E(`items.egg.feat`))}</div>
      <p class="frizyyy-burst__quote">«${e(E(`items.egg.quote`))}»</p>
    </div>
  `;let n=e=>{e.key===`Escape`&&i()},r=0;function i(){window.clearTimeout(r),window.removeEventListener(`keydown`,n),t.remove()}t.addEventListener(`click`,i),window.addEventListener(`keydown`,n),r=window.setTimeout(i,Ho),document.body.appendChild(t)}function Go(){return`
    <a class="frizyyy-bonus mt-3 flex items-center gap-3 rounded border border-line bg-card p-3"
       href="${zo}" target="_blank" rel="noopener noreferrer">
      <span class="frizyyy-bonus__spark" aria-hidden="true">⚡</span>
      <span class="min-w-0 flex-1">
        <span class="block text-[10px] uppercase tracking-wider text-dim">${e(E(`items.egg.bonusHint`))}</span>
        <span class="block text-sm font-medium text-ink">frizyyy — ${e(E(`items.egg.feat`))}</span>
      </span>
      <span class="text-xs whitespace-nowrap frizyyy-bonus__cta">${e(E(`items.egg.bonusCta`))} →</span>
    </a>
  `}var Ko=n(`assets/icons/effects/`),qo={food:`Голод.png`,poison:`Отравление.png`,bleeding:`Кровотечение.png`,sleep:`Сонливость.png`,fracture:`Перелом ноги.png`,shock:`Дезориентация.png`,immunity:`Абсолютная сопротивляемость.png`,stamina:`Перегруз.png`,heat:`Перегрев.png`},Jo={buff:`Бафф.png`,debuff:`Дебафф.png`};function Yo(e){let t=e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`);return RegExp(`(?<![а-яёa-z0-9])`+t+`(?![а-яёa-z0-9])`,`iu`)}var Xo=[{pattern:`иммунитет к негативным эффектам`,theme:`immunity`,polarity:`buff`},{pattern:`абсолютная сопротивляемость`,theme:`immunity`,polarity:`buff`},{pattern:`уменьшение расхода сытости`,theme:`food`,polarity:`buff`},{pattern:`восстановление сытости`,theme:`food`,polarity:`buff`},{pattern:`восстановления сытости`,theme:`food`,polarity:`buff`},{pattern:`уменьшение расхода выносливости`,theme:`stamina`,polarity:`buff`},{pattern:`отравляет ядом`,theme:`poison`,polarity:`debuff`},{pattern:`вызывает кровотечение`,theme:`bleeding`,polarity:`debuff`},{pattern:`останавливает кровотечение`,theme:`bleeding`,polarity:`buff`},{pattern:`снижение скорости реакции`,theme:`shock`,polarity:`debuff`},{pattern:`кофеиновый шок`,theme:`shock`,polarity:`debuff`},{pattern:`кофейновый шок`,theme:`shock`,polarity:`debuff`},{pattern:`перелом ноги`,theme:`fracture`,polarity:`debuff`},{pattern:`отравление`,theme:`poison`,polarity:`debuff`},{pattern:`кровотечение`,theme:`bleeding`,polarity:`debuff`},{pattern:`дезориентация`,theme:`shock`,polarity:`debuff`},{pattern:`оглушение`,theme:`shock`,polarity:`debuff`},{pattern:`оглушает`,theme:`shock`,polarity:`debuff`},{pattern:`усыпляет`,theme:`sleep`,polarity:`debuff`},{pattern:`усыпление`,theme:`sleep`,polarity:`debuff`},{pattern:`перегрев`,theme:`heat`,polarity:`debuff`},{pattern:`перегруз`,theme:`stamina`,polarity:`debuff`},{pattern:`перелом`,theme:`fracture`,polarity:`debuff`},{pattern:`голод`,theme:`food`,polarity:`debuff`},{pattern:`яд`,theme:`poison`,polarity:`debuff`},{pattern:`полное восстановление здоровья`,polarity:`buff`},{pattern:`большое восстановление здоровья`,polarity:`buff`},{pattern:`малое восстановление здоровья`,polarity:`buff`},{pattern:`восстановление здоровья`,polarity:`buff`},{pattern:`восстановления здоровья`,polarity:`buff`},{pattern:`восстановление бодрости`,polarity:`buff`},{pattern:`восстановления бодрости`,polarity:`buff`},{pattern:`повышение скорости передвижения`,polarity:`buff`},{pattern:`уменьшение входящего урона`,polarity:`buff`},{pattern:`снятие большинства негативных эффектов`,polarity:`buff`},{pattern:`снятие эффектов`,polarity:`buff`},{pattern:`нейтрализация эффектов`,polarity:`buff`},{pattern:`фиксирует конечность`,polarity:`buff`},{pattern:`бонус к урону`,polarity:`buff`},{pattern:`бонус к радиусу`,polarity:`buff`},{pattern:`уменьшает максимальное здоровье`,polarity:`debuff`},{pattern:`снижение скорости передвижения`,polarity:`debuff`},{pattern:`негативный эффект`,polarity:`debuff`},{pattern:`периодический урон`,polarity:`debuff`},{pattern:`дебафф`,polarity:`debuff`},{pattern:`бафф`,polarity:`buff`}];Xo.sort((e,t)=>t.pattern.length-e.pattern.length);var Zo=Xo.map(e=>({entry:e,re:Yo(e.pattern)})),Qo=[`снятие`,`снимает`,`останавливает`,`фиксирует`,`иммунитет к`,`защита от`,`нейтрализация`,`нейтрализует`],$o=new Set([`Яд «Кислота»`,`Яд «Отчаяние»`,`Яд «Поцелуй вдовы»`]),es=/потер[ия][^.]*\d+\s*%\s*здоровь/i,ts={кислота:`Яд «Кислота»`,"поцелуй вдовы":`Яд «Поцелуй вдовы»`,снотворного:`Снотворное`,снотворное:`Снотворное`},ns=/["«]([^"«»]+)["»]/g;function rs(t,n){let r=[],i=0;for(let a of t.matchAll(ns)){let o=a.index??0;o>i&&r.push(e(t.slice(i,o)));let s=a[1]??``,c=ts[s.toLowerCase().trim()]??xn(s.trim());c=ts[c.toLowerCase()]??c;let l=M(c,n),u=e(s),d=e(c);r.push(`<span class="item-chip inline-flex items-baseline gap-1 rounded border border-line/60 bg-surface px-1.5 py-0.5 align-baseline" data-item-name="${d}"><img src="${l}" alt="${d}" loading="lazy" class="inline-block h-3.5 w-3.5 self-center object-contain" data-fallback="remove" />${u}</span>`),i=o+(a[0]?.length??0)}return i<t.length&&r.push(e(t.slice(i))),r.join(``)}function is(e,t,n){if(t!==void 0&&n!==void 0&&$o.has(t)&&es.test(e))return{url:M(t,n),alt:t};let r=e.toLowerCase(),i=Qo.some(e=>r.startsWith(e));for(let{entry:e,re:t}of Zo){if(!t.test(r))continue;if(e.theme&&qo[e.theme])return as(qo[e.theme],e.theme);let n=i?`buff`:e.polarity;if(n)return as(Jo[n],n)}return i?as(Jo.buff,`buff`):null}function as(e,t){return{url:Ko+encodeURIComponent(e),alt:t}}function os(e,t,n,r){let i=e.split(`;`).map(e=>e.trim()),a=(r??e).split(`;`).map(e=>e.trim()),o=[];for(let e=0;e<i.length;e++){let r=i[e]??``;if(!r)continue;let s=a[e]??r;o.push(ss(r,s,t,n))}return o.join(``)}function ss(t,n,r,i){let a=is(n,i,r);return`<div class="effect-row flex items-baseline gap-2 py-0.5">${a?J({url:a.url,alt:a.alt,className:`inline-block h-4 w-4 shrink-0 self-center object-contain`,fallbackClass:`inline-block h-4 w-4 shrink-0`}):`<span class="inline-block h-4 w-4 shrink-0" aria-hidden="true"></span>`}<span class="min-w-0">${r?rs(t,r):e(t)}</span></div>`}var cs={dispose(){}};async function ls(){let t=document.getElementById(`items`);if(!t)return cs;let n=!1,r=null,i=()=>{n||(n=!0,r?.dispose())},a,o,s,c,l,u;try{let e=await pr();a=e.items,o=e.iconMap,s=e.locationColors,c=e.mediaMap,l=e.statusEffects,u=e.shops}catch(e){return n?cs:(t.innerHTML=W(`items`,e),{dispose:i})}if(n)return cs;let d=a.filter(e=>e.placeholder!==!0),f=Rs(d),p=zs(d),m=Vs(d),h=Hs(d),g=D(`items`);t.innerHTML=`
    ${G({num:g.num,title:g.label,summary:g.summary})}
    <div class="mb-6 flex flex-col gap-3">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input type="search" id="items-search"
               placeholder="${e(E(`items.search.placeholder`))}"
               class="min-w-0 flex-1 bg-card border border-line text-ink rounded px-3 py-2 placeholder-dim focus:outline-none focus:border-accent" />
        <div class="flex items-center gap-2 sm:shrink-0">
          <span id="items-sort-label" class="text-[10px] uppercase tracking-wider text-dim whitespace-nowrap">${e(E(`items.sort.label`))}</span>
          <div class="select-menu">
            <button id="items-sort" type="button"
                    class="select-menu__trigger"
                    aria-haspopup="listbox" aria-expanded="false"
                    aria-labelledby="items-sort-label">
              <span class="select-menu__value">${e(E(`items.sort.name`))}</span>
              <svg class="select-menu__caret" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              </svg>
            </button>
            <ul id="items-sort-options" class="select-menu__panel" role="listbox" aria-labelledby="items-sort-label" hidden>
              <li role="option" data-value="name" class="select-menu__option" aria-selected="true">${e(E(`items.sort.name`))}</li>
              <li role="option" data-value="rarity" class="select-menu__option" aria-selected="false">${e(E(`items.sort.rarity`))}</li>
              <li role="option" data-value="category" class="select-menu__option" aria-selected="false">${e(E(`items.sort.category`))}</li>
            </ul>
          </div>
          <button id="items-sort-dir" type="button"
                  class="items-sort-dir bg-card border border-line text-ink rounded px-2 py-2 text-sm hover:border-accent focus:outline-none focus:border-accent"
                  aria-label="${e(E(`items.sort.asc`))}">
            <svg class="items-sort-dir__icon" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 10l4-4 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2" id="items-cats" data-filter-group="cat">
        <span class="text-[10px] uppercase tracking-wider text-dim mr-1">${e(E(`items.filter.category`))}</span>
        ${Us(`all`,E(`filter.all`),!0)}
        ${f.map(e=>Us(e,Po(e),!1)).join(``)}
      </div>
      ${p.length?`
      <div class="flex flex-wrap items-center gap-2" id="items-branches" data-filter-group="branch">
        <span class="text-[10px] uppercase tracking-wider text-dim mr-1">${e(E(`items.filter.branch`))}</span>
        ${Ws(`all`,E(`filter.all`),!0)}
        ${p.map(e=>Ws(e,Fo(e),!1)).join(``)}
      </div>`:``}
      ${m.length?`
      <div class="flex flex-wrap items-center gap-2" id="items-rarities" data-filter-group="rarity">
        <span class="text-[10px] uppercase tracking-wider text-dim mr-1">${e(E(`items.filter.rarity`))}</span>
        ${Gs(`all`,E(`filter.all`),!0)}
        ${m.map(e=>Gs(e,Io(e),!1)).join(``)}
      </div>`:``}
      ${h.length?`
      <div class="flex flex-wrap items-center gap-2" id="items-floors" data-filter-group="floor">
        <span class="text-[10px] uppercase tracking-wider text-dim mr-1">${e(E(`items.filter.floor`))}</span>
        ${h.map(e=>Ks(e,Lo(e),!1)).join(``)}
      </div>`:``}
      <div class="flex shrink-0 gap-2" aria-label="${e(E(`items.mode.aria`))}">
        <button id="items-btn-items" type="button" data-mode="items"
                class="items-mode-btn rounded border border-accent bg-accent px-3 py-2 text-sm text-page transition-colors">
          ${e(E(`items.mode.items`))}
        </button>
        <button id="items-btn-loc" type="button" data-mode="locations"
                class="items-mode-btn rounded border border-line bg-card px-3 py-2 text-sm text-mute transition-colors hover:text-ink">
          ${e(E(`items.mode.locations`))}
        </button>
      </div>
    </div>
    <div id="items-list" class="items-scroll space-y-4"></div>
    ${Ss(u,a,o)}
    ${Cs(l,o)}
  `;let ee=X(t,`#items-search`,`items search input`),_=X(t,`#items-sort`,`items sort trigger`),v=X(t,`#items-sort-options`,`items sort options panel`),te=X(_,`.select-menu__value`,`items sort value label`),y=Array.from(v.querySelectorAll(`[role="option"]`)),ne=X(t,`#items-sort-dir`,`items sort direction button`),re=X(t,`#items-cats`,`items category bar`),ie=t.querySelector(`#items-branches`),ae=t.querySelector(`#items-rarities`),oe=t.querySelector(`#items-floors`),b=X(t,`#items-list`,`items list container`),se=Array.from(t.querySelectorAll(`.items-mode-btn`)),ce=new Map(f.map((e,t)=>[e,t])),le=`all`,ue=`all`,de=`all`,fe=new Set,pe=`items`,x=`name`,me={name:`asc`,rarity:`desc`,category:`asc`};function he(){return d.filter(e=>!(le!==`all`&&e.category!==le||ue!==`all`&&e.branch!==ue||de!==`all`&&e.rarity!==de))}function S(){let e=he(),t=I(ee.value.trim().toLowerCase());b.innerHTML=pe===`items`?us(e,t,o,s,x,me[x],ce):As(e,t,o,s,c,fe)}function ge(){let e=me[x];ne.classList.toggle(`is-desc`,e===`desc`),ne.setAttribute(`aria-label`,E(e===`asc`?`items.sort.asc`:`items.sort.desc`))}ee.addEventListener(`input`,S);let C={name:E(`items.sort.name`),rarity:E(`items.sort.rarity`),category:E(`items.sort.category`)};function _e(e){x=e,te.textContent=C[e];for(let t of y)t.setAttribute(`aria-selected`,t.dataset.value===e?`true`:`false`);ge(),S()}r=No({trigger:()=>_,panel:()=>v,onSelect:e=>{(e===`name`||e===`rarity`||e===`category`)&&_e(e)}}),ne.addEventListener(`click`,()=>{me[x]=me[x]===`asc`?`desc`:`asc`,ge(),S()}),ge(),b.addEventListener(`toggle`,e=>{let t=e.target;if(!(t instanceof HTMLDetailsElement))return;let n=t.classList.contains(`location-card`),r=t.classList.contains(`item-card`);if(!n&&!r||!t.open)return;let i=n?`details.location-card[open]`:`details.item-card[open]`;for(let e of b.querySelectorAll(i))e!==t&&(e.open=!1);requestAnimationFrame(()=>{let e=t.querySelector(`summary`);if(!e)return;let n=e.getBoundingClientRect(),r=b.getBoundingClientRect();n.top<r.top&&(b.scrollTop+=n.top-r.top)})},!0);let w=[];b.addEventListener(`click`,e=>{let t=e.target;if(!(t instanceof Element)||!t.closest(`[data-egg="frizyyy"]`))return;let n=Date.now();w=w.filter(e=>n-e<Vo),w.push(n),w.length>=Bo&&(w=[],Wo())});function ve(e,t,n){e&&e.addEventListener(`click`,r=>{let i=r.target;if(!(i instanceof HTMLElement))return;let a=i.closest(`[data-${t}]`)?.dataset[t];a!==void 0&&(n(a),e.querySelectorAll(`button[data-${t}]`).forEach(e=>{let n=e.getAttribute(`data-${t}`)===a;e.classList.toggle(`is-active`,n)}),S())})}ve(re,`cat`,e=>{le=e}),ve(ie,`branch`,e=>{ue=e}),ve(ae,`rarity`,e=>{de=e}),oe&&oe.addEventListener(`click`,e=>{let t=e.target;if(!(t instanceof HTMLElement))return;let n=t.closest(`[data-floor]`)?.dataset.floor;if(n===void 0)return;let r=!fe.has(n);r?fe.add(n):fe.delete(n),oe.querySelectorAll(`button[data-floor]`).forEach(e=>{e.getAttribute(`data-floor`)===n&&(e.classList.toggle(`is-active`,!r),e.classList.toggle(`opacity-40`,r),e.classList.toggle(`line-through`,r),e.setAttribute(`aria-pressed`,r?`false`:`true`))}),S()});function ye(){oe&&(oe.style.display=pe===`locations`?``:`none`)}for(let e of se)e.addEventListener(`click`,()=>{let t=e.dataset.mode;if(!(t!==`items`&&t!==`locations`)){pe=t,ye();for(let e of se){let t=e.dataset.mode===pe;e.classList.toggle(`bg-accent`,t),e.classList.toggle(`text-page`,t),e.classList.toggle(`border-accent`,t),e.classList.toggle(`bg-card`,!t),e.classList.toggle(`text-mute`,!t),e.classList.toggle(`border-line`,!t)}S()}});return ye(),S(),{dispose:i}}function us(e,t,n,r,i,a,o){let s=e.filter(e=>sc(e,t));if(s.length===0)return gc();let c=s.slice().sort((e,t)=>ps(e,t,i,a,o)).map(e=>ms(e,n,r)).join(``),l=s.length===1?s[0]:void 0;return`
    <div class="items-grid grid gap-3" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">
      ${c}
    </div>
    ${t&&l&&Uo(l)?Go():``}
  `}function ds(e,t){switch(t){case`name`:return!1;case`rarity`:return!e.rarity||Bs.indexOf(e.rarity)<0;case`category`:return!e.category}}function fs(e,t,n,r){switch(n){case`name`:return P(e.name,t.name);case`rarity`:return Bs.indexOf(e.rarity??``)-Bs.indexOf(t.rarity??``);case`category`:{let n=e.category,i=t.category;return(n?r.get(n)??1/0:1/0)-(i?r.get(i)??1/0:1/0)}}}function ps(e,t,n,r,i){let a=ds(e,n);if(a!==ds(t,n))return a?1:-1;if(!a){let a=fs(e,t,n,i);if(a!==0)return r===`desc`?-a:a}return P(e.name,t.name)}function ms(t,n,r){let i=M(t._nameRU??t.name,n),a=t.name.slice(0,3),o=t.drops.length===0,s=Ys(t.category),c=t.itemId?`<div class="font-mono text-xs text-dim">${e(t.itemId)}</div>`:``,l=t.note?`<p class="text-sm text-mute mt-3 border-t border-line pt-2">${e(t.note)}</p>`:``,u=hs(t.cleaning),d=_s(t,n),f;if(o&&t.staticSpawns)f=`<div class="flex flex-wrap gap-1.5 mt-3">${Object.entries(t.staticSpawns).map(([e,t])=>Xs(e,t,r)).join(``)}</div>`;else if(t.drops.length>0){let n=[...t.drops].sort((e,t)=>mc(t.drop)-mc(e.drop));f=`
      <div class="overflow-x-auto mt-3">
        <table class="w-full min-w-[620px] text-left text-xs">
          <thead class="text-dim">
            <tr class="border-b border-line">
              <th class="px-3 py-2 font-medium">${e(E(`items.col.container`))}</th>
              <th class="px-3 py-2 font-medium">${e(E(`items.col.location`))}</th>
              <th class="px-3 py-2 font-medium">${e(E(`items.col.floor`))}</th>
              <th class="px-3 py-2 font-medium">${e(E(`items.col.qty`))}</th>
              <th class="px-3 py-2 font-medium">${e(E(`items.col.chance`))}</th>
            </tr>
          </thead>
          <tbody>
            ${n.map(e=>ks(e)).join(``)}
          </tbody>
        </table>
      </div>
    `}else f=`<p class="text-xs text-dim mt-3 italic">${e(E(`items.noLocationData`))}</p>`;let p=t.rarity?`<span class="rarity-chip ${gs[t.rarity]??`rarity--common`}">${e(Io(t.rarity))}</span>`:``,m=t.category?`<span class="text-[10px] uppercase tracking-wider text-mute border border-line/60 rounded px-1.5 py-0.5 whitespace-nowrap">${e(Po(t.category))}</span>`:``;return`
    <details class="item-card group rounded border border-line bg-card overflow-hidden open:col-span-full"${Uo(t)?` data-egg="frizyyy"`:``}>
      <summary class="cursor-pointer list-none p-3">
        <div class="flex items-start gap-3">
          ${J({url:i,alt:a,className:`h-10 w-10 shrink-0 object-contain`,fallbackClass:`inline-grid h-10 w-10 shrink-0 place-items-center rounded border border-line text-[11px] text-dim`,fallbackText:a})}
          <div class="min-w-0 flex-1">
            <div lang="ru" class="text-sm font-medium text-ink leading-tight item-card__name">${e(t.name)}</div>
            ${c}
          </div>
        </div>
        <div class="item-card__summary-meta mt-2 flex flex-wrap items-center gap-1.5">
          ${p}
          ${m}
        </div>
      </summary>
      <div class="border-t border-line p-4 group-open:bg-surface/40">
        ${s?`<div class="cat-chip-row mb-3">${s}</div>`:``}
        ${d}
        ${f}
        ${u}
        ${l}
      </div>
    </details>
  `}function hs(t){if(!t||t.rows.length===0)return``;let n=t.rows.map(t=>`
    <tr>
      <td class="item-cleaning__target">${e(t.target)}</td>
      <td class="item-cleaning__num">${t.totalPercent}%</td>
      <td class="item-cleaning__num">${t.perUsePercent}%</td>
      <td class="item-cleaning__num">${t.ticks}</td>
    </tr>`).join(``),r=t.notes?.length?`<ul class="item-cleaning__notes">${t.notes.map(t=>`<li>${e(t)}</li>`).join(``)}</ul>`:``;return`
    <section class="item-cleaning mt-3 border-t border-line pt-2">
      <h5 class="item-cleaning__title">${e(E(`items.cleaning.title`))}</h5>
      <div class="item-cleaning__scroll">
        <table class="item-cleaning__table">
          <thead>
            <tr>
              <th class="item-cleaning__th">${e(E(`items.cleaning.col.target`))}</th>
              <th class="item-cleaning__th item-cleaning__th--num">${e(E(`items.cleaning.col.total`))}</th>
              <th class="item-cleaning__th item-cleaning__th--num">${e(E(`items.cleaning.col.perUse`))}</th>
              <th class="item-cleaning__th item-cleaning__th--num">${e(E(`items.cleaning.col.ticks`))}</th>
            </tr>
          </thead>
          <tbody>${n}</tbody>
        </table>
      </div>
      ${r}
    </section>`}var gs={Обычный:`rarity--common`,Необычный:`rarity--uncommon`,Редкий:`rarity--rare`,"Очень редкий":`rarity--very-rare`,Легендарный:`rarity--legendary`};function _s(t,n){if(!(t.rarity||t.weight||t.effect||t.description||t.requiresTool||t.branch||t.durability||t.charge||t.damageType||t.craft))return``;let r=[];if(t.rarity){let n=gs[t.rarity]??`rarity--common`;r.push(`<span class="rarity-chip ${n}">${e(Io(t.rarity))}</span>`)}if(t.weight&&r.push(`<span class="text-[11px] text-dim">${e(E(`items.meta.weight`))} ${e(t.weight)}</span>`),t.shop){let n=t.shop.vendor===`monoshop`?E(`items.vendor.monoshop`):E(`items.vendor.vending`),i=t.shop.currency??E(`items.shop.currencyUnit`);r.push(`<span class="text-[11px] text-dim border border-line/60 rounded px-1.5 py-0.5">${e(n)} · ${t.shop.price} ${e(i)}</span>`)}t.branch&&t.branch!==`Прочее`&&r.push(`<span class="text-[10px] uppercase tracking-wider text-mute border border-line/60 rounded px-1.5 py-0.5">${e(Fo(t.branch))}</span>`),t.durability&&r.push(`<span class="text-[11px] text-dim">${e(E(`items.meta.durability`))} ${e(t.durability)}</span>`),t.charge&&r.push(`<span class="text-[11px] text-dim">${e(E(`items.meta.charge`))} ${e(t.charge)}</span>`),t.damageType&&r.push(`<span class="text-[11px] text-dim">${e(E(`items.meta.damageType`))} ${e(N(t.damageType))}</span>`),t.requiresTool&&r.push(`<span class="text-[11px] text-dim">${e(E(`items.meta.requiresTool`))} ${e(t.requiresTool)}</span>`);let i=!!t.description,a=r.length?`<div class="flex flex-wrap items-center gap-2${i?` border-b border-line/40 pb-2`:``}">${r.join(``)}</div>`:``,o=t.description?`<p class="text-sm text-mute italic${r.length?` mt-3`:``}">${e(t.description)}</p>`:``,s=t.effect?`<div class="mt-3 rounded bg-surface/60 px-3 py-2 border-l-2 border-accent/60">
         <span class="text-[10px] uppercase tracking-wider text-dim">${e(E(`items.meta.effect`))}</span>
         <div class="text-xs text-ink mt-1 space-y-0.5">${os(t.effect,n,t._nameRU??t.name,t._effectRU)}</div>
       </div>`:``,c=t.craft?Ds(t.craft,n):``;return`<div class="mb-3 pb-3 border-b border-line/60">${a}${o}${s}${ws(t.mechanics)}${c}</div>`}var vs={"poison-acid":`Яд «Кислота»`,"poison-despair":`Яд «Отчаяние»`,"poison-widows-kiss":`Яд «Поцелуй вдовы»`,"poison-gas":`Ловушка с ядовитым газом`,trap:`Капкан`,"hunger-mild":`Голод`,"hunger-strong":`Голод`,"hunger-critical":`Голод`,"hunger-drain":`Голод`,"drowsy-mild":`Сонливость`,"drowsy-strong":`Сонливость`,"drowsy-critical":`Сонливость`,"vigor-drain":`Сонливость`,"energy-drink-buff":`Энергетик «MonomiFizz»`,"stew-buff":`Рагу`,"bloody-hands":`Окровавленные руки`,"caffeine-shock":`Чёрный кофе`,"severe-food-poisoning":`Отравление`},ys=`Мономонеты`;function bs(t,n,r){let i=M(n,r),a=e(t),o=e(t.slice(0,3));return`<span class="item-chip inline-flex items-center gap-1.5 rounded border border-line/60 bg-card px-1.5 py-0.5 text-xs text-ink" data-item-name="${e(n)}"><img src="${i}" alt="${o}" loading="lazy" class="inline-block h-4 w-4 shrink-0 object-contain" data-fallback="remove" />${a}</span>`}function xs(t,n){let r=M(ys,n),i=e(ys.slice(0,3)),a=e(ys);return`<span class="inline-flex items-center gap-1.5 tabular-nums text-ink">
    <span class="item-chip inline-flex items-center rounded border border-line/60 bg-card px-1 py-0.5" data-item-name="${a}" title="${a}"><img src="${r}" alt="${i}" loading="lazy" class="inline-block h-4 w-4 object-contain" data-fallback="remove" /></span>
    <span>${t}</span>
  </span>`}function Ss(t,n,r){if(!t||t.length===0)return``;let i=new Map;for(let e of n){if(!e.shop)continue;let t=i.get(e.shop.vendor)??[];t.push(e),i.set(e.shop.vendor,t)}let a=t=>{let n=[];for(let e of i.get(t.id)??[])n.push({name:e.name,nameRU:e._nameRU??e.name,price:e.shop.price,kind:`buy`});for(let e of t.exchanges??[])n.push({name:N(e.item),nameRU:e.item,price:e.price,kind:e.kind??`buy`,...e.note?{note:e.note}:{}});n.sort((e,t)=>e.kind===t.kind?e.price-t.price||P(e.name,t.name):e.kind===`sell`?1:-1);let a=n.map(t=>{let n=t.note?`<div class="text-[11px] text-dim mt-0.5">${e(t.note)}</div>`:``;return t.kind===`sell`?`<tr class="border-b border-line/40 last:border-b-0">
          <td class="px-2 py-1.5 whitespace-nowrap">${xs(t.price,r)}</td>
          <td class="px-2 py-1.5 text-right">${bs(t.name,t.nameRU,r)}${n}</td>
        </tr>`:`<tr class="border-b border-line/40 last:border-b-0">
        <td class="px-2 py-1.5">${bs(t.name,t.nameRU,r)}${n}</td>
        <td class="px-2 py-1.5 text-right whitespace-nowrap">${xs(t.price,r)}</td>
      </tr>`}).join(``);return`<section class="items-registry__col">
      <h4 class="items-registry__col-title">${e(t.name)}</h4>
      <table class="w-full text-sm"><tbody>${a}</tbody></table>
    </section>`},o=t.reduce((e,t)=>e+(t.exchanges?.length??0),0),s=n.filter(e=>!!e.shop).length+o,c=`${t.length} ${E(`items.shops.vendorsCount`)} · ${s} ${E(`items.shops.positionsCount`)}`;return`
    <details id="shops" class="items-registry hazard-card hazard-card--shops mt-8 scroll-mt-24">
      ${Y({variant:`shops`,icon:ea,title:E(`items.shops.title`),subtitle:c,count:String(s)})}
      <div class="items-registry__columns">${t.map(a).join(``)}</div>
    </details>
  `}function Cs(t,n){if(!t||t.length===0)return``;let r=t.filter(e=>e.polarity===`negative`),i=t.filter(e=>e.polarity===`positive`),a=t=>{let r=vs[t.id]??t.name,i=t.polarity===`positive`?`Бафф`:`Дебафф`,a=`<img src="${M(r,n)}" alt="" loading="lazy" class="status-effect__icon" data-fallback-src="${M(i,n)}" />`,o=t.durationSec==null?``:`<span class="status-effect__duration">${t.durationSec} ${e(E(`items.effects.durationSec`))}</span>`,s=t.description?`<p class="status-effect__desc">${e(t.description)}</p>`:``;return`<article class="status-effect status-effect--${t.polarity}" id="effect-${e(t.id)}">
      <header class="status-effect__head">
        ${a}
        <span class="status-effect__name">${e(N(t.name))}</span>
        ${o}
      </header>
      ${s}
    </article>`},o=`${r.length} ${E(`items.effects.negCount`)} · ${i.length} ${E(`items.effects.posCount`)}`;return`
    <details class="items-registry hazard-card hazard-card--effects mt-8">
      ${Y({variant:`effects`,icon:Wi,title:E(`items.effects.title`),subtitle:o,count:String(t.length)})}
      <div class="items-registry__columns">
        <div class="items-registry__col">
          <h4 class="items-registry__col-title items-registry__col-title--neg">${e(E(`items.effects.negative`))}</h4>
          <div class="items-registry__grid">${r.map(a).join(``)}</div>
        </div>
        <div class="items-registry__col">
          <h4 class="items-registry__col-title items-registry__col-title--pos">${e(E(`items.effects.positive`))}</h4>
          <div class="items-registry__grid">${i.map(a).join(``)}</div>
        </div>
      </div>
    </details>
  `}function ws(t){if(!t)return``;let n=[];return t.hunger&&n.push(Es(E(`items.mech.hunger`),t.hunger,`food`)),t.hp&&n.push(Es(E(`items.mech.hp`),t.hp,t.hp.startsWith(`-`)?`damage`:`heal`)),t.vigor&&n.push(Es(E(`items.mech.vigor`),t.vigor,`shock`)),t.buff&&n.push(Es(E(`items.mech.buff`),t.buff,`buff`)),t.cures&&t.cures.length&&n.push(Es(E(`items.mech.cures`),t.cures.map(N).join(`, `),`cleanse`)),t.extra&&n.push(Es(E(`items.mech.extra`),t.extra,`neutral`)),n.length===0?``:`<div class="mt-3 rounded bg-surface/60 px-3 py-2 border-l-2 border-cyan-400/60">
    <span class="text-[10px] uppercase tracking-wider text-dim">${e(E(`items.meta.mechanics`))}</span>
    <div class="mt-1 grid gap-1.5 grid-cols-1 sm:grid-cols-2">${n.join(``)}</div>
  </div>`}var Ts={food:`text-emerald-300`,heal:`text-teal-300`,damage:`text-rose-300`,shock:`text-amber-300`,buff:`text-cyan-300`,cleanse:`text-cyan-200`,neutral:`text-mute`};function Es(t,n,r){let i=Ts[r]??`text-ink`;return`<div class="text-xs flex items-baseline gap-2">
    <span class="text-[10px] uppercase tracking-wider text-dim shrink-0">${e(t)}</span>
    <span class="${i} min-w-0">${e(n)}</span>
  </div>`}function Ds(t,n){let r=t.ingredients.map(t=>{let r=M(t.name,n),i=e(t.name.slice(0,3)),a=e(N(t.name));return`<span class="recipe-chip inline-flex items-center gap-1.5 rounded border border-line bg-card px-2 py-1 text-xs text-mute" data-item-name="${e(t.name)}"><img src="${r}" alt="${i}" loading="lazy" class="inline-block h-4 w-4 object-contain" data-fallback="remove" /><span class="text-ink">${a}</span><span class="text-dim">×${e(String(t.qty))}</span></span>`}).join(``),i=t.successChance?` · ${e(E(`items.craft.chance`))} ${e(t.successChance)}`:``,a=``;if(t.tool){let r=M(t.tool,n),i=e(t.tool.slice(0,3));a=` · <span class="item-chip inline-flex items-baseline gap-1 rounded border border-line/60 bg-card px-1.5 py-0.5 align-baseline normal-case text-[11px] text-ink" data-item-name="${e(t.tool)}"><img src="${r}" alt="${i}" loading="lazy" class="inline-block h-3.5 w-3.5 self-center object-contain" data-fallback="remove" />${e(N(t.tool))}</span>`}return`
    <div class="mt-3 rounded border border-line bg-surface px-3 py-2">
      <div class="text-[10px] uppercase tracking-wider text-dim flex flex-wrap items-center gap-x-1 gap-y-1">${e(E(`items.craft.label`))} · ${e(t.stations.map(N).join(` · `))}${i}${a}</div>
      <div class="mt-2 flex flex-wrap gap-1.5">${r}</div>
    </div>
  `}function Os(t){return t.chanceRaw===`Гарантированно`?`<span class="inline-flex items-center rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-300">${e(E(`items.chip.static`))}</span>`:`<span class="${hc(t.chancePercent??null)}">${e(pc(t))}</span>`}function ks(t){let n=t.source,r=t.drop,i=e(n.containerName??n.sourceTitle),a=e(t.locationLabel||n.sourceTitle),o=e(uc(n.floor)),s=Os(r);return`
    <tr class="border-b border-line/70 last:border-b-0">
      <td class="px-3 py-2 text-ink">${i}</td>
      <td class="px-3 py-2 text-mute">${a}</td>
      <td class="px-3 py-2 text-dim">${o}</td>
      <td class="px-3 py-2 text-mute">${e(fc(r))}</td>
      <td class="px-3 py-2 font-medium">${s}</td>
    </tr>
  `}function As(t,n,r,i,a,o){let s=new Map;new Set(t.map(e=>e.name));for(let e of t)for(let{source:t,drop:r}of e.drops){if(o.has(t.floor??`__unknown`)||n&&!cc(t,n)&&!lc(r,n))continue;let e=s.get(t.sourceId);e?e.drops.push(r):s.set(t.sourceId,{source:t,drops:[r]})}let c=Ms([...s.values()]),l=new Set(c.map(e=>e.location.toLowerCase()));for(let e of t)for(let{source:t}of e.drops)l.add((t.location??t.sourceTitle).toLowerCase());let u=n.trim().toLowerCase();for(let e of Object.keys(a)){if(l.has(e.toLowerCase())||u&&!e.toLowerCase().includes(u))continue;let t=i[e]?.floor??null,n=t?t===`—`?null:t.replace(/эт\.$/u,`этаж`).trim()||null:null;o.has(n??`__unknown`)||c.push({location:e,floor:n,containers:[]})}if(c.sort((e,t)=>{let n=Z(e.floor)-Z(t.floor);return n===0?P(e.location,t.location):n}),c.length===0){let n=t.some(e=>e.drops.length===0)?`<p class="text-xs text-dim mt-2">${e(E(`items.loc.staticInItemsMode`))}</p>`:``;return gc()+n}let d=t.filter(e=>e.drops.length===0).length,f=d>0?`<p class="text-xs text-dim italic mb-4">${e(E(`items.loc.staticBannerPrefix`))} ${d} ${jn(d,{one:E(`items.loc.staticBannerSuffixOne`),few:E(`items.loc.staticBannerSuffixFew`),many:E(`items.loc.staticBannerSuffixMany`)})} ${e(E(`items.loc.staticBannerTail`))}</p>`:``,p=new Map;for(let e of c){let t=e.floor??`__unknown`,n=p.get(t)??[];n.push(e),p.set(t,n)}return f+[...p.keys()].sort((e,t)=>Z(e===`__unknown`?null:e)-Z(t===`__unknown`?null:t)).map(t=>{let n=t===`__unknown`?E(`items.loc.floorUnknownTitle`):N(t),o=p.get(t).map(e=>js(e,r,i,a)).join(``);return`
        <section class="mb-6">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-dim mb-2">${e(n)}</h3>
          <div class="locations-grid grid gap-3" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">
            ${o}
          </div>
        </section>
      `}).join(``)}function js(t,r,i,a){let o=t.containers.length,s=t.containers.reduce((e,t)=>e+t.drops.length,0),c=a[t.location],l=c?.panoramas[0],u=l?`<img src="${n(`assets/${e(l)}`)}" alt="${e(t.location)}" loading="lazy" class="h-full w-full object-cover" data-fallback="remove" data-fallback-parent-class="location-card__thumb--missing" />`:`<div class="grid h-full w-full place-items-center text-[11px] text-dim">${e(E(`items.loc.noPhoto`))}</div>`,d=``;if(c&&c.panoramas.length>1){let r=`pano:${t.location}${t.floor?`:${t.floor}`:``}`;d=`
      <div class="flex gap-2 overflow-x-auto pb-2 mb-2 snap-x">
        ${c.panoramas.map(i=>`<img src="${n(`assets/${e(i)}`)}" alt="${e(t.location)}" loading="lazy" data-lightbox data-lightbox-group="${e(r)}" class="h-24 w-auto rounded border border-line snap-center object-cover" />`).join(``)}
      </div>
    `}else if(c&&c.panoramas.length===1){let r=`pano:${t.location}${t.floor?`:${t.floor}`:``}`;d=`
      <div class="mb-2">
        <img src="${n(`assets/${e(c.panoramas[0])}`)}" alt="${e(t.location)}" loading="lazy" data-lightbox data-lightbox-group="${e(r)}" class="h-32 w-auto rounded border border-line object-cover" />
      </div>
    `}return`
    <details class="location-card group rounded border border-line bg-surface overflow-hidden open:col-span-full">
      <summary class="loc-header cursor-pointer list-none">
        <div class="location-card__thumb aspect-video bg-page overflow-hidden">${u}</div>
        <div class="location-card__meta px-3 py-2 border-t border-line">
          <div class="text-sm font-medium text-ink leading-tight break-words">${e(N(t.location))}</div>
          <div class="mt-1.5 flex items-center justify-between gap-2">
            ${tc(t.location,t.floor,i)}
            <span class="text-[11px] text-dim shrink-0">${o===0&&s===0?E(`items.loc.photoOnly`):`${o} · ${s} ${E(`items.loc.itemsShort`)}`}</span>
          </div>
        </div>
      </summary>
      <div class="p-3 border-t border-line">
        ${d}
        <div class="space-y-3">
          ${t.containers.map(e=>Ns(e,r,c)).join(``)}
        </div>
      </div>
    </details>
  `}function Z(e){if(!e)return 99;let t=e.toLowerCase();if(t.includes(`цокольн`))return 0;if(t.includes(`между 3 и 4`))return 3.5;let n=t.match(/(\d+)/);return n?Number(n[1]):99}function Ms(e){let t=new Map;for(let n of e){let e=n.source.location??n.source.sourceTitle,r=n.source.floor??null,i=`${r??``}\0${e}`,a=t.get(i)??{location:e,floor:r,containers:[]};a.containers.push(n),t.set(i,a)}return[...t.values()].sort((e,t)=>{let n=Z(e.floor)-Z(t.floor);return n===0?P(e.location,t.location):n})}function Ns(t,r,i){let a=t.source,o=a.containerName??a.sourceTitle,s=[...t.drops].sort((e,t)=>mc(t)-mc(e)),c=Qs(),l=a.containerNameRU??o;if(i&&i.containers){let t=i.containers.find(e=>l.toLowerCase().includes(e.name.toLowerCase())||e.name.toLowerCase().includes(l.toLowerCase()));t&&t.images.length>0&&(c=`<img src="${n(`assets/${t.images[0]}`)}" alt="${e(o)}" loading="lazy" data-lightbox class="h-[34px] w-12 rounded object-cover border border-line" />`)}return`
    <article class="rounded border border-line bg-card">
      <div class="ctr-header flex gap-3 border-b border-line p-3">
        ${c}
        <div class="min-w-0 flex-1">
          <div class="text-xs font-medium text-ink">${e(o)}</div>
          <div class="mt-1 text-xs text-dim">${e(a.sourceTitle)}</div>
        </div>
        <div class="shrink-0 text-xs text-dim">${s.length} ${e(E(`items.loc.itemsShort`))}</div>
      </div>
      ${Ps(s,r)}
    </article>
  `}function Ps(t,n){return`
    <div class="overflow-x-auto">
      <table class="w-full min-w-[560px] text-left text-xs">
        <thead class="text-dim">
          <tr class="border-b border-line">
            <th class="w-10 px-3 py-2 font-medium"></th>
            <th class="px-3 py-2 font-medium">${e(E(`items.col.item`))}</th>
            <th class="px-3 py-2 font-medium">${e(E(`items.col.qty`))}</th>
            <th class="px-3 py-2 font-medium">${e(E(`items.col.chance`))}</th>
            <th class="px-3 py-2 font-medium">${e(E(`items.col.stack`))}</th>
          </tr>
        </thead>
        <tbody>
          ${t.map(e=>Fs(e,n)).join(``)}
        </tbody>
      </table>
    </div>
  `}function Fs(t,n){let r=`<td class="px-3 py-2 font-medium">${Os(t)}</td>`;return`
    <tr class="border-b border-line/70 last:border-b-0">
      <td class="px-3 py-2">${Zs(t.itemName,n)}</td>
      <td class="px-3 py-2">
        <div class="font-medium text-ink">${e(N(t.itemName))}</div>
        <div class="font-mono text-[10px] text-dim">${e(t.itemId)}</div>
      </td>
      <td class="px-3 py-2 text-mute">${e(fc(t))}</td>
      ${r}
      <td class="px-3 py-2 text-mute">${e(dc(t.stackRaw))}</td>
    </tr>
  `}var Is=[`Ресурс`,`Расходник`,`Инструмент`,`Оружие`,`Оружие/Инструмент`,`Снаряжение`,`Стартовый предмет`,`Прочее`],Ls=[`Универсальные`,`Еда`,`Медицина`,`Инженерия`,`Прочее`];function Rs(e){let t=new Set;for(let n of e)n.category&&t.add(n.category);return Is.filter(e=>t.has(e)).concat([...t].filter(e=>!Is.includes(e)))}function zs(e){let t=new Set;for(let n of e)n.branch&&t.add(n.branch);return Ls.filter(e=>t.has(e)).concat([...t].filter(e=>!Ls.includes(e)))}var Bs=[`Обычный`,`Необычный`,`Редкий`,`Очень редкий`,`Легендарный`];function Vs(e){let t=new Set;for(let n of e)n.rarity&&t.add(n.rarity);return Bs.filter(e=>t.has(e)).concat([...t].filter(e=>!Bs.includes(e)))}function Hs(e){let t=new Set;for(let n of e)for(let{source:e}of n.drops)t.add(e.floor??`__unknown`);return[...t].sort((e,t)=>e===`__unknown`?1:t===`__unknown`?-1:Z(e)-Z(t))}function Us(t,n,r){let i=t===`all`?`all`:Js(t),a=r?`is-active`:``;return`<button data-cat="${e(t)}" class="cat-pill cat-pill--${i} ${a}">${e(n)}</button>`}function Ws(t,n,r){let i=r?`is-active`:``;return`<button data-branch="${e(t)}" class="cat-pill cat-pill--misc ${i}">${e(n)}</button>`}function Gs(t,n,r){let i=t===`all`?`cat-pill cat-pill--all`:`rarity-chip rarity-pill ${gs[t]??`rarity--common`}`,a=r?`is-active`:``;return`<button data-rarity="${e(t)}" class="${i} ${a}">${e(n)}</button>`}function Ks(t,n,r){let i=r?`opacity-40 line-through`:`is-active`;return`<button type="button" data-floor="${e(t)}" aria-pressed="${r?`false`:`true`}" class="cat-pill cat-pill--all ${i}">${e(n)}</button>`}var qs={Ресурс:`res`,Расходник:`food`,Инструмент:`tool`,Оружие:`tool`,"Оружие/Инструмент":`tool`,Снаряжение:`tool`,"Стартовый предмет":`special`,Прочее:`misc`};function Js(e){return qs[e]??`misc`}function Ys(t){return t?`<span class="cat-chip cat-chip--${Js(t)}">${e(Po(t))}</span>`:``}function Xs(t,n,r){let i=un(t,r),a=n===`1`||n===`1.0`?``:`<span class="opacity-80">×${e(n.replace(`.0`,``))}</span>`;return`<span class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border border-line bg-card text-ink" style="${i?`background:#${i.bg};color:#${i.fg};border-color:#${i.fg}33`:``}">${e(N(t))}${a}</span>`}function Zs(e,t){let n=e.slice(0,3);return`
    ${J({url:M(e,t),alt:n,className:`h-[22px] w-[22px] object-contain`,fallbackClass:`inline-grid h-[22px] w-[22px] place-items-center rounded border border-line text-[9px] text-dim`,fallbackText:n})}
  `}function Qs(){return`<div class="grid h-[34px] w-12 shrink-0 place-items-center rounded border border-line bg-surface text-[10px] text-dim">${e(E(`items.loc.noPhoto`))}</div>`}var $s={basement:{fg:`455A64`,bg:`ECEFF1`},1:{fg:`2E7D32`,bg:`E8F5E9`},2:{fg:`1565C0`,bg:`E3F2FD`},3:{fg:`6A1B9A`,bg:`F3E5F5`},"3.5":{fg:`B45309`,bg:`FEF3C7`},4:{fg:`AD1457`,bg:`FCE4EC`},5:{fg:`00838F`,bg:`E0F7FA`}};function ec(e){if(!e)return null;let t=e.toLowerCase();return t.includes(`цокольн`)?`basement`:t.includes(`между 3 и 4`)?`3.5`:t.match(/(\d+)/)?.[1]??null}function tc(t,n,r){let i=n?N(n):E(`items.loc.floorUnknownBadge`),a=ec(n),o=a?$s[a]:void 0;return`<span class="inline-flex items-center justify-center whitespace-nowrap shrink-0 rounded border border-line bg-card px-2 py-0.5 text-xs text-dim" style="${o?`background:#${o.bg};color:#${o.fg};border-color:#${o.fg}33`:``}">${e(i)}</span>`}var nc=/["'«»“”‘’`]/g;function rc(e){return I(e.toLowerCase()).replace(nc,` `)}function ic(e){let t=[];return{loose:rc(e.replace(/"([^"]*)"/g,(e,n)=>{for(let e of rc(n).split(/\s+/).filter(Boolean))t.push(e);return` `})).split(/\s+/).filter(Boolean),exact:t}}function ac(e){return e.loose.length===0&&e.exact.length===0}function oc(e,t){if(ac(t))return!0;let n=rc(e);for(let e of t.loose)if(!n.includes(e))return!1;if(t.exact.length>0){let e=new Set(n.split(/\s+/).filter(Boolean));for(let n of t.exact)if(!e.has(n))return!1}return!0}function sc(e,t){if(!t)return!0;let n=ic(t);return ac(n)?!0:oc([e.name,e._nameRU??``,...$t.get(e._nameRU??e.name)??[],e.itemId??``,e.note??``,e.category,Po(e.category),e.branch,Fo(e.branch),e.rarity??``,e.rarity?Io(e.rarity):``,...e.drops.flatMap(e=>[e.source.sourceTitle,e.source.containerName??``,e.source.location??``,N(e.source.location??``),e.source.floor??``]),...Object.keys(e.staticSpawns??{}).flatMap(e=>[e,N(e)])].join(` `),n)}function cc(e,t){if(!t)return!0;let n=ic(t);return ac(n)?!0:oc([e.sourceTitle,e.containerName??``,e.location??``,N(e.location??``),e.floor??``].join(` `),n)}function lc(e,t){if(!t)return!0;let n=ic(t);return ac(n)?!0:oc([e.itemName,e.itemId].join(` `),n)}function uc(e){return e?N(e):`—`}function dc(e){return e===`Нестак.`?E(`items.stack.no`):e}function fc(e){let t=e.quantityMin??null,n=e.quantityMax??null;return t===null||n===null?e.quantityRaw:t===n?String(t):`${t}-${n}`}function pc(e){return e.chancePercent!==null&&e.chancePercent!==void 0?`${e.chancePercent}%`:e.chanceRaw}function mc(e){return e.chancePercent??-1}function hc(e){return e===null?`text-dim`:e>=20?`text-green`:e>=5?`text-yellow`:`text-red`}function gc(){return`<p class="text-dim italic text-center py-8">${e(E(`items.noResults`))}</p>`}function _c(t){let{image:r,caption:i,zoomLabel:a,buttonClass:o,toggleLabel:s}=t;if(!r)return``;let c=n(r);return`
    <details class="shot-toggle">
      <summary class="shot-toggle__summary">${e(s)}</summary>
      <button
        type="button"
        class="${e(o)}"
        data-gif-expand
        data-gif-src="${c}"
        data-gif-alt="${e(i)}"
        data-gif-code="${e(i)}"
        aria-label="${e(a)}">
        <img src="${c}" alt="${e(i)}" loading="lazy" decoding="async" data-fallback="remove" />
      </button>
    </details>`}function vc(e){e.dataset.itemNavWired!==`1`&&(e.dataset.itemNavWired=`1`,e.addEventListener(`click`,e=>{let t=e.target;if(!(t instanceof HTMLElement))return;let n=t.closest(`button[data-item-name], button[data-jump-to-items-search]`);if(!n)return;let r=n.dataset.itemName??n.dataset.jumpToItemsSearch;r&&yc(r,n.dataset.jumpMode===`locations`?`locations`:`items`,n.dataset.jumpSearchEn)}))}function yc(e,t=`items`,n){let r=document.querySelector(`#items-search`);r&&(r.value=s(T())?n??N(e):e,r.dispatchEvent(new Event(`input`,{bubbles:!0})));let i=document.querySelector(`#items-cats button[data-cat="all"]`);i&&!i.classList.contains(`bg-accent`)&&i.click();let a=t===`locations`?`#items-btn-loc`:`#items-btn-items`,o=document.querySelector(a);o&&!o.classList.contains(`bg-accent`)&&o.click();let c=document.getElementById(`items`);c&&c.scrollIntoView({behavior:An(),block:`start`}),history.replaceState(null,``,location.pathname+location.search+`#items`)}var Q=`weapons`,bc=[{id:`default`},{id:`alpha`},{id:`damage`},{id:`effects`}],xc={default:`weapons.sort.default`,alpha:`weapons.sort.alpha`,damage:`weapons.sort.damage`,effects:`weapons.sort.effects`};function Sc(e){return E(xc[e])}var Cc=[`blunt`,`stab-cut`,`slash`,`stab`,`hybrid`,`other`],wc={Нож:`Кухонный нож`,Бита:`Бейсбольная бита`};function Tc(e){return wc[e]??e}var Ec={dispose(){}};async function Dc(){let e=document.querySelector(`#${Q}`);if(!e)return Ec;e.dataset.view=Q,e.dataset.sectionTitle=D(Q).label;let t=!1,n=null,r=null,i=null,a=()=>{t||(t=!0,n&&e.removeEventListener(`click`,n),r?.dispose(),i&&window.removeEventListener(`hashchange`,i))},o,s,c;try{[o,s,c]=await Promise.all([ar(),B(),z()])}catch(n){return t?Ec:(e.innerHTML=W(Q,n),{dispose:a})}if(t)return Ec;let l=o.weapons;if(!l?.length)return e.innerHTML=W(Q,Error(`data/weapons.json: empty weapons list`)),{dispose:a};let u=Oc()??l[0].id,d=l.find(e=>e.id===u)??l[0],f=`default`;return e.innerHTML=Ic(o,d,s,f)+Gc(c,s)+el(c.forensics,s),n=t=>{let n=t.target;if(!(n instanceof HTMLElement))return;let r=n.closest(`button[data-weapon-id]`);if(r){let t=r.dataset.weaponId??``,n=l.find(e=>e.id===t);n&&Pc(e,o,n,s);return}let i=n.closest(`button[data-weapon-cell]`);i&&Fc(e,i)},e.addEventListener(`click`,n),r=No({trigger:()=>e.querySelector(`#weapons-sort-trigger`),panel:()=>e.querySelector(`#weapons-sort-panel`),optionValue:e=>e.dataset.weaponSort,onSelect:t=>{let n=t??`default`;n!==f&&(f=n,Nc(e,o,s,f))}}),i=()=>{let t=Oc();if(!t)return;let n=l.find(e=>e.id===t);n&&n.id!==kc(e)&&Pc(e,o,n,s)},window.addEventListener(`hashchange`,i),ba(),e.dataset.lightboxWired||(xa(e),e.dataset.lightboxWired=`true`),vc(e),{dispose:a}}function Oc(){let e=window.location.hash;if(!e.startsWith(`#${Q}`))return null;let t=e.split(`?`)[1];return t?new URLSearchParams(t).get(`w`):null}function kc(e){return e.querySelector(`button[data-weapon-id][aria-pressed="true"]`)?.dataset.weaponId??null}function Ac(e){let t=0;for(let n of Object.keys(e.cells)){let r=e.cells[n];if(!(!r||r.disabled)&&(typeof r.damageMax==`number`&&(t=Math.max(t,r.damageMax)),typeof r.damageMin==`number`&&(t=Math.max(t,r.damageMin)),typeof r.critDamage==`string`)){let e=Number.parseFloat(r.critDamage);Number.isFinite(e)&&(t=Math.max(t,e))}}return t}function jc(e,t){let n=[...e];switch(t){case`damage`:n.sort((e,t)=>Ac(t)-Ac(e));break;case`effects`:n.sort((e,t)=>{let n=+!!e.bleed,r=+!!t.bleed;return n===r?P(e.name,t.name):r-n});break;default:n.sort((e,t)=>P(e.name,t.name));break}return n}function Mc(e,t){let n=new Map;for(let t of e){let e=Cc.includes(t.damageTypeColor)?t.damageTypeColor:`other`,r=n.get(e)??[];r.push(t),n.set(e,r)}let r=[];for(let e of Cc){let i=n.get(e);!i||i.length===0||r.push({id:e,label:i[0].damageType,weapons:jc(i,t)})}return r}function Nc(e,t,n,r){let i=e.querySelector(`.weapons-rail`);i&&(i.innerHTML=Lc(t,kc(e)??t.weapons[0].id,n,r))}function Pc(e,t,n,r){let i=e.querySelector(`.weapons-rail`);i&&i.querySelectorAll(`button[data-weapon-id]`).forEach(e=>{let t=e.dataset.weaponId===n.id;e.setAttribute(`aria-pressed`,String(t)),e.classList.toggle(`weapons-rail__card--active`,t)});let a=e.querySelector(`.weapons-dossier`);if(a&&(a.innerHTML=zc(t,n,r)),window.location.hash.startsWith(`#${Q}`)){let e=`${location.pathname}${location.search}#${Q}?w=${encodeURIComponent(n.id)}`;history.replaceState(history.state,``,e)}}function Fc(e,t){let n=t.getAttribute(`aria-expanded`)===`true`;e.querySelectorAll(`button[data-weapon-cell]`).forEach(e=>e.setAttribute(`aria-expanded`,`false`));let r=e.querySelector(`.weapons-forensic`);if(r){if(n){r.hidden=!0,r.innerHTML=``;return}t.setAttribute(`aria-expanded`,`true`),r.hidden=!1,r.innerHTML=Wc(t),r.scrollIntoView({behavior:`smooth`,block:`nearest`})}}function Ic(t,n,r,i){let a=D(Q);return`
    ${G({num:a.num,title:a.label,summary:a.summary})}
    <div class="weapons-layout">
      <aside class="weapons-rail" aria-label="${e(E(`weapons.rail.aria`))}">
        ${Lc(t,n.id,r,i)}
      </aside>
      <div class="weapons-dossier">
        ${zc(t,n,r)}
      </div>
    </div>
  `}function Lc(t,n,r,i){let a=i===`default`?Mc(t.weapons,i):[{id:`all`,label:``,weapons:jc(t.weapons,i)}],o=bc.map(t=>{let n=t.id===i;return`<li role="option"
              data-weapon-sort="${t.id}"
              class="select-menu__option"
              aria-selected="${n}">${e(Sc(t.id))}</li>`}).join(``);return`
    <div class="weapons-sort">
      <span id="weapons-sort-label" class="weapons-sort__label">${e(E(`weapons.sort.label`))}</span>
      <div class="select-menu weapons-sort__menu">
        <button id="weapons-sort-trigger"
                type="button"
                class="select-menu__trigger weapons-sort__trigger"
                aria-haspopup="listbox"
                aria-expanded="false"
                aria-labelledby="weapons-sort-label">
          <span class="select-menu__value">${e(Sc(i))}</span>
          <svg class="select-menu__caret" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </button>
        <ul id="weapons-sort-panel"
            class="select-menu__panel"
            role="listbox"
            aria-labelledby="weapons-sort-label"
            hidden>${o}</ul>
      </div>
    </div>
    <div class="weapons-rail__rows">
      ${a.map(t=>`
        <ul class="weapons-rail__list weapons-rail__list--${t.id}" role="list"${t.label?` aria-label="${e(t.label)}"`:``}>
          ${t.weapons.map(e=>Rc(e,e.id===n,r)).join(``)}
        </ul>
      `).join(``)}
    </div>
  `}function Rc(t,n,r){let i=M(Tc(t.name),r),a=t.bleed?`<span class="weapons-flag weapons-flag--bleed" title="${e(E(`weapons.flag.bleed.title`))}">🩸</span>`:``;return`
    <li>
      <button type="button"
              class="weapons-rail__card${n?` weapons-rail__card--active`:``}"
              data-weapon-id="${e(t.id)}"
              aria-pressed="${n}">
        <img class="weapons-rail__icon" src="${e(i)}" alt="" width="40" height="40" loading="lazy" />
        <span class="weapons-rail__name">${e(N(Tc(t.name)))}</span>
        <div class="weapons-rail__meta">
          <span class="weapons-rail__type weapons-type-chip weapons-type-chip--${e(t.damageTypeColor)}">${e(N(t.damageType))}</span>
          ${a}
        </div>
      </button>
    </li>
  `}function zc(t,n,r){let i=Tc(n.name),a=M(i,r),o=[];return n.bleed&&o.push(Bc(E(`weapons.effect.label`),E(`weapons.effect.bleedDetail`))),`
    <header class="weapons-dossier__header">
      <img class="weapons-dossier__icon" src="${e(a)}" alt="" width="64" height="64" loading="lazy" />
      <div class="weapons-dossier__head">
        <button type="button" class="weapons-dossier__name"
                data-item-name="${e(i)}"
                title="${e(E(`weapons.dossier.openInItems`))}">
          ${e(N(Tc(n.name)))}
        </button>
        <div class="weapons-dossier__meta">
          <span class="weapons-type-chip weapons-type-chip--${e(n.damageTypeColor)}">${e(N(n.damageType))}</span>
          ${n.bleed?`<span class="weapons-chip weapons-chip--bleed">🩸 ${e(E(`weapons.effect.bleed`))}</span>`:``}
        </div>
      </div>
      ${o.length?`<dl class="weapons-dossier__stats">${o.join(``)}</dl>`:``}
    </header>

    <div class="weapons-matrix-wrap">
      ${Vc(t,n)}
      <div class="weapons-forensic" hidden></div>
    </div>

    ${n.stealthKill?Uc(n.stealthKill):``}
  `}function Bc(t,n){return`<div class="weapons-dossier__stat"><dt>${e(t)}</dt><dd>${e(n)}</dd></div>`}function Vc(t,n){let r=t.attackModes,i=t.bodyZones,a=`
    <thead>
      <tr>
        <th scope="col" class="weapons-matrix__corner"><span class="sr-only">${e(E(`weapons.matrix.attackType`))}</span></th>
        ${i.map(t=>`<th scope="col">${e(t.label)}</th>`).join(``)}
      </tr>
    </thead>
  `,o=r.map(t=>`
    <tr>
      <th scope="row">${e(t.label)}</th>
      ${i.map(e=>{let r=`${t.id}.${e.id}`;return Hc(n,t.id,e.id,n.cells[r],e.label)}).join(``)}
    </tr>
  `).join(``);return`
    <table class="weapons-matrix" role="grid" aria-label="${e(E(`weapons.matrix.aria`))}: ${e(N(Tc(n.name)))}">
      ${a}
      <tbody>${o}</tbody>
    </table>
  `}function Hc(t,n,r,i,a=``){let o=a?` data-zone="${e(a)}"`:``;if(!i||i.disabled)return`
      <td class="weapons-cell weapons-cell--disabled" aria-disabled="true"${o}>
        <span class="weapons-cell__none">${e(E(`weapons.cell.none`))}</span>
        <span class="sr-only">${e(E(`weapons.cell.notProvided`))}</span>
      </td>
    `;let s=i.damageLabel??(i.damageMin==null?`—`:String(i.damageMin)),c=[];i.bleed&&c.push(`<span class="weapons-cell__chip weapons-cell__chip--bleed" title="${e(E(`weapons.cell.bleed.title`))}">🩸</span>`),i.ohko&&c.push(`<span class="weapons-cell__chip weapons-cell__chip--ohko" title="${e(E(`weapons.cell.ohko.title`))}">${e(E(`weapons.cell.ohko.chip`))}</span>`),i.critDamage&&c.push(`<span class="weapons-cell__chip weapons-cell__chip--crit" title="${e((i.critProbability??``)+` `+E(`weapons.cell.crit.titleSuffix`)+` `+i.critDamage)}">${e(E(`weapons.cell.crit.prefix`))} ${e(String(i.critDamage))}</span>`);let l=Array.isArray(i.forensic)&&i.forensic.length>0;return`
    <td class="${[`weapons-cell`,i.ohko?`weapons-cell--ohko`:``,i.bleed?`weapons-cell--bleed`:``].filter(Boolean).join(` `)}"${o}>
      <button type="button"
              class="weapons-cell__btn"
              data-weapon-cell
              data-forensic="${l?e(JSON.stringify({variants:i.forensic,weapon:t.name,mode:n,zone:r,labels:i.forensicLabels??[],crit:i.critDamage?{damage:i.critDamage,probability:i.critProbability??``}:void 0})):``}"
              aria-expanded="false"
              ${l?``:`aria-disabled="true" disabled`}>
        <span class="weapons-cell__damage tabular-nums">${e(s)}</span>
        ${c.length?`<span class="weapons-cell__chips">${c.join(``)}</span>`:``}
        ${l?`<span class="weapons-cell__more" aria-hidden="true"><span class="weapons-cell__more-text">${e(E(`weapons.cell.openFile`))}</span><span class="weapons-cell__more-arrow">▸</span></span>`:``}
      </button>
    </td>
  `}function Uc(t){return`
    <aside class="weapons-stealth" aria-label="${e(E(`weapons.stealth.aria`))}">
      <header class="weapons-stealth__head">
        <span class="weapons-stealth__icon" aria-hidden="true">🗡</span>
        <h3 class="weapons-stealth__title">${e(E(`weapons.stealth.title`))}</h3>
      </header>
      <p class="weapons-stealth__quote">${e(t)}</p>
    </aside>
  `}function Wc(t){let n=t.getAttribute(`data-forensic`)??``;if(!n)return``;let r;try{r=JSON.parse(n)}catch{return``}let i=r.variants??[];if(!i.length)return``;let a=r.labels??[];return`
    <div class="weapons-forensic__inner">
      ${i.map((t,n)=>{let r=a[n]??``,i=r?`<header class="weapons-forensic__zone">${e(r)}</header>`:``,o=n===0?`<span class="weapons-forensic__tag">${e(E(`weapons.forensic.tag`))}</span>`:`<span class="weapons-forensic__tag weapons-forensic__tag--alt">${e(E(`weapons.forensic.tag`))}</span>`;return`
    <article class="weapons-forensic__card${n===0?``:` weapons-forensic__card--alt`}">
      ${i}
      ${o}
      <p class="weapons-forensic__text">${e(t)}</p>
    </article>
  `}).join(``)}
      ${r.crit?`<p class="weapons-forensic__crit">${e(E(`weapons.forensic.critRare`))} ${e(r.crit.damage)}</p>`:``}
    </div>
  `}function Gc(t,n){let r=t.traps??[],i=t.throwingWeapons??[],a=t.poisons??[],o=t.temperatureHazards;return r.length===0&&i.length===0&&a.length===0&&!o?.overheating&&!o?.hypothermia?``:`
    <section class="hazards mt-12" aria-labelledby="hazards-heading">
      <h3 id="hazards-heading" class="hazards__heading">
        ${e(E(`weapons.hazards.heading`))}
      </h3>
      ${r.length?Kc({variant:`traps`,idPrefix:`hazard-trap-`,icon:Ri,title:E(`weapons.traps.title`),entries:r,iconMap:n}):``}
      ${i.length?Kc({variant:`throwing`,idPrefix:`hazard-throwing-`,icon:zi,title:E(`weapons.throwing.title`),entries:i,iconMap:n}):``}
      ${a.length?Jc(a,n,t.poisonNotes??[]):``}
      ${o?.overheating?Zc(`overheating`,o.overheating,n):``}
      ${o?.hypothermia?Zc(`hypothermia`,o.hypothermia,n):``}
    </section>
  `}function Kc(t){let n=t.entries.map(n=>`
    <article class="hazard-row" id="${t.idPrefix}${e(n.id)}">
      <header class="hazard-row__head">
        <img src="${M(xn(n.name),t.iconMap)}" alt="" loading="lazy" class="hazard-row__icon" data-fallback="remove" />
        <h4 class="hazard-row__name">${e(N(n.name))}</h4>
      </header>
      ${n.damage?`<div class="hazard-row__metric"><span class="hazard-row__metric-label">${e(E(`weapons.traps.metric.damage`))}</span><span class="hazard-row__metric-value">${e(n.damage)}</span></div>`:``}
      ${n.extra?`<p class="hazard-row__extra">${e(n.extra)}</p>`:``}
    </article>
  `).join(``),r=t.entries.map(e=>N(e.name)).join(` · `);return`
    <details class="hazard-card hazard-card--${t.variant}">
      ${Y({variant:t.variant,icon:t.icon,title:t.title,subtitle:r,count:String(t.entries.length)})}
      <div class="hazard-card__body">${n}</div>
    </details>
  `}function qc(t){let n=t.filter(e=>e.tests&&e.tests.runs.length>0);if(n.length===0)return``;let r=n.map(t=>{let n=t.tests.runs.map((n,r)=>{let i=n.rows.some(e=>e.wake),a=`
        <tr>
          <th class="hazard-poison__th">${e(E(`weapons.poisons.tests.col.character`))}</th>
          <th class="hazard-poison__th">${e(E(`weapons.poisons.tests.col.poisoned`))}</th>
          <th class="hazard-poison__th">${e(E(`weapons.poisons.tests.col.onset`))}</th>
          <th class="hazard-poison__th">${e(E(`weapons.poisons.tests.col.delta`))}</th>
          ${i?`<th class="hazard-poison__th">${e(E(`weapons.poisons.tests.col.wake`))}</th>`:``}
        </tr>`,o=n.rows.map(t=>`
        <tr>
          <td class="hazard-poison__td">${e(N(t.character))}</td>
          <td class="hazard-poison__td">${e(t.poisoned)}</td>
          <td class="hazard-poison__td">${e(t.onset)}</td>
          <td class="hazard-poison__td">${e(t.delta)}</td>
          ${i?`<td class="hazard-poison__td">${e(t.wake??``)}</td>`:``}
        </tr>`).join(``);return`
        <h6 class="hazard-poison__tests-run">${e(t.tests.runs.length>1?`${E(`weapons.poisons.tests.run`)} ${r+1}`:E(`weapons.poisons.tests.run`))}</h6>
        <div class="hazard-poison__tests-scroll">
          <table class="hazard-poison__table hazard-poison__table--tests">
            <thead>${a}</thead>
            <tbody>${o}</tbody>
          </table>
        </div>`}).join(``);return`
      <section class="hazard-poison__tests-group">
        <h5 class="hazard-poison__tests-name">${e(N(t.name))}</h5>
        ${n}
      </section>`}).join(``);return`
    <details class="hazard-poison__tests">
      <summary class="hazard-poison__tests-summary">${e(E(`weapons.poisons.tests.title`))}</summary>
      <div class="hazard-poison__tests-body">${r}</div>
    </details>`}function Jc(t,n,r=[]){let i=t.map(t=>{let r=(t,n)=>n?`<tr><th class="hazard-poison__th">${e(t)}</th><td class="hazard-poison__td">${e(n.real)}</td><td class="hazard-poison__td">${e(n.ingame)}</td></tr>`:``,i=t.cures&&t.cures.length?`<div class="hazard-row__metric"><span class="hazard-row__metric-label">${e(E(`weapons.poisons.metric.cures`))}</span><span class="hazard-poison__cures">${t.cures.map(t=>`<span class="hazard-poison__cure" data-item-name="${e(t)}">${e(N(t))}</span>`).join(``)}</span></div>`:``,a=`Яд «${xn(t.name)}»`;return`
      <article class="hazard-row" id="hazard-poison-${e(t.id)}">
        <header class="hazard-row__head">
          <img src="${M(a,n)}" alt="" loading="lazy" class="hazard-row__icon" data-fallback="remove" />
          <h4 class="hazard-row__name">${e(N(t.name))}</h4>
        </header>
        ${t.effect?`<div class="hazard-row__metric"><span class="hazard-row__metric-label">${e(E(`weapons.poisons.metric.effect`))}</span><span class="hazard-row__metric-value">${e(t.effect)}</span></div>`:``}
        ${t.poisoningDuration?`<div class="hazard-row__metric"><span class="hazard-row__metric-label">${e(E(`weapons.poisons.metric.poisoning`))}</span><span class="hazard-row__metric-value">${e(t.poisoningDuration)}</span></div>`:``}
        ${t.actionDuration?`<div class="hazard-row__metric"><span class="hazard-row__metric-label">${e(E(`weapons.poisons.metric.action`))}</span><span class="hazard-row__metric-value">${e(t.actionDuration)}</span></div>`:``}
        ${t.sideEffect?`<div class="hazard-row__metric"><span class="hazard-row__metric-label">${e(E(`weapons.poisons.metric.sideEffect`))}</span><span class="hazard-row__metric-value">${e(t.sideEffect)}</span></div>`:``}
        ${i}
        <table class="hazard-poison__table">
          <thead>
            <tr><th></th><th class="hazard-poison__th">${e(E(`weapons.poisons.table.real`))}</th><th class="hazard-poison__th">${e(E(`weapons.poisons.table.ingame`))}</th></tr>
          </thead>
          <tbody>
            ${r(E(`weapons.poisons.timing.onset`),t.onset)}
            ${r(E(`weapons.poisons.timing.ttd`),t.ttd)}
            ${r(E(`weapons.poisons.timing.wake`),t.wake)}
            ${r(E(`weapons.poisons.timing.total`),t.total)}
          </tbody>
        </table>
      </article>
    `}).join(``),a=t.map(e=>N(e.name)).join(` · `),o=r.length?`<section class="hazard-poison__notes">
        <h5 class="hazard-poison__notes-title">${e(E(`weapons.poisons.notes.title`))}</h5>
        <ul class="hazard-poison__notes-list">${r.map(t=>`<li>${e(t)}</li>`).join(``)}</ul>
      </section>`:``;return`
    <details class="hazard-card hazard-card--poisons">
      ${Y({variant:`poisons`,icon:Bi,title:E(`weapons.poisons.title`),subtitle:a,count:String(t.length)})}
      <div class="hazard-card__body">
        <p class="hazard-card__testing-notice">${e(E(`weapons.hazards.testingNotice`))}</p>
        ${o}
        ${i}
        ${qc(t)}
      </div>
    </details>
  `}var Yc={overheating:`locations/баня_1_этаж.jpg`,hypothermia:`locations/морозилка_1_этаж_1.jpg`},Xc={"Куртка «Плюшевый Мрак»":`Тёплая куртка «Плюшевый Мрак»`};function Zc(t,r,i){let a=t===`overheating`?Vi:Hi,o=n(`assets/${Yc[t]}`),s=`<img src="${o}" alt="" loading="lazy" class="hazard-temp__thumb" data-fallback="remove" />`,c=`${r.stages.length} ${E(`weapons.temp.stagesCount`)} · ${E(`weapons.temp.deathLabel`)}: ${r.causeOfDeath}`,l=r.stages.map(t=>`
    <tr>
      <td class="hazard-temp__stage">${e(t.stage)}</td>
      <td class="hazard-temp__temp">${e(t.temperature)}</td>
      <td class="hazard-temp__debuffs">${(t.debuffs??[]).map(t=>`<span class="hazard-temp__chip">${e(t)}</span>`).join(``)}</td>
    </tr>
  `).join(``),u=r.timings[0]?.rows.map(t=>`<th class="hazard-temp__th">${e(N(t.equipment))}</th>`).join(``)??``,d=r.timings.map(t=>{let n=t.rows.map(t=>`<td class="hazard-temp__td"><div class="hazard-temp__td-real">${e(t.real)}</div><div class="hazard-temp__td-ingame">${e(t.ingame)}</div></td>`).join(``);return`<tr><th class="hazard-temp__th">${e(t.stage)}</th>${n}</tr>`}).join(``),f=r.milestones&&r.milestones.length?`<table class="hazard-temp__milestones">
        <thead><tr><th></th><th class="hazard-temp__th">${e(E(`weapons.temp.real`))}</th><th class="hazard-temp__th">${e(E(`weapons.temp.ingame`))}</th></tr></thead>
        <tbody>${r.milestones.map(t=>`<tr><th class="hazard-temp__th">${e(t.label)}</th><td class="hazard-temp__td">${e(t.real)}</td><td class="hazard-temp__td">${e(t.ingame)}</td></tr>`).join(``)}</tbody>
       </table>`:``,p=r.equipment&&r.equipment.length?`<ul class="hazard-temp__equipment">${r.equipment.map(t=>{let n=xn(t.name);return`
        <li class="hazard-temp__equipment-item">
          <header class="hazard-temp__equipment-head">
            <img src="${M(Xc[n]??n,i)}" alt="" loading="lazy" class="hazard-temp__equipment-icon" data-item-name="${e(n)}" data-fallback="remove" />
            <span class="hazard-temp__equipment-name">${e(N(t.name))}</span>
          </header>
          <span class="hazard-temp__equipment-effect">${e(t.effect)}</span>
          ${t.delta?`<span class="hazard-temp__equipment-delta">${e(t.delta)}</span>`:``}
          ${t.annotation?`<span class="hazard-temp__equipment-warn">⚠ ${e(t.annotation)}</span>`:``}
        </li>
      `}).join(``)}</ul>`:``;return`
    <details class="hazard-card hazard-card--${t}" style="--hazard-backdrop: url('${o}')">
      ${Y({variant:t,icon:a,title:r.label,subtitle:c,count:r.causeOfDeath})}
      <div class="hazard-card__body">
        ${s}
        <p class="hazard-card__testing-notice">${e(E(`weapons.hazards.testingNotice`))}</p>
        <h5 class="hazard-temp__subhead">${e(E(`weapons.temp.stages`))}</h5>
        <table class="hazard-temp__stages">
          <thead><tr><th class="hazard-temp__th">${e(E(`weapons.temp.table.stage`))}</th><th class="hazard-temp__th">${e(E(`weapons.temp.table.temp`))}</th><th class="hazard-temp__th">${e(E(`weapons.temp.table.effects`))}</th></tr></thead>
          <tbody>${l}</tbody>
        </table>
        <h5 class="hazard-temp__subhead">${e(E(`weapons.temp.timingsFromEntry`))}</h5>
        <div class="hazard-temp__scroll">
          <table class="hazard-temp__timings">
            <thead><tr><th class="hazard-temp__th">${e(E(`weapons.temp.table.stage`))}</th>${u}</tr></thead>
            <tbody>${d}</tbody>
          </table>
        </div>
        ${f?`<h5 class="hazard-temp__subhead">${e(E(`weapons.temp.unconsciousness`))}</h5>${f}`:``}
        ${p?`<h5 class="hazard-temp__subhead">${e(E(`weapons.temp.equipment`))}</h5>${p}`:``}
      </div>
    </details>
  `}var Qc={"homemade-bomb":`Взрывчатка`,molotov:`Коктейль Молотова`,"explosive-trap":`Взрывная ловушка`,"snare-trap":`Капкан`,"blood-loss":`Кровотечение`,starvation:`Голод`,"sleep-deprivation":`Сонливость`,poison:`Ловушка с ядовитым газом`,"electroshock-trap":`Электрошоковая ловушка`};function $c(e,t){return _c({image:e,caption:`${t} — ${E(`weapons.forensics.shotCaption`)}`,zoomLabel:E(`weapons.forensics.shotZoom`)+t,buttonClass:`forensic-card__shot`,toggleLabel:E(`weapons.forensics.shotToggle`)})}function el(t,n){if(!t)return``;let r=t.causes.map(t=>{let r=Qc[t.id],i=r?`<img src="${M(r,n)}" alt="" loading="lazy" class="forensic-card__icon" data-fallback="remove" />`:``,a=t.variants?.length?`<details class="forensic-card__variants">
          <summary class="forensic-card__variants-summary">${e(E(`weapons.forensics.variantsToggle`))}</summary>
          <div class="forensic-card__variants-body">
            ${t.variants.map(n=>`
              <section class="forensic-card__variant" id="forensic-${e(t.id)}-${e(n.id)}">
                <h5 class="forensic-card__variant-label">${e(n.label)}</h5>
                <p class="forensic-card__desc">${e(n.description)}</p>
                ${$c(n.image,n.label)}
              </section>`).join(``)}
          </div>
        </details>`:``;return`
    <article class="forensic-card" id="forensic-${e(t.id)}">
      <header class="forensic-card__head">
        ${i}
        <h4 class="forensic-card__label">${e(t.label)}</h4>
      </header>
      <p class="forensic-card__desc">${e(t.description)}</p>
      ${$c(t.image,t.label)}
      ${a}
    </article>
  `}).join(``),i=t.modifiers.map(t=>`
    <article class="forensic-mod" id="forensic-mod-${e(t.id)}">
      <h4 class="forensic-mod__cond">${e(t.condition)}</h4>
      <p class="forensic-mod__line">${e(t.line)}</p>
      ${$c(t.image,t.condition)}
    </article>
  `).join(``),a=`${t.causes.length} ${E(`weapons.forensics.subtitleDeaths`)} · ${t.modifiers.length} ${E(`weapons.forensics.subtitleMods`)}`;return`
    <details class="hazard-card hazard-card--forensics mt-12">
      ${Y({variant:`forensics`,icon:Ui,title:E(`weapons.forensics.title`),subtitle:a,count:String(t.causes.length)})}
      <div class="forensics__body">
        <h4 class="forensics__col-title">${e(E(`weapons.forensics.deaths`))} <span class="forensics__count">${t.causes.length}</span></h4>
        <div class="forensics__grid">${r}</div>
        <h4 class="forensics__col-title">${e(E(`weapons.forensics.markers`))} <span class="forensics__count">${t.modifiers.length}</span></h4>
        <div class="forensics__grid">${i}</div>
      </div>
    </details>
  `}function tl(e){let t=new Map;for(let n of e)n.craft&&t.set(n.name,n.craft);return t}function nl(e){let t=e?.yield;return t!==void 0&&t>1?t:1}function rl(e,t){return Math.ceil(e/nl(t))}function il(e,t){let n=[],r=new Set,i=new Set,a=e=>{if(!(r.has(e)||i.has(e))){i.add(e);for(let n of t.get(e)?.ingredients??[])a(n.name);i.delete(e),r.add(e),n.push(e)}};return a(e),n.reverse()}function al(e,t,n){let r=new Map([[e,t]]),i=new Map,a=new Map;for(let t of il(e,n)){let e=r.get(t)??0;if(i.set(t,e),e<=0)continue;let o=n.get(t);if(!o){a.set(t,(a.get(t)??0)+e);continue}let s=rl(e,o);for(let e of o.ingredients)r.set(e.name,(r.get(e.name)??0)+s*e.qty)}for(let[e,t]of r){let n=t-(i.get(e)??0);n>0&&a.set(e,(a.get(e)??0)+n)}return a}function ol(e,t,n,r=new Set){let i=n.get(e);if(!i||r.has(e))return{name:e,qty:t,isLeaf:!0,children:[]};let a=rl(t,i);r.add(e);let o=i.ingredients.map(e=>ol(e.name,e.qty*a,n,r));r.delete(e);let s={name:e,qty:t,isLeaf:!1,stations:i.stations,children:o};i.successChance!==void 0&&(s.successChance=i.successChance),i.tool!==void 0&&(s.tool=i.tool);let c=nl(i);return c>1&&(s.crafts=a,s.produced=a*c),s}function sl(e){let t=new Set,n=new Set,r=e=>{for(let n of e.stations??[])t.add(n);e.tool&&e.tool.trim()!==``&&n.add(e.tool),e.children.forEach(r)};return r(e),{stations:[...t],tools:[...n]}}var cl=`craft-calc-item`,ll=`craft-calc-qty`,ul=`craft-calc-options`,dl=`craft-calc-results`,fl=`craft-calc-opt-`,pl=[`Верстак`,`Мед. лаборатория`,`Кухонная плита`];function ml(t,n,r){let i=e(N(t)),a=t.slice(0,3);return Mo({chipClass:`craft-calc__chip`,itemName:t,title:`${E(`calculator.tool.openTitle.prefix`)} «${N(t)}» ${E(`calculator.tool.openTitle.suffix`)}`,icon:{url:M(t,r),alt:a,className:`craft-calc__chip-icon`,fallbackClass:`craft-calc__chip-icon craft-fallback-icon`,fallbackText:a},qtyFirst:!0,qtyHtml:`<span class="craft-calc__chip-qty tabular-nums">×${n}</span>`,nameHtml:`<span class="craft-calc__chip-name">${i}</span>`})}function hl(t){if(t.crafts===void 0||t.produced===void 0)return``;let n=jn(t.crafts,{one:E(`calculator.node.craftsOne`),few:E(`calculator.node.craftsFew`),many:E(`calculator.node.craftsMany`)});return`<span class="craft-calc__node-crafts">${e(`${t.crafts} ${n} → ${t.produced} ${E(`calculator.node.produced`)}`)}</span>`}function gl(t,n,r=0){let i=e(t.name),a=e(N(t.name)),o=t.name.slice(0,3),s=`
    <span class="craft-calc__node-label">
      ${J({url:M(t.name,n),alt:o,className:`craft-calc__node-icon`,fallbackClass:`craft-calc__node-icon craft-fallback-icon`,fallbackText:o})}
      <span class="craft-calc__node-qty tabular-nums">×${t.qty}</span>
      <button type="button" class="craft-calc__node-name" data-item-name="${i}"
              title="${e(E(`calculator.tool.openTitle.prefix`))} «${a}» ${e(E(`calculator.tool.openTitle.suffix`))}">${a}</button>
      ${hl(t)}
    </span>`;if(t.isLeaf)return`<li class="craft-calc__node craft-calc__node--leaf">${s}</li>`;let c=t.children.map(e=>gl(e,n,r+1)).join(``);return`
    <li class="craft-calc__node">
      <details${r===0?` open`:``}>
        <summary>${s}</summary>
        <ul class="craft-calc__subtree">${c}</ul>
      </details>
    </li>`}function _l(t){return`
    <section class="craft-calc" aria-label="${e(E(`calculator.ariaLabel`))}">
      <header class="craft-calc__header">
        <h3 class="text-xl font-semibold text-ink">${e(E(`calculator.heading`))}</h3>
        <p class="craft-calc__hint">${e(E(`calculator.hint`))}</p>
      </header>
      <div class="craft-calc__controls">
        <div class="craft-calc__field">
          <span class="craft-calc__field-label" id="${cl}-label">${e(E(`calculator.field.item`))}</span>
          <div class="craft-calc__combo">
            <input id="${cl}" class="craft-calc__input" type="text"
                   role="combobox" aria-expanded="false" aria-controls="${ul}"
                   aria-autocomplete="list" aria-activedescendant=""
                   aria-labelledby="${cl}-label"
                   placeholder="${e(E(`calculator.input.placeholder`))}" autocomplete="off" />
            <ul id="${ul}" class="craft-calc__listbox" role="listbox"
                aria-label="${e(E(`calculator.listbox.ariaLabel`))}" hidden></ul>
          </div>
        </div>
        <label class="craft-calc__field craft-calc__field--qty">
          <span class="craft-calc__field-label">${e(E(`calculator.field.quantity`))}</span>
          <input id="${ll}" class="craft-calc__input" type="number" min="1" step="1" value="1" />
        </label>
      </div>
      <div id="${dl}" class="craft-calc__results" aria-live="polite"></div>
    </section>`}function vl(e){let t=new Map;for(let n of e)if(n.craft)for(let e of n.craft.stations){let r=t.get(e),i={name:n.name,station:e};r?r.push(i):t.set(e,[i])}let n=pl.filter(e=>t.has(e));for(let e of t.keys())n.includes(e)||n.push(e);return n.map(e=>({station:e,items:(t.get(e)??[]).sort((e,t)=>P(e.name,t.name))}))}function yl(t,n,r,i){if(!r.has(t))return`<p class="craft-calc__empty">${e(E(`calculator.empty.pickItem`))}</p>`;let a=al(t,n,r),o=ol(t,n,r),{stations:s,tools:c}=sl(o),l=[...a.entries()].sort((e,t)=>P(e[0],t[0])).map(([e,t])=>ml(e,t,i)).join(``),u=s.length?`<div class="craft-calc__summary-line"><span class="craft-calc__summary-key">${e(E(`calculator.section.stations`))}</span> ${s.map(t=>`<span class="craft-calc__tag">${e(N(t))}</span>`).join(``)}</div>`:``,d=c.length?`<div class="craft-calc__summary-line"><span class="craft-calc__summary-key">${e(E(`calculator.section.tools`))}</span> ${c.map(t=>`<button type="button" class="craft-calc__tag craft-calc__tag--tool" data-item-name="${e(t)}" title="${e(E(`calculator.tool.openTitle.prefix`))} «${e(N(t))}» ${e(E(`calculator.tool.openTitle.suffix`))}">${e(N(t))}</button>`).join(``)}</div>`:``,f=a.size;return`
    <div class="craft-calc__breakdown">
      <h4 class="craft-calc__breakdown-title">${e(E(`calculator.tree.toggle`))}</h4>
      <ul class="craft-calc__tree">${gl(o,i)}</ul>
    </div>
    ${u||d?`<div class="craft-calc__summary">${u}${d}</div>`:``}
    <details class="craft-calc__raw">
      <summary class="craft-calc__raw-toggle">
        <span class="craft-calc__raw-toggle-text">${e(E(`calculator.raw.toggle`))}</span>
        <span class="craft-calc__raw-meta">${e(E(`calculator.result.titlePrefix`))} ${n} × «${e(N(t))}»</span>
        <span class="craft-calc__raw-count tabular-nums" aria-hidden="true">${f}</span>
      </summary>
      <div class="craft-calc__totals">${l}</div>
    </details>`}var bl=new WeakMap;function xl(t,n,r){e(t.station);let i=e(N(t.station));return`
    <li role="group" class="craft-calc__optgroup" aria-label="${i}">
      <span class="craft-calc__optgroup-head" aria-hidden="true">${i}</span>
      <ul class="craft-calc__optgroup-list" role="presentation">${t.items.map((t,i)=>{let a=n+i,o=e(t.name),s=e(N(t.name)),c=t.name.slice(0,3);return`
        <li id="${fl}${a}" class="craft-calc__option" role="option"
            data-craft-value="${o}" data-craft-display="${e(N(t.name).toLowerCase())}" aria-selected="false">
          ${J({url:M(t.name,r),alt:c,className:`craft-calc__option-icon`,fallbackClass:`craft-calc__option-icon craft-fallback-icon`,fallbackText:c})}
          <span class="craft-calc__option-name">${s}</span>
        </li>`}).join(``)}</ul>
    </li>`}function Sl(t,n,r){let i=tl(n.items),a=t.querySelector(`#${cl}`),o=t.querySelector(`#${ll}`),s=t.querySelector(`#${dl}`),c=t.querySelector(`#${ul}`);if(!a||!o||!s||!c)return;bl.get(t)?.abort();let l=new AbortController;bl.set(t,l);let u=vl(n.items),d=0;c.innerHTML=u.map(e=>{let t=xl(e,d,r);return d+=e.items.length,t}).join(``)+`<li class="craft-calc__option craft-calc__option--empty" role="option" aria-disabled="true">${e(E(`calculator.empty.notFound`))}</li>`;let f=[...c.querySelectorAll(`[role="option"][data-craft-value]`)],p=c.querySelector(`.craft-calc__option--empty`),m=``,h=``,g=e=>{h=e,a.setAttribute(`aria-activedescendant`,e);for(let t of f)t.classList.toggle(`is-active`,t.id===e)},ee=()=>f.filter(e=>!e.hidden),_=e=>{let t=e.trim().toLowerCase();for(let e of f){let n=(e.dataset.craftValue??``).toLowerCase(),r=e.dataset.craftDisplay??``;e.hidden=t!==``&&!n.includes(t)&&!r.includes(t)}for(let e of c.querySelectorAll(`.craft-calc__optgroup`))e.hidden=e.querySelector(`[role="option"]:not([hidden])`)===null;let n=ee();return p&&(p.hidden=n.length>0),n},v=()=>{c.hidden=!1,a.setAttribute(`aria-expanded`,`true`)},te=()=>{c.hidden=!0,a.setAttribute(`aria-expanded`,`false`),g(``)},y=()=>{let t=m,n=Number.parseInt(o.value,10);if(!i.has(t)||!Number.isFinite(n)||n<1){s.innerHTML=`<p class="craft-calc__empty">${e(E(`calculator.empty.pickItemQty`))}</p>`;return}s.innerHTML=yl(t,n,i,r)},ne=e=>{let t=e.dataset.craftValue??``;m=t,a.value=N(t);for(let t of f)t.setAttribute(`aria-selected`,String(t===e));te(),y()};a.addEventListener(`input`,()=>{m=``;let e=_(a.value);v(),g(e.length?e[0].id:``),y()}),a.addEventListener(`focus`,()=>{let e=_(a.value);v(),(!h||!e.some(e=>e.id===h))&&g(e.length?e[0].id:``)}),a.addEventListener(`keydown`,e=>{let t=ee();switch(e.key){case`ArrowDown`:{if(e.preventDefault(),c.hidden){let e=_(a.value);v(),g(e.length?e[0].id:``);return}if(!t.length)return;let n=t.findIndex(e=>e.id===h),r=n<0?0:Math.min(n+1,t.length-1);g(t[r].id),t[r].scrollIntoView({block:`nearest`});break}case`ArrowUp`:{if(e.preventDefault(),c.hidden||!t.length)return;let n=t.findIndex(e=>e.id===h),r=n<=0?0:n-1;g(t[r].id),t[r].scrollIntoView({block:`nearest`});break}case`Enter`:if(!c.hidden&&h){e.preventDefault();let t=f.find(e=>e.id===h);t&&ne(t)}break;case`Escape`:c.hidden||(e.preventDefault(),te());break;default:break}}),c.addEventListener(`mousedown`,e=>{let t=e.target;if(!(t instanceof HTMLElement))return;let n=t.closest(`[role="option"][data-craft-value]`);n&&(e.preventDefault(),ne(n))}),document.addEventListener(`click`,e=>{let t=e.target;t instanceof Node&&!a.contains(t)&&!c.contains(t)&&te()},{signal:l.signal}),o.addEventListener(`input`,y),_(``),y()}var Cl=[`Кухонная плита`,`Мед. лаборатория`,`Верстак`],wl={"Кухонная плита":`🍳`,"Мед. лаборатория":`⚕`,Верстак:`🛠`},Tl={Обычный:0,Необычный:1,Редкий:2,"Очень редкий":3,Легендарный:4},El={Обычный:`text-rarity--common`,Необычный:`text-rarity--uncommon`,Редкий:`text-rarity--rare`,"Очень редкий":`text-rarity--very-rare`,Легендарный:`text-rarity--legendary`},Dl={dispose(){}};async function Ol(){let e=document.getElementById(`crafting`);if(!e)return Dl;let t=!1,n=()=>{t=!0},r,i,a;try{let[e,t]=await Promise.all([z(),B()]);i=t,a=e,r=kl(e.items)}catch(r){return t?Dl:(e.innerHTML=W(`crafting`,r),{dispose:n})}if(t)return Dl;let o=Cl.filter(e=>r.has(e));for(let e of r.keys())o.includes(e)||o.push(e);let s=D(`crafting`),c=tl(a.items);return e.innerHTML=`
    ${G({num:s.num,title:s.label,summary:s.summary})}
    ${_l(c)}
    <div class="space-y-10">
      ${o.map(e=>Ml(e,r.get(e)??[],i)).join(``)}
    </div>
  `,Sl(e,a,i),vc(e),{dispose:n}}function kl(e){let t=new Map;for(let n of e){if(!n.craft)continue;let e={itemName:n.name,rarity:n.rarity,weight:n.weight,description:n.description,successChance:n.craft.successChance,yield:n.craft.yield,tool:n.craft.tool,ingredients:[...n.craft.ingredients]};for(let r of n.craft.stations){let n=t.get(r);n?n.push(e):t.set(r,[e])}}for(let e of t.values())e.sort((e,t)=>{let n=e.rarity===void 0?99:Tl[e.rarity]??99,r=t.rarity===void 0?99:Tl[t.rarity]??99;return n===r?P(e.itemName,t.itemName):n-r});return t}function Al(e){let t=new Set,n=0;for(let r of e)r.tool&&r.tool.trim()!==``&&(t.add(r.tool),n+=1);return{tools:[...t],allShare:t.size>0&&n===e.length}}function jl(e,t,n){return J({url:M(e,t),alt:e,className:n,fallbackClass:`${n} craft-fallback-icon`,fallbackText:e.slice(0,3)})}function Ml(t,n,r){let i=wl[t]??`◇`,{tools:a,allShare:o}=Al(n),s=``;if(a.length>0){let n=a.map(t=>`
        <button type="button" class="craft-tool-plate__tool" data-item-name="${e(t)}"
                title="${e(E(`crafting.tool.openTitle.prefix`))} «${e(N(t))}» ${e(E(`crafting.tool.openTitle.suffix`))}">
          ${jl(t,r,`craft-tool-plate__tool-icon`)}
          <span class="craft-tool-plate__tool-name">${e(N(t))}</span>
        </button>`).join(``),i=o?`${e(E(`crafting.tool.allRequire.prefix`))} «${e(N(t))}» ${e(E(`crafting.tool.allRequire.suffix`))}`:`${e(E(`crafting.tool.someRequire.prefix`))} «${e(N(t))}» ${e(E(`crafting.tool.someRequire.suffix`))}`;s=`
      <div class="craft-tool-plate" data-station="${e(t)}">
        <p class="craft-tool-plate__text">${i}</p>
        <div class="craft-tool-plate__tools">${n}</div>
      </div>`}return`
    <section>
      <header class="flex items-center gap-3 mb-3 pb-2 border-b border-line">
        <span class="text-2xl" aria-hidden="true">${e(i)}</span>
        <h3 class="text-xl font-semibold text-ink">${e(N(t))}</h3>
        <span class="text-xs text-dim">${n.length} ${e(E(`crafting.recipesCount`))}</span>
      </header>
      ${s}
      <div class="craft-table" role="table" aria-label="${e(E(`crafting.row.recipesAria`))}: ${e(N(t))}">
        <div class="craft-table__head" role="row">
          <span role="columnheader">${e(E(`crafting.col.item`))}</span>
          <span role="columnheader">${e(E(`crafting.col.ingredients`))}</span>
          <span role="columnheader">${e(E(`crafting.col.description`))}</span>
        </div>
        <div class="craft-table__body">
          ${n.map(e=>Nl(e,r)).join(``)}
        </div>
      </div>
    </section>
  `}function Nl(t,n){let r=M(t.itemName,n),i=t.itemName.slice(0,3),a=t.rarity?El[t.rarity]??``:``,o=[];t.weight&&o.push(`<span class="craft-row__meta-item text-xs text-dim" title="${e(E(`crafting.row.weightTitle`))}">${e(E(`crafting.row.weight`))} ${e(t.weight)}</span>`),t.successChance&&o.push(`<span class="craft-row__meta-item" title="${e(E(`crafting.row.chanceTitle`))}">${e(E(`crafting.row.chance`))} ${e(t.successChance)}</span>`);let s=o.length?`<div class="craft-row__meta">${o.join(``)}</div>`:``,c=e(t.itemName),l=e(N(t.itemName)),u=t.tool?`<button type="button" class="craft-row__tool-chip" data-item-name="${e(t.tool)}"
               title="${e(E(`crafting.tool.requiredTitle`))} ${e(N(t.tool))}${e(E(`crafting.tool.openSentence`))}">
         ${jl(t.tool,n,`craft-row__tool-icon`)}
         <span>${e(N(t.tool))}</span>
       </button>`:``,d=t.ingredients.map(t=>{let r=t.name.slice(0,3),i=e(N(t.name));return`
        <li class="craft-ingredient-cell">
          ${Mo({chipClass:`craft-ingredient`,itemName:t.name,title:`${E(`crafting.tool.openTitle.prefix`)} «${N(t.name)}» ${E(`crafting.tool.openTitle.suffix`)}`,icon:{url:M(t.name,n),alt:r,className:`craft-ingredient__icon`,fallbackClass:`craft-ingredient__icon craft-fallback-icon`,fallbackText:r},qtyFirst:!0,qtyHtml:`<span class="craft-ingredient__qty tabular-nums">×${t.qty}</span>`,nameHtml:`<span class="craft-ingredient__name">${i}</span>`})}
        </li>`}).join(``),f=t.yield&&t.yield>1?`<span class="craft-row__yield tabular-nums" title="${e(E(`crafting.row.yieldTitle`))}">×${t.yield}</span>`:``,p=t.description?`<p class="craft-row__desc">${e(t.description)}</p>`:`<p class="craft-row__desc craft-row__desc--empty">—</p>`;return`
    <article class="craft-row" role="row">
      <div class="craft-row__item" role="cell">
        <button type="button" class="craft-row__item-button" data-item-name="${c}"
                title="${e(E(`crafting.tool.openTitle.prefix`))} «${l}» ${e(E(`crafting.tool.openTitle.suffix`))}">
          <span class="craft-row__icon-wrap">
            ${J({url:r,alt:i,className:`craft-row__icon`,fallbackClass:`craft-row__icon craft-fallback-icon`,fallbackText:i})}
            ${f}
          </span>
          <div class="craft-row__name-block">
            <div class="craft-row__name ${a}">${l}</div>
            ${s}
          </div>
        </button>
        ${u}
      </div>
      <ul class="craft-row__ingredients" role="cell" aria-label="${e(E(`crafting.row.ingredientsAria`))}">${d}</ul>
      <div class="craft-row__desc-cell" role="cell">${p}</div>
    </article>
  `}async function Pl(){let e=document.getElementById(`repairs`);if(!e)return;let t,n;try{[t,n]=await Promise.all([z(),B()])}catch(t){e.innerHTML=W(`repairs`,t);return}let r=D(`repairs`);e.innerHTML=`
    ${G({num:r.num,title:E(`repairs.headerTitle`),summary:r.summary})}
    <div class="space-y-6">
      ${t.repairs.map((e,t)=>Wl(e,t,n)).join(``)}
    </div>
    ${Fl(t.repairsTips,t.repairs)}
  `,vc(e),zl(e),va(e)}function Fl(e,t){return!e||e.length===0?``:`
    <details class="items-registry hazard-card hazard-card--tips mt-8">
      ${Y({variant:`tips`,icon:ta,title:E(`repairs.tips.title`),subtitle:E(`repairs.tips.subtitle`),count:String(e.length)})}
      <div class="repair-tips__grid">
        ${e.map((e,n)=>Il(e,n,t)).join(``)}
      </div>
    </details>
  `}function Il(t,n,r){let i=String(n+1).padStart(2,`0`),a=t.tag?`<span class="repair-tip-card__tag">${e(t.tag)}</span>`:``,o=t.example?`
      <details class="repair-tip-card__example">
        <summary>${e(E(`repairs.tip.example`))}</summary>
        <p>${e(t.example)}</p>
      </details>
    `:``,s=t.linkedItems&&t.linkedItems.length?`
      <div class="repair-tip-card__chips" role="list">
        ${t.linkedItems.map(e=>Ll(e)).join(``)}
      </div>
    `:``,c=t.linkedStages&&t.linkedStages.length?`
      <div class="repair-tip-card__stages" role="list">
        ${t.linkedStages.map(e=>Rl(e,r)).join(``)}
      </div>
    `:``;return`
    <article class="repair-tip-card">
      <header class="repair-tip-card__header">
        <span class="repair-tip-card__num">${e(E(`repairs.tip`))} ${i}</span>
        ${a}
      </header>
      <p class="repair-tip-card__body">${e(t.text)}</p>
      ${o}
      ${s}
      ${c}
    </article>
  `}function Ll(t){let n=e(t),r=e(N(t));return`
    <button type="button" class="repair-tip-card__chip" data-item-name="${n}"
            title="${e(E(`repairs.item.openPrefix`))}«${r}»${e(E(`repairs.item.openSuffix`))}">
      <span class="repair-tip-card__chip-arrow" aria-hidden="true">→</span>
      <span>${r}</span>
    </button>
  `}function Rl(t,n){let r=n[t];if(!r)return``;let i=r.name??`${E(`repairs.stageFallback`)} ${t+1}`;return`
    <button type="button" class="repair-tip-card__stage-chip"
            data-stage-target="${t}"
            title="${e(E(`repairs.stage.goToPrefix`)+i)}">
      <span class="repair-tip-card__chip-arrow" aria-hidden="true">↓</span>
      <span>${e(i)}</span>
    </button>
  `}function zl(e){e.dataset.stageScrollWired!==`1`&&(e.dataset.stageScrollWired=`1`,e.addEventListener(`click`,t=>{let n=t.target;if(!(n instanceof HTMLElement))return;let r=n.closest(`button[data-stage-target]`);if(!r)return;let i=r.dataset.stageTarget;if(i===void 0)return;let a=e.querySelector(`#repair-stage-${i}`);a&&a.scrollIntoView({behavior:`smooth`,block:`start`})}))}var Bl=[[16,`8`],[15,`8`],[14,`8`],[13,`8`],[12,`7`],[11,`7`],[10,`6`],[9,`5`],[8,`5`],[7,`4`],[6,`4`],[5,`3`],[4,`3`],[3,`2`],[2,`автоматическая победа`],[1,`автоматическая победа`]];function Vl(){return`
    <aside class="capsule-boarding mt-4" aria-labelledby="capsule-boarding-heading">
      <h4 id="capsule-boarding-heading" class="capsule-boarding__title">${e(E(`repairs.capsule.boardingTitle`))}</h4>
      <ul class="capsule-boarding__list">
        <li>${e(E(`repairs.capsule.unlock`))}</li>
        <li>${e(E(`repairs.capsule.scan`))}</li>
        <li>${e(E(`repairs.capsule.board`))} <kbd class="kbd">E</kbd>.</li>
        <li>${e(E(`repairs.capsule.carry`))} <kbd class="kbd">E</kbd>${e(E(`repairs.capsule.carrySuffix`))}</li>
      </ul>
    </aside>
  `}function Hl(){let t=E(`repairs.capsule.autoWin`),r=Bl.map(([n,r])=>`<tr><td>${n}</td><td>${e(r===`автоматическая победа`?t:r)}</td></tr>`).join(``),i=n(`assets/locations/комната_с_капсулами_4_этаж_1.jpg`),a=n(`assets/locations/комната_с_капсулами_4_этаж_2.jpg`);return`
    <details class="capsule-table mt-4">
      <summary>${e(E(`repairs.capsule.tableSummary`))}</summary>
      <div class="capsule-table__layout">
        <table>
          <thead><tr><th>${e(E(`repairs.capsule.colSurvivors`))}</th><th>${e(E(`repairs.capsule.colCapsules`))}</th></tr></thead>
          <tbody>${r}</tbody>
        </table>
        <figure class="capsule-table__figure">
          <img src="${i}" alt="${e(E(`repairs.capsule.figureAlt1`))}" loading="lazy" data-lightbox />
          <img src="${a}" alt="${e(E(`repairs.capsule.figureAlt2`))}" loading="lazy" data-lightbox />
        </figure>
      </div>
    </details>
  `}function Ul(e){let t=e._titleRU;return t?t.startsWith(`Капсулы спасения`):e.title.startsWith(`Капсулы спасения`)||e.title.startsWith(`Escape capsules`)}function Wl(t,n,r){let i=t.note?`<p class="text-sm text-mute mt-2">${e(t.note)}</p>`:``,a=Ul(t)?Vl()+Hl():``;return`
    <article id="repair-stage-${n}" class="bg-card border border-line rounded p-4 scroll-mt-24">
      <header class="flex flex-wrap items-baseline gap-3 mb-3">
        <span class="text-xs font-mono uppercase tracking-wider text-page bg-accent px-2 py-0.5 rounded">${e(E(`repairs.stage`))} ${n+1}</span>
        <h3 class="text-lg font-semibold text-ink">${e(t.title)}</h3>
      </header>
      ${i}
      <div class="grid gap-3 mt-4 sm:grid-cols-2">
        ${t.presets.map(e=>Gl(e,r)).join(``)}
      </div>
      ${a}
    </article>
  `}function Gl(t,n){let r=t.items.filter(e=>!e.tool),i=t.items.filter(e=>e.tool),a=r.length?`<ul class="space-y-1.5 grow">
        ${r.map(e=>Kl(e,n)).join(``)}
      </ul>`:`<div class="grow"></div>`,o=i.length?ql(i,n):``;return`
    <div class="bg-page border border-line rounded p-3 flex flex-col h-full">
      <div class="text-xs font-mono uppercase tracking-wider text-dim mb-2">${e(t.name)}</div>
      ${a}
      ${o}
    </div>
  `}function Kl(t,n){let r=t.name.slice(0,3),i=String(t.qty).replace(`.0`,``),a=e(N(t.name));return`
    <li>
      ${Mo({chipClass:`repair-item`,itemName:t.name,title:`${E(`repairs.item.openPrefix`)}«${N(t.name)}»${E(`repairs.item.openSuffix`)}`,icon:{url:M(t.name,n),alt:r,className:`repair-item__icon`,fallbackClass:`repair-item__icon craft-fallback-icon`,fallbackText:r},nameHtml:`<span class="repair-item__name">${a}</span>`,qtyHtml:`<span class="repair-item__qty tabular-nums">×${e(i)}</span>`})}
    </li>
  `}function ql(t,n){let r=e(E(`repairs.tool.label`));return`
    <div class="repair-tool-plate" role="group" aria-label="${r}">
      <span class="repair-tool-plate__label">${r}</span>
      <div class="repair-tool-plate__tools">
        ${t.map(e=>Jl(e,n)).join(``)}
      </div>
    </div>
  `}function Jl(t,n){let r=t.name.slice(0,3),i=String(t.qty).replace(`.0`,``),a=i&&i!==`1`?`<span class="repair-tool-plate__tool-qty">×${e(i)}</span>`:``,o=e(N(t.name));return Mo({chipClass:`repair-tool-plate__tool`,itemName:t.name,title:`${E(`repairs.item.openPrefix`)}«${N(t.name)}»${E(`repairs.item.openSuffix`)}`,icon:{url:M(t.name,n),alt:r,className:`repair-tool-plate__tool-icon`,fallbackClass:`repair-tool-plate__tool-icon craft-fallback-icon`,fallbackText:r},nameHtml:`<span class="repair-tool-plate__tool-name">${o}</span>`,qtyHtml:a})}var Yl=new Set([]);function Xl(e){let t=new Set,n=[];for(let r of e){let e=r.trim();e.length<3||Yl.has(e.toLowerCase())||t.has(e.toLowerCase())||(t.add(e.toLowerCase()),n.push(e))}return n.sort((e,t)=>t.length-e.length),n}var Zl=``,Ql=``,$l=/\[\[([^\]]+)\]\]/g,eu=/(\d+)/g;function tu(e){let t=[];return{text:e.replace($l,(e,n)=>{let r=t.length;return t.push(n),`${Zl}${r}${Ql}`}),combos:t}}function nu(e,t){return e.replace(eu,(e,n)=>ru(t[Number(n)]??``))}function ru(t){let n=t.split(`+`).map(e=>e.trim()).filter(Boolean);return n.length===0?``:`<span class="kbd-group kbd-group--inline">${n.map(t=>`<kbd class="kbd">${e(t)}</kbd>`).join(`<span class="kbd-plus" aria-hidden="true">+</span>`)}</span>`}function iu(e){let{durationMs:t,tolerancePx:n,onComplete:r,onPressingChange:i,shouldFire:a}=e,o=null,s=0,c=0,l=!1,u=!1;function d(){o!==null&&(clearTimeout(o),o=null),l&&(l=!1,i?.(!1))}return{start(e,n){l||(l=!0,u=!1,s=e,c=n,i?.(!0),o=setTimeout(()=>{o=null,l=!1,i?.(!1),!(a&&!a())&&(u=!0,r())},t))},move(e,t){l&&(Math.abs(e-s)>n||Math.abs(t-c)>n)&&d()},cancel:d,consumeClick(){return u?(u=!1,!0):!1}}}var au={"GD characters/Хаджимэ Хината/ct_spriteico_1.png":0,"GD characters/Хаджимэ Хината/ct_spriteico_14.png":0,"GD characters/Чиаки Нанами/ct_sprite_1.png":.1655,"GD characters/Чиаки Нанами/ct_sprite_3.png":.1655,"GD characters/Чиаки Нанами/ct_sprite_7.png":.1641,"KH characters/K1-B0/ct_spriteico_25.png":0,"KH characters/K1-B0/ct_spriteico_3.png":0,"KH characters/Шуичи Сайхара/ct_spriteico_1.png":.0391,"KH characters/Шуичи Сайхара/ct_spriteico_27.png":.0391,"KH characters/Шуичи Сайхара/ct_spriteico_37.png":.0391,"KH characters/Шуичи Сайхара/ct_spriteico_6.png":.0273,"THH characters/Кёко Киригири/ct_argue_1.png":.1211,"THH characters/Кёко Киригири/ct_argue_2.png":.1279,"THH characters/Кёко Киригири/ct_sprite_15.png":.1289,"THH characters/Кёко Киригири/ct_sprite_19.png":.0938,"THH characters/Макото Наэги/ct_sprite_1.png":.084,"THH characters/Макото Наэги/ct_sprite_3.png":.0854,"THH characters/Макото Наэги/ct_sprite_5.png":.0996};function ou(e,t,n,r){let i=_n(e,t,n,r);return i?au[i]??0:0}function su(e){return e?` style="--pad-top: ${e.toFixed(4)}"`:``}async function cu(){return(await Fi(`detective-notebook`)).replace(/\r\n/g,`
`)}var lu={ПНВ:`NoctiScope v0.1`,Нож:`Кухонный нож`,мономонет:`Мономонеты`},uu={Магазине:`#shops`,Магазин:`#shops`},du=[`правило 4.3`,`правила 4.3`,`rule 4.3`],fu={"Туалеты у спортзала (1 эт.)":`Туалеты у спортзала`,"Туалет у общежития (1 эт.)":`Туалет у общежития`,"Туалет (4 эт.)":`Туалет`,"Техническое помещение (между 3 и 4 этажами)":`Техническое помещение (между 3 и 4)`},pu={"Restrooms by the gym (1F)":`Туалеты у спортзала`,"Restroom by the dormitory (1F)":`Туалет у общежития`,"Abandoned dormitory floor":`Заброшенный этаж общежития`,"Restroom (4F)":`Туалет`,"Chemistry Laboratory":`Лаборатория химии`},mu=new Map;function hu(){return mu.get(T())??new Map}async function gu(e,t){if(mu.has(t))return;let r=c(t,`drop-rates.json`);if(r===null)return;let i;try{let e=await fetch(n(r));if(!e.ok)return;i=await e.json()}catch{return}let a=new Map;for(let t of e)a.set(t.sourceId,{sourceTitle:t.sourceTitle,location:t.location??``});let o=new Map,s=new Map;for(let e of i){let t=e.containerName??e.sourceTitle;if(!t)continue;let n=a.get(e.sourceId);if(!n)continue;let r=t.toLowerCase(),i=o.get(r)??t;o.has(r)||o.set(r,i);let c={sourceTitle:n.sourceTitle,location:n.location,sourceTitleEN:e.sourceTitle},l=s.get(i);l?l.push(c):s.set(i,[c])}mu.set(t,s)}function _u(e,t){let n=e.match(/⚠️️?\s*/u);if(n&&n.index!==void 0){let r=e.slice(0,n.index),i=e.slice(n.index+n[0].length);return`${r?vu(r,t):``}<span class="detective-warn" role="note"><span class="detective-warn__icon" aria-hidden="true">⚠️</span><span class="detective-warn__text">${vu(i,t)}</span></span>`}return vu(e,t)}function vu(t,n){let{text:r,combos:i}=tu(t),a=new Set(n.items.map(e=>e.toLowerCase())),o=new Set([...n.containers.keys()].map(e=>e.toLowerCase())),s=new Set(Object.keys(lu).map(e=>e.toLowerCase())),c=[];for(let e of n.items){if(s.has(e.toLowerCase()))continue;c.push({kind:`item`,surface:e,canonical:e});let t=N(e);t.toLowerCase()!==e.toLowerCase()&&c.push({kind:`item`,surface:t,canonical:e})}for(let[e,t]of Object.entries(lu))e.length>=2&&a.has(t.toLowerCase())&&c.push({kind:`item`,surface:e,canonical:t});for(let e of n.containers.keys())a.has(e.toLowerCase())||c.push({kind:`container`,surface:e,canonical:e});for(let[e]of hu().entries())a.has(e.toLowerCase())||c.push({kind:`container`,surface:e,canonical:e});let l=new Set(n.locations.map(e=>e.toLowerCase()));for(let e of n.locations){let t=e.toLowerCase();if(a.has(t)||o.has(t))continue;c.push({kind:`location`,surface:e,canonical:e});let n=N(e);n.toLowerCase()!==t&&c.push({kind:`location`,surface:n,canonical:e})}for(let[e,t]of Object.entries(fu))e.length>=2&&l.has(t.toLowerCase())&&c.push({kind:`location`,surface:e,canonical:t});for(let[e,t]of Object.entries(pu))e.length>=2&&l.has(t.toLowerCase())&&c.push({kind:`location`,surface:e,canonical:t});for(let[e,t]of Object.entries(uu))e.length>=2&&c.push({kind:`section`,surface:e,canonical:t});for(let e of du)c.push({kind:`rule`,surface:e,canonical:e});c.sort((e,t)=>t.surface.length-e.surface.length);let u=new Set,d=[];for(let e of c){let t=e.surface.toLowerCase();u.has(t)||(u.add(t),d.push(e))}let f;if(d.length===0)f=e(r);else{let t=d.map(e=>Cu(e.surface)).join(`|`),i=RegExp(`(?<![\\p{L}\\p{N}])(${t})(?![\\p{L}\\p{N}])`,`giu`),a=``,o=0;for(let t of r.matchAll(i)){if(t.index===void 0)continue;a+=e(r.slice(o,t.index));let i=t[1]??t[0],s=d.find(e=>e.surface.toLowerCase()===i.toLowerCase());if(!s){a+=e(i),o=t.index+i.length;continue}if(s.kind===`container`){let e=yu(r.slice(t.index+i.length),d),o=n.containers.get(s.canonical),c=o??hu().get(s.canonical)??[],l=e?c.find(t=>t.location.toLowerCase()===e.toLowerCase()):void 0,u=o?s.canonical:c[0]?.sourceTitle??s.canonical,f=l?l.sourceTitle:u,p=l?l.sourceTitleEN:c[0]?.sourceTitleEN;a+=xu(i,f,p)}else a+=bu(s,i);o=t.index+i.length}a+=e(r.slice(o)),f=a}return _a(nu(f,i))}function yu(e,t){let n=/^\s*(?:→|➔|➡|->)\s*(.+)$/u.exec(e);if(!n)return null;let r=n[1]??``,i=t.filter(e=>e.kind===`location`).slice().sort((e,t)=>t.surface.length-e.surface.length);for(let e of i)if(r.toLowerCase().startsWith(e.surface.toLowerCase()))return e.canonical;return null}function bu(t,n){let r=e(n),i=e(t.canonical);return t.kind===`rule`?`<span class="detective-rule" tabindex="0" role="note" aria-label="${r}"><span class="detective-rule__surface">${r}</span><span class="detective-rule__pop no-time-chip" role="tooltip">${e(E(`detective.rule.r43.body`))}</span></span>`:t.kind===`location`?`<button type="button" class="detective-location-link" data-jump-to-items-search="${i}" data-jump-mode="locations">${r}</button>`:t.kind===`section`?`<a href="${i}" class="detective-section-link">${r}</a>`:`<button type="button" class="detective-item-link" data-item-name="${i}">${r}</button>`}function xu(t,n,r){let i=r?` data-jump-search-en="${e(r)}"`:``;return`<button type="button" class="detective-container-link" data-jump-to-items-search="${e(n)}"${i}>${e(t)}</button>`}function Su(e,t){let n=new Set(e.items.filter(e=>e.placeholder!==!0).map(e=>e.name));for(let e of t)for(let t of e.drops)n.add(t.itemName);let r=new Set(e.locations);for(let e of t)e.location&&r.add(e.location);let i=new Map,a=new Map;for(let e of t){let t=e.containerName??e.sourceTitle;if(!t)continue;let n=t.toLowerCase(),r=a.get(n)??t;a.has(n)||a.set(n,r);let o={sourceTitle:e.sourceTitle,location:e.location??``},s=i.get(r);s?s.push(o):i.set(r,[o])}return{items:Xl([...n]),locations:Xl([...r]),containers:i}}function Cu(e){return e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`)}var wu={violet:{border:`border-l-violet-500`,text:`text-violet-300`,bg:`bg-violet-500/10`,ring:`ring-violet-500/30`,chipBg:`bg-violet-500/15`,chipBorder:`border-violet-500/60`},slate:{border:`border-l-slate-400`,text:`text-slate-300`,bg:`bg-slate-500/10`,ring:`ring-slate-400/30`,chipBg:`bg-slate-500/15`,chipBorder:`border-slate-400/60`},teal:{border:`border-l-teal-400`,text:`text-teal-300`,bg:`bg-teal-500/10`,ring:`ring-teal-400/30`,chipBg:`bg-teal-500/15`,chipBorder:`border-teal-400/60`},amber:{border:`border-l-amber-400`,text:`text-amber-300`,bg:`bg-amber-500/10`,ring:`ring-amber-400/30`,chipBg:`bg-amber-500/15`,chipBorder:`border-amber-400/60`},rose:{border:`border-l-rose-500`,text:`text-rose-300`,bg:`bg-rose-500/10`,ring:`ring-rose-500/30`,chipBg:`bg-rose-500/15`,chipBorder:`border-rose-500/60`},emerald:{border:`border-l-emerald-400`,text:`text-emerald-300`,bg:`bg-emerald-500/10`,ring:`ring-emerald-400/30`,chipBg:`bg-emerald-500/15`,chipBorder:`border-emerald-400/60`}},Tu={violet:`#a78bfa`,slate:`#94a3b8`,teal:`#2dd4bf`,amber:`#fbbf24`,rose:`#fb7185`,emerald:`#34d399`},Eu=`free-time`,Du={dispose(){}};async function Ou(){let t=document.getElementById(`detective`);if(!t)return Du;let n=!1,r=null,i=()=>{n||(n=!0,r?.())},a,o,c,l;try{[a,o,c,l]=await Promise.all([z(),V(),B(),cu()]),s(T())&&await gu(o,T())}catch(e){return n?Du:(t.innerHTML=W(`detective`,e),{dispose:i})}if(n)return Du;let u=a.detectiveProtocol,d=Su(a,o),f=ad(window.location.hash,u.phases)??Eu,p=D(`detective`);t.innerHTML=`
    ${G({num:p.num,title:p.label,summary:u.intro||p.summary})}

    <p class="hazard-card__testing-notice mt-4">${e(E(`detective.notice.timings`))}</p>

    <p class="hazard-card__testing-notice hazard-card__testing-notice--info mt-4">${e(E(`detective.notice.guidance`))}</p>

    <nav class="detective-chips" role="tablist" aria-label="${e(E(`detective.chips.aria`))}">
      ${u.phases.map(e=>Bu(e,e.id===f)).join(``)}
    </nav>

    <div class="detective-panels mt-4">
      ${u.phases.map(e=>Vu(e,e.id===f,d)).join(``)}
    </div>

    ${ju(a.detectiveEvidence,c)}
    ${Ru(a.monokumaEvents)}
    ${zu(l)}
    <div class="section-videos" data-videos-host></div>
  `,Pa(t,`detective`);let m=t.querySelector(`.detective-panel[data-phase="trial"]`);if(m){let e=document.createElement(`div`);e.className=`section-videos section-videos--chapter`,m.append(e),Na(e,`detective-basics`,`class-trial`)}return ba(),t.dataset.lightboxWired||(xa(t),t.dataset.lightboxWired=`true`),nd(t,l),r=rd(t),td(t),vc(t),{dispose:i}}var ku={"blood-puddle":`Лужа_крови`,"trace-bomb":`След_взрыва`,"trace-molotov":`Коктейль Молотова`,"trace-explosive-trap":`След_взрыва`,"trace-electric-trap":`Электрошоковая ловушка`,"trace-poison-trap":`Ловушка с ядовитым газом`,"trace-somnus-gas":`Сомнус-граната`,fingerprint:`Отпечаток_пальцев`,"bloody-fingerprint":`Отпечаток_пальцев`,"fingerprint-profile":`Профиль_отпечатка_пальцев`,"footprint-profile":`Профиль_следа_от_обуви`,"bloody-footprint":`Профиль_следа_от_обуви`};function Au(e,t){return _c({image:e,caption:`${t} — ${E(`detective.evidence.shotCaption`)}`,zoomLabel:E(`detective.evidence.shotZoom`)+t,buttonClass:`detective-evidence__shot`,toggleLabel:E(`detective.evidence.shotToggle`)})}function ju(t,n){if(!t||t.length===0)return``;let r=t.map(t=>{let r=ku[t.id],i=r?`<img src="${M(r,n)}" alt="" loading="lazy" class="detective-evidence__icon" data-fallback="remove" />`:``;return`
      <article class="detective-evidence__card" id="evidence-${e(t.id)}">
        <header class="detective-evidence__head">
          ${i}
          <h4 class="detective-evidence__name">${e(t.name)}</h4>
        </header>
        <p class="detective-evidence__desc">${e(t.description)}</p>
        ${Au(t.image,t.name)}
      </article>`}).join(``),i=t.map(e=>e.name).join(` · `);return`
    <details class="detective-evidence hazard-card hazard-card--evidence mt-8">
      ${Y({variant:`evidence`,icon:Gi,title:E(`detective.evidence.title`),subtitle:i,count:String(t.length)})}
      <div class="detective-evidence__grid">${r}</div>
    </details>
  `}var Mu=e=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`,Nu=Mu(`<path d="M3 11l14-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/><path d="M20.7 8a5 5 0 0 1 0 8"/>`),Pu={masquerade:Mu(`<path d="M2 10c0-2.2 2.2-4 5-4 2 0 3.2 1 5 1s3-1 5-1c2.8 0 5 1.8 5 4 0 3.8-3 7-5.5 7-1.8 0-2.7-1.5-4.5-1.5S9.3 17 7.5 17C5 17 2 13.8 2 10z"/><circle cx="8.5" cy="10.5" r="1.3"/><circle cx="15.5" cy="10.5" r="1.3"/>`),blackout:Mu(`<path d="M12 3a6 6 0 0 0-4.2 10.3c.7.6 1.2 1.4 1.2 2.2h6c0-.8.5-1.6 1.2-2.2A6 6 0 0 0 12 3z"/><path d="M9.5 18.5h5"/><path d="M10.5 21h3"/><path d="M4 4l16 16"/>`),teleport:Mu(`<path d="M16 3h5v5"/><path d="M21 3l-7.5 7.5"/><path d="M8 21H3v-5"/><path d="M3 21l7.5-7.5"/><path d="M3 8V3h5"/><path d="M21 16v5h-5"/>`),"despair-roulette":Mu(`<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="6.2" r="1.4"/><circle cx="17" cy="9.1" r="1.4"/><circle cx="17" cy="14.9" r="1.4"/><circle cx="12" cy="17.8" r="1.4"/><circle cx="7" cy="14.9" r="1.4"/><circle cx="7" cy="9.1" r="1.4"/>`)};function Fu(t){let r=t.spots;if(!r||r.length===0)return``;let i=r.reduce((e,t)=>e+t.images.length,0),a=r.map(t=>`
        <div class="detective-teleport__floor">
          <h5 class="detective-teleport__floor-title">${e(t.floor)}</h5>
          <div class="detective-teleport__grid">
            ${t.images.map(t=>`
              <figure class="detective-teleport__fig">
                <button
                  type="button"
                  class="detective-teleport__zoom"
                  data-gif-expand
                  data-gif-src="${n(t.src)}"
                  data-gif-alt="${e(t.caption)}"
                  data-gif-code="${e(t.caption)}"
                  aria-label="${e(E(`detective.monokuma.spotsZoom`)+t.caption)}">
                  <img src="${n(t.src)}" alt="${e(t.caption)}" loading="lazy" decoding="async" data-fallback="remove" />
                </button>
                <figcaption>${e(t.caption)}</figcaption>
              </figure>`).join(``)}
          </div>
        </div>`).join(``);return`
    <details class="detective-teleport mt-3">
      <summary class="detective-teleport__summary">${e(E(`detective.monokuma.spotsTitle`))} <span class="detective-teleport__count">${i}</span></summary>
      <div class="detective-teleport__body">${a}</div>
    </details>`}function Iu(t){let n=t.sections;return!n||n.length===0?``:n.map(t=>{let n=t.ordered?`ol`:`ul`,r=t.items.map(t=>`<li>${e(t)}</li>`).join(``);return`
        <div class="detective-monokuma__section">
          <p class="detective-monokuma__section-title">${e(t.title)}</p>
          <${n} class="detective-monokuma__section-list detective-monokuma__section-list--${t.ordered?`ordered`:`bullet`}">${r}</${n}>
        </div>`}).join(``)}function Lu(t){let r=t.gallery;if(!r||r.images.length===0)return``;let i=r.images.map(t=>`
      <figure class="detective-teleport__fig">
        <button
          type="button"
          class="detective-teleport__zoom"
          data-gif-expand
          data-gif-src="${n(t.src)}"
          data-gif-alt="${e(t.caption)}"
          data-gif-code="${e(t.caption)}"
          aria-label="${e(E(`detective.monokuma.spotsZoom`)+t.caption)}">
          <img src="${n(t.src)}" alt="${e(t.caption)}" loading="lazy" decoding="async" data-fallback="remove" />
        </button>
        <figcaption>${e(t.caption)}</figcaption>
      </figure>`).join(``);return`
    <details class="detective-teleport mt-3">
      <summary class="detective-teleport__summary">${e(r.title)} <span class="detective-teleport__count">${r.images.length}</span></summary>
      <div class="detective-teleport__body">
        <div class="detective-teleport__grid">${i}</div>
      </div>
    </details>`}function Ru(t){if(!t||t.events.length===0)return``;let n=t.events.map(t=>{let n=Pu[t.id],r=n?`<span class="detective-monokuma__icon" aria-hidden="true">${n}</span>`:``;return`
      <article class="detective-evidence__card" id="monokuma-${e(t.id)}">
        <header class="detective-evidence__head">
          ${r}
          <h4 class="detective-evidence__name">${e(t.name)}</h4>
        </header>
        <p class="detective-evidence__desc">${e(t.description)}</p>
        ${t.note?`<p class="detective-monokuma__note">${e(t.note)}</p>`:``}
        ${Iu(t)}
        ${Fu(t)}
        ${Lu(t)}
      </article>`}).join(``),r=t.tips.map(t=>`<li>${e(t)}</li>`).join(``),i=t.broadcasts&&t.broadcasts.length>0?`
      <details class="detective-monokuma__broadcasts mt-2">
        <summary>${e(E(`detective.monokuma.broadcastsTitle`))}</summary>
        <ul>${t.broadcasts.map(t=>`<li>${e(t)}</li>`).join(``)}</ul>
      </details>`:``,a=t.events.map(e=>e.name).join(` · `);return`
    <details class="detective-evidence hazard-card hazard-card--monokuma mt-8">
      ${Y({variant:`monokuma`,icon:Nu,title:E(`detective.monokuma.title`),subtitle:a,count:String(t.events.length)})}
      <div class="detective-evidence__grid">${n}</div>
      <div class="detective-monokuma__tips">
        <p class="detective-monokuma__tips-title">${e(E(`detective.monokuma.tipsTitle`))}</p>
        <ul>${r}</ul>
        ${i}
      </div>
    </details>
  `}function zu(t){return`
    <section class="detective-notebook mt-8" aria-labelledby="detective-notebook-heading">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 id="detective-notebook-heading" class="text-sm font-semibold text-ink uppercase tracking-wider">
            <span aria-hidden="true">📓</span> ${e(E(`detective.notebook.heading`))}
          </h3>
          <p class="text-xs text-dim mt-1">${e(E(`detective.notebook.instructions`))}</p>
        </div>
        <button
          type="button"
          id="detective-copy-btn"
          class="detective-copy-btn"
          data-state="idle"
          aria-label="${e(E(`detective.notebook.copyAria`))}">
          <span class="detective-copy-btn__label">${e(E(`detective.notebook.copyIdle`))}</span>
        </button>
      </div>
      <p class="detective-notebook__preface text-sm text-mute mb-3">
        ${e(E(`detective.notebook.preface`))}
      </p>
      <pre class="detective-notebook__paper" id="detective-notebook-text">${e(t)}</pre>
    </section>
  `}function Bu(t,n){let r=wu[t.accent],i=t.mascot,a=i?mn(i.name,i.talent,i.game,`ico`):null,o=a?`<img src="${e(a)}" alt="" loading="lazy" class="detective-chip__ico" />`:`<span class="detective-chip__icon" aria-hidden="true">${e(t.icon)}</span>`;return`
    <button
      type="button"
      class="detective-chip ${n?`is-active`:``} ${r.chipBg} ${r.chipBorder}"
      role="tab"
      aria-selected="${n?`true`:`false`}"
      aria-controls="detective-panel-${e(t.id)}"
      data-phase="${e(t.id)}">
      ${o}
      <span class="detective-chip__label">
        <span class="detective-chip__title ${r.text}">${e(t.title)}</span>
        <span class="detective-chip__count">${t.items.length} ${jn(t.items.length,{one:E(`detective.chip.itemsOne`),few:E(`detective.chip.itemsFew`),many:E(`detective.chip.itemsMany`)})}</span>
      </span>
    </button>
  `}function Vu(t,n,r){let i=wu[t.accent],a=Tu[t.accent];return`
    <article
      id="detective-panel-${e(t.id)}"
      class="detective-panel bg-card border border-line border-l-4 ${i.border} rounded p-4 ${n?`is-entering`:`hidden`}"
      role="tabpanel"
      aria-labelledby="chip-${e(t.id)}"
      data-phase="${e(t.id)}"
      style="--phase-accent: ${a}">
      ${Hu(t,i)}
      ${t.mascot?Uu(t.mascot,i):``}
      <ul class="detective-bullets mt-4">
        ${t.items.map((e,n)=>Gu(e,t.accent,i,r,n)).join(``)}
      </ul>
    </article>
  `}function Hu(t,n){let r=t.subtitle?`<p class="text-xs text-dim mt-1">${e(t.subtitle)}</p>`:``;return`
    <header class="flex items-start gap-3">
      <span class="inline-flex items-center justify-center w-9 h-9 rounded ${n.bg} ring-1 ${n.ring} text-lg shrink-0" aria-hidden="true">${e(t.icon)}</span>
      <div class="min-w-0">
        <h3 class="text-sm font-semibold ${n.text} uppercase tracking-wider">${e(t.title)}</h3>
        ${r}
      </div>
    </header>
  `}function Uu(t,n){let r=t.pose??`sprite_1`,i=gn(t.name,t.talent,t.game,r);if(!i)return``;let a=Wu(r),o=su(ou(t.name,t.talent,t.game,r));return`
    <aside class="detective-mascot mt-4">
      <div class="detective-mascot__sprite" data-crop="${a}">
        <img class="detective-mascot__sprite-img" src="${e(i)}" alt="${e(t.name)}" loading="lazy"${o} />
      </div>
      <div class="detective-mascot__bubble ${n.bg} ring-1 ${n.ring}">
        <div class="detective-mascot__name ${n.text}">${e(N(t.name))}</div>
        <p class="detective-mascot__line">«${e(t.tagline)}»</p>
      </div>
    </aside>
  `}function Wu(e){return e?.startsWith(`spriteico`)?`head`:`full`}function Gu(e,t,n,r,i){if(e.speaker)return`<li class="detective-bullets__entry" style="--enter-index: ${i}">${Ju(e,t,r)}</li>`;let a=e.subItems?.length?`<ul class="detective-subitems">
         ${e.subItems.map(e=>`<li>${Ku(e,r)}</li>`).join(``)}
       </ul>`:``;return`
    <li class="detective-bullet" style="--enter-index: ${i}">
      <div class="detective-bullet__body min-w-0">
        <div>${_u(e.text,r)}</div>
        ${a}
        ${qu(e.detail)}
      </div>
    </li>
  `}function Ku(e,t){return typeof e==`string`?_u(e,t):`
    <details class="detective-detail detective-detail--inline">
      <summary class="detective-detail__summary">${_u(e.text,t)}</summary>
      <div class="detective-detail__body">
        <ul class="detective-subitems detective-subitems--nested">
          ${e.subItems.map(e=>`<li>${_u(e,t)}</li>`).join(``)}
        </ul>
      </div>
    </details>`}function qu(t){if(!t)return``;let r=``;if(t.video){let e=t.video.poster?` poster="${n(t.video.poster)}"`:``;r+=`<video class="detective-detail__video" controls preload="none"${e}><source src="${n(t.video.src)}" type="video/mp4" /></video>`}if(t.images&&t.images.length>0){let i=t.images.length>1?` detective-detail__gallery--tiles`:``;r+=`<div class="detective-detail__gallery${i}">${t.images.map(t=>`
      <figure class="detective-detail__fig">
        <button
          type="button"
          class="detective-detail__zoom"
          data-gif-expand
          data-gif-src="${n(t.src)}"
          data-gif-alt="${e(t.caption??``)}"
          data-gif-code="${e(t.caption??``)}"
          aria-label="${e(E(`detective.monokuma.spotsZoom`)+(t.caption??``))}">
          <img src="${n(t.src)}" alt="${e(t.caption??``)}" loading="lazy" decoding="async" data-fallback="remove" />
        </button>
        ${t.caption?`<figcaption>${e(t.caption)}</figcaption>`:``}
      </figure>`).join(``)}</div>`}return t.spawnGrid&&t.spawnGrid.length>0&&(r+=`<div class="detective-detail__spawngrid">${t.spawnGrid.map(t=>`
      <article class="detective-spawn">
        ${t.image?`<img class="detective-spawn__img" src="${n(encodeURI(t.image))}" alt="${e(t.container??t.item)}" loading="lazy" decoding="async" data-fallback="remove" />`:``}
        <div class="detective-spawn__body">
          <span class="detective-spawn__item">${e(t.item)}</span>
          <span class="detective-spawn__rate">${e(t.rate)}</span>
          ${t.container?`<span class="detective-spawn__where">${e(t.container)}${t.location?` · ${e(t.location)}`:``}</span>`:``}
        </div>
      </article>`).join(``)}</div>`),`
    <details class="detective-detail mt-2">
      <summary class="detective-detail__summary">${e(t.toggleLabel)}</summary>
      <div class="detective-detail__body">${r}</div>
    </details>`}function Ju(t,n,r){let i=t.speaker,a=i.pose??`sprite_1`,o=gn(i.name,i.talent,i.game,a),s=i.side??`left`,c=i.mood??`normal`,l=Wu(a),u=wu[n],d=c===`objection`?`<span class="detective-dialogue__shout">${e(E(`detective.dialogue.objection`))}</span>`:c===`argue`?`<span class="detective-dialogue__shout detective-dialogue__shout--soft">${e(E(`detective.dialogue.important`))}</span>`:``,f=su(ou(i.name,i.talent,i.game,a)),p=o?`<div class="detective-dialogue__sprite" data-crop="${l}"><img class="detective-dialogue__sprite-img" src="${e(o)}" alt="${e(i.name)}" loading="lazy"${f} /></div>`:`<div class="detective-dialogue__sprite detective-dialogue__sprite--missing" aria-hidden="true"></div>`;return`
    <div class="detective-dialogue" data-side="${e(s)}" data-mood="${e(c)}">
      ${p}
      <div class="detective-dialogue__bubble ${u.bg}">
        <div class="detective-dialogue__name ${u.text}">
          ${e(N(i.name))}
          ${d}
        </div>
        <p class="detective-dialogue__text">«${_u(t.text,r)}»</p>
      </div>
    </div>
  `}var Yu=`trace-somnus-gas`,Xu=mn(`Кёко Киригири`,`Абсолютный детектив`,`Danganronpa: Trigger Happy Havoc`,`pixel`),Zu=2e3,Qu=10,$u=7e3;function ed(){if(document.querySelector(`.arkplague-reveal`))return;let t=document.createElement(`div`);t.className=`arkplague-reveal`,t.setAttribute(`role`,`dialog`),t.setAttribute(`aria-label`,`arkplague`),t.innerHTML=`
    <div class="arkplague-reveal__print" aria-hidden="true"></div>
    ${Xu?`<img class="arkplague-reveal__figure" src="${e(Xu)}" alt="" aria-hidden="true" data-fallback="remove" />`:``}
    <div class="arkplague-reveal__card">
      <div class="arkplague-reveal__match">${e(E(`detective.egg.ark.match`))}</div>
      <div class="arkplague-reveal__name">arkplague</div>
      <p class="arkplague-reveal__line">${e(E(`detective.egg.ark.line`))}</p>
    </div>
  `;let n=e=>{e.key===`Escape`&&i()},r=0;function i(){window.clearTimeout(r),window.removeEventListener(`keydown`,n),t.remove()}t.addEventListener(`click`,i),window.addEventListener(`keydown`,n),r=window.setTimeout(i,$u),document.body.appendChild(t)}function td(e){let t=e.querySelector(`#evidence-${Yu} .detective-evidence__head`);if(!t)return;t.dataset.arkEgg=`on`,t.style.setProperty(`--ark-press-ms`,`${Zu}ms`);let n=iu({durationMs:Zu,tolerancePx:Qu,shouldFire:()=>t.isConnected,onPressingChange:e=>{if(e){t.dataset.arkPress=`on`;return}delete t.dataset.arkPress,r=null},onComplete:ed}),r=null;t.addEventListener(`pointerdown`,e=>{if(!(e.pointerType===`mouse`&&e.button!==0)&&r===null){r=e.pointerId;try{t.setPointerCapture(e.pointerId)}catch{}n.start(e.clientX,e.clientY)}}),t.addEventListener(`pointermove`,e=>{e.pointerId===r&&n.move(e.clientX,e.clientY)},{passive:!0});let i=e=>{e.pointerId===r&&n.cancel()};t.addEventListener(`pointerup`,i),t.addEventListener(`pointercancel`,i),t.addEventListener(`click`,e=>{n.consumeClick()&&(e.preventDefault(),e.stopPropagation())},!0)}function nd(e,t){let n=e.querySelector(`#detective-copy-btn`),r=n?.querySelector(`.detective-copy-btn__label`);if(!n||!r)return;let i=null;n.addEventListener(`click`,async()=>{i&&clearTimeout(i);let e=await od(t);n.dataset.state=e?`success`:`error`,r.textContent=E(e?`detective.notebook.copyDone`:`detective.notebook.copyError`),i=setTimeout(()=>{n.dataset.state=`idle`,r.textContent=E(`detective.notebook.copyIdle`),i=null},1800)})}function rd(e){let t=e.querySelectorAll(`.detective-chip`),n=e.querySelectorAll(`.detective-panel`);function r(e){t.forEach(t=>{let n=t.dataset.phase===e;t.classList.toggle(`is-active`,n),t.setAttribute(`aria-selected`,n?`true`:`false`)}),n.forEach(t=>{let n=t.dataset.phase===e;t.classList.toggle(`hidden`,!n),n?(t.classList.remove(`is-entering`),t.offsetWidth,t.classList.add(`is-entering`)):t.classList.remove(`is-entering`)})}t.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.phase;if(!t)return;r(t);let n=`#detective:${t}`;window.location.hash!==n&&history.replaceState(history.state,``,`${location.pathname}${location.search}${n}`)})});let i=()=>{let e=ad(window.location.hash,id(n));e&&r(e)};return window.addEventListener(`hashchange`,i),()=>{window.removeEventListener(`hashchange`,i)}}function id(e){return Array.from(e).map(e=>e.dataset.phase).filter(e=>!!e).map(e=>({id:e}))}function ad(e,t){let n=e.match(/^#detective:([\w-]+)$/)?.[1];return n&&t.some(e=>e.id===n)?n:null}async function od(e){if(typeof navigator<`u`&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(e),!0}catch{}try{let t=document.createElement(`textarea`);t.value=e,t.setAttribute(`readonly`,``),t.style.position=`absolute`,t.style.left=`-9999px`,document.body.appendChild(t),t.select();let n=document.execCommand(`copy`);return document.body.removeChild(t),n}catch{return!1}}var sd=`xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"`,cd={speed:`<path d="m5 7 5 5-5 5"/><path d="m11 7 5 5-5 5"/>`,capacity:`<path d="M6 9V7a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M5 9h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M9 13h6"/>`,attention:`<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>`,sleep:`<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>`,hunger:`<path d="M7 3v8a2 2 0 0 0 2 2v8"/><path d="M11 3v6"/><path d="M5 3v6"/><path d="M17 3c-1.5 0-3 2-3 5s1.5 4 3 4v9"/>`,needs:`<path d="M12 21s-7-4.5-9.5-9.5a5 5 0 0 1 9.5-2 5 5 0 0 1 9.5 2C19 16.5 12 21 12 21z"/>`,resistance:`<path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6z"/>`,stamina:`<path d="m13 2-9 13h7l-1 7 9-13h-7z"/>`,lockpick:`<circle cx="8" cy="15" r="4"/><path d="m11 12 10-10"/><path d="m17 6 3 3"/><path d="m14 9 3 3"/>`,metabolism:`<path d="M4 20c0-9 7-16 16-16 0 12-7 17-13 17a8 8 0 0 1-3-1z"/><path d="M4 20 14 10"/>`,default:`<circle cx="12" cy="12" r="2.5"/>`},ld=[{type:`needs`,re:/^Сон\s+и\s+голод/i},{type:`needs`,re:/^Sleep\s+and\s+hunger/i},{type:`needs`,re:/^Сон\s+на\s+\d+%?,\s*голод/i},{type:`needs`,re:/^Все\s+(нужды|потребности)/i},{type:`needs`,re:/^All\s+needs/i},{type:`speed`,re:/^Скорость\s+бега/i},{type:`speed`,re:/^Run\s+speed/i},{type:`capacity`,re:/^Вместимость/i},{type:`capacity`,re:/^Capacity/i},{type:`attention`,re:/^Внимательность/i},{type:`attention`,re:/^Perception/i},{type:`sleep`,re:/^Сон(?=\s|$)/i},{type:`sleep`,re:/^Sleep(?=\s|$)/i},{type:`hunger`,re:/^Голод/i},{type:`hunger`,re:/^Hunger/i},{type:`resistance`,re:/^Сопротивление/i},{type:`resistance`,re:/resistance/i},{type:`stamina`,re:/^Расход\s+выносливости/i},{type:`stamina`,re:/^Stamina/i},{type:`lockpick`,re:/^Облегч[её]нный\s+взлом/i},{type:`lockpick`,re:/lock-?pick/i},{type:`metabolism`,re:/^Пища\s+не\s+требуется/i},{type:`metabolism`,re:/^No\s+food\s+required/i},{type:`metabolism`,re:/метаболизм/i},{type:`metabolism`,re:/metabolism/i},{type:`needs`,re:/\bHP\b/i},{type:`resistance`,re:/^\d+\s*ед\.?$/i},{type:`resistance`,re:/^\d+\s*units?\b/i}],ud=new Set(Object.keys(cd));function dd(e){return e!==void 0&&ud.has(e)}function fd(e,t){if(dd(e))return e;let n=(t??``).trim();if(!n)return`default`;for(let{type:e,re:t}of ld)if(t.test(n))return e;return`default`}function pd(e){return`<svg ${sd}>${cd[e]}</svg>`}function md(e,t){let n=fd(e,t);return`<span class="attr-icon attr-icon--${n}" aria-hidden="true">${pd(n)}</span>`}async function hd(){let e=document.getElementById(`cast`);if(!e)return;let t,n;try{let[e,r]=await Promise.all([z(),B()]);n=r,t=e.cast??[]}catch(t){e.innerHTML=W(`cast`,t);return}let r=t.reduce((e,t)=>e+t.characters.length,0),i=D(`cast`),a=`${r} ${E(`cast.summary.charactersOf`)} ${E(`cast.summary.clickHint`)}`;e.innerHTML=`
    ${G({num:i.num,title:i.label,summary:a})}
    <div class="space-y-4">
      ${t.map((e,t)=>_d(e,t,n)).join(``)}
    </div>
  `,vc(e)}var gd={"Danganronpa: Trigger Happy Havoc":`#5b6cff`,"Danganronpa 2: Goodbye Despair":`#c2536b`,"Danganronpa Zero":`#c9893f`,"Danganronpa V3: Killing Harmony":`#3fa98c`,"Ultra Despair Girls":`#c2569f`};function _d(t,n,r){let i=n===0?` open`:``,a=`${t.characters.length} ${e(E(`cast.group.countSuffix`))}`;return`
    <details class="hazard-card hazard-card--evidence cast-group" style="--category-accent:${gd[t.game]??`var(--color-accent)`}"${i}>
      <summary class="hazard-card__summary hazard-card__summary--evidence cast-group__summary">
        <span class="cast-group__bar" aria-hidden="true"></span>
        <span class="cast-group__name">${e(t.game)}</span>
        <span class="hazard-card__count">${a}</span>
      </summary>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3 p-4">
        ${t.characters.map(e=>vd(e,t.game,r)).join(``)}
      </div>
    </details>
  `}function vd(t,n,r){let i=t.features.map(t=>`
      <li class="character-feature flex flex-col">
        <span class="character-feature__label text-[10px] uppercase tracking-wider text-dim">${md(t.kind,t.value)}${e(t.label||`—`)}</span>
        <span class="text-xs text-mute">${e(t.value)}</span>
      </li>`).join(``),a=t.startingItems&&t.startingItems.length?`
      <div class="mt-3 pt-3 border-t border-line">
        <div class="text-[10px] uppercase tracking-wider text-dim mb-1.5">${e(E(`cast.startingItems`))}</div>
        <div class="flex flex-wrap gap-1.5">
          ${t.startingItems.map(e=>yd(e,r)).join(``)}
        </div>
      </div>`:``,o=mn(t.name,t.talent,n),s=o?`
      <div class="roster-card__portrait">
        <img src="${o}" alt="${e(t.name)}" loading="lazy"
             class="roster-card__portrait-img"
             data-fallback="remove-parent" />
      </div>`:``;return`
    <article class="character-card rounded border border-line bg-card overflow-hidden flex flex-col scroll-mt-24"
             data-character-id="${e(hn(t.name,t.talent))}">
      ${s}
      <div class="p-4 flex-1 flex flex-col">
        <header class="mb-2">
          <h4 class="text-sm font-medium text-ink">${e(N(t.name))}</h4>
          <p class="text-xs text-accent mt-0.5">${e(N(t.talent))}</p>
        </header>
        ${t.description?`<p class="text-xs text-mute italic mb-3">${e(t.description)}</p>`:``}
        <ul class="grid grid-cols-1 gap-y-1.5">${i}</ul>
        ${a}
      </div>
    </article>
  `}function yd(t,n){let r=t.name.slice(0,3),i=e(N(t.name)),a=t.qty===void 0?``:`<span class="tabular-nums text-dim">×${t.qty}</span>`;return Mo({chipClass:`roster-starting-item`,itemName:t.name,title:`${E(`cast.item.openPrefix`)}«${N(t.name)}»${E(`cast.item.openSuffix`)}`,icon:{url:M(t.name,n),alt:r,className:`roster-starting-item__icon`,fallbackClass:`roster-starting-item__icon roster-starting-item__icon--fallback`,fallbackText:r},nameHtml:`<span>${i}</span>`,qtyHtml:a})}var bd=`achievements.json`,xd=new Map;function Sd(e){let t=xd.get(e);return t||(t=Cd(e).catch(t=>{throw xd.delete(e),t}),xd.set(e,t)),t}async function Cd(e){let t=await wd(n(`data/${bd}`)),r=c(e,bd);if(r===null)return t;try{let e=await wd(n(r));return Td(t,e)?e:t}catch{return t}}async function wd(e){let t=await fetch(e);if(!t.ok)throw Error(`${e} HTTP ${t.status}`);return await t.json()}function Td(e,t){let n=e=>e.categories.map(e=>`${e.id}:${e.achievements.map(e=>e.id).join(`,`)}`).join(`|`);return n(e)===n(t)}var Ed={1:`achievements.tier.1`,2:`achievements.tier.2`,3:`achievements.tier.3`,4:`achievements.tier.4`},Dd=[1,2,3,4];async function Od(){let t=document.getElementById(`achievements`);if(!t)return;let n=D(`achievements`),r;try{r=await Sd(f())}catch(e){document.body.contains(t)&&(t.innerHTML=W(`achievements`,e));return}if(!document.body.contains(t))return;let i=r.categories.flatMap(e=>e.achievements);return t.innerHTML=`
    ${G({num:n.num,title:n.label,summary:n.summary})}
    <p class="ach-intro">${e(E(`achievements.intro`))}</p>
    ${kd(i)}
    ${Ad(r.categories)}
    <div class="ach-categories">
      ${r.categories.map(jd).join(``)}
    </div>
  `,{dispose:Nd(t)}}function kd(t){let r=new Map;for(let e of t)r.set(e.tier,(r.get(e.tier)??0)+1);let i=Dd.map(t=>{let i=E(Ed[t]);return`
      <li class="ach-tiers__item">
        <img class="ach-tiers__medal"
             src="${e(n(`assets/achievements/header/md${t}.webp`))}"
             alt="${e(i)}" width="31" height="30" loading="lazy" decoding="async" data-fallback="remove" />
        <span class="ach-tiers__count">${r.get(t)??0}</span>
        <span class="ach-tiers__name">${e(i)}</span>
      </li>`}).join(``);return`
    <div class="ach-tiers">
      <p class="ach-tiers__label">
        ${e(E(`achievements.tiers.label`))}
        <span class="ach-tiers__total">${t.length} ${e(E(`achievements.count.srLabel`))}</span>
      </p>
      <ul class="ach-tiers__list">${i}</ul>
    </div>`}function Ad(t){let n=t.map(t=>`
      <button type="button" class="ach-chip" data-ach-filter="${e(t.id)}">
        ${e(t.title)}
        <span class="ach-chip__count">${t.achievements.length}</span>
      </button>`).join(``);return`
    <nav class="ach-nav" aria-label="${e(E(`achievements.nav.aria`))}">
      <p class="ach-nav__label">${e(E(`achievements.nav.label`))}</p>
      <div class="ach-nav__chips">
        <button type="button" class="ach-chip is-active" data-ach-filter="all">${e(E(`achievements.nav.all`))}</button>
        ${n}
      </div>
    </nav>`}function jd(t){return`
    <section class="ach-category" id="ach-${e(t.id)}" data-ach-category="${e(t.id)}">
      <h3 class="ach-category__title">
        ${e(t.title)}
        <span class="ach-category__count">${t.achievements.length}</span>
      </h3>
      <ul class="ach-grid">
        ${t.achievements.map(Md).join(``)}
      </ul>
    </section>`}function Md(t){let r=t.tier,i=E(Ed[r]),a=n(`assets/achievements/stages/bg${r}.webp`),o=n(`assets/achievements/stages/md${r}.webp`);return`
    <li class="ach-card" id="ach-item-${e(t.id)}" data-tier="${r}">
      <div class="ach-card__art" style="background-image:url('${e(a)}')">
        <img class="ach-card__medal" src="${e(o)}" alt="${e(i)}"
             width="130" height="130" loading="lazy" decoding="async" data-fallback="remove" />
      </div>
      <div class="ach-card__body">
        <h4 class="ach-card__name">${e(t.name)}</h4>
        <p class="ach-card__condition">
          <span class="sr-only">${e(E(`achievements.condition.srLabel`))}</span>${e(t.condition)}
        </p>
        <p class="ach-card__reward">
          <span class="ach-card__reward-amount">${t.reward}</span>
          <span class="ach-card__reward-unit">${e(E(`achievements.reward.unit`))}</span>
        </p>
      </div>
    </li>`}function Nd(e){let t=t=>{let n=t.target?.closest(`[data-ach-filter]`);if(!n)return;let r=n.dataset.achFilter;r&&(e.querySelectorAll(`[data-ach-filter]`).forEach(e=>{e.classList.toggle(`is-active`,e===n)}),e.querySelectorAll(`[data-ach-category]`).forEach(e=>{e.hidden=r!==`all`&&e.dataset.achCategory!==r}))};return e.addEventListener(`click`,t),()=>e.removeEventListener(`click`,t)}async function Pd(){return Pi(`faq`)}async function Fd(){let e=document.getElementById(`faq`);if(!e)return;let t=D(`faq`),n;try{n=await Pd()}catch(t){document.body.contains(e)&&(e.innerHTML=W(`faq`,t));return}if(!document.body.contains(e))return;e.innerHTML=`
    ${G({num:t.num,title:t.label,summary:t.summary})}
    <div class="prose-shinri faq-prose">
      ${Id()}
      <div class="faq-list">${Ld(n)}</div>
      <p class="faq-empty" role="status" hidden>${Hd(E(`faq.search.empty`))}</p>
    </div>
  `,va(e.querySelector(`.faq-prose`));let r=Ud(e),i=Rd(e);return{dispose(){r.dispose(),i()}}}function Id(){return`<div class="faq-search" role="search"><span class="faq-search__icon" aria-hidden="true">🔍</span><label class="sr-only" for="faq-search-input">${Hd(E(`faq.search.label`))}</label><input id="faq-search-input" class="faq-search__input" type="search" placeholder="${Vd(E(`faq.search.placeholder`))}" autocomplete="off" /><button type="button" class="faq-search__clear" aria-label="${Vd(E(`faq.search.clearAria`))}" hidden>×</button></div>`}function Ld(e){let t=new DOMParser().parseFromString(`<div>${e}</div>`,`text/html`).body.firstElementChild;if(!t)return e;for(let e of Array.from(t.querySelectorAll(`img`))){let t=e.getAttribute(`src`)??``;t&&!/^(?:https?:|data:|blob:)/i.test(t)&&e.setAttribute(`src`,n(t)),e.hasAttribute(`loading`)||e.setAttribute(`loading`,`lazy`),e.hasAttribute(`decoding`)||e.setAttribute(`decoding`,`async`),e.hasAttribute(`data-lightbox`)||e.setAttribute(`data-lightbox`,``)}let r=Array.from(t.children),i=new Set,a=[],o=[],s=null,c=null,l=()=>{if(!c)return;let e=c.body.map(e=>e.outerHTML).join(``),t=`<details class="faq-item" id="${Vd(c.id)}"><summary class="faq-item__summary"><span class="faq-item__q">${c.question}</span><span class="faq-item__chevron" aria-hidden="true">⌄</span></summary><div class="faq-item__body">${e}</div></details>`;s||(s={title:null,items:[]},a.push(s)),s.items.push(t),c=null};for(let e of r)if(e.tagName===`H1`)l(),s={title:e.innerHTML.trim(),items:[]},a.push(s);else if(e.tagName===`H2`){l();let t=e.innerHTML.trim();c={id:Bd(zd(e.textContent??``),i),question:t,body:[]}}else c?c.body.push(e):o.push(e);return l(),(o.length?`<div class="faq-lede">${o.map(e=>e.outerHTML).join(``)}</div>`:``)+a.map(e=>{let t=e.items.join(``);return e.title===null?t:`<section class="faq-group"><h3 class="faq-group__title">${e.title}</h3><div class="faq-group__items">${t}</div></section>`}).join(``)}function Rd(e){let t=e.querySelector(`#faq-search-input`);if(!t)return()=>{};let n=e.querySelector(`.faq-search__clear`),r=e.querySelector(`.faq-empty`),i=[...e.querySelectorAll(`.faq-item`)],a=[...e.querySelectorAll(`.faq-group`)],o=e=>e.toLowerCase().replace(/ё/g,`е`).replace(/\s+/g,` `).trim(),s=new Map;for(let e of i)s.set(e,o(e.textContent??``));let c=new AbortController,l=()=>{let e=o(t.value),c=!1;for(let t of i){let n=e===``||(s.get(t)??``).includes(e);t.hidden=!n,n&&(c=!0)}for(let e of a)e.hidden=e.querySelector(`.faq-item:not([hidden])`)===null;n&&(n.hidden=e===``),r&&(r.hidden=c||e===``)};return t.addEventListener(`input`,l,{signal:c.signal}),n?.addEventListener(`click`,()=>{t.value=``,l(),t.focus()},{signal:c.signal}),()=>c.abort()}function zd(e){return e.replace(/\s+/g,` `).trim()}function Bd(e,t){let n=`faq-`+e.toLowerCase().replace(/[«»"'`]/g,``).replace(/[^\p{L}\p{N}]+/gu,`-`).replace(/^-+|-+$/g,``).slice(0,60)||`faq-item`,r=n,i=2;for(;t.has(r);)r=`${n}-${i++}`;return t.add(r),r}function Vd(e){return e.replace(/&/g,`&amp;`).replace(/"/g,`&quot;`).replace(/</g,`&lt;`)}function Hd(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function Ud(e){let t=()=>{let t=window.location.hash;try{t=decodeURIComponent(t)}catch{}let n=t.replace(/^#/,``);if(!n.startsWith(`faq-`))return;let r=e.querySelector(`details.faq-item#${CSS.escape(n)}`);r&&!r.open&&(r.open=!0)};t(),window.addEventListener(`hashchange`,t);let n=!1;return{dispose(){n||(n=!0,window.removeEventListener(`hashchange`,t))}}}async function Wd(){let t=document.getElementById(`videos`);if(!t)return;let n;try{n=await Ea()}catch{t.innerHTML=``;return}if(!document.body.contains(t))return;let r=E(`shell.disclaimer.youtubeHref`);t.setAttribute(`aria-label`,E(`videos.strip.aria`)),t.setAttribute(`data-section-title`,E(`videos.nav.label`)),t.innerHTML=`
    <div class="video-strip__head">
      <span class="video-strip__glyph" aria-hidden="true"></span>
      <div class="video-strip__titles">
        <h2 class="video-strip__title">${e(E(`videos.strip.title`))}</h2>
        <p class="video-strip__sub">${e(E(`videos.strip.sub`))}</p>
      </div>
      <a class="video-strip__channel-btn" href="${e(r)}"
         target="_blank" rel="noopener noreferrer">${e(E(`videos.strip.channelBtn`))} →</a>
    </div>
    <div class="video-strip__carwrap">
      <button type="button" class="video-strip__nav video-strip__nav--prev"
              aria-label="${e(E(`videos.strip.prevAria`))}">‹</button>
      <button type="button" class="video-strip__nav video-strip__nav--next"
              aria-label="${e(E(`videos.strip.nextAria`))}">›</button>
      <div class="video-strip__carousel">
        ${n.map(e=>ja(e,`video-card--strip`)).join(``)}
        <a class="video-strip__endcard" href="${e(r)}"
           target="_blank" rel="noopener noreferrer">
          <span>${e(E(`videos.strip.endcard`))}</span>
          <span class="video-strip__endcard-arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  `,Ma(t),Gd(t)}function Gd(e){let t=e.querySelector(`.video-strip__carousel`);if(!t)return;let n=()=>{let e=t.querySelector(`.video-card`);return e?e.offsetWidth+14:320},r=!window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,i=e=>{t.scrollBy({left:e*n(),behavior:r?`smooth`:`auto`})};e.querySelector(`.video-strip__nav--prev`)?.addEventListener(`click`,()=>i(-1)),e.querySelector(`.video-strip__nav--next`)?.addEventListener(`click`,()=>i(1))}var Kd=new Set;function qd(e){return e&&typeof e.dispose==`function`&&Kd.add(e),e}async function $(e){qd(await e)}function Jd(){for(let e of Kd)try{e.dispose()}catch{}Kd.clear()}var Yd=document.getElementById(`app`);kr(),m(),Yd&&Se().then(async e=>{s(e)&&bn(await tr(e))}).catch(()=>{}).then(()=>{Qd(Yd)});var Xd=new Map;async function Zd(){try{let{items:e}=await pr();Xd=new Map(e.map(e=>[e._nameRU??e.name,e]))}catch{}}function Qd(e){Ue(e),$d(),ef(),nt(),it(),Et(),zt(),Kt(),Yt(),ai(),ki(),Lr(),pr().then(({items:e,iconMap:t})=>{Xd=new Map(e.map(e=>[e._nameRU??e.name,e])),wr({getItem:e=>Xd.get(e),iconMap:t})}).catch(()=>{});let t=document.getElementById(`guide-search`),n=document.getElementById(`guide-search-status`);t&&Fn(t,async()=>{let[e,t,n,r,i]=await Promise.all([z(),V(),B(),er(),ar().catch(()=>void 0)]);return Cn(e,t,n,r,i)},n),window.addEventListener(u,()=>{rf()})}function $d(){qd(Co()),qd(ko()),$(Li()),$(Wd()),$(ao()),$(Fd()),$(La()),$(ls()),$(Dc()),$(Ol()),$(Pl()),$(Ou()),$(hd()),$(Od())}function ef(){let e=tf();e&&nf(e,8e3).then(t=>{t&&tf()===e&&ct(t)})}function tf(){let e=location.hash;try{e=decodeURIComponent(e)}catch{}return e.replace(/^#/,``)}function nf(e,t){let n=()=>{let t=document.getElementById(e);return t&&t.childElementCount>0&&t.offsetHeight>40?t:null};return new Promise(r=>{let i=n();if(i){r(i);return}if(typeof MutationObserver>`u`){r(document.getElementById(e));return}let a=()=>{o.disconnect(),window.clearTimeout(s)},o=new MutationObserver(()=>{let e=n();e&&(a(),r(e))});o.observe(document.body,{childList:!0,subtree:!0});let s=window.setTimeout(()=>{a(),r(document.getElementById(e))},t)})}async function rf(){let e=window.scrollY;Jd();let t=f();try{await Promise.all([xe(t),gr(t)])}catch{}$d(),Ge(),rt(),Rr(),Zd(),window.scrollTo({top:e})}