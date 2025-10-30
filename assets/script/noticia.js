// notacia.js
(function() { 
    
    // URL do Script de acesso à Planilha Google
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwFw9x2EckNeuHY8QbZ6j13DCi_PvBQI7KFCkiRoeffqiBCcoKdLplg46Ls8B7j6N1NSQ/exec'; 

    const newsContainer = document.querySelector('.not_interna');
    const BASE_IMAGE_PATH_NOTICIA = 'assets/images/noticia/'; 
    
    let news = []; 
    let currentNewsIndex = 0;
    // O intervalo foi mantido em 20 segundos, conforme o seu código
    const rotationInterval = 20000;

    async function fetchNoticias() {
        const url = `${WEB_APP_URL}?sheet=Noticia`;
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} ao buscar notícias.`);
            }
            
            const rawNews = await response.json();
            
            // Mapeia, filtra e ordena os dados da planilha
            news = rawNews
                .map(item => {
                    // Converte o filename da planilha para minúsculo
                    const filename = String(item.imagem_url || '').trim().toLowerCase();
                    
                    return {
                        title: item.titulo,
                        description: item.descricao,
                        image: BASE_IMAGE_PATH_NOTICIA + filename, 
                        order: item.ordem ? parseInt(item.ordem) : 999 
                    };
                })
                .filter(item => item.title && item.image && item.image.includes(BASE_IMAGE_PATH_NOTICIA))
                .sort((a, b) => a.order - b.order); 

            if (news.length > 0) {
                showNextNews();
                // Inicia o ciclo de rotação
                setInterval(showNextNews, rotationInterval);
            } else {
                newsContainer.innerHTML = '<h2>Nenhuma notícia válida encontrada.</h2>';
            }

        } catch (error) {
            console.error('Noticia.js: Falha ao carregar as notícias.', error);
            newsContainer.innerHTML = '<h2>Erro ao carregar as notícias.</h2>';
        }
    }


    function showNextNews() {
        if (news.length === 0) return;
        
        const currentNews = news[currentNewsIndex];

        const newsElement = document.createElement('div');
        newsElement.classList.add('news-item');
        
        // CORREÇÃO AQUI: Ordem dos elementos ajustada para: Imagem, Título, Descrição
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

    fetchNoticias();

})();