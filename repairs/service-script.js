// Глобальный объект, который собирает данные от квиза по шагам
let quizDraftOrder = {
  clientName: "",
  clientPhone: "",
  deviceType: "",       // Запишем сюда выбранную услугу, если кликнули по каталогу
  brand: "",            // Шаг 1
  initialProblem: "",   // Шаг 2
  source: "Квиз-форма"  // Источник заявки по умолчанию
};
// Глобальный объект для сбора ответов клиента
let draftOrder = {
  initialProblem: "",
  deviceType: "",
  brand: "",
  clientName: "",
  clientPhone: ""
};

// Функция открытия/закрытия панели "Все услуги"
function toggleServicesMenu() {
  const panel = document.getElementById('services-panel');
  const icon = document.getElementById('services-icon');
  const btnText = document.getElementById('services-btn-text');
  
  panel.classList.toggle('open');
  
  if (panel.classList.contains('open')) {
    btnText.innerText = "Закрыть";
    icon.innerHTML = "✕"; // Меняем 4 кубика на крестик
    icon.style.display = "block";
  } else {
    btnText.innerText = "Все услуги";
    icon.innerHTML = "<span></span><span></span><span></span><span></span>";
    icon.style.display = "grid";
  }
}

// Переключение табов и фильтрация карточек
function filterServices(category, buttonElement) {
  const allTabs = document.querySelectorAll('.tab-btn');
  allTabs.forEach(tab => tab.classList.remove('active'));
  buttonElement.classList.add('active');

  const cards = document.querySelectorAll('.service-card');
  cards.forEach(card => {
    if (category === 'all' || card.getAttribute('data-category') === category) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

// Выбор конкретной услуги из шторки
// ОБНОВЛЕННАЯ ФУНКЦИЯ В КОРНЕВОМ SCRIPT.JS (НА ГЛАВНОЙ СТРАНИЦЕ)
function selectDeviceType(typeName) {
  // 1. Сохраняем черновик и тип техники в память браузера
  if (typeof draftOrder !== 'undefined') {
    draftOrder.deviceType = typeName;
    console.log("Черновик обновлен на главной:", draftOrder);
  }
  
  // Сохраняем маркер для автоскролла/автозапуска на новой странице
  localStorage.setItem('selectedDeviceType', typeName);

  // Закрываем меню (если функция toggleServicesMenu существует на главной)
  if (typeof toggleServicesMenu === "function") toggleServicesMenu();

  // 2. ПЕРЕНАПРАВЛЕНИЕ НА СООТВЕТСТВУЮЩУЮ СТРАНИЦУ
  switch (typeName) {
    case 'Ремонт компьютеров':
      window.location.href = 'kompyutery.html';
      break;
    case 'Ремонт ноутбуков':
      window.location.href = 'noutbuki.html';
      break;
    case 'Ремонт игровых приставок':
      window.location.href = 'pristavki.html';
      break;
    case 'Ремонт телевизоров':
      window.location.href = 'televizory.html';
      break;
    case 'Ремонт ресиверов':
      window.location.href = 'resiveri.html';
      break;
    case 'Ремонт микроволновок':
      window.location.href = 'mikrovolnovki.html';
      break;
    case 'Ремонт отпаривателей':
      window.location.href = 'otparivateli.html';
      break;
    case 'Ремонт пылесосов и роботов-пылесосов':
      window.location.href = 'pylesosy.html';
      break;
    case 'Ремонт электроинструмента':
      window.location.href = 'elektroinstrument.html';
      break;
    case 'Ремонт плат и блоков питания':
      window.location.href = 'platy-i-bp.html';
      break;
      
    default:
      // Логика заглушки на случай, если название карточки не совпало
      alert(`Выбран ремонт: ${typeName}. Логика квиза сработает здесь.`);
  }
}

// ОДНА УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ДЛЯ ВСЕХ СТРАНИЦ ТЕХНИКИ
function startQuizFromHero() {
  // 1. Забираем текст из инпута на главном экране
  const heroInput = document.getElementById('initial-problem');
  if (!heroInput) return;

  const problemText = heroInput.value.trim();

  if (problemText === "") {
    alert("Пожалуйста, опишите коротко, что нужно починить!");
    return;
  }

  // --- АВТОМАТИЧЕСКОЕ ОПРЕДЕЛЕНИЕ РАЗДЕЛА ---
  // Смотрим, какой html-файл сейчас открыт в браузере
  const currentFile = window.location.pathname.split('/').pop();

  // Карта настроек для каждой страницы: [Тип техники для базы, Название раздела для source]
  const pageConfigs = {
    'kompyutery.html':          ['Ремонт компьютеров', 'компьютеры'],
    'noutbuki.html':            ['Ремонт ноутбуков', 'ноутбуки'],
    'pristavki.html':           ['Ремонт игровых приставок', 'игровые приставки'],
    'televizory.html':          ['Ремонт телевизоров', 'телевизоры'],
    'resiveri.html':            ['Ремонт ресиверов', 'ресиверы'],
    'mikrovolnovki.html':       ['Ремонт микроволновок', 'микроволновки'],
    'otparivateli.html':        ['Ремонт отпаривателей', 'отпариватели'],
    'pylesosy.html':            ['Ремонт пылесосов и роботов-пылесосов', 'пылесосы'],
    'elektroinstrument.html':   ['Ремонт электроинструмента', 'электроинструменты'],
    'platy-i-bp.html':          ['Ремонт плат и блоков питания', 'платы и БП']
  };

  // Получаем настройки для текущей страницы. Если совпадений нет — ставим дефолт.
  const [detectedDevice, detectedSection] = pageConfigs[currentFile] || ['Ремонт компьютеров', 'компьютеры'];
  // ------------------------------------------

  // 2. Записываем динамические данные в глобальный объект квиза
  quizDraftOrder.initialProblem = problemText;
  quizDraftOrder.deviceType = detectedDevice; // Сюда уйдет правильный тип (например, "Ремонт микроволновок")
  
  // Автоматически соберет: "Инпут на первом экране, раздел микроволновки"
  quizDraftOrder.source = `Инпут на первом экране, раздел ${detectedSection}`; 
  
  console.log(`Фиксация для раздела [${detectedSection}]:`, quizDraftOrder);

  // 3. Синхронизируем текст с textarea ВСПЛЫВАЮЩЕГО (popup) квиза
  const popupTextarea = document.getElementById('popup-quiz-problem-textarea');
  if (popupTextarea) {
    popupTextarea.value = problemText;
  }

  // 4. Открываем всплывающее модальное окно мини-квиза
  const modal = document.getElementById('quiz-popup-modal');
  if (modal) {
    modal.style.setProperty('display', 'flex', 'important');
  } else {
    console.error("Окно #quiz-popup-modal не найдено в HTML!");
  }

  // 5. Переключаем всплывающий квиз сразу на Шаг 1 (Выбор бренда)
  if (typeof changePopupQuizStep === "function") {
    changePopupQuizStep(1); 
  }
}

// Управление бургер-меню
function openBurgerMenu() {
  document.getElementById('fullscreen-menu').classList.add('active');
}
function closeBurgerMenu() {
  document.getElementById('fullscreen-menu').classList.remove('remove'); // фикс анимации
  document.getElementById('fullscreen-menu').classList.remove('active');
}
function openServicesFromMenu() {
  closeBurgerMenu();
  toggleServicesMenu();
}
function filterCatalog(category, buttonElement) {
  // 1. Снимаем активный класс со всех табов каталога и добавляем нажатому
  const catalogTabs = document.querySelectorAll('.cat-tab');
  catalogTabs.forEach(tab => tab.classList.remove('active'));
  buttonElement.classList.add('active');

  // 2. Фильтруем карточки основного каталога
  const catalogCards = document.querySelectorAll('.catalog-card');
  catalogCards.forEach(card => {
    const cardCategory = card.getAttribute('data-catalog-cat');
    
    if (category === 'all_cat' || cardCategory === category) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}
let currentSlideIndex = 0;
let cardsPerPage = 3;

// Функция прокрутки на шаг вперед/назад (+1 или -1)
function moveSlider(direction) {
  let nextIndex = currentSlideIndex + direction;
  let maxIndex = reviewsData.length - cardsPerPage;
  
  if (nextIndex < 0) nextIndex = 0;
  if (nextIndex > maxIndex) nextIndex = maxIndex;
  
  goToSlide(nextIndex);
}

// Переход на конкретный индекс слайда
function goToSlide(index) {
  const track = document.getElementById('reviews-track');
  const cards = document.querySelectorAll('.review-card');
  const dots = document.querySelectorAll('.slider-dot');
  
  if(cards.length === 0) return;
  
  currentSlideIndex = index;
  
  // Вычисляем ширину одной карточки с учетом отступа gap (20px)
  let cardWidth = cards[0].getBoundingClientRect().width;
  let offset = index * (cardWidth + 20);
  
  // Плавно сдвигаем ленту трека
  track.style.transform = `translateX(-${offset}px)`;
  
  // Обновляем активную точку-капсулу
  dots.forEach((dot, idx) => {
    if (idx === index) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}
// ==========================================================================
// УПРАВЛЕНИЕ МОДАЛЬНЫМ МИНИ-КВИЗОМ (ИЗ БЛОКА ПОЛОМОК)
// ==========================================================================

// УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ДЛЯ ОТКРЫТИЯ КВИЗА ИЗ БЛОКА ПОЛОМОК
function openQuizPopupModal() {
  // --- АВТОМАТИЧЕСКОЕ ОПРЕДЕЛЕНИЕ РАЗДЕЛА ---
  const currentFile = window.location.pathname.split('/').pop();

  const pageConfigs = {
    'kompyutery.html':          ['Ремонт компьютеров', 'компьютеры'],
    'noutbuki.html':            ['Ремонт ноутбуков', 'ноутбуки'],
    'pristavki.html':           ['Ремонт игровых приставок', 'игровые приставки'],
    'televizory.html':          ['Ремонт телевизоров', 'телевизоры'],
    'resiveri.html':            ['Ремонт ресиверов', 'ресиверы'],
    'mikrovolnovki.html':       ['Ремонт микроволновок', 'микроволновки'],
    'otparivateli.html':        ['Ремонт отпаривателей', 'отпариватели'],
    'pylesosy.html':            ['Ремонт пылесосов и роботов-пылесосов', 'пылесосы'],
    'elektroinstrument.html':   ['Ремонт электроинструмента', 'электроинструменты'],
    'platy-i-bp.html':          ['Ремонт плат и блоков питания', 'платы и БП']
  };

  const [detectedDevice, detectedSection] = pageConfigs[currentFile] || ['Ремонт компьютеров', 'компьютеры'];
  // ------------------------------------------

  // Фиксируем точный кастомный источник для вашей таблицы orders
  quizDraftOrder.deviceType = detectedDevice;
  quizDraftOrder.source = `Кнопка в блоке поломок, раздел ${detectedSection}`;
  console.log("Источник зафиксирован для всплывающего квиза:", quizDraftOrder.source);

  // Сбрасываем попап-квиз на 1 шаг перед открытием
  if (typeof changePopupQuizStep === "function") changePopupQuizStep(1);
  if (document.getElementById('popup-quiz-problem-textarea')) document.getElementById('popup-quiz-problem-textarea').value = '';
  if (document.getElementById('popup-quiz-name')) document.getElementById('popup-quiz-name').value = '';
  if (document.getElementById('popup-quiz-phone')) document.getElementById('popup-quiz-phone').value = '';

  const modal = document.getElementById('quiz-popup-modal');
  if (modal) {
    modal.style.setProperty('display', 'flex', 'important');
  }
}

function closeQuizPopupModal() {
  const modal = document.getElementById('quiz-popup-modal');
  if (modal) {
    modal.style.setProperty('display', 'none', 'important');
  }
}

function changePopupQuizStep(stepNumber) {
  // Скрываем все шаги всплывающего квиза
  document.getElementById('popup-quiz-step-1').classList.remove('active');
  document.getElementById('popup-quiz-step-2').classList.remove('active');
  document.getElementById('popup-quiz-step-3').classList.remove('active');
  
  // Показываем нужный шаг
  document.getElementById(`popup-quiz-step-${stepNumber}`).classList.add('active');
  
  const progressLine = document.getElementById('popup-quiz-progress-line');
  const stepIndicator = document.getElementById('popup-quiz-step-indicator');
  
  if (!progressLine || !stepIndicator) return;

  if (stepNumber === 1) {
    progressLine.style.width = '33.3%';
    stepIndicator.innerText = 'Шаг 1 из 3';
  } else if (stepNumber === 2) {
    progressLine.style.width = '66.6%';
    stepIndicator.innerText = 'Шаг 2 из 3';
  } else if (stepNumber === 3) {
    progressLine.style.width = '100%';
    stepIndicator.innerText = 'Шаг 3 из 3';
  }
}

function selectPopupQuizBrand(brandName) {
  quizDraftOrder.brand = brandName;
  console.log("Всплывающий квиз — выбран бренд:", brandName);
  changePopupQuizStep(2);
}

function submitPopupQuizStep2() {
  const textVal = document.getElementById('popup-quiz-problem-textarea').value.trim();
  quizDraftOrder.initialProblem = textVal;
  changePopupQuizStep(3);
}
// Универсальная отправка данных квиза в таблицу 'orders'
async function sendPopupQuizToSupabase(config) {
  // Находим элементы динамически по переданным ID
  const nameInp = document.getElementById(config.nameId)?.value.trim() || "";
  const phoneInp = document.getElementById(config.phoneId)?.value.trim() || "";
  const submitBtn = document.getElementById(config.submitBtnId);

  if (nameInp === "" || phoneInp === "") {
    alert("Пожалуйста, заполните поля 'Имя' и 'Номер телефона'!");
    return;
  }

  // Записываем данные в наш объект черновика
  quizDraftOrder.clientName = nameInp;
  quizDraftOrder.clientPhone = phoneInp;

  if (submitBtn) {
    submitBtn.innerText = "Отправка...";
    submitBtn.disabled = true;
  }

  try {
    console.log("Отправка квиза в Supabase (Таблица orders):", quizDraftOrder);

    const { data, error } = await supabase
      .from('orders')
      .insert([
        { 
          client_name: quizDraftOrder.clientName,
          client_phone: quizDraftOrder.clientPhone,
          device_type: quizDraftOrder.deviceType || "Ремонт компьютеров",
          initial_problem: `Бренд: ${quizDraftOrder.brand || 'Не выбран'}. Поломка: ${quizDraftOrder.initialProblem || 'Нет описания'}`,
          // Берем источник из конфига окна или из объекта
          source: config.source || quizDraftOrder.source 
        }
      ]);

    if (error) throw error; 

    alert("Заявка успешно отправлена! Мастер свяжется с вами.");
    
    // Вызываем функцию закрытия конкретного окна, если она передана
    if (typeof config.closeModalFunc === "function") {
      config.closeModalFunc();
    }

  } catch (err) {
    console.error("Ошибка Supabase при отправке:", err);
    alert(`Ошибка Supabase: ${err.message || JSON.stringify(err)}`);
  } finally {
    if (submitBtn) {
      submitBtn.innerText = config.defaultBtnText || "Отправить заявку ⚡";
      submitBtn.disabled = false;
    }
  }
}

// ========================================================
// ИНИЦИАЛИЗАЦИЯ И СЛУЖЕБНАЯ ЛОГИКА СТРАНИЦЫ (ФИНАЛЬНЫЙ БЛОК)
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
  
  // 1. СВАЙПЫ ДЛЯ ОТЗЫВОВ (ЛОГИКА ПОЛНОСТЬЮ СОХРАНЕНА)
  const viewport = document.querySelector('.slider-viewport');
  if (viewport) {
    let touchStartX = 0;
    let touchEndX = 0;

    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches.screenX;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches.screenX;
      
      const swipeThreshold = 50;
      if (touchStartX - touchEndX > swipeThreshold) {
        moveSlider(1);  
      } else if (touchEndX - touchStartX > swipeThreshold) {
        moveSlider(-1); 
      }
    }, { passive: true });
  }

  // 2. АВТОМАТИЧЕСКИЙ ПОДХВАТ ПРИ ПЕРЕХОДЕ С ГЛАВНОЙ СТРАНИЦЫ
  const savedType = localStorage.getItem('selectedDeviceType');
  
  if (savedType) {
    const currentFile = window.location.pathname.split('/').pop();

    const pageConfigs = {
      'kompyutery.html':          'компьютеры',
      'noutbuki.html':            'ноутбуки',
      'pristavki.html':           'игровые приставки',
      'televizory.html':          'телевизоры',
      'resiveri.html':            'ресиверы',
      'mikrovolnovki.html':       'микроволновки',
      'otparivateli.html':        'отпариватели',
      'pylesosy.html':            'пылесосы',
      'elektroinstrument.html':   'электроинструменты',
      'platy-i-bp.html':          'платы и БП'
    };

    const detectedSection = pageConfigs[currentFile];

    if (detectedSection) {
      localStorage.removeItem('selectedDeviceType'); 
      
      quizDraftOrder.deviceType = savedType; 
      quizDraftOrder.source = `Поиск на главной, раздел ${detectedSection}`; 
      
      console.log(`Пользователь перешел с поиска главной. Раздел [${detectedSection}]. Данные квиза:`, quizDraftOrder);
      
      // Сразу открываем квиз, если это страница ПК (сохраняем логику из второго блока)
      if (detectedSection === 'компьютеры' && typeof openQuizOrForm === "function") {
        console.log("Пользователь перешел на страницу ПК. Автоматически запускаем квиз...");
        openQuizOrForm();
      }
    }
  }

  // 3. АВТОНОМНАЯ РУЧНАЯ МАСКА ТЕЛЕФОНА (БЕЗ СКРИПТОВ ИЗ ИНТЕРНЕТА)
  const phoneInputs = [
    document.getElementById("quiz-phone"),
    document.getElementById("popup-quiz-phone")
  ];

  phoneInputs.forEach(input => {
    if (!input) return;

    // При фокусе автоматически подставляем базовый "+7 "
    input.addEventListener("focus", function () {
      if (input.value === "") {
        input.value = "+7 ";
      }
    });

    // Форматирование номера на лету (поддерживает ввод любых кодов городов вроде 800 или 345)
    input.addEventListener("input", function () {
      let matrix = "+7 (___) ___-__-__",
          i = 0,
          def = matrix.replace(/\D/g, ""),
          val = input.value.replace(/\D/g, "");

      if (def.length >= val.length) val = def;

      input.value = matrix.replace(/./g, function (a) {
        return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i < val.length ? a : "";
      });
    });

    // Защита: не даем пользователю стереть префикс "+7 " кнопкой Backspace
    input.addEventListener("keydown", function (e) {
      if (input.selectionStart <= 4 && e.key === "Backspace") {
        e.preventDefault();
      }
    });
  });

});

function toggleFaq(element) {
  // Проверяем, открыт ли текущий элемент
  const isOpen = element.classList.contains('active');
  
  // (Опционально) Закрываем все остальные открытые вопросы, если нужно
  /* 
  document.querySelectorAll('.faq-item').forEach(item => {
    item.classList.remove('active');
    item.querySelector('.faq-answer').style.maxHeight = null;
  });
  */

  const answerBlock = element.querySelector('.faq-answer');

  if (isOpen) {
    element.classList.remove('active');
    answerBlock.style.maxHeight = null;
  } else {
    element.classList.add('active');
    // Присваиваем max-height точную высоту скрытого текста в пикселях
    answerBlock.style.maxHeight = answerBlock.scrollHeight + "px";
  }
}
// ==========================================
// НАСТРОЙКА SUPABASE
// ==========================================
const SUPABASE_URL = 'https://rikhpxdysaamkbcvfnkh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FKQJQV6xvJujVg8sEKFwJg_5wUAr3-s';

// Инициализируем клиента базы данных
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// УПРАВЛЕНИЕ ВИЗУАЛОМ КВИЗА (ОТКРЫТИЕ / ЗАКРЫТИЕ)
// ==========================================

// Функция открытия модалки квиза
function openQuizModal(sourceName = "Квиз-форма") {
  quizDraftOrder.source = sourceName; // Запоминаем, откуда открыли модалку
  document.getElementById('quiz-modal').style.display = 'flex';
  changeQuizStep(1); // Начинаем всегда с 1 шага
}

// Функция закрытия модалки
function closeQuizModal() {
  document.getElementById('quiz-modal').style.display = 'none';
  resetQuizForm();
}

// Функция переключения шагов, изменения полосы прогресса и текста индикатора
function changeQuizStep(stepNumber) {
  // Скрываем все шаги
  document.querySelectorAll('.quiz-step').forEach(step => step.classList.remove('active'));
  
  // Показываем нужный шаг
  document.getElementById(`quiz-step-${stepNumber}`).classList.add('active');
  
  // Обновляем индикатор текста и линию прогресса
  const progressLine = document.getElementById('quiz-progress-line');
  const stepIndicator = document.getElementById('quiz-step-indicator');
  
  if (stepNumber === 1) {
    progressLine.style.width = '33.3%';
    stepIndicator.innerText = 'Шаг 1 из 3';
  } else if (stepNumber === 2) {
    progressLine.style.width = '66.6%';
    stepIndicator.innerText = 'Шаг 2 из 3';
  } else if (stepNumber === 3) {
    progressLine.style.width = '100%';
    stepIndicator.innerText = 'Шаг 3 из 3';
  }
}

// ==========================================
// ЛОГИКА ШАГОВ
// ==========================================

// Шаг 1: Пользователь кликнул на бренд
function selectQuizBrand(brandName) {
  quizDraftOrder.brand = brandName;
  console.log("Выбран бренд:", brandName);
  changeQuizStep(2); // Перекидываем на шаг 2
}

// Шаг 2: Пользователь написал поломку и нажал "Далее"
function submitQuizStep2() {
  const textVal = document.getElementById('quiz-problem-textarea').value.trim();
  quizDraftOrder.initialProblem = textVal; // Записываем, даже если пусто
  changeQuizStep(3); // Перекидываем на финал
}

// Сброс формы в начальное состояние
function resetQuizForm() {
  document.getElementById('quiz-problem-textarea').value = '';
  document.getElementById('quiz-name').value = '';
  document.getElementById('quiz-phone').value = '';
  quizDraftOrder.brand = "";
  quizDraftOrder.initialProblem = "";
}

// ==========================================
// СВЯЗЬ С SUPABASE — ОТПРАВКА ДАННЫХ В БАЗУ
// ==========================================
async function sendQuizToSupabase() {
  const nameInp = document.getElementById('quiz-name').value.trim();
  const phoneInp = document.getElementById('quiz-phone').value.trim();

  // 1. Проверяем, что поля вообще заполнены
  if (nameInp === "" || phoneInp === "") {
    alert("Пожалуйста, заполните поля 'Имя' и 'Номер телефона'!");
    return;
  }

  // 2. ГИБКАЯ ПРОВЕРКА НОМЕРА ТЕЛЕФОНА (Защита от мусора и букв)
  // Очищаем строку от скобок, дефисов, плюсов и пробелов, оставляя только чистые цифры
  const cleanPhone = phoneInp.replace(/\D/g, ''); 

  // В России мобильный номер с кодом (7 или 8) состоит ровно из 11 цифр.
  // Делаем проверку: если чистых цифр меньше 10 (на случай ввода без кода города), это точно спам или опечатка.
  if (cleanPhone.length < 10) {
    alert(" Пожалуйста, введите корректный номер телефона (минимум 10 цифр)!");
    // Находим инпут и подсвечиваем его красным для юзабилити
    document.getElementById('quiz-phone').style.borderColor = "#dc3545";
    document.getElementById('quiz-phone').focus();
    return;
  } else {
    // Если всё хорошо, убираем красную рамку
    document.getElementById('quiz-phone').style.borderColor = "";
  }

  // Записываем данные в черновик (теперь у тебя в базе будут гарантированно валидные контакты)
  quizDraftOrder.clientName = nameInp;
  quizDraftOrder.clientPhone = phoneInp; // отправляем как ввел пользователь (со скобочками из маски, если она есть)

  const submitBtn = document.querySelector('.quiz-submit-btn');
  submitBtn.innerText = "Отправка...";
  submitBtn.disabled = true;

  try {
    console.log("Данные перед отправкой в Supabase:", quizDraftOrder);

    const { data, error } = await supabase
      .from('orders')
      .insert([
        { 
          client_name: quizDraftOrder.clientName, 
          client_phone: quizDraftOrder.clientPhone,
          device_type: quizDraftOrder.deviceType || "Не указан",
          initial_problem: `Бренд: ${quizDraftOrder.brand || 'Не выбран'}. Описание: ${quizDraftOrder.initialProblem || 'Нет описания'}`,
          source: quizDraftOrder.source || "Лендинг Квиз"
        }
      ]);

    if (error) {
      throw error; 
    }

    alert("Заявка успешно отправлена! Мастер свяжется с вами.");
    resetQuizForm(); 
    closeQuizModal();

  } catch (err) {
    console.error("Критическая ошибка при работе с Supabase:", err);
    const errorDetails = err.message || err.details || JSON.stringify(err);
    alert(`Ошибка Supabase: ${errorDetails}`);
  } finally {
    submitBtn.innerText = "Отправить заявку ⚡";
    submitBtn.disabled = false;
  }
}
// =================================================================
// УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ОТКРЫТИЯ МОДАЛКИ ИЗ ПРАЙС-ЛИСТА
// =================================================================
function openQuizFromPrice() {
  // --- АВТОМАТИЧЕСКОЕ ОПРЕДЕЛЕНИЕ РАЗДЕЛА ---
  const currentFile = window.location.pathname.split('/').pop();

  const pageConfigs = {
    'kompyutery.html':          ['Ремонт компьютеров', 'компьютеры'],
    'noutbuki.html':            ['Ремонт ноутбуков', 'ноутбуки'],
    'pristavki.html':           ['Ремонт игровых приставок', 'игровые приставки'],
    'televizory.html':          ['Ремонт телевизоров', 'телевизоры'],
    'resiveri.html':            ['Ремонт ресиверов', 'ресиверы'],
    'mikrovolnovki.html':       ['Ремонт микроволновок', 'микроволновки'],
    'otparivateli.html':        ['Ремонт отпаривателей', 'отпариватели'],
    'pylesosy.html':            ['Ремонт пылесосов и роботов-пылесосов', 'пылесосы'],
    'elektroinstrument.html':   ['Ремонт электроинструмента', 'электроинструменты'],
    'platy-i-bp.html':          ['Ремонт плат и блоков питания', 'платы и БП']
  };

  const [detectedDevice, detectedSection] = pageConfigs[currentFile] || ['Ремонт компьютеров', 'компьютеры'];
  // ------------------------------------------

  // 1. Фиксируем данные в объекте простых форм draftOrder
  draftOrder.deviceType = detectedDevice;
  draftOrder.source = `Узнать стоимость ремонта, раздел ${detectedSection}`; // Формируем точный source

  console.log("Источник зафиксирован из прайс-листа:", draftOrder);

  // 2. Показываем модальное окно
  const priceModal = document.getElementById('price-callback-modal');
  if (priceModal) {
    priceModal.style.display = 'flex';
  }
}

// Закрытие модального окна прайса
function closePriceModal() {
  const priceModal = document.getElementById('price-callback-modal');
  if (priceModal) {
    priceModal.style.display = 'none';
  }
}

// ИСПРАВЛЕННАЯ ФУНКЦИЯ ОТПРАВКИ ИЗ ПРАЙС-ЛИСТА В ТАБЛИЦУ 'ORDERS' (С ПРОВЕРКОЙ ЦИФР)
async function sendPriceLeadToSupabase() {
  const nameInp = document.getElementById('modal-callback-name').value.trim();
  const phoneInp = document.getElementById('modal-callback-phone').value.trim();

  if (phoneInp === "") {
    alert("Пожалуйста, введите номер телефона!");
    return;
  }

  // СТРОГАЯ ПРОВЕРКА НОМЕРА ТЕЛЕФОНА (Защита от мусора и букв)
  const cleanPhone = phoneInp.replace(/\D/g, ''); 

  if (cleanPhone.length !== 11) {
    alert("Пожалуйста, введите полный номер телефона в формате +7 (999) 000-00-00!");
    const phoneField = document.getElementById('modal-callback-phone');
    if (phoneField) {
      phoneField.style.borderColor = "#dc3545"; // Красная подсветка
      phoneField.focus();
    }
    return;
  } else {
    const phoneField = document.getElementById('modal-callback-phone');
    if (phoneField) phoneField.style.borderColor = ""; // Сброс красной рамки
  }

  // Заглушка, если имя не введено
  const validName = nameInp || "Не указано";

  try {
    console.log("Отправка быстрой формы в общую таблицу orders:", {
      client_name: validName,
      client_phone: phoneInp,
      device_type: draftOrder.deviceType,
      source: draftOrder.source
    });

    // ШЛЁМ СТРОГО В ТАБЛИЦУ 'ORDERS' С РОДНЫМИ НАЗВАНИЯМИ СТОЛБЦОВ
    const { data, error } = await supabase
      .from('orders') 
      .insert([
        { 
          client_name: validName, 
          client_phone: phoneInp,
          device_type: draftOrder.deviceType || "Не указан", 
          initial_problem: "Быстрая заявка: клиент хочет узнать стоимость ремонта по телефону.",
          source: draftOrder.source || "Узнать стоимость ремонта (запасной источник)"
        }
      ]);

    if (error) {
      throw error; 
    }

    alert("Заявка успешно отправлена! Мастер свяжется с вами.");
    closePriceModal();
    
    // Сбрасываем поля
    document.getElementById('modal-callback-name').value = "";
    document.getElementById('modal-callback-phone').value = "";

  } catch (err) {
    console.error("Критическая ошибка Supabase (Таблица orders):", err);
    alert(`Ошибка при отправке: ${err.message || JSON.stringify(err)}`);
  }
}

// ========================================================
// ИНИЦИАЛИЗАЦИЯ И СЛУЖЕБНАЯ ЛОГИКА СТРАНИЦЫ (ФИНАЛЬНЫЙ БЛОК)
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
  
  // 1. СВАЙПЫ ДЛЯ ОТЗЫВОВ (ЛОГИКА ПОЛНОСТЬЮ СОХРАНЕНА)
  const viewport = document.querySelector('.slider-viewport');
  if (viewport) {
    let touchStartX = 0;
    let touchEndX = 0;

    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches.screenX;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches.screenX;
      
      const swipeThreshold = 50;
      if (touchStartX - touchEndX > swipeThreshold) {
        moveSlider(1);  
      } else if (touchEndX - touchStartX > swipeThreshold) {
        moveSlider(-1); 
      }
    }, { passive: true });
  }

  // 2. АВТОМАТИЧЕСКИЙ ПОДХВАТ ПРИ ПЕРЕХОДЕ С ГЛАВНОЙ СТРАНИЦЫ
  const savedType = localStorage.getItem('selectedDeviceType');
  
  if (savedType) {
    const currentFile = window.location.pathname.split('/').pop();

    const pageConfigs = {
      'kompyutery.html':          'компьютеры',
      'noutbuki.html':            'ноутбуки',
      'pristavki.html':           'игровые приставки',
      'televizory.html':          'телевизоры',
      'resiveri.html':            'ресиверы',
      'mikrovolnovki.html':       'микроволновки',
      'otparivateli.html':        'отпариватели',
      'pylesosy.html':            'пылесосы',
      'elektroinstrument.html':   'электроинструменты',
      'platy-i-bp.html':          'платы и БП'
    };

    const detectedSection = pageConfigs[currentFile];

    if (detectedSection) {
      localStorage.removeItem('selectedDeviceType'); 
      
      quizDraftOrder.deviceType = savedType; 
      quizDraftOrder.source = `Поиск на главной, раздел ${detectedSection}`; 
      
      console.log(`Пользователь перешел с поиска главной. Раздел [${detectedSection}]. Данные квиза:`, quizDraftOrder);
      
      // Сразу открываем квиз, если это страница ПК
      if (detectedSection === 'компьютеры' && typeof openQuizOrForm === "function") {
        console.log("Пользователь перешел на страницу ПК. Автоматически запускаем квиз...");
        openQuizOrForm();
      }
    }
  }

  // 3. АВТОНОМНАЯ РУЧНАЯ МАСКА ТЕЛЕФОНА (НА ВСЕ ТРИ ОКНА САЙТА)
  const phoneInputs = [
    document.getElementById("quiz-phone"),          // Поле обычного квиза
    document.getElementById("popup-quiz-phone"),    // Поле всплывающего квиза
    document.getElementById("modal-callback-phone") // Поле окна стоимости из прайса
  ];

  phoneInputs.forEach(input => {
    if (!input) return;

    // При фокусе автоматически подставляем базовый "+7 "
    input.addEventListener("focus", function () {
      if (input.value === "") {
        input.value = "+7 ";
      }
    });

    // Форматирование номера на лету (поддерживает любые коды 800, 345, 961 и тд)
    input.addEventListener("input", function () {
      let matrix = "+7 (___) ___-__-__",
          i = 0,
          def = matrix.replace(/\D/g, ""),
          val = input.value.replace(/\D/g, "");

      if (def.length >= val.length) val = def;

      input.value = matrix.replace(/./g, function (a) {
        return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i < val.length ? a : "";
      });
    });

    // Защита: не даем пользователю стереть префикс "+7 " кнопкой Backspace
    input.addEventListener("keydown", function (e) {
      if (input.selectionStart <= 4 && e.key === "Backspace") {
        e.preventDefault();
      }
    });
  });

}); // Конец служебного блока DOMContentLoaded