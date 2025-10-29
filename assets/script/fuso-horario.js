// Seu código JavaScript aqui
function updateTimes() {
  const brasiliaTime = new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const newYorkTime = new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' });
  const hongKongTime = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Hong_Kong' });

  document.getElementById('brasilia-time').textContent = brasiliaTime;
  document.getElementById('newyork-time').textContent = newYorkTime;
  document.getElementById('hongkong-time').textContent = hongKongTime;
}

// Chame a função inicialmente e a cada segundo para manter os horários atualizados
updateTimes();
setInterval(updateTimes, 1000);
