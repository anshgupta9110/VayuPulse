// Alerts Page JavaScript
const apiKey = '7b94334822mshac221ccfdec8553p14bebejsn581b69669a45';
const headers = {
  'X-RapidAPI-Key': apiKey,
  'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
};

let currentLocation = 'New Delhi';
let currentDay = 'today';

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle('light-theme');
}

// Show alert message
function showAlert(message, type = 'info') {
  const alertBox = document.getElementById('alertBox');
  alertBox.textContent = message;
  alertBox.className = `alert-box ${type}`;
  alertBox.style.display = 'block';
  
  setTimeout(() => {
    alertBox.style.display = 'none';
  }, 5000);
}

// Update location
function updateLocation() {
  const input = document.getElementById('locationInput');
  const newLocation = input.value.trim();
  
  if (newLocation) {
    currentLocation = newLocation;
    showAlert(`Location updated to: ${newLocation}`, 'success');
    loadAllData();
  } else {
    showAlert('Please enter a valid location', 'error');
  }
}

// Refresh alerts
function refreshAlerts() {
  showAlert('Refreshing weather data...', 'info');
  loadAllData();
}

// Tab switching
function showDay(day) {
  currentDay = day;
  
  // Update active tab
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  // Update active content
  document.querySelectorAll('.day-content').forEach(content => content.classList.remove('active'));
  document.getElementById(day).classList.add('active');
  
  // Load data for selected day
  loadDayData(day);
}

// Load live alerts
async function loadLiveAlerts() {
  const alertsContainer = document.getElementById('liveAlerts');
  
  try {
    const url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${currentLocation}&days=3`;
    const response = await fetch(url, { headers });
    const data = await response.json();

    console.log('Alerts API Response:', data); // Debug log

    const alerts = data.alerts?.alert || [];
    
    if (alerts.length === 0) {
      alertsContainer.innerHTML = `
        <div class="no-alerts">
          <div class="no-alerts-icon">✅</div>
          <h3>No Active Alerts</h3>
          <p>There are currently no weather alerts for ${currentLocation}</p>
        </div>
      `;
    } else {
      alertsContainer.innerHTML = alerts.map(alert => `
        <div class="alert-card ${getAlertSeverity(alert.severity)}">
          <div class="alert-header">
            <span class="alert-icon">⚠️</span>
            <span class="alert-severity">${alert.severity}</span>
          </div>
          <h3>${alert.headline}</h3>
          <p>${alert.msg}</p>
          <div class="alert-meta">
            <span>Effective: ${formatDate(alert.effective)}</span>
            <span>Expires: ${formatDate(alert.expires)}</span>
          </div>
        </div>
      `).join('');
    }

    updateLastUpdate();
  } catch (error) {
    console.error('Error loading alerts:', error);
    alertsContainer.innerHTML = `
      <div class="error-message">
        <div class="error-icon">❌</div>
        <h3>Failed to Load Alerts</h3>
        <p>Please check your connection and try again</p>
        <p>Error: ${error.message}</p>
      </div>
    `;
  }
}

// Load day data
async function loadDayData(day) {
  const dayContainer = document.getElementById(day);
  
  try {
    const url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${currentLocation}&days=3`;
    const response = await fetch(url, { headers });
    const data = await response.json();

    console.log('Day Data API Response:', data); // Debug log

    let dayData;
    if (day === 'yesterday') {
      // For yesterday, we'll show current day data as reference
      dayData = data.forecast.forecastday[0];
    } else if (day === 'today') {
      dayData = data.forecast.forecastday[0];
    } else {
      dayData = data.forecast.forecastday[1];
    }

    dayContainer.innerHTML = `
      <div class="day-overview">
        <div class="day-header">
          <h3>${formatDayName(day)} - ${formatDate(dayData.date)}</h3>
          <div class="day-condition">
            <img src="https:${dayData.day.condition.icon}" alt="${dayData.day.condition.text}">
            <span>${dayData.day.condition.text}</span>
          </div>
        </div>
        
        <div class="day-stats">
          <div class="stat-item">
            <span class="stat-label">🌡️ Temperature</span>
            <span class="stat-value">${dayData.day.mintemp_c}°C - ${dayData.day.maxtemp_c}°C</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">💧 Humidity</span>
            <span class="stat-value">${dayData.day.avghumidity}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">💨 Wind</span>
            <span class="stat-value">${dayData.day.maxwind_kph} km/h</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">🌧️ Rain Chance</span>
            <span class="stat-value">${dayData.day.daily_chance_of_rain}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">☀️ UV Index</span>
            <span class="stat-value">${dayData.day.uv}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">👁️ Visibility</span>
            <span class="stat-value">${dayData.day.avgvis_km} km</span>
          </div>
        </div>
      </div>
    `;

    // Update summary cards
    updateSummaryCards(data);
    
  } catch (error) {
    console.error('Error loading day data:', error);
    dayContainer.innerHTML = `
      <div class="error-message">
        <div class="error-icon">❌</div>
        <h3>Failed to Load Data</h3>
        <p>Please check your connection and try again</p>
        <p>Error: ${error.message}</p>
      </div>
    `;
  }
}

