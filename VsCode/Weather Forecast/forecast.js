const apiKey = "7b94334822mshac221ccfdec8553p14bebejsn581b69669a45";

// Default city fallback
const defaultCity = "New Delhi";

// Popular cities for suggestions
const popularCities = [
  { name: "New Delhi", country: "India", icon: "🏛️" },
  { name: "Mumbai", country: "India", icon: "🌊" },
  { name: "Bangalore", country: "India", icon: "🌳" },
  { name: "Chennai", country: "India", icon: "🌴" },
  { name: "Kolkata", country: "India", icon: "🎭" },
  { name: "Hyderabad", country: "India", icon: "💎" },
  { name: "Pune", country: "India", icon: "🏔️" },
  { name: "Ahmedabad", country: "India", icon: "🏛️" },
  { name: "Jaipur", country: "India", icon: "🏰" },
  { name: "Lucknow", country: "India", icon: "🌺" },
  { name: "New York", country: "USA", icon: "🗽" },
  { name: "London", country: "UK", icon: "🏰" },
  { name: "Tokyo", country: "Japan", icon: "🗾" },
  { name: "Paris", country: "France", icon: "🗼" },
  { name: "Sydney", country: "Australia", icon: "🏖️" },
  { name: "Toronto", country: "Canada", icon: "🍁" },
  { name: "Berlin", country: "Germany", icon: "🏛️" },
  { name: "Rome", country: "Italy", icon: "🏛️" },
  { name: "Madrid", country: "Spain", icon: "🌞" },
  { name: "Amsterdam", country: "Netherlands", icon: "🌷" }
];

// Chart.js global defaults for modern styling
Chart.defaults.font.family = "'Inter', 'Segoe UI', sans-serif";
Chart.defaults.color = '#f0f0f0';
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.padding = 20;

// Light theme chart colors
const lightThemeColors = {
  text: '#1a202c',
  grid: 'rgba(26, 32, 44, 0.1)',
  primary: '#4facfe',
  secondary: '#f093fb',
  accent: '#667eea',
  success: '#00f2fe',
  warning: '#ffecd2'
};

// Dark theme chart colors
const darkThemeColors = {
  text: '#f0f0f0',
  grid: 'rgba(240, 240, 240, 0.1)',
  primary: '#4facfe',
  secondary: '#f093fb',
  accent: '#667eea',
  success: '#00f2fe',
  warning: '#ffecd2'
};

function getChartColors() {
  return document.body.classList.contains('light-theme') ? lightThemeColors : darkThemeColors;
}

function showLoading() {
  document.getElementById('loadingIndicator').style.display = 'block';
}

function hideLoading() {
  document.getElementById('loadingIndicator').style.display = 'none';
}

function updateDateTime() {
  const now = new Date();
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  document.getElementById('dateTime').textContent = now.toLocaleDateString('en-US', options);
}

async function fetchWeather(city) {
    showLoading();
    try {
        const response = await fetch(`https://weatherapi-com.p.rapidapi.com/forecast.json?q=${city}&days=7&aqi=yes`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
            }
        });

        const data = await response.json();

        if (data.error) {
            alert(data.error.message);
            hideLoading();
            return;
        }

        // Update basic info
        document.getElementById('cityName').textContent = data.location.name;
        document.getElementById('temp').textContent = `${data.current.temp_c}°C`;
        document.getElementById('condition').textContent = data.current.condition.text;

        // Update weather icon
        const weatherIcon = document.getElementById('weatherIcon');
        weatherIcon.src = `https:${data.current.condition.icon}`;
        weatherIcon.style.display = 'block';

        // Update detail cards
        document.querySelector('#windCard .card-content p').textContent = `${data.current.wind_kph} km/h`;
        document.querySelector('#pressureCard .card-content p').textContent = `${data.current.pressure_mb} hPa`;
        document.querySelector('#humidityCard .card-content p').textContent = `${data.current.humidity}%`;
        document.querySelector('#uvCard .card-content p').textContent = data.current.uv;
        document.querySelector('#rainCard .card-content p').textContent = `${data.forecast.forecastday[0].day.daily_chance_of_rain}%`;

        // Update AQI
        const aqiIndex = data.current.air_quality["us-epa-index"];
        const aqiText = ["N/A", "Good", "Moderate", "Unhealthy (Sensitive)", "Unhealthy", "Very Unhealthy", "Hazardous"];
        const aqiCard = document.querySelector('#aqiCard .card-content p');
        aqiCard.textContent = aqiText[aqiIndex] || "N/A";

        // Create modern charts
        createTemperatureChart(data);
        createWeeklyForecastChart(data);
        createHumidityPressureChart(data);
        createWindChart(data);

        // Populate 7-day forecast cards
        populateWeeklyForecast(data);

        // Populate recorded weather table
        populateRecordedTable(data);

        hideLoading();

    } catch (error) {
        console.error(error);
        alert("Failed to fetch weather data.");
        hideLoading();
    }
}

