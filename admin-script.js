// Веса для статусов (чем меньше цифра, тем выше в таблице)
const statusWeights = {
  'new': 1,
  'process': 2,
  'done': 3
};

// Переменная режима сортировки: 'status' (по статусам) или 'id' (стандартный сброс по ID)
let currentSortMode = 'status'; 

// Функция проверки авторизации при загрузке страницы
function checkAuthOnLoad() {
  const isAuthorized = sessionStorage.getItem('isMasterLogged');
  
  if (isAuthorized === 'true') {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('admin-screen').style.display = 'flex';
    
    // При первичном входе вешаем обработчик клика на заголовок ID
    initTableSortButton();
    // Сортируем в дефолтный режим
    sortTableRows();
  } else {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('admin-screen').style.display = 'none';
  }
}

// Навешиваем клик на заголовок ID для возврата к стандарту
function initTableSortButton() {
  const idHeader = document.querySelector('.orders-table th:first-child');
  if (idHeader) {
    idHeader.style.cursor = 'pointer';
    idHeader.title = 'Сбросить сортировку и показать по ID';
    // Добавим визуальный индикатор-стрелочку возле слова ID
    idHeader.innerHTML = 'ID <span id="sort-id-arrow" style="font-size: 10px; margin-left: 3px; color: #606C66;">⇅</span>';
    
    idHeader.onclick = function() {
      // Переключаем режим на строгую сортировку по ID
      currentSortMode = 'id';
      document.getElementById('sort-id-arrow').style.color = '#00875A'; // подсвечиваем стрелочку зеленым
      sortTableRows();
    };
  }
}

// Функция сортировки строк таблицы
function sortTableRows() {
  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;

  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  rows.sort((rowA, rowB) => {
    const idA = parseInt(rowA.getAttribute('data-id'));
    const idB = parseInt(rowB.getAttribute('data-id'));

    if (currentSortMode === 'status') {
      // 1. Режим по умолчанию: Сначала сортируем по весу статуса (Новые -> В работе -> Готово)
      const statusA = rowA.getAttribute('data-status');
      const statusB = rowB.getAttribute('data-status');
      
      if (statusWeights[statusA] !== statusWeights[statusB]) {
        return statusWeights[statusA] - statusWeights[statusB];
      }
      // Если статусы одинаковые внутри группы — сортируем по ID (свежие сверху)
      return idB - idA;
    } else {
      // 2. Режим "Стандарт": Строгая сквозная сортировка по ID (самые новые ID всегда вверху)
      return idB - idA;
    }
  });

  // Перерисовываем отсортированные строки обратно в таблицу
  rows.forEach(row => tbody.appendChild(row));
}

// Обработчик отправки формы логина
function handleAdminLogin(event) {
  event.preventDefault();
  const userInp = document.getElementById('username').value.trim();
  const passInp = document.getElementById('password').value.trim();
  
  if (userInp === 'admin' && passInp === 'admin') {
    sessionStorage.setItem('isMasterLogged', 'true');
    checkAuthOnLoad();
  } else {
    alert('Неверный логин или пароль! Попробуйте снова.');
  }
}

// Выход из системы
function handleAdminLogout() {
  sessionStorage.removeItem('isMasterLogged');
  window.location.reload();
}

// Следим за изменением статусов в выпадающих списках
document.addEventListener('change', function(e) {
  if (e.target && e.target.classList.contains('status-select')) {
    const select = e.target;
    const row = select.closest('tr');
    
    select.classList.remove('status-new', 'status-process', 'status-done');
    const newStatus = select.value;
    row.setAttribute('data-status', newStatus);
    
    if (newStatus === 'new') select.classList.add('status-new');
    if (newStatus === 'process') select.classList.add('status-process');
    if (newStatus === 'done') select.classList.add('status-done');
    
    console.log(`Статус заявки #${row.getAttribute('data-id')} изменен на: ${newStatus}`);
    
    // Если мастер вручную меняет статус, логично вернуть умную группировку по статусам
    if (currentSortMode === 'id') {
      currentSortMode = 'status';
      const arrow = document.getElementById('sort-id-arrow');
      if (arrow) arrow.style.color = '#606C66'; // возвращаем стрелочке нейтральный серый цвет
    }
    
    sortTableRows();
  }
});

// Запуск проверки авторизации при старте скрипта
checkAuthOnLoad();