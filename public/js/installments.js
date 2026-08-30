(function () {
  var dataEl = document.getElementById('installments-data');
  var todayEl = document.getElementById('installments-today');
  var calendarEl = document.getElementById('inst-calendar');
  var loadingEl = document.getElementById('inst-loading');
  var emptyEl = document.getElementById('inst-empty');
  var errorEl = document.getElementById('inst-error');
  var periodLabel = document.getElementById('inst-period-label');
  var prevBtn = document.getElementById('inst-prev');
  var nextBtn = document.getElementById('inst-next');
  var todayBtn = document.getElementById('inst-today');
  var retryBtn = document.getElementById('inst-retry');
  var filterMethod = document.getElementById('filter-method');
  var filterStatus = document.getElementById('filter-status');
  var filterCustomer = document.getElementById('filter-customer');
  var filterClear = document.getElementById('filter-clear');
  var sumCount = document.getElementById('inst-summary-count');
  var sumPending = document.getElementById('inst-summary-pending');
  var sumPaid = document.getElementById('inst-summary-paid');
  var sumOverdue = document.getElementById('inst-summary-overdue');

  var installments = [];
  var todayStr = '';
  try {
    installments = JSON.parse(dataEl ? dataEl.textContent || '[]' : '[]');
  } catch (e) {
    installments = [];
  }
  try {
    todayStr = JSON.parse(todayEl ? todayEl.textContent || '""' : '""');
  } catch (e) {
    todayStr = new Date().toISOString().slice(0, 10);
  }
  if (!todayStr) todayStr = new Date().toISOString().slice(0, 10);

  var monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var weekDays = ['SEG','TER','QUA','QUI','SEX','SÁB','DOM'];

  var parts = todayStr.split('-');
  var curYear = Number(parts[0]);
  var curMonth = Number(parts[1]) - 1; // 0-indexed

  function brl(cents) {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  function methodLabel(m) {
    var map = { PIX: 'PIX', BOLETO: 'Boleto', CREDIT_CARD: 'Cartão de crédito', DEBIT_CARD: 'Cartão de débito', CASH: 'Dinheiro' };
    return map[m] || m;
  }
  function methodClass(m) {
    var map = { PIX: 'pm-pix', BOLETO: 'pm-boleto', CREDIT_CARD: 'pm-credit', DEBIT_CARD: 'pm-debit', CASH: 'pm-cash' };
    return map[m] || 'pm-pix';
  }
  function statusInfo(inst) {
    var due = inst.dueDate;
    var isOverdue = inst.status === 'PENDING' && due < todayStr;
    if (inst.status === 'PAID' || inst.status === 'SETTLED') return { icon: 'bi-check-circle-fill', iconClass: 'text-success', label: inst.status === 'SETTLED' ? 'Quitado' : 'Pago', overdue: false, paid: true };
    if (isOverdue) return { icon: 'bi-exclamation-triangle-fill', iconClass: 'text-danger', label: 'Vencido', overdue: true, paid: false };
    if (inst.status === 'CANCELED') return { icon: 'bi-x-circle', iconClass: 'text-secondary', label: 'Cancelado', overdue: false, paid: false };
    return { icon: 'bi-circle-fill', iconClass: 'text-warning', label: 'Pendente', overdue: false, paid: false };
  }

  function getFiltered() {
    var m = filterMethod ? filterMethod.value : '';
    var s = filterStatus ? filterStatus.value : '';
    var q = filterCustomer ? filterCustomer.value.trim().toLowerCase() : '';
    return installments.filter(function (inst) {
      if (m && inst.paymentMethod !== m) return false;
      if (s && inst.status !== s) return false;
      if (q && inst.customerName.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
  }

  function render() {
    var filtered = getFiltered();
    // group by dueDate
    var byDate = {};
    filtered.forEach(function (inst) {
      if (!byDate[inst.dueDate]) byDate[inst.dueDate] = [];
      byDate[inst.dueDate].push(inst);
    });

    // period label + summary for current month
    if (periodLabel) periodLabel.textContent = monthNames[curMonth] + ' ' + curYear;

    var monthPrefix = curYear + '-' + String(curMonth + 1).padStart(2, '0');
    var monthItems = filtered.filter(function (i) { return i.dueDate.indexOf(monthPrefix) === 0; });
    var pending = monthItems.filter(function (i) { return i.status === 'PENDING'; });
    var paid = monthItems.filter(function (i) { return i.status === 'PAID' || i.status === 'SETTLED'; });
    var overdue = pending.filter(function (i) { return i.dueDate < todayStr; });
    var pendingTotal = pending.reduce(function (s, i) { return s + i.amountCents; }, 0);
    var paidTotal = paid.reduce(function (s, i) { return s + i.amountCents; }, 0);
    var overdueTotal = overdue.reduce(function (s, i) { return s + i.amountCents; }, 0);
    if (sumCount) sumCount.textContent = monthItems.length + ' parcela(s)';
    if (sumPending) sumPending.textContent = brl(pendingTotal);
    if (sumPaid) sumPaid.textContent = brl(paidTotal);
    if (sumOverdue) sumOverdue.textContent = brl(overdueTotal);

    // build calendar grid
    var firstDay = new Date(curYear, curMonth, 1);
    // getDay: 0=Sun -> convert to Mon=0
    var startWeekday = (firstDay.getDay() + 6) % 7;
    var daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
    var daysInPrev = new Date(curYear, curMonth, 0).getDate();

    var html = '';
    html += '<div class="cal-weekdays">' + weekDays.map(function (d) { return '<div class="cal-weekday">' + d + '</div>'; }).join('') + '</div>';
    html += '<div class="cal-grid">';

    var totalCells = 42; // 6 weeks
    for (var i = 0; i < totalCells; i++) {
      var dayNum, isOther, cellDateStr;
      if (i < startWeekday) {
        dayNum = daysInPrev - startWeekday + 1 + i;
        var pm = curMonth === 0 ? 11 : curMonth - 1;
        var py = curMonth === 0 ? curYear - 1 : curYear;
        cellDateStr = py + '-' + String(pm + 1).padStart(2, '0') + '-' + String(dayNum).padStart(2, '0');
        isOther = true;
      } else if (i >= startWeekday + daysInMonth) {
        dayNum = i - startWeekday - daysInMonth + 1;
        var nm = curMonth === 11 ? 0 : curMonth + 1;
        var ny = curMonth === 11 ? curYear + 1 : curYear;
        cellDateStr = ny + '-' + String(nm + 1).padStart(2, '0') + '-' + String(dayNum).padStart(2, '0');
        isOther = true;
      } else {
        dayNum = i - startWeekday + 1;
        cellDateStr = curYear + '-' + String(curMonth + 1).padStart(2, '0') + '-' + String(dayNum).padStart(2, '0');
        isOther = false;
      }
      var isToday = cellDateStr === todayStr;
      var items = byDate[cellDateStr] || [];
      var cellClass = 'cal-cell' + (isOther ? ' cal-cell-other' : '') + (isToday ? ' cal-cell-today' : '');
      html += '<div class="' + cellClass + '" data-date="' + cellDateStr + '">';
      html += '<div class="cal-cell-head"><span class="cal-daynum' + (isToday ? ' cal-daynum-today' : '') + '">' + dayNum + '</span>' + (isToday ? '<span class="badge bg-dark ms-1" style="font-size:0.6rem">Hoje</span>' : '') + '</div>';
      if (items.length === 0) {
        html += '<div class="cal-cell-empty"></div>';
      } else {
        html += '<div class="cal-events">';
        // limit visible to avoid overflow, but all are rendered with scroll
        items.forEach(function (inst) {
          var si = statusInfo(inst);
          var paidClass = si.paid ? ' cal-event-paid' : '';
          var overdueClass = si.overdue ? ' cal-event-overdue' : '';
          var title = inst.customerName + ' — ' + brl(inst.amountCents) + ' · ' + methodLabel(inst.paymentMethod) + ' · ' + inst.number + '/' + inst.saleInstallments + ' · ' + si.label;
          html += '<a href="/sales/' + inst.saleId + '" class="cal-event ' + methodClass(inst.paymentMethod) + paidClass + overdueClass + '" title="' + escAttr(title) + '" aria-label="' + escAttr(title) + '">';
          html += '<span class="cal-event-dot" aria-hidden="true"></span>';
          html += '<span class="cal-event-main">';
          html += '<span class="cal-event-customer">' + escHtml(inst.customerName) + '</span>';
          html += '<span class="cal-event-value">' + brl(inst.amountCents) + '</span>';
          html += '</span>';
          html += '<span class="cal-event-meta"><span class="cal-event-method">' + escHtml(methodLabel(inst.paymentMethod)) + '</span><span class="cal-event-num">' + inst.number + '/' + inst.saleInstallments + '</span><i class="bi ' + si.icon + ' ' + si.iconClass + ' cal-event-status" aria-hidden="true" title="' + si.label + '"></i></span>';
          html += '</a>';
        });
        if (items.length > 3) {
          // hint handled by scroll, no extra
        }
        html += '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    // mobile list fallback (hidden on desktop via css, but also ensure)
    calendarEl.innerHTML = html;
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function escAttr(s) {
    return escHtml(s).replace(/'/g,'&#39;');
  }

  function showState() {
    if (loadingEl) loadingEl.classList.add('d-none');
    var filtered = getFiltered();
    var monthPrefix = curYear + '-' + String(curMonth + 1).padStart(2, '0');
    var hasAny = installments.length > 0;
    var monthHas = filtered.some(function (i) { return i.dueDate.indexOf(monthPrefix) === 0; });
    if (!hasAny) {
      if (calendarEl) calendarEl.classList.add('d-none');
      if (emptyEl) {
        emptyEl.classList.remove('d-none');
        emptyEl.querySelector('p.fw-medium').textContent = 'Nenhuma parcela cadastrada';
        emptyEl.querySelector('p.small').textContent = 'As parcelas das suas vendas aparecerão no calendário.';
      }
      return;
    }
    if (!monthHas) {
      if (emptyEl) {
        emptyEl.classList.remove('d-none');
        emptyEl.querySelector('p.fw-medium').textContent = 'Nenhuma parcela neste período';
        emptyEl.querySelector('p.small').textContent = 'Não existem recebimentos programados para estas datas.';
      }
      if (calendarEl) calendarEl.classList.remove('d-none');
      // still render grid (empty month looks empty) so keep calendar visible
    } else {
      if (emptyEl) emptyEl.classList.add('d-none');
      if (calendarEl) calendarEl.classList.remove('d-none');
    }
    if (errorEl) errorEl.classList.add('d-none');
  }

  function refresh() {
    render();
    showState();
  }

  // events
  if (prevBtn) prevBtn.addEventListener('click', function () {
    curMonth--; if (curMonth < 0) { curMonth = 11; curYear--; }
    refresh();
  });
  if (nextBtn) nextBtn.addEventListener('click', function () {
    curMonth++; if (curMonth > 11) { curMonth = 0; curYear++; }
    refresh();
  });
  if (todayBtn) todayBtn.addEventListener('click', function () {
    var p = todayStr.split('-'); curYear = Number(p[0]); curMonth = Number(p[1]) - 1; refresh();
  });
  if (filterMethod) filterMethod.addEventListener('change', refresh);
  if (filterStatus) filterStatus.addEventListener('change', refresh);
  if (filterCustomer) filterCustomer.addEventListener('input', refresh);
  if (filterClear) filterClear.addEventListener('click', function () {
    if (filterMethod) filterMethod.value = '';
    if (filterStatus) filterStatus.value = '';
    if (filterCustomer) filterCustomer.value = '';
    refresh();
  });
  if (retryBtn) retryBtn.addEventListener('click', function () { window.location.reload(); });

  // init
  try {
    if (installments.length === 0 && dataEl && dataEl.textContent.trim() === '') throw new Error('no data');
    refresh();
    if (loadingEl) loadingEl.classList.add('d-none');
  } catch (e) {
    if (loadingEl) loadingEl.classList.add('d-none');
    if (errorEl) errorEl.classList.remove('d-none');
    if (calendarEl) calendarEl.classList.add('d-none');
  }
})();
