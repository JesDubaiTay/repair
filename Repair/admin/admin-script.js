// ========================================================
// 1. ИНИЦИАЛИЗАЦИЯ SUPABASE (Вставьте ваши ключи из лендинга)
// ========================================================
const SUPABASE_URL = 'https://rikhpxdysaamkbcvfnkh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FKQJQV6xvJujVg8sEKFwJg_5wUAr3-s';

window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Настройки сортировки
const statusWeights = { 'new': 1, 'process': 2, 'done': 3 };
let currentSortMode = 'status'; 

// ========================================================
// 2. ЛОГИКА АВТОРИЗАЦИИ (Supabase Auth)
// ========================================================

// Проверка сессии при загрузке страницы
async function checkAuthOnLoad() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (user && !error) {
      document.getElementById('auth-screen').style.display = 'none';
      document.getElementById('admin-screen').style.display = 'flex';
      
      initTableSortButton();
      loadLiveOrders(); // Загружаем живые заявки из базы
    } else {
      document.getElementById('auth-screen').style.display = 'flex';
      document.getElementById('admin-screen').style.display = 'none';
    }
  } catch (err) {
    console.error("Ошибка проверки сессии:", err);
  }
}

// Вход в систему (логин — это ваш Email)
async function handleAdminLogin(event) {
  event.preventDefault();
  
  const emailInp = document.getElementById('username').value.trim();
  const passInp = document.getElementById('password').value.trim();
  
  const loginBtn = document.querySelector('.btn-login');
  loginBtn.innerText = "Вход в систему...";
  loginBtn.disabled = true;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailInp,
      password: passInp,
    });

    if (error) {
      alert(`Ошибка входа: ${error.message}`);
      return;
    }

    checkAuthOnLoad();

  } catch (err) {
    console.error(err);
    alert("Произошла ошибка при попытке авторизации.");
  } finally {
    loginBtn.innerText = "Войти в систему";
    loginBtn.disabled = false;
  }
}

// Выход из системы
async function handleAdminLogout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert("Не удалось выйти из системы: " + error.message);
  } else {
    window.location.reload();
  }
}

// ========================================================
// 3. ЗАГРУЗКА ДАННЫХ ИЗ ТАБЛИЦЫ ORDERS
// ========================================================

async function loadLiveOrders() {
  const tableBody = document.getElementById('orders-table-body');
  const countSpan = document.querySelector('.orders-count');
  
  if (!tableBody) return;
  tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 20px;">Загрузка заявок из базы...</td></tr>`;

  try {
    // Тянем все заявки из Supabase
    const { data: orders, error } = await supabase.from('orders').select('*');

    if (error) throw error;

    countSpan.innerText = `Всего: ${orders.length} заявок`;
    tableBody.innerHTML = ''; 

    if (orders.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 20px;">Новых заявок пока нет.</td></tr>`;
      return;
    }

    // Отрисовываем каждую заявку
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const formattedDate = date.toLocaleString('ru-RU', { 
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
      });

      const row = document.createElement('tr');
      row.setAttribute('data-id', order.id);
      row.setAttribute('data-status', order.status || 'new');

      row.innerHTML = `
        <td>#${order.id}</td>
        <td>${formattedDate}</td>
        <td><span class="source-tag">${order.source || 'Не указан'}</span></td>
        <td>${order.client_name}</td>
        <td><a href="tel:${order.client_phone}" class="table-phone">${order.client_phone}</a></td>
        <td>${order.initial_problem || 'Нет описания'}</td>
        <td>
          <select class="status-select status-${order.status || 'new'}">
            <option value="new" ${order.status === 'new' ? 'selected' : ''}>Новая</option>
            <option value="process" ${order.status === 'process' ? 'selected' : ''}>В работе</option>
            <option value="done" ${order.status === 'done' ? 'selected' : ''}>Готово</option>
          </select>
        </td>
        <td>
          <input type="text" class="master-note-input" placeholder="Добавить заметку..." 
                 value="${order.master_comment || ''}" 
                 onchange="updateMasterComment(${order.id}, this.value)">
        </td>
      `;
      tableBody.appendChild(row);
    });

    // После того как все строки вставились, применяем вашу фирменную сортировку
    sortTableRows();

  } catch (err) {
    console.error("Ошибка загрузки данных из Supabase:", err);
    tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:red; padding: 20px;">Ошибка при загрузке данных.</td></tr>`;
  }
}

