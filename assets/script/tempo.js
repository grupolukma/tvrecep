// =======================================================
// === CONFIGURAÇÃO OPENWEATHERMAP =======================
// =======================================================

// Sua chave da API fornecida
const OPENWEATHER_API_KEY = '663757f8b7d193f0b4d8c80a07e0202e'; 
// Suas coordenadas que funcionam
const CITY_LAT = '-20.8222'; 
const CITY_LON = '-49.3875'; 
const UNIDADES = 'metric'; // Unidades métricas (Celsius)
const LANG = 'pt_br';

// Variáveis Globais e Elementos HTML
const DIAS_SEMANA_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
// IDs da seção clima no seu index.html 
const climaAtualElement = document.getElementById('clima-atual');
const previsaoDiasElement = document.getElementById('previsao-dias');


/* ----------------------------------- */
/* FUNÇÕES DE BUSCA (XMLHttpRequest/Promise) */
/* ----------------------------------- */

/**
 * Função de busca compatível com navegadores antigos (XMLHttpRequest com Promise)
 * @param {string} endpoint - 'weather' ou 'forecast' (usando o endpoint 2.5)
 * @returns {Promise<Object>} Dados JSON da API
 */
function fetchWeatherData(endpoint) {
    const url = `https://api.openweathermap.org/data/2.5/${endpoint}?lat=${CITY_LAT}&lon=${CITY_LON}&units=${UNIDADES}&lang=${LANG}&appid=${OPENWEATHER_API_KEY}`;
    
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch (e) {
                    reject(new Error("Erro ao processar JSON da API OpenWeather."));
                }
            } else {
                reject(new Error(`Erro API OpenWeather: ${xhr.status} - Verifique LAT/LON/KEY.`));
            }
        };

        xhr.onerror = function() {
            reject(new Error("Erro de rede ao conectar com OpenWeather."));
        };

        xhr.send();
    });
}

/**
 * Mapeia os códigos de ícone do OpenWeather para classes Font Awesome (Fallback visual).
 */
function getWeatherIcon(iconCode) {
    // Usamos a lógica de mapeamento para cores e ícones FA (em caso de falha do ícone PNG)
    switch (iconCode) {
        case '01d': return { iconClass: 'fas fa-sun', color: '#FFD700' }; 
        case '01n': return { iconClass: 'fas fa-moon', color: '#ADD8E6' }; 
        case '02d': 
        case '02n': return { iconClass: 'fas fa-cloud-sun', color: '#ADD8E6' }; 
        case '03d':
        case '03n': return { iconClass: 'fas fa-cloud', color: '#B0C4DE' }; 
        case '04d':
        case '04n': return { iconClass: 'fas fa-cloud', color: '#808080' }; 
        case '09d':
        case '09n': return { iconClass: 'fas fa-cloud-showers-heavy', color: '#4682B4' }; 
        case '10d':
        case '10n': return { iconClass: 'fas fa-cloud-rain', color: '#4169E1' }; 
        case '11d':
        case '11n': return { iconClass: 'fas fa-bolt', color: '#FFC300' }; 
        case '13d':
        case '13n': return { iconClass: 'fas fa-snowflake', color: '#E0FFFF' }; 
        case '50d':
        case '50n': return { iconClass: 'fas fa-smog', color: '#C0C0C0' }; 
        default: return { iconClass: 'fas fa-question-circle', color: 'white' };
    }
}


/* ----------------------------------- */
/* LÓGICA DE RENDERIZAÇÃO */
/* ----------------------------------- */

/**
 * Exibe o clima atual em destaque (Cidade, Temp, Vento, Umidade).
 */
function displayCurrentWeather(currentData) {
    if (!climaAtualElement) return;

    const temp = Math.round(currentData.main.temp);
    const feelsLike = Math.round(currentData.main.feels_like);
    const humidity = currentData.main.humidity;
    // OpenWeather API 2.5 wind_speed está em m/s, convertemos para km/h
    const windSpeed = (currentData.wind.speed * 3.6).toFixed(1); 
    const description = currentData.weather[0].description;
    const iconCode = currentData.weather[0].icon;
    // Usamos o ícone PNG oficial para a melhor visualização
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const cityName = currentData.name || "Localidade Desconhecida";


    // Renderização do clima atual
    climaAtualElement.innerHTML = `
        <div class="clima-current-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h2 style="font-size: 24px; color: white; margin: 0;">${cityName}</h2>
            <span style="font-size: 14px; color: #ccc; text-transform: capitalize;">${description}</span>
        </div>
        
        <div class="clima-main-info" style="display: flex; align-items: center; justify-content: center; gap: 20px;">
            <div style="display: flex; align-items: center;">
                <img src="${iconUrl}" alt="${description}" style="width: 80px; height: 80px;">
                <span style="font-size: 60px; color: white; font-weight: bold;">${temp}°C</span>
            </div>
            
            <div class="clima-details" style="display: flex; flex-direction: column; font-size: 16px;">
                <p style="color: white; margin: 5px 0; font-size: 12px;">
                    <i class="fas fa-wind" style="margin-right: 8px;"></i> Vento: ${windSpeed} km/h
                </p>
                <p style="color: white; margin: 5px 0;font-size: 12px;">
                    <i class="fas fa-tint" style="margin-right: 8px;"></i> Umidade: ${humidity}%
                </p>
                <p style="color: #aaa; margin: 5px 0; font-size: 14px;">
                    Sensação: ${feelsLike}°C
                </p>
            </div>
        </div>
    `;
}

