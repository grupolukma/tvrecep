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
// IDs da seção clima no seu index.html (como definimos anteriormente)
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
 * Nota: No display, usaremos o ícone da própria OpenWeather, mas manteremos o mapeamento para cores/descrições.
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


    climaAtualElement.innerHTML = `
        <div class="clima-current-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h2 style="font-size: 24px; color: #06dffc;; margin: 0;">${cityName}</h2>
            <span style="font-size: 14px; color: #ccc; text-transform: capitalize;">${description}</span>
        </div>
        
        <div class="clima-main-info" style="display: flex; align-items: center; justify-content: center; gap: 20px;">
            <div style="display: flex; align-items: center;">
                <img src="${iconUrl}" alt="${description}" style="width: 80px; height: 80px;">
                <span style="font-size: 60px; color: white; font-weight: bold;">${temp}°C</span>
            </div>
            
            <div class="clima-details" style="display: flex; flex-direction: column; font-size: 16px;">
                <p style="color: white; margin: 5px 0;">
                    <i class="fas fa-wind" style="margin-right: 8px;"></i> Vento: ${windSpeed} km/h
                </p>
                <p style="color: white; margin: 5px 0;">
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
 * Exibe a previsão para os próximos 4 dias (filtra a previsão de 3 em 3 horas).
 */
function displayForecast(forecastData) {
    if (!previsaoDiasElement) return;

    let forecastHTML = '<div class="clima-forecast-list" style="display: flex; justify-content: space-around; margin-top: 20px;">';
    
    const hoje = new Date().getDay(); 
    
    // Array para armazenar os 4 dias em ordem CRONOLÓGICA
    const forecastDaysArray = []; 
    // Objeto auxiliar para garantir que só pegamos UMA previsão por dia da semana (índice 0-6)
    const registeredDays = {};
    let diasContados = 0;
    
    // Filtra para pegar apenas 4 dias futuros (próximo ao meio-dia)
    for (const item of forecastData.list) {
        const date = new Date(item.dt * 1000);
        const diaDaPrevisao = date.getDay(); // 0=Dom, 1=Seg, ..., 6=Sáb

        // 1. Pula o dia atual
        if (diaDaPrevisao === hoje) continue; 
        
        // 2. Se o dia já foi registrado, ou se ainda não chegamos na hora do almoço (12h-15h), pula
        if (registeredDays[diaDaPrevisao] || date.getHours() < 12 || date.getHours() > 15) continue;
        
        // 3. Registra o dia no array CRONOLÓGICO
        forecastDaysArray.push({
            // Guarda o índice do dia (0-6) para o nome
            dayIndex: diaDaPrevisao, 
            item: item,
            maxTemp: Math.round(item.main.temp_max),
            minTemp: Math.round(item.main.temp_min)
        });
        // Marca o dia como registrado no objeto auxiliar
        registeredDays[diaDaPrevisao] = true;
        diasContados++;
        
        // 4. Limita a 4 dias e encerra o loop
        if (diasContados >= 4) break;
    }
    
    // Renderiza a lista usando o array 'forecastDaysArray', que está em ordem cronológica.
    forecastDaysArray.forEach(dayData => {
        const iconCode = dayData.item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
        
        forecastHTML += `
            <div class="clima-forecast-item" style="text-align: center; color: white; font-size: 14px;">
                <p style="margin: 0; text-transform: capitalize;">${DIAS_SEMANA_CURTOS[dayData.dayIndex]}</p>
                <img src="${iconUrl}" alt="Clima" style="width: 40px; height: 40px;">
                <p style="margin: 0; font-weight: bold;">${dayData.maxTemp}°C</p>
                <p style="margin: 0; color: #aaa;">${dayData.minTemp}°C</p>
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