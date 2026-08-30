function showToast(message, type) {
  type = type || 'success';
  var bg = type === 'error' ? 'bg-danger' : type === 'info' ? 'bg-info text-dark' : 'bg-success';
  var container = document.getElementById('toast-container');
  if (!container) return alert(message);
  var el = document.createElement('div');
  el.className = 'toast align-items-center border-0 ' + bg + ' text-white show mb-2';
  el.setAttribute('role', 'alert');
  el.innerHTML = '<div class="d-flex"><div class="toast-body">' + escapeHtml(message) + '</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>';
  container.appendChild(el);
  setTimeout(function(){ el.remove(); }, 4000);
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
  // Auto-dismiss flash after 5s
  setTimeout(function(){
    document.querySelectorAll('.alert').forEach(function(a){
      var bs = bootstrap.Alert.getOrCreateInstance(a);
      if(bs) try{ bs.close(); }catch(e){}
    });
  }, 5000);
  // Confirm delete buttons
  document.querySelectorAll('[data-confirm]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      var msg = btn.getAttribute('data-confirm') || 'Tem certeza?';
      if(!confirm(msg)) e.preventDefault();
    });
  });
  // Prevent double submit
  document.querySelectorAll('form[data-prevent-double]').forEach(function(f){
    f.addEventListener('submit', function(){
      var b = f.querySelector('button[type=submit]');
      if(b){ b.disabled=true; b.dataset.orig=b.textContent; b.textContent='Salvando…'; setTimeout(function(){ b.disabled=false; b.textContent=b.dataset.orig; }, 4000); }
    });
  });
});
