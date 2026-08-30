function showToast(message, type) {
  type = type || 'success';
  var container = document.getElementById('toast-container');
  if (!container) return alert(message);
  var isError = type === 'error';
  var isInfo = type === 'info';
  var cls = isError ? 'mc-toast-error' : isInfo ? 'mc-toast-info' : 'mc-toast-success';
  var icon = isError ? 'bi-exclamation-triangle' : isInfo ? 'bi-info-circle' : 'bi-check-circle';
  var iconColor = isError ? 'var(--mc-danger)' : isInfo ? 'var(--mc-info)' : 'var(--mc-success)';
  var el = document.createElement('div');
  el.className = 'mc-toast ' + cls;
  el.setAttribute('role', 'alert');
  el.innerHTML = '<i class="bi ' + icon + '" style="color:' + iconColor + ';font-size:1.1rem;flex-shrink:0" aria-hidden="true"></i>'
    + '<span style="flex:1;min-width:0;word-break:break-word">' + escapeHtml(message) + '</span>'
    + '<button type="button" class="btn-close" style="font-size:0.7rem" aria-label="Fechar"></button>';
  var closeBtn = el.querySelector('.btn-close');
  if (closeBtn) closeBtn.addEventListener('click', function(){ el.remove(); });
  container.appendChild(el);
  setTimeout(function(){
    el.style.animation = 'mc-toast-out 160ms ease forwards';
    setTimeout(function(){ el.remove(); }, 170);
  }, 4000);
}
function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function formatBRL(cents){
  return (cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}
function formatDateBR(d){
  var dt = new Date(d);
  if(isNaN(dt)) return String(d).slice(0,10).split('-').reverse().join('/');
  return dt.toLocaleDateString('pt-BR',{timeZone:'UTC'});
}
document.addEventListener('DOMContentLoaded', function(){
  setTimeout(function(){
    document.querySelectorAll('.alert').forEach(function(a){
      try { var bs = bootstrap.Alert.getOrCreateInstance(a); if(bs) bs.close(); } catch(e){}
    });
  }, 5000);
  document.querySelectorAll('[data-confirm]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      var msg = btn.getAttribute('data-confirm') || 'Tem certeza?';
      if(!confirm(msg)) e.preventDefault();
    });
  });
  document.querySelectorAll('form[data-prevent-double]').forEach(function(f){
    f.addEventListener('submit', function(){
      var b = f.querySelector('button[type=submit]');
      if(b){ b.disabled=true; b.dataset.orig=b.textContent; b.textContent='Salvando…'; setTimeout(function(){ b.disabled=false; b.textContent=b.dataset.orig; }, 4000); }
    });
  });
});
