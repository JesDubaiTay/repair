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
function selectDeviceType(typeName) {
  draftOrder.deviceType = typeName;
  console.log("Черновик обновлен (Тип техники):", draftOrder);
  toggleServicesMenu(); // Закрываем шторку
  
  // 1. Сохраняем выбранный тип техники в память браузера, чтобы не потерять при переходе
  localStorage.setItem('selectedDeviceType', typeName);

  // 2. Проверяем, создана ли уже отдельная страница под эту технику
  if (typeName === 'Ремонт компьютеров') {
      window.location.href = 'repairs/kompyutery.html';
      return;
  }
  // Если для какой-то техники страницы еще нет, оставляем вашу старую логику заглушки
  alert(`Выбран ремонт: ${typeName}. Логика квиза сработает здесь.`);
}

// ИСПРАВЛЕННАЯ ФУНКЦИЯ ДЛЯ ВСПЛЫВАЮЩЕГО ОКНА ИЗ ИНПУТА ПК
function startQuizFromHero() {
  // 1. Забираем текст из инпута на главном экране страницы ПК
  const heroInput = document.getElementById('initial-problem');
  if (!heroInput) return;

  const problemText = heroInput.value.trim();

  if (problemText === "") {
    alert("Пожалуйста, опишите коротко, что нужно починить!");
    return;
  }

  // 2. Записываем текст в глобальный объект квиза
  quizDraftOrder.initialProblem = problemText;
  quizDraftOrder.deviceType = "Ремонт компьютеров";
  
  // Переписываем источник для Supabase, чтобы знать, что лид пришел именно из строки ввода
  quizDraftOrder.source = "Инпут на первом экране, раздел компьютеры"; 
  console.log("Проблема зафиксирована:", quizDraftOrder.initialProblem);

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
  // Пользователь сначала выберет бренд (ASUS, HP и т.д.), кликнет на него,
  // и квиз перекинет его на Шаг 2, где уже будет красиво лежать слово "Комп"
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

function openQuizPopupModal() {
  // Фиксируем точный кастомный источник для вашей таблицы orders
  quizDraftOrder.deviceType = "Ремонт компьютеров";
  quizDraftOrder.source = "Кнопка в блоке поломок, раздел компьютеры";
  console.log("Источник зафиксирован для всплывающего квиза:", quizDraftOrder.source);

  // Сбрасываем попап-квиз на 1 шаг перед открытием
  changePopupQuizStep(1);
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
// Отправка данных всплывающего мини-квиза в таблицу 'orders'
async function sendPopupQuizToSupabase() {
  const nameInp = document.getElementById('popup-quiz-name').value.trim();
  const phoneInp = document.getElementById('popup-quiz-phone').value.trim();

  if (nameInp === "" || phoneInp === "") {
    alert("Пожалуйста, заполните поля 'Имя' и 'Номер телефона'!");
    return;
  }

  quizDraftOrder.clientName = nameInp;
  quizDraftOrder.clientPhone = phoneInp;

  const submitBtn = document.getElementById('popup-quiz-submit-btn');
  if (submitBtn) {
    submitBtn.innerText = "Отправка...";
    submitBtn.disabled = true;
  }

  try {
    console.log("Отправка всплывающего мини-квиза в Supabase (Таблица orders):", quizDraftOrder);

    // Жестко синхронизируем со структурой вашей таблицы 'orders' из 4-й части кода
    const { data, error } = await supabase
      .from('orders') // Имя вашей таблицы квизов
      .insert([
        { 
          client_name: quizDraftOrder.clientName, // Точное имя столбца из вашей БД
          client_phone: quizDraftOrder.clientPhone, // Точное имя столбца из вашей БД
          device_type: quizDraftOrder.deviceType || "Ремонт компьютеров",
          initial_problem: `Бренд: ${quizDraftOrder.brand || 'Не выбран'}. Поломка (из всплывающего окна): ${quizDraftOrder.initialProblem || 'Нет описания'}`,
          source: quizDraftOrder.source // Сюда динамически запишется точный источник!
        }
      ]);

    if (error) throw error; 

    alert("Заявка успешно отправлена через мини-квиз! Мастер свяжется с вами.");
    closeQuizPopupModal(); // Закрываем всплывающее окно

  } catch (err) {
    console.error("Ошибка Supabase при отправке всплывающего квиза:", err);
    alert(`Ошибка Supabase: ${err.message || JSON.stringify(err)}`);
  } finally {
    if (submitBtn) {
      submitBtn.innerText = "Отправить заявку ⚡";
      submitBtn.disabled = false;
    }
  }
}

// НАЙДИТЕ ЭТОТ БЛОК В САМОМ НИЗУ СВОЕГО service-script.js И ЗАМЕНИТЕ НА ЭТОТ:
document.addEventListener("DOMContentLoaded", () => {
  // Свайпы для отзывов (вызов initReviewsSlider удален, чтобы не вешать скрипт!)
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

  // Автоматический подхват при переходе с главной страницы
  const savedType = localStorage.getItem('selectedDeviceType');
  if (savedType === 'Ремонт компьютеров') {
    localStorage.removeItem('selectedDeviceType');
    
    quizDraftOrder.source = "Поиск на главной, раздел компьютеры";
    quizDraftOrder.deviceType = "Ремонт компьютеров";
    console.log("Пользователь перешел с поиска главной. Источник квиза:", quizDraftOrder.source);
  }
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

  if (nameInp === "" || phoneInp === "") {
    alert("Пожалуйста, заполните поля 'Имя' и 'Номер телефона'!");
    return;
  }

  quizDraftOrder.clientName = nameInp;
  quizDraftOrder.clientPhone = phoneInp;

  const submitBtn = document.querySelector('.quiz-submit-btn');
  submitBtn.innerText = "Отправка...";
  submitBtn.disabled = true;

  try {
    // Выводим в консоль то, что пытаемся отправить, для самопроверки
    console.log("Данные перед отправкой в Supabase:", quizDraftOrder);

    const { data, error } = await supabase
      .from('orders')
      .insert([
        { 
          client_name: quizDraftOrder.clientName, 
          client_phone: quizDraftOrder.clientPhone,
          // Если эти поля пустые, временно передаем строки, чтобы не сработал NOT NULL в БД
          device_type: quizDraftOrder.deviceType || "Не указан",
          initial_problem: `Бренд: ${quizDraftOrder.brand || 'Не выбран'}. Описание: ${quizDraftOrder.initialProblem || 'Нет описания'}`,
          source: quizDraftOrder.source || "Лендинг Квиз"
        }
      ]);

    if (error) {
      // Важно: генерируем ошибку так, чтобы передать весь объект ответа Supabase
      throw error; 
    }

    alert("Заявка успешно отправлена! Мастер свяжется с вами.");
    resetQuizForm(); // Очищаем форму
    closeQuizModal();

  } catch (err) {
    // Внимание сюда! Смотрим полную структуру ошибки в консоли F12
    console.error("Критическая ошибка при работе с Supabase:", err);
    
    // Выводим подробности для пользователя/разработчика
    const errorDetails = err.message || err.details || JSON.stringify(err);
    alert(`Ошибка Supabase: ${errorDetails}`);
  } finally {
    submitBtn.innerText = "Отправить заявку ⚡";
    submitBtn.disabled = false;
  }
}
// Открытие модального окна из Прайс-листа
function openQuizFromPrice() {
  // 1. Фиксируем данные в объекте простых форм draftOrder
  draftOrder.deviceType = "Ремонт компьютеров";
  draftOrder.source = "Узнать стоимость ремонта, раздел компьютеры"; // Наш точный источник

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

document.addEventListener("DOMContentLoaded", () => {
    // Проверяем, есть ли в памяти сохраненный выбор
    const savedType = localStorage.getItem('selectedDeviceType');
    
    if (savedType === 'Ремонт компьютеров') {
        console.log("Пользователь перешел на страницу ПК. Автоматически запускаем квиз...");
        
        // Очищаем запись, чтобы квиз не всплывал бесконечно при простой перезагрузке страницы
        localStorage.removeItem('selectedDeviceType');
        
        // Вызываем функцию открытия вашего квиза (подставьте имя вашей функции, например openQuizOrForm)
        if (typeof openQuizOrForm === "function") {
            openQuizOrForm();
        }

    }
});
// ИСПРАВЛЕННАЯ ФУНКЦИЯ ОТПРАВКИ ИЗ ПРАЙС-ЛИСТА В ТАБЛИЦУ 'ORDERS'
async function sendPriceLeadToSupabase() {
  const nameInp = document.getElementById('modal-callback-name').value.trim();
  const phoneInp = document.getElementById('modal-callback-phone').value.trim();

  if (phoneInp === "") {
    alert("Пожалуйста, введите номер телефона!");
    return;
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
      .from('orders') // Ваша единая таблица для всех заявок сайта
      .insert([
        { 
          client_name: validName, 
          client_phone: phoneInp,
          device_type: draftOrder.deviceType || "Ремонт компьютеров", 
          
          // Спасаем от ошибки NOT NULL: пишем понятный текст поломки для мастера
          initial_problem: "Быстрая заявка: клиент хочет узнать стоимость ремонта по телефону.",
          
          // Передаем точный источник для сквозной аналитики
          source: draftOrder.source || "Узнать стоимость ремонта, раздел компьютеры"
        }
      ]);

    if (error) {
      throw error; // Передаем ошибку в блок catch для разбора
    }

    alert("Заявка успешно отправлена! Мастер свяжется с вами.");
    closePriceModal();
    
    // Сбрасываем поля
    document.getElementById('modal-callback-name').value = "";
    document.getElementById('modal-callback-phone').value = "";

  } catch (err) {
    console.error("Критическая ошибка Supabase (Таблица orders):", err);
    // Выводим подробный текст ошибки от Supabase, чтобы сразу понять, в чем дело
    alert(`Ошибка при отправке: ${err.message || JSON.stringify(err)}`);
  }
}