/**
 * Exibe a previsão para os próximos 4 dias, agregando a temperatura máxima e mínima do dia.
 */
function displayForecast(forecastData) {
    if (!previsaoDiasElement) return;

    let forecastHTML = '<div class="clima-forecast-list" style="display: flex; justify-content: space-around; margin-top: 20px;">';
    
    const hoje = new Date().getDay(); 
    // Mapeia todos os itens da lista por dia (0 a 6)
    const dailyForecasts = {};
    
    for (const item of forecastData.list) {
        const date = new Date(item.dt * 1000);
        const diaDaPrevisao = date.getDay(); // 0=Dom, 1=Seg, ..., 6=Sáb
        
        // Pula o dia atual
        if (diaDaPrevisao === hoje) continue; 

        // Cria o array para o dia se ele ainda não existir
        if (!dailyForecasts[diaDaPrevisao]) {
            dailyForecasts[diaDaPrevisao] = {
                // Usamos o ícone do item mais próximo do meio-dia para o resumo
                iconItem: null,
                maxTemp: -Infinity, // Inicializa com menor valor
                minTemp: Infinity,  // Inicializa com maior valor
                // Array para armazenar todos os itens do dia
                items: [],
                // Para ordenação cronológica
                timestamp: item.dt
            };
        }

        // Armazena todas as temperaturas do dia para encontrar a verdadeira Máxima/Mínima
        const dayForecast = dailyForecasts[diaDaPrevisao];
        dayForecast.items.push(item);
        
        // Atualiza a Máxima/Mínima global para o dia
        dayForecast.maxTemp = Math.max(dayForecast.maxTemp, item.main.temp_max);
        dayForecast.minTemp = Math.min(dayForecast.minTemp, item.main.temp_min);

        // Seleciona o ícone que será usado (escolhe o ícone da previsão próxima ao meio-dia)
        if (!dayForecast.iconItem && date.getHours() >= 12 && date.getHours() <= 15) {
             dayForecast.iconItem = item;
        }
    }
    
    // Converte o objeto de previsões diárias em um array e ordena pelo timestamp (cronológico)
    const sortedForecasts = Object.values(dailyForecasts)
        .sort((a, b) => a.timestamp - b.timestamp)
        // Limita aos 4 dias futuros
        .slice(0, 4);

    // Renderiza a lista de 4 dias
    sortedForecasts.forEach(dayData => {
        // Usa o ícone selecionado, ou o primeiro item do dia como fallback
        const itemToUse = dayData.iconItem || dayData.items[0]; 
        const iconCode = itemToUse.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
        
        // O índice do dia da semana (0-6)
        const dayIndex = new Date(itemToUse.dt * 1000).getDay();
        
        forecastHTML += `
            <div class="clima-forecast-item" style="text-align: center; color: white; font-size: 14px;">
                <p style="margin: 0; text-transform: capitalize;">${DIAS_SEMANA_CURTOS[dayIndex]}</p>
                <img src="${iconUrl}" alt="Clima" style="width: 40px; height: 40px;">
                <p style="margin: 0; font-weight: bold;">${Math.round(dayData.maxTemp)}°C</p>
                <p style="margin: 0; color: #aaa;">${Math.round(dayData.minTemp)}°C</p>
            </div>
        `;
    });

    forecastHTML += '</div>';
    previsaoDiasElement.innerHTML = forecastHTML;
}

/**
 * Função principal para carregar o tempo.
 */
function loadTempo() {
    // 1. Busca a Condição Atual e renderiza
    fetchWeatherData('weather')
        .then(currentData => {
            displayCurrentWeather(currentData);
            // 2. Chama a busca da previsão de 5 dias (por hora)
            return fetchWeatherData('forecast');
        })
        .then(forecastData => {
            // 3. Renderiza a previsão
            displayForecast(forecastData);
        })
        .catch(error => {
            console.error("Erro ao carregar Tempo:", error);
            if (climaAtualElement) {
                climaAtualElement.innerHTML = `<h2 style="color: red;">Erro!</h2><p style="color: white; font-size: 14px;">Não foi possível carregar o clima. Detalhes: ${error.message}</p>`;
            }
        });
}


/* ----------------------------------- */
/* CHAMADAS INICIAIS */
/* ----------------------------------- */

loadTempo();
setInterval(loadTempo, 600000); // Recarrega a cada 10 minutos

/*
### Resumo das Alterações:

1.  **Agregação Diária (`dailyForecasts`):** Em vez de usar apenas um ponto de dados por dia, o novo código itera sobre todos os dados de 3 em 3 horas fornecidos pela API.
2.  **Cálculo da Máxima/Mínima:** Para cada dia futuro, ele armazena o `temp_max` e `temp_min` de todas as entradas e usa `Math.max()` e `Math.min()` para encontrar a verdadeira máxima e mínima do período de 24 horas (ou o período coberto pela API para aquele dia).
3.  **Seleção do Ícone:** O ícone e o nome do dia continuam sendo extraídos do ponto de dados mais próximo do meio-dia (12h às 15h) para garantir que representem as condições diurnas, mas agora as temperaturas são as corretas para o dia inteiro.

Agora, as temperaturas mínima e máxima devem ser diferentes, refletindo a variação real do dia. */