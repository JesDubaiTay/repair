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

  // 2. ЖЕСТКОЕ ПЕРЕНАПРАВЛЕНИЕ НА НОВУЮ СТРАНИЦУ ПК
  if (typeName === 'Ремонт компьютеров') {
      // Закрываем меню (если функция toggleServicesMenu существует на главной)
      if (typeof toggleServicesMenu === "function") toggleServicesMenu();
      
      // Переходим по относительному пути (без слэша в начале — для GitHub Pages это закон)
      window.location.href = 'repairs/kompyutery.html';
      return; // Останавливаем функцию, чтобы не вылетал старый alert
  }
  
  // Ниже остается ваша старая логика заглушки для остальной техники
  if (typeof toggleServicesMenu === "function") toggleServicesMenu();
  alert(`Выбран ремонт: ${typeName}. Логика квиза сработает здесь.`);
}

function startQuizFromHero() {
  // 1. Забираем текст из инпута на главном экране
  const heroInput = document.getElementById('initial-problem');
  if (!heroInput) return;

  const problemText = heroInput.value.trim();

  if (problemText === "") {
    alert("Пожалуйста, опишите коротко, что нужно починить!");
    return;
  }

  // 2. Записываем в наш единый глобальный объект квиза
  quizDraftOrder.initialProblem = problemText;
  
  // Устанавливаем источник, чтобы в админке было видно, откуда пришел лид
  quizDraftOrder.source = "Главный экран (Инпут)";

  // ЛАЙФХАК: Синхронизируем текст с текстовым полем внутри квиза на Шаге 2, 
  // чтобы функция submitQuizStep2() потом случайно не затерла его пустотой!
  const quizTextarea = document.getElementById('quiz-problem-textarea');
  if (quizTextarea) {
    quizTextarea.value = problemText;
  }

  // 3. Выводим ваше сообщение и открываем квиз
  alert(`Проблема "${problemText}" записана! Переходим к выбору бренда.`);
  
  // Открываем модальное окно квиза
  if (typeof openQuizModal === "function") {
    openQuizModal();
    // Переключаем сразу на шаг 1 (выбор бренда), так как проблему мы уже зафиксировали
    changeQuizStep(1); 
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
const reviewsData = [
  { name: "Игорь К.", date: "12 мая 2026", device: "Телевизор LG", text: "Перестал включаться экран, звук шел. Принес в РемонтТех, через 2 часа перезвонили — сгорела подсветка. Сделали за день, цена адекватная, дали гарантию.", rating: 5 },
  { name: "Анна Миронова", date: "28 апреля 2026", device: "Ноутбук ASUS", text: "Ноутбук начал жутко тормозить и греться как утюг. Мастер провел чистку, заменил термопасту прямо при мне за полчаса. Теперь летает и работает тихо!", rating: 5 },
  { name: "Дмитрий Л.", date: "15 апреля 2026", device: "iPhone 13", text: "Разбил стекло на айфоне, думал придется менять весь модуль за огромные деньги. В РемонтТех смогли переклеить только само стекло! Сэкономил кучу денег.", rating: 5 },
  { name: "Ольга Чехова", date: "4 апреля 2026", device: "Телевизор Samsung", text: "Экран пошел полосами после грозы. Думала всё, на свалку. Мастер поколдовал над платой питания, что-то перепаял. Телевизор снова как новый, спасибо!", rating: 5 },
  { name: "Сергей Волк", date: "22 марта 2026", device: "Компьютер (ПК)", text: "Компьютер перестал загружаться, выдавал синий экран. Привез ребятам. Быстро нашли битую планку оперативки, заменили, почистили от пыли. Отличный сервис.", rating: 5 },
  { name: "Мария П.", date: "11 марта 2026", device: "Планшет iPad", text: "Сын расшатал гнездо зарядки, планшет перестал заряжаться. Поменяли разъем за пару часов. Заодно проконсультировали по защитному стеклу. Рекомендую!", rating: 5 },
  { name: "Артем Ребров", date: "3 марта 2026", device: "Монитор AOC", text: "Монитор гас через секунду после включения. Заменили конденсаторы в блоке питания. Быстро, недорого, без лишних навязанных услуг. Все честно.", rating: 5 },
  { name: "Елена К.", date: "25 февраля 2026", device: "Робот-пылесос", text: "Пылесос крутился на одном месте и выдавал ошибку бампера. Починили за один день, цена очень порадовала. Буду обращаться еще с мелкой техникой.", rating: 5 },
  { name: "Владимир Ш.", date: "14 февраля 2026", device: "Ноутбук Lenovo", text: "Залил клавиатуру кофе, половина кнопок залипла. Заменили клавиатуру на оригинальную. Сделали аккуратно, корпус без царапин после разборки.", rating: 5 },
  { name: "Светлана", date: "2 февраля 2026", device: "Смартфон Xiaomi", text: "Батарея совсем перестала держать заряд, телефон выключался на 30%. Поменяли аккумулятор быстро, теперь снова держит заряд как новый весь день.", rating: 5 },
  { name: "Павел Дуров", date: "20 января 2026", device: "Жесткий диск (HDD)", text: "Случайно удалил семейный архив фото с внешнего диска. Думал потерял навсегда. Специалист по восстановлению данных вернул абсолютно всё! Чудо какое-то.", rating: 5 },
  { name: "Евгения Т.", date: "9 января 2026", device: "Микроволновка", text: "Искрила и трещала при включении. Оказалось, прогорела пластина слюды. Заменили за 15 минут в моем присутствии. Очень приятный и быстрый сервис.", rating: 5 },
  { name: "Константин", date: "28 декабря 2025", device: "Игровая приставка PS5", text: "Консоль начала сильно шуметь в тяжелых играх. Ребята полностью ее обслужили, заменили жидкий металл. Работает теперь бесшумно, как из коробки.", rating: 5 },
  { name: "Наталья В.", date: "15 декабря 2025", device: "Смартфон Samsung", text: "Уронила телефон в воду. Принесла сразу сюда, мастер оперативно разобрал, просушил в ультразвуковой ванне, восстановил дорожки. Телефон выжил!", rating: 5 },
  { name: "Максим Г.", date: "3 декабря 2025", device: "Телевизор Philips", text: "Появились темные пятна по углам экрана. Сделали ремонт локальной подсветки. Картинка снова сочная, равномерная. Качественная работа профессионалов.", rating: 5 },
  { name: "Юлия", date: "22 ноября 2025", device: "Наушники AirPods", text: "Один наушник стал играть тише другого. Оказалось, глубокое загрязнение сеточек. Почистили специальным средством, звук выровнялся. Быстро и дешево.", rating: 5 },
  { name: "Иван Алексеевич", date: "10 ноября 2025", device: "ПК (Сборка)", text: "Обратился за помощью в сборке нового игрового ПК из моих комплектующих. Собрали шикарно, кабель-менеджмент идеальный, проверили под нагрузкой.", rating: 5 },
  { name: "Кристина Р.", date: "30 октября 2025", device: "Электронная книга", text: "Экран застыл на одной странице и не реагировал на кнопки. Перепрошили девайс, теперь все работает плавно, книжка снова ожила.", rating: 4 },
  { name: "Роман", date: "18 октября 2025", device: "Увлажнитель воздуха", text: "Перестал идти пар. Заменили ультразвуковую мембрану. Работа заняла пару часов, теперь в комнате снова комфортный микроклимат.", rating: 5 },
  { name: "Олеся", date: "5 октября 2025", device: "Смартфон Honor", text: "Разбила камеру сзади, фотки были мутные. Заменили стеклышко камеры за полчаса. Фокус теперь ловит идеально, царапин на корпусе не оставили.", rating: 5 }
];
let currentSlideIndex = 0;
let cardsPerPage = 3;

// Функция инициализации отзывов
function initReviewsSlider() {
  const track = document.getElementById('reviews-track');
  const dotsContainer = document.getElementById('slider-dots-container');
  
  // 1. Генерируем HTML карточек из нашего массива данных
  let cardsHTML = '';
  reviewsData.forEach(rev => {
    let stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
    cardsHTML += `
      <div class="review-card">
        <div class="review-user-info">
          <div>
            <div class="review-name">${rev.name}</div>
            <div class="review-stars">${stars}</div>
          </div>
          <div class="review-date">${rev.date}</div>
        </div>
        <div class="review-device-tag">🔧 ${rev.device}</div>
        <p class="review-text">${rev.text}</p>
      </div>
    `;
  });
  track.innerHTML = cardsHTML;

  // 2. Вычисляем количество точек управления
  updateCardsPerPage();
  let totalDots = reviewsData.length - cardsPerPage + 1;
  if(totalDots < 1) totalDots = 1;

  let dotsHTML = '';
  for(let i = 0; i < totalDots; i++) {
    dotsHTML += `<span class="slider-dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></span>`;
  }
  dotsContainer.innerHTML = dotsHTML;

  // Слушаем изменение размеров экрана, чтобы слайдер не ломался
  window.addEventListener('resize', () => {
    updateCardsPerPage();
    goToSlide(currentSlideIndex);
  });
}

// Определяем, сколько карточек влезает на экран прямо сейчас
function updateCardsPerPage() {
  if (window.innerWidth <= 768) {
    cardsPerPage = 1;
  } else if (window.innerWidth <= 1100) {
    cardsPerPage = 2;
  } else {
    cardsPerPage = 3;
  }
}

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

// Запуск слайдера и настройка тач-событий для мобилок
document.addEventListener("DOMContentLoaded", () => {
  initReviewsSlider();

  const viewport = document.querySelector('.slider-viewport');
  let touchStartX = 0;
  let touchEndX = 0;

  // Фиксируем, где палец коснулся экрана
  viewport.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  // Фиксируем, где палец оторвался от экрана
  viewport.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  // Логика определения направления свайпа
  function handleSwipe() {
    const swipeThreshold = 50; // Минимальная длина свайпа в пикселях
    if (touchStartX - touchEndX > swipeThreshold) {
      // Свайп влево — крутим вперед
      moveSlider(1);
    } else if (touchEndX - touchStartX > swipeThreshold) {
      // Свайп вправо — крутим назад
      moveSlider(-1);
    }
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