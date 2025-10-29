// Variável global para armazenar as últimas taxas de câmbio
const previousRates = {};

const exchangeRateElement = document.getElementById('dollar_hoje');
const currencies = [
  // Ícones do Font Awesome adicionados
  { code: 'USD', name: 'Dolar', icon: 'fas fa-dollar-sign' },
  { code: 'EUR', name: 'Euro', icon: 'fas fa-euro-sign' },
  { code: 'GBP', name: 'Libra', icon: 'fas fa-sterling-sign' },
  { code: 'BTC', name: 'Bitcoin', icon: 'fab fa-btc' }, // Fab = Font Awesome Brands
  { code: 'ETH', name: 'Ethereum', icon: 'fab fa-ethereum' } // Fab = Font Awesome Brands
];
let currentCurrencyIndex = 0;

/**
 * Busca a taxa de câmbio e a variação para a moeda especificada.
 */
async function fetchExchangeRate(currency) {
  try {
    const currencyInfo = currencies.find(c => c.code === currency);
    let response, data, currentRate, changePercentage = 0;

    // 1. Lógica para CRIPTOMOEDAS (BTC, ETH)
    if (currency === 'BTC' || currency === 'ETH') {
      const targetCurrency = currency === 'BTC' ? 'bitcoin' : 'ethereum';
      
      // Inclui a variação de 24 horas (24hr_change)
      response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${targetCurrency}&vs_currencies=brl&include_24hr_change=true`);
      data = await response.json();
      
      currentRate = data[targetCurrency].brl;
      changePercentage = data[targetCurrency].brl_24h_change;

    // 2. Lógica para MOEDAS FIDUCIÁRIAS (USD, EUR, GBP)
    } else {
      // ExchangeRate-API
      response = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`);
      data = await response.json();
      currentRate = data.rates.BRL;

      // Compara a taxa atual com a taxa armazenada (se existir)
      const prevRate = previousRates[currency];
      if (prevRate) {
        // Calcula a variação percentual
        changePercentage = ((currentRate - prevRate) / prevRate) * 100;
      } else {
        // Na primeira volta, a variação será 0, e a lógica de display irá tratar.
        changePercentage = 0; 
      }
    }
    
    // Armazena a taxa atual para a próxima comparação
    previousRates[currency] = currentRate;
    
    // Atualiza a exibição com a nova lógica
    updateDisplay(currencyInfo, currentRate, changePercentage);

  } catch (error) {
    exchangeRateElement.innerHTML = '<h1 class="title" style="color: red;">Câmbio</h1><span style="color: white;">Não foi possível obter a taxa de câmbio.</span>';
    console.error(error);
  }
}

/**
 * Atualiza o display com o novo formato, ícones e a porcentagem colorida.
 */
function updateDisplay(currencyInfo, rate, percentageChange) {
    const isFiat = ['USD', 'EUR', 'GBP'].includes(currencyInfo.code);

    // 1. Define o conteúdo da variação (%)
    let changeHTML;
    
    if (percentageChange === 0 && isFiat) {
        // Se a mudança for 0 e for moeda Fiat, mostramos um status de espera
        changeHTML = '<span style="font-size: 16px; color: #aaa;">Aguardando 1ª comparação</span>';
    } else {
        // Lógica de seta e cor
        const isRising = percentageChange >= 0;
        const arrow = isRising ? '▲' : '▼';
        const color = isRising ? 'green' : 'red';
        
        // Garante que o número é positivo para exibição
        const formattedChange = Math.abs(parseFloat(percentageChange)).toFixed(2);
        
        changeHTML = `
            <span class="taxa-porcentagem" style="color: ${color}; font-size: 20px; font-weight: bold; white-space: nowrap;">
              ${arrow} ${formattedChange}%
            </span>
        `;
    }
    
    const formattedRate = parseFloat(rate).toFixed(2).replace('.', ','); // Formato brasileiro
    
    // Novo formato HTML
    exchangeRateElement.innerHTML = `
      <h1 class="title">${currencyInfo.name} Hoje</h1>
      
      <div class="currency-display" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; margin-top: 10px;">
          
          <span class="currency-value" style="color: white; font-size: 38px; font-weight: bold;">
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

function cycleCurrencies() {
  currentCurrencyIndex = (currentCurrencyIndex + 1) % currencies.length;
  const nextCurrency = currencies[currentCurrencyIndex].code;
  fetchExchangeRate(nextCurrency);
}

// Inicia a busca pela primeira moeda e o ciclo
fetchExchangeRate(currencies[currentCurrencyIndex].code);
setInterval(cycleCurrencies, 10000); // Alternar moeda a cada 10 segundos