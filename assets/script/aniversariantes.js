// aniversariantes.js
(function() {
    
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwFw9x2EckNeuHY8QbZ6j13DCi_PvBQI7KFCkiRoeffqiBCcoKdLplg46Ls8B7j6N1NSQ/exec'; 

    const BASE_IMAGE_PATH = 'assets/images/aniversariante/'; 

    let aniversariantes = [];
    let currentAniversariante = 0;
    const rotationInterval = 5000;
    let intervalId;

    async function fetchAniversariantes() {
        const url = `${WEB_APP_URL}?sheet=Aniversariante`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            aniversariantes = await response.json();

            aniversariantes = aniversariantes.map(item => {
                // Converte o filename da planilha para minúsculo (PNG vs png)
                const filename = String(item.foto_url || '').trim().toLowerCase(); 

                return {
                    imagem: BASE_IMAGE_PATH + filename, 
                    titulo: 'Aniversariante',
                    nome: item.nome,
                    descricao: String(item.aniversario), 
                    setor: `Setor: ${item.setor}`
                };
            }).filter(item => item.nome); 

            if (aniversariantes.length > 0) {
                showAniversariante(currentAniversariante);
                if (intervalId) {
                    clearInterval(intervalId);
                }
                intervalId = setInterval(nextAniversariante, rotationInterval);
            } else {
                document.getElementById('nome').textContent = 'Nenhum aniversariante hoje.';
            }

        } catch (error) {
            console.error('Aniversariantes.js: Erro ao carregar os dados de aniversariantes:', error);
            document.getElementById('nome').textContent = 'Erro ao carregar dados.';
            document.getElementById('img').src = '';
        }
    }

    function showAniversariante(index) {
        if (aniversariantes.length === 0) return;

        const aniversarianteAtual = aniversariantes[index];
        
        document.getElementById('img').src = aniversarianteAtual.imagem; 
        document.getElementById('titulo').textContent = aniversarianteAtual.titulo;
        document.getElementById('nome').textContent = aniversarianteAtual.nome;
        document.getElementById('desc').textContent = aniversarianteAtual.descricao;
        document.getElementById('setor').textContent = aniversarianteAtual.setor;
    }

    function nextAniversariante() {
        currentAniversariante = (currentAniversariante + 1) % aniversariantes.length;
        showAniversariante(currentAniversariante);
    }

    fetchAniversariantes();

})();