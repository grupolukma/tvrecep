// A URL de Web App do Google Apps Script
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwFw9x2EckNeuHY8QbZ6j13DCi_PvBQI7KFCkiRoeffqiBCcoKdLplg46Ls8B7j6N1NSQ/exec'; 

// 💡 VERIFIQUE: O nome da pasta é 'aniversariante' ou 'aniversariantes'?
// Mantenha o que está correto:
const BASE_IMAGE_PATH = 'assets/images/aniversariante/'; 

let aniversariantes = [];
let currentAniversariante = 0;
const rotationInterval = 5000;
let intervalId;

/**
 * Busca os dados da aba "Aniversariante" da planilha.
 */
async function fetchAniversariantes() {
    const url = `${WEB_APP_URL}?sheet=Aniversariante`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        aniversariantes = await response.json();

        // Mapeia os campos da planilha e CONSTRÓI o caminho da imagem
// Mapeia os campos da planilha e CONSTRÓI o caminho da imagem
aniversariantes = aniversariantes.map(item => {
    // 💡 VERIFIQUE: O nome da coluna na sua planilha é 'foto_urll' ou 'foto_url' (minúsculo)?
    // Use a chave correta aqui. Assumindo que seja 'foto_urll' ou 'foto_url'
    const filename = String(item.foto_urll || item.foto_url).trim(); 
    
    // Se o problema persistir, use apenas 'item.foto_url' se o cabeçalho for 'FOTO_URL'
    // const filename = String(item.foto_url).trim(); 

    return {
        // Montagem do caminho final:
        imagem: BASE_IMAGE_PATH + filename, 
        titulo: 'Aniversariante',
        nome: item.nome,
        descricao: String(item.aniversario), 
        setor: `Setor: ${item.setor}`
    };
});

        if (aniversariantes.length > 0) {
            showAniversariante(currentAniversariante);
            if (intervalId) {
                clearInterval(intervalId);
            }
            intervalId = setInterval(nextAniversariante, rotationInterval);
        } else {
            console.log("Nenhum aniversariante encontrado na planilha.");
            document.getElementById('nome').textContent = 'Nenhum aniversariante hoje.';
        }

    } catch (error) {
        console.error('Erro ao carregar os dados de aniversariantes:', error);
        document.getElementById('nome').textContent = 'Erro ao carregar dados.';
    }
}

/**
 * Exibe o aniversariante atual na tela.
 */
function showAniversariante(index) {
    if (aniversariantes.length === 0) return;

    const aniversarianteAtual = aniversariantes[index];
    
    // O caminho final é aplicado aqui
    document.getElementById('img').src = aniversarianteAtual.imagem; 
    document.getElementById('titulo').textContent = aniversarianteAtual.titulo;
    document.getElementById('nome').textContent = aniversarianteAtual.nome;
    document.getElementById('desc').textContent = aniversarianteAtual.descricao;
    document.getElementById('setor').textContent = aniversarianteAtual.setor;
}

/**
 * Avança para o próximo aniversariante na lista.
 */
function nextAniversariante() {
    currentAniversariante = (currentAniversariante + 1) % aniversariantes.length;
    showAniversariante(currentAniversariante);
}

// Inicia o processo de busca e exibição
fetchAniversariantes();