function createTemperatureChart(data) {
        const hours = data.forecast.forecastday[0].hour;
    const labels = hours.map(h => h.time.split(" ")[1].substring(0, 5));
    const temps = hours.map(h => h.temp_c);
    const colors = getChartColors();

    const ctx = document.getElementById('tempChart').getContext('2d');
        if (window.tempChartInstance) window.tempChartInstance.destroy();
    
    window.tempChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                label: 'Temperature (°C)',
                    data: temps,
                borderColor: colors.primary,
                backgroundColor: colors.primary + '20',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: colors.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: colors.primary,
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false
                }
            },
            scales: {
                x: {
                    grid: { color: colors.grid },
                    ticks: { color: colors.text }
                },
                y: {
                    grid: { color: colors.grid },
                    ticks: { color: colors.text }
                }
            }
        }
    });
}

function createWeeklyForecastChart(data) {
    const days = data.forecast.forecastday;
    const labels = days.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }));
    const maxTemps = days.map(d => d.day.maxtemp_c);
    const minTemps = days.map(d => d.day.mintemp_c);
    const colors = getChartColors();

    const ctx = document.getElementById('weeklyChart').getContext('2d');
    if (window.weeklyChartInstance) window.weeklyChartInstance.destroy();
    
    window.weeklyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Max Temp',
                    data: maxTemps,
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                    borderWidth: 0,
                    borderRadius: 8,
                    borderSkipped: false
                },
                {
                    label: 'Min Temp',
                    data: minTemps,
                    backgroundColor: colors.secondary,
                    borderColor: colors.secondary,
                    borderWidth: 0,
                    borderRadius: 8,
                    borderSkipped: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: colors.text }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: colors.primary,
                    borderWidth: 1,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: { color: colors.grid },
                    ticks: { color: colors.text }
                },
                y: {
                    grid: { color: colors.grid },
                    ticks: { color: colors.text }
                }
            }
        }
    });
}

function createHumidityPressureChart(data) {
    const hours = data.forecast.forecastday[0].hour;
    const labels = hours.map(h => h.time.split(" ")[1].substring(0, 5));
    const humidity = hours.map(h => h.humidity);
    const pressure = hours.map(h => h.pressure_mb);
    const colors = getChartColors();

    const ctx = document.getElementById('humidityPressureChart').getContext('2d');
    if (window.humidityPressureChartInstance) window.humidityPressureChartInstance.destroy();
    
    window.humidityPressureChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Humidity (%)',
                    data: humidity,
                    borderColor: colors.accent,
                    backgroundColor: colors.accent + '20',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Pressure (hPa)',
                    data: pressure,
                    borderColor: colors.success,
                    backgroundColor: colors.success + '20',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
            },
            options: {
                responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
                plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: colors.text }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: colors.primary,
                    borderWidth: 1,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: { color: colors.grid },
                    ticks: { color: colors.text }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: colors.grid },
                    ticks: { color: colors.text }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: colors.text }
                }
                }
            }
        });
}

function createWindChart(data) {
    const hours = data.forecast.forecastday[0].hour;
    const labels = hours.map(h => h.time.split(" ")[1].substring(0, 5));
    const windSpeed = hours.map(h => h.wind_kph);
    const windGust = hours.map(h => h.gust_kph);
    const colors = getChartColors();

    const ctx = document.getElementById('windChart').getContext('2d');
    if (window.windChartInstance) window.windChartInstance.destroy();
    
    window.windChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
            labels: labels,
            datasets: [
                {
                    label: 'Wind Speed (km/h)',
                    data: windSpeed,
                    borderColor: colors.warning,
                    backgroundColor: colors.warning + '20',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: colors.warning,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 3
                },
                {
                    label: 'Wind Gust (km/h)',
                    data: windGust,
                    borderColor: colors.secondary,
                    backgroundColor: colors.secondary + '20',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: colors.secondary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 3
                }
            ]
            },
            options: {
                responsive: true,
            maintainAspectRatio: false,
                plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: colors.text }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: colors.primary,
                    borderWidth: 1,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: { color: colors.grid },
                    ticks: { color: colors.text }
                },
                y: {
                    grid: { color: colors.grid },
                    ticks: { color: colors.text }
                }
                }
            }
        });
}

