const newsContainer = document.querySelector('.not_interna');
const news = [
  {
    title: 'Corinthians fecha patrocínio com Lukma',
    description: 'Empresa vai exibir a sua marca na barra traseira do calção dos atletas do futebol masculino profissional',
    image: 'assets/images/noticia/not01.jpg'
  },
  {
    title: 'Embaixador da Multieletrica',
    description: 'Fabiano Hayasaki arquiteto se torna Embaixador oficial da Multieletrica.',
    image: 'assets/images/noticia/not02.png'
  },
  {
    title: 'Garoto Propaganda',
    description: 'Neto o craque, ex jogador, comentarista é o novo Garoto Propaganda da Multieletrica.',
    image: 'assets/images/noticia/not03.jpg'
  },  
  {
    title: 'Premiação - Rodrigo Lukasavicus',
    description: 'Em reconhecimento pelos inestimáveis e excepcionais serviços à coletividade.',
    image: 'assets/images/noticia/not04.jpg'
  },
  {
    title: 'Bruxinho da sinuca',
    description: 'O Grupo Lukma tem o orgulho de anunciar que está patrocinando o talentoso Bruxinho da sinuca Baianinho de Mauá.',
    image: 'assets/images/noticia/not05.jpg'
  },
  {
    title: 'Internacional Limeira fecha patrocínio com Lukma',
    description: 'A Internacional divulga oficialmente a parceria com o Grupo Lukma Electric para a sequência da temporada.',
    image: 'assets/images/noticia/not07.png'
  },
  // ... Adicione mais notícias conforme necessário
];

let currentNewsIndex = 0;

function showNextNews() {
  const currentNews = news[currentNewsIndex];

  const newsElement = document.createElement('div');
  newsElement.classList.add('news-item');
  newsElement.innerHTML = `
    <div class="news-item-img">
      <img src="${currentNews.image}" alt="Imagem da Notícia">
    </div>
    <h2>${currentNews.title}</h2>
    <p>${currentNews.description}</p>
  `;

  newsContainer.innerHTML = '';
  newsContainer.appendChild(newsElement);

  currentNewsIndex = (currentNewsIndex + 1) % news.length;
}

showNextNews(); // Mostra a primeira notícia imediatamente

setInterval(showNextNews, 20000); // Mostra a próxima notícia a cada 1 minuto