// ========================================================
// 4. СОХРАНЕНИЕ ИЗМЕНЕНИЙ В БАЗУ ДАННЫХ (UPDATE)
// ========================================================

// Асинхронное сохранение заметки мастера при потере фокуса (onchange)
async function updateMasterComment(orderId, newComment) {
  console.log(`Сохранение заметки для #${orderId}: ${newComment}`);
  const { error } = await supabase
    .from('orders')
    .update({ master_comment: newComment })
    .eq('id', orderId);

  if (error) {
    alert("Не удалось сохранить заметку в базу: " + error.message);
  }
}

// Следим за изменением статусов в выпадающих списках и пишем в БД
document.addEventListener('change', async function(e) {
  if (e.target && e.target.classList.contains('status-select')) {
    const select = e.target;
    const row = select.closest('tr');
    const orderId = row.getAttribute('data-id');
    const newStatus = select.value;
    
    select.classList.remove('status-new', 'status-process', 'status-done');
    row.setAttribute('data-status', newStatus);
    
    if (newStatus === 'new') select.classList.add('status-new');
    if (newStatus === 'process') select.classList.add('status-process');
    if (newStatus === 'done') select.classList.add('status-done');
    
    // ОТПРАВЛЯЕМ ОБНОВЛЕННЫЙ СТАТУС В SUPABASE
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      alert("Не удалось обновить статус в базе данных: " + error.message);
      return;
    }

    if (currentSortMode === 'id') {
      currentSortMode = 'status';
      const arrow = document.getElementById('sort-id-arrow');
      if (arrow) arrow.style.color = '#606C66'; 
    }
    
    sortTableRows();
  }
});

// ========================================================
// 5. ЛОГИКА СОРТИРОВКИ ТАБЛИЦЫ
// ========================================================

function initTableSortButton() {
  const idHeader = document.querySelector('.orders-table th:first-child');
  if (idHeader) {
    idHeader.style.cursor = 'pointer';
    idHeader.title = 'Сбросить сортировку и показать по ID';
    idHeader.innerHTML = 'ID <span id="sort-id-arrow" style="font-size: 10px; margin-left: 3px; color: #606C66;">⇅</span>';
    
    idHeader.onclick = function() {
      currentSortMode = 'id';
      document.getElementById('sort-id-arrow').style.color = '#00875A'; 
      sortTableRows();
    };
  }
}

function sortTableRows() {
  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;

  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  rows.sort((rowA, rowB) => {
    const idA = parseInt(rowA.getAttribute('data-id'));
    const idB = parseInt(rowB.getAttribute('data-id'));

    if (currentSortMode === 'status') {
      const statusA = rowA.getAttribute('data-status');
      const statusB = rowB.getAttribute('data-status');
      
      if (statusWeights[statusA] !== statusWeights[statusB]) {
        return statusWeights[statusA] - statusWeights[statusB];
      }
      return idB - idA; 
    } else {
      return idB - idA;
    }
  });

  rows.forEach(row => tbody.appendChild(row));
}

// Запуск стартовой проверки при загрузке скрипта
checkAuthOnLoad();
// Автоматическое обновление таблицы в реальном времени
supabase
  .channel('public:orders')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
    console.log('Получена новая заявка', payload.new);
    // Просто перезапускаем функцию загрузки, чтобы таблица обновилась
    loadLiveOrders(); 
  })
  .subscribe();