function populateWeeklyForecast(data) {
    const forecastContainer = document.querySelector('.forecast-cards');
    forecastContainer.innerHTML = "";
    
    data.forecast.forecastday.forEach(day => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="card-icon">${getWeatherIcon(day.day.condition.text)}</div>
            <div class="card-content">
                <h4>${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</h4>
                <p>${day.day.avgtemp_c}°C</p>
                <p style="font-size: 12px; opacity: 0.8;">${day.day.condition.text}</p>
            </div>
        `;
        forecastContainer.appendChild(card);
    });
}

function populateRecordedTable(data) {
        const tableBody = document.getElementById('recordedDataBody');
tableBody.innerHTML = "";

data.forecast.forecastday.forEach(day => {
  const row = document.createElement("tr");
  row.innerHTML = `
            <td>${new Date(day.date).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            })}</td>
    <td>${day.day.avgtemp_c}°C</td>
    <td>${day.day.avghumidity}%</td>
    <td>${day.day.maxwind_kph} km/h</td>
    <td>${day.day.condition.text}</td>
  `;
  tableBody.appendChild(row);
});
}

function getWeatherIcon(condition) {
    const icons = {
        'Sunny': '☀️',
        'Clear': '🌙',
        'Partly cloudy': '⛅',
        'Cloudy': '☁️',
        'Overcast': '☁️',
        'Mist': '🌫️',
        'Patchy rain': '🌦️',
        'Light rain': '🌧️',
        'Moderate rain': '🌧️',
        'Heavy rain': '⛈️',
        'Thunder': '⛈️',
        'Snow': '❄️',
        'Fog': '🌫️'
    };
    
    for (const [key, icon] of Object.entries(icons)) {
        if (condition.toLowerCase().includes(key.toLowerCase())) {
            return icon;
        }
    }
    return '🌤️';
}

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(`https://weatherapi-com.p.rapidapi.com/forecast.json?q=${latitude},${longitude}&days=7&aqi=yes`, {
                        method: 'GET',
                        headers: {
                            'X-RapidAPI-Key': apiKey,
                            'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
                        }
                    });
                    const data = await response.json();
                    if (data.error) {
                        alert(data.error.message);
                        return;
                    }
                    fetchWeather(data.location.name);
                } catch (error) {
                    console.error(error);
                    alert("Failed to get weather for your location.");
                }
            },
            (error) => {
                console.error(error);
                alert("Unable to get your location. Please search for a city manually.");
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Utility to position suggestions dropdown under the search box
function positionSuggestionsDropdown() {
    const searchBox = document.getElementById('searchBox');
    const suggestionsContainer = document.getElementById('suggestionsContainer');
    if (!searchBox || !suggestionsContainer) return;
    const rect = searchBox.getBoundingClientRect();
    suggestionsContainer.style.top = `${rect.bottom + window.scrollY}px`;
    suggestionsContainer.style.left = `${rect.left + window.scrollX}px`;
    suggestionsContainer.style.width = `${rect.width}px`;
}

// Update showSuggestions to call positionSuggestionsDropdown
async function showSuggestions(query) {
    const suggestionsContainer = document.getElementById('suggestionsContainer');
    if (query.length < 2) {
        suggestionsContainer.classList.remove('show');
        return;
    }

    // Fetch city suggestions from WeatherAPI
    try {
        const response = await fetch(
            `https://weatherapi-com.p.rapidapi.com/search.json?q=${encodeURIComponent(query)}`,
            {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
                }
            }
        );
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            suggestionsContainer.classList.remove('show');
            return;
        }

        suggestionsContainer.innerHTML = data
            .slice(0, 8)
            .map(city => `
                <div class="suggestion-item" onclick="selectCity('${city.name.replace(/'/g, "\\'")}')">
                    <span class="suggestion-icon">🏙️</span>
                    <span class="suggestion-text">${city.name}</span>
                    <span class="suggestion-region">${city.region ? city.region + ', ' : ''}${city.country}</span>
                </div>
            `).join('');
        suggestionsContainer.classList.add('show');
        positionSuggestionsDropdown();
    } catch (error) {
        suggestionsContainer.classList.remove('show');
    }
}

function selectCity(cityName) {
    document.getElementById('searchBox').value = cityName;
    document.getElementById('suggestionsContainer').classList.remove('show');
    fetchWeather(cityName);
}

function hideSuggestions() {
    document.getElementById('suggestionsContainer').classList.remove('show');
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchBox = document.getElementById('searchBox');
    const searchBtn = document.querySelector('.search-btn');

    // Search box event listeners
    searchBox.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
            showSuggestions(query);
        } else {
            hideSuggestions();
        }
    });

    searchBox.addEventListener('focus', () => {
        if (searchBox.value.trim().length >= 2) {
            showSuggestions(searchBox.value.trim());
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-section')) {
            hideSuggestions();
        }
    });

    // Search button functionality
    searchBtn.addEventListener('click', () => {
        const city = searchBox.value.trim();
        if (city) {
            fetchWeather(city);
            hideSuggestions();
        }
    });

    // Enter key functionality
    searchBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = searchBox.value.trim();
            if (city) {
                fetchWeather(city);
                hideSuggestions();
            }
        }
    });

    // Load saved theme on page load
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }

    // Initialize with default city
    fetchWeather(defaultCity);
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update time every minute

    // Also reposition on window resize/scroll
    window.addEventListener('resize', positionSuggestionsDropdown);
    window.addEventListener('scroll', positionSuggestionsDropdown);
});
