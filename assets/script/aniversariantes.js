// aniversariantes.js
(function() {
    
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwFw9x2EckNeuHY8QbZ6j13DCi_PvBQI7KFCkiRoeffqiBCcoKdLplg46Ls8B7j6N1NSQ/exec'; 

    const BASE_IMAGE_PATH = 'assets/images/aniversariante/'; 

    let aniversariantes = [];
    let currentAniversariante = 0;
    const rotationInterval = 8000;
    let intervalId;
    
    // 🎊 FUNÇÃO DE CONFETES USANDO CONFETTI.JS 🎊
    function shootConfetti() {
        // Verifica se o objeto 'confetti' da biblioteca está disponível
        if (typeof confetti === 'undefined') {
            console.error("A biblioteca confetti.js não está carregada. Por favor, adicione o <script> no seu index.html.");
            return;
        }

        // O canvas precisa existir no HTML: <canvas id="confetti-canvas"></canvas>
        const confettiCanvas = document.getElementById('confetti-canvas');
        if (!confettiCanvas) {
             console.error("Elemento <canvas id=\"confetti-canvas\"> não encontrado.");
             return;
        }

        const myConfetti = confetti.create(confettiCanvas, { 
            resize: true,
            useDpr: true 
        });

        const coresFesta = ['#2dd3e9', '#ffffff', '#FFD700', '#FF1493'];

        let particleScalar = 1; 
        let baseVelocity = 40; 
        let secondWaveDelay = 500; 

        // --- Onda 1 ---
        myConfetti({
            particleCount: 80,
            spread: 70,
            startVelocity: baseVelocity, 
            decay: 0.9,
            gravity: 0.8,
            ticks: 250, 
            origin: { y: 0.2, x: 0.5},
            colors: coresFesta,
            scalar: particleScalar  
        });

        // --- Onda 2 ---
        setTimeout(() => {
            myConfetti({
                particleCount: 120,
                spread: 120, 
                startVelocity: baseVelocity * 0.6, 
                decay: 0.92, 
                gravity: 0.6, 
                ticks: 350, 
                origin: { y: 0, x: 0.5 }, 
                colors: coresFesta,
                shapes: ['circle', 'square'],
                scalar: particleScalar 
            });
        }, secondWaveDelay); 
    }


    async function fetchAniversariantes() {
        const url = `${WEB_APP_URL}?sheet=Aniversariante`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            aniversariantes = await response.json();

            aniversariantes = aniversariantes.map(item => {
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
        
        // 🎊 CHAMADA DA NOVA FUNÇÃO 🎊
        shootConfetti(); 
    }

    function nextAniversariante() {
        currentAniversariante = (currentAniversariante + 1) % aniversariantes.length;
        showAniversariante(currentAniversariante);
    }

    fetchAniversariantes();

})();