// Load hourly forecast
async function loadHourlyForecast() {
  const hourlyContainer = document.getElementById('hourlyForecast');
  
  try {
    const url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${currentLocation}&days=1`;
    const response = await fetch(url, { headers });
    const data = await response.json();

    console.log('Hourly Forecast API Response:', data); // Debug log

    const hours = data.forecast.forecastday[0].hour.slice(0, 24);
    
    hourlyContainer.innerHTML = hours.map(hour => `
      <div class="hour-card">
        <div class="hour-time">${formatHour(hour.time)}</div>
        <div class="hour-icon">
          <img src="https:${hour.condition.icon}" alt="${hour.condition.text}">
        </div>
        <div class="hour-temp">${hour.temp_c}°C</div>
        <div class="hour-condition">${hour.condition.text}</div>
        <div class="hour-details">
          <span>💧 ${hour.humidity}%</span>
          <span>💨 ${hour.wind_kph} km/h</span>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error loading hourly forecast:', error);
    hourlyContainer.innerHTML = `
      <div class="error-message">
        <div class="error-icon">❌</div>
        <h3>Failed to Load Hourly Forecast</h3>
        <p>Please check your connection and try again</p>
        <p>Error: ${error.message}</p>
      </div>
    `;
  }
}

// Update summary cards
function updateSummaryCards(data) {
  const current = data.current;
  const today = data.forecast.forecastday[0].day;
  
  // Temperature
  document.querySelector('.min').textContent = `${today.mintemp_c}°C`;
  document.getElementById('currentTemp').textContent = `${current.temp_c}°C`;
  document.querySelector('.max').textContent = `${today.maxtemp_c}°C`;
  
  // Humidity
  document.getElementById('humidityValue').textContent = `${current.humidity}%`;
  document.getElementById('humidityFill').style.width = `${current.humidity}%`;
  
  // Wind
  document.getElementById('windSpeed').textContent = `${current.wind_kph} km/h`;
  document.getElementById('windDirection').textContent = current.wind_dir;
  
  // Visibility
  document.getElementById('visibilityValue').textContent = `${current.vis_km} km`;
}

// Helper functions
function getAlertSeverity(severity) {
  const severityMap = {
    'Minor': 'minor',
    'Moderate': 'moderate',
    'Severe': 'severe',
    'Extreme': 'extreme'
  };
  return severityMap[severity] || 'minor';
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDayName(day) {
  const dayNames = {
    yesterday: 'Yesterday',
    today: 'Today',
    tomorrow: 'Tomorrow'
  };
  return dayNames[day] || day;
}

function formatHour(timeString) {
  return new Date(timeString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true
  });
}

function updateLastUpdate() {
  const now = new Date();
  document.getElementById('lastUpdate').textContent = 
    `Last updated: ${now.toLocaleTimeString()}`;
}

// Load all data
function loadAllData() {
  loadLiveAlerts();
  loadDayData(currentDay);
  loadHourlyForecast();
}

// Initialize page
function initAlertsPage() {
  console.log('Initializing Alerts Page...');
  
  // Set up event listeners
  document.getElementById('locationInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      updateLocation();
    }
  });

  // Load initial data
  loadAllData();
  
  // Set up auto-refresh every 5 minutes
  setInterval(loadAllData, 5 * 60 * 1000);
  
  console.log('Alerts Page initialized successfully');
}

// Export functions for global access
window.toggleTheme = toggleTheme;
window.updateLocation = updateLocation;
window.refreshAlerts = refreshAlerts;
window.showDay = showDay;
window.initAlertsPage = initAlertsPage;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initAlertsPage();
}); 