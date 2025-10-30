// --- Configurações de Intervalo ---
const REFRESH_INTERVAL = 60000; // 60 segundos para buscar novos dados da API
const DISPLAY_INTERVAL = 10000; // 10 segundos para trocar a moeda no display

// --- Configurações da API ---
const API_URL = 'https://economia.awesomeapi.com.br/json/last/';
// String de códigos das moedas para buscar de uma vez
const CURRENCY_CODES = 'USD-BRL,EUR-BRL,GBP-BRL,BTC-BRL,ETH-BRL';

const exchangeRateElement = document.getElementById('dollar_hoje');

// Mapeamento para exibição (code, name, icon) e o código retornado pela API (apiCode)
const currenciesDisplay = [
  { code: 'USD', name: 'Dolar', icon: 'fas fa-dollar-sign', apiCode: 'USDBRL' },
  { code: 'EUR', name: 'Euro', icon: 'fas fa-euro-sign', apiCode: 'EURBRL' },
  { code: 'GBP', name: 'Libra', icon: 'fas fa-sterling-sign', apiCode: 'GBPBRL' },
  { code: 'BTC', name: 'Bitcoin', icon: 'fab fa-btc', apiCode: 'BTCBRL' },
  { code: 'ETH', name: 'Ethereum', icon: 'fab fa-ethereum', apiCode: 'ETHBRL' }
];

let currentCurrencyIndex = 0;
let ratesData = {}; // Armazena todos os dados obtidos da API
let displayIntervalId;
let refreshIntervalId;

/**
 * Busca todas as cotações da Awesome API de uma vez.
 */
async function fetchAllRates() {
    try {
        const response = await fetch(`${API_URL}${CURRENCY_CODES}`);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        ratesData = await response.json();
        
        if (Object.keys(ratesData).length > 0) {
            // Se esta for a primeira busca, inicia o ciclo de exibição
            if (!displayIntervalId) {
                // Exibe a primeira moeda e inicia o ciclo
                updateDisplay(currenciesDisplay[currentCurrencyIndex]);
                displayIntervalId = setInterval(cycleCurrencies, DISPLAY_INTERVAL);
            }
            // Apenas atualiza o display caso a busca ocorra no meio de uma exibição
            updateDisplay(currenciesDisplay[currentCurrencyIndex]);
        } else {
            exchangeRateElement.innerHTML = '<h1 class="title" style="color: red;">Câmbio</h1><span style="color: white;">Nenhuma cotação encontrada.</span>';
        }

    } catch (error) {
        exchangeRateElement.innerHTML = '<h1 class="title" style="color: red;">Câmbio</h1><span style="color: white;">Não foi possível obter a taxa de câmbio.</span>';
        console.error('Erro ao buscar cotações da AwesomeAPI:', error);
    }
}

/**
 * Atualiza o display com os dados do ratesData.
 */
function updateDisplay(currencyInfo) {
    const data = ratesData[currencyInfo.apiCode];

    if (!data) {
        // Se os dados não existirem, ignora a atualização (mantém a última taxa exibida)
        return; 
    }

    // Awesome API: 'bid' é a taxa de compra, 'pctChange' é a variação de 24h (como string)
    const rate = data.bid;
    // Converte a string de porcentagem para float
    const percentageChange = parseFloat(data.pctChange);

    // Lógica de seta e cor
    const isRising = percentageChange >= 0;
    const arrow = isRising ? '▲' : '▼';
    // A cor é definida com base na variação (verde ou vermelho)
    const color = isRising ? 'green' : 'red';
    
    // Garante que o número é positivo para exibição e limita a 2 casas decimais
    const formattedChange = Math.abs(percentageChange).toFixed(2);
    
    // HTML para a variação percentual
    const changeHTML = `
        <span class="taxa-porcentagem" style="color: ${color}; font-size: 20px; font-weight: bold; white-space: nowrap;">
          ${arrow} ${formattedChange}%
        </span>
    `;
    
    // Formato brasileiro com vírgula (R$ X,XX)
    const formattedRate = parseFloat(rate).toFixed(2).replace('.', ','); 
    
    // Novo formato HTML
    exchangeRateElement.innerHTML = `
      <h1 class="title">${currencyInfo.name} Hoje</h1>
      
      <div class="currency-display" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; margin-top: 10px;">
          
          <span class="currency-value" style="color: white; font-size: 20px; font-weight: bold;">
            R$ ${formattedRate}
          </span>
          
          <div style="display: flex; align-items: center; gap: 10px;">
              <span class="currency-icon" style="color: white; font-size: 20px;">
                <i class="${currencyInfo.icon}"></i>
              </span>
              
              <span style="font-size: 18px; color: #ccc;">
                  vs BRL
              </span>
          </div>

          <div style="margin-top: 15px;">
             ${changeHTML}
          </div>

      </div>
    `;
}

/**
 * Avança para a próxima moeda na lista e atualiza o display.
 */
function cycleCurrencies() {
  currentCurrencyIndex = (currentCurrencyIndex + 1) % currenciesDisplay.length;
  updateDisplay(currenciesDisplay[currentCurrencyIndex]);
}

// 1. Inicia o processo de busca
fetchAllRates();
// 2. Define o intervalo para buscar novos dados (a cada 60s)
refreshIntervalId = setInterval(fetchAllRates, REFRESH_INTERVAL);