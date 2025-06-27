const apiKey = '7b94334822mshac221ccfdec8553p14bebejsn581b69669a45';
const headers = {
  'X-RapidAPI-Key': apiKey,
  'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
};

// Live Clock
function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// Fetch Weather for Main City (Delhi)
async function fetchMainCityWeather() {
  const url = 'https://weatherapi-com.p.rapidapi.com/forecast.json?q=New Delhi&days=1';

  try {
    const res = await fetch(url, { headers });
    const data = await res.json();

    // ✅ Log full data to check icon path
    console.log("Main city weather:", data);

    document.getElementById("mainTemp").textContent = `${data.current.temp_c}°`;
    document.querySelector(".location").textContent = data.location.name;
    document.querySelector(".wind").textContent = `${data.current.wind_dir} at ${data.current.wind_kph} km/h`;
    document.querySelector(".condition").textContent = data.current.condition.text;
    document.querySelector(".description").innerHTML = `High ${data.forecast.forecastday[0].day.maxtemp_c}°, Winds from ${data.current.wind_dir} at ${data.current.wind_kph} km/h`;

    // ✅ Set weather icon
    const iconUrl = `https:${data.current.condition.icon}`;
    console.log("Weather icon URL:", iconUrl); // ✅ Confirm it's correct
    document.getElementById("weatherIcon").src = iconUrl;

    // ✅ Set humidity and pressure
    document.querySelector(".stats").innerHTML = `
      <div>💧 Humidity<br><strong>${data.current.humidity}%</strong></div>
      <div>💧 Pressure<br><strong>${data.current.pressure_mb} hPa</strong></div>`;

    // ✅ Set additional weather summary data
    document.getElementById("feelsLike").textContent = `${data.current.feelslike_c}°`;
    document.getElementById("uvIndex").textContent = data.current.uv;
    document.getElementById("visibility").textContent = `${data.current.vis_km} km`;

    // ✅ Set temperature range
    const maxTemp = data.forecast.forecastday[0].day.maxtemp_c;
    const minTemp = data.forecast.forecastday[0].day.mintemp_c;
    const currentTemp = data.current.temp_c;
    
    document.getElementById("maxTemp").textContent = `${maxTemp}°C`;
    document.getElementById("minTemp").textContent = `${minTemp}°C`;
    
    // Calculate temperature range percentage for the bar
    const tempRange = maxTemp - minTemp;
    const currentPosition = ((currentTemp - minTemp) / tempRange) * 100;
    document.getElementById("tempFill").style.width = `${currentPosition}%`;

    return data; // Return data for charts
  } catch (err) {
    console.error("Main city weather fetch error:", err);
  }
}

// Fetch City Card Weather (Kochi, Kolkata, Pune)
const cities = [
  { name: "Kochi", selector: ".city-card:nth-child(1)" },
  { name: "Kolkata", selector: ".city-card:nth-child(2)" },
  { name: "Pune", selector: ".city-card:nth-child(3)" }
];

async function fetchCityCardWeather() {
  for (let city of cities) {
    const url = `https://weatherapi-com.p.rapidapi.com/current.json?q=${city.name}`;
    try {
      const res = await fetch(url, { headers });
      const data = await res.json();

      const card = document.querySelector(city.selector);
      card.innerHTML = `${getEmoji(data.current.condition.text)} ${city.name} <div>${data.current.temp_c}°</div>`;
    } catch (err) {
      console.error(`Error fetching weather for ${city.name}:`, err);
    }
  }
}

// Fetch Alerts
async function fetchAlerts() {
  const url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=Delhi&days=1`;

  try {
    const res = await fetch(url, { headers });
    const data = await res.json();
    const alerts = data.alerts?.alert;

    const alertBox = document.getElementById("alertBox");
    if (alerts && alerts.length > 0) {
      alertBox.textContent = `⚠️ ${alerts[0].headline}`;
    } else {
      alertBox.textContent = `✅ No active weather alerts.`;
    }
  } catch (err) {
    document.getElementById("alertBox").textContent = "⚠️ Failed to fetch alerts.";
    console.error("Alerts error:", err);
  }
}

// Emoji by condition
function getEmoji(condition) {
  const lower = condition.toLowerCase();
  if (lower.includes("rain")) return "🌧️";
  if (lower.includes("sunny")) return "☀️";
  if (lower.includes("cloud")) return "⛅";
  if (lower.includes("clear")) return "🌤️";
  if (lower.includes("thunder")) return "⛈️";
  return "🌡️";
}

// Modern Chart Configurations
const chartConfig = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        drawBorder: false
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.8)',
        font: {
          size: 10
        }
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.8)',
        font: {
          size: 10
        }
      }
    }
  },
  elements: {
    point: {
      radius: 4,
      hoverRadius: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#1e88e5',
      borderWidth: 2
    },
    line: {
      tension: 0.4
    }
  }
};

// Render Hourly Temperature Chart
async function renderHourlyChart() {
  const url = 'https://weatherapi-com.p.rapidapi.com/forecast.json?q=Delhi&days=1';

  try {
    const res = await fetch(url, { headers });
    const data = await res.json();

    const forecastHours = data.forecast.forecastday[0].hour;
    const labels = forecastHours.map(hour => {
      const time = hour.time.split(" ")[1];
      return time.substring(0, 5); // HH:MM format
    });
    const temps = forecastHours.map(hour => hour.temp_c);

    const ctx = document.getElementById('hourlyChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.slice(0, 12), // next 12 hours
        datasets: [{
          label: 'Temperature (°C)',
          data: temps.slice(0, 12),
          backgroundColor: 'rgba(30, 136, 229, 0.2)',
          borderColor: '#1e88e5',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        ...chartConfig,
        plugins: {
          ...chartConfig.plugins,
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#1e88e5',
            borderWidth: 1
          }
        }
      }
    });
  } catch (error) {
    console.error("Hourly chart error:", error);
  }
}

// Render Humidity & Pressure Chart
async function renderHumidityChart() {
  const url = 'https://weatherapi-com.p.rapidapi.com/forecast.json?q=Delhi&days=1';

  try {
    const res = await fetch(url, { headers });
    const data = await res.json();

    const forecastHours = data.forecast.forecastday[0].hour;
    const labels = forecastHours.map(hour => {
      const time = hour.time.split(" ")[1];
      return time.substring(0, 5);
    });
    const humidity = forecastHours.map(hour => hour.humidity);
    const pressure = forecastHours.map(hour => hour.pressure_mb);

    const ctx = document.getElementById('humidityChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.slice(0, 8), // 8 hours for better visibility
        datasets: [
          {
            label: 'Humidity (%)',
            data: humidity.slice(0, 8),
            backgroundColor: 'rgba(76, 175, 80, 0.6)',
            borderColor: '#4caf50',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Pressure (hPa)',
            data: pressure.slice(0, 8),
            backgroundColor: 'rgba(255, 152, 0, 0.6)',
            borderColor: '#ff9800',
            borderWidth: 1,
            yAxisID: 'y1',
            type: 'line'
          }
        ]
      },
      options: {
        ...chartConfig,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.8)',
              font: { size: 10 }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.8)',
              font: { size: 10 }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.8)',
              font: { size: 10 }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error("Humidity chart error:", error);
  }
}

// Render Wind Speed Chart
async function renderWindChart() {
  const url = 'https://weatherapi-com.p.rapidapi.com/forecast.json?q=Delhi&days=1';

  try {
    const res = await fetch(url, { headers });
    const data = await res.json();

    const forecastHours = data.forecast.forecastday[0].hour;
    const labels = forecastHours.map(hour => {
      const time = hour.time.split(" ")[1];
      return time.substring(0, 5);
    });
    const windSpeed = forecastHours.map(hour => hour.wind_kph);

    const ctx = document.getElementById('windChart').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.slice(0, 6), // 6 hours for doughnut
        datasets: [{
          data: windSpeed.slice(0, 6),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'rgba(255, 255, 255, 0.8)',
              font: { size: 10 },
              padding: 10
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            callbacks: {
              label: function(context) {
                return `Wind: ${context.parsed} km/h`;
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error("Wind chart error:", error);
  }
}

// Initialize all charts and data
async function initializeDashboard() {
  console.log("🚀 Initializing dashboard...");
  
  // Show loading indicator
  const loadingIndicator = document.getElementById("loadingIndicator");
  loadingIndicator.style.display = "block";
  
  try {
    console.log("📡 Fetching main city weather...");
    await fetchMainCityWeather();
    
    console.log("🏙️ Fetching city card weather...");
    await fetchCityCardWeather();
    
    console.log("⚠️ Fetching alerts...");
    await fetchAlerts();
    
    console.log("📊 Rendering charts...");
    await renderHourlyChart();
    await renderHumidityChart();
    await renderWindChart();
    
    console.log("✅ Dashboard initialization complete!");
    
    // Hide loading indicator
    loadingIndicator.style.display = "none";
    
    // Show success message briefly
    const alertBox = document.getElementById("alertBox");
    alertBox.textContent = "✅ Weather data loaded successfully!";
    alertBox.style.display = "block";
    setTimeout(() => {
      alertBox.style.display = "none";
    }, 3000);

  } catch (error) {
    console.error("❌ Dashboard initialization failed:", error);
    
    // Hide loading indicator
    loadingIndicator.style.display = "none";
    
    // Show error message
    const alertBox = document.getElementById("alertBox");
    alertBox.textContent = "❌ Failed to load weather data. Please refresh the page.";
    alertBox.style.display = "block";
  }
}

// Add error handling for API failures
window.addEventListener('error', function(e) {
  console.error('Global error:', e.error);
});

// Test API connection
async function testAPIConnection() {
  const testUrl = 'https://weatherapi-com.p.rapidapi.com/current.json?q=London';
  try {
    const response = await fetch(testUrl, { headers });
    if (response.ok) {
      console.log("✅ API connection successful");
      return true;
    } else {
      console.error("❌ API connection failed:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ API connection error:", error);
    return false;
  }
}

// Init with API test
async function init() {
  console.log("🔍 Testing API connection...");
  const apiConnected = await testAPIConnection();
  
  if (apiConnected) {
    initializeDashboard();
  } else {
    console.error("❌ Cannot initialize dashboard - API connection failed");
    // Show error message to user
    document.getElementById("alertBox").textContent = "❌ Unable to connect to weather service. Please check your internet connection.";
    document.getElementById("alertBox").style.display = "block";
  }
}

// Start the application
init();

// Weather Notification System
function initWeatherNotifications() {
  // Initialize EmailJS with stored config or default
  const config = JSON.parse(localStorage.getItem('emailjsConfig') || '{}');
  if (config.userId) {
    emailjs.init(config.userId);
  }
  
  const notificationForm = document.getElementById('notificationForm');
  
  if (notificationForm) {
    notificationForm.addEventListener('submit', handleNotificationSubscription);
  }
}

function handleNotificationSubscription(e) {
  e.preventDefault();
  
  const email = document.getElementById('notificationEmail').value;
  const dailyUpdates = document.getElementById('dailyUpdates').checked;
  const severeWeather = document.getElementById('severeWeather').checked;
  const rainAlerts = document.getElementById('rainAlerts').checked;
  
  // Get current location for weather alerts
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        
        // Store subscription with location
        const subscription = {
          email: email,
          location: location,
          preferences: {
            dailyUpdates: dailyUpdates,
            severeWeather: severeWeather,
            rainAlerts: rainAlerts
          },
          subscribedAt: new Date().toISOString()
        };
        
        localStorage.setItem('weatherNotificationSubscription', JSON.stringify(subscription));
        
        // Send confirmation email
        sendNotificationEmail(email, 'subscription', {
          dailyUpdates: dailyUpdates,
          severeWeather: severeWeather,
          rainAlerts: rainAlerts,
          location: location
        });
        
        showAlert('Successfully subscribed to weather notifications for your location!', 'success');
        
        // Clear form
        document.getElementById('notificationEmail').value = '';
        
        // Start monitoring weather for this location
        startWeatherMonitoring(location, subscription.preferences);
      },
      (error) => {
        showAlert('Unable to get your location. Please enable location access.', 'error');
        console.error('Geolocation error:', error);
      }
    );
  } else {
    showAlert('Geolocation is not supported by your browser.', 'error');
  }
}

function sendNotificationEmail(email, type, data = {}) {
  const config = JSON.parse(localStorage.getItem('emailjsConfig') || '{}');
  
  if (!config.serviceId || !config.templateId) {
    console.error('EmailJS not configured. Please set up EmailJS first.');
    return;
  }
  
  const templateParams = {
    to_email: email,
    notification_type: type,
    ...data
  };
  
  // Send email using EmailJS
  emailjs.send(config.serviceId, config.templateId, templateParams)
    .then(function(response) {
      console.log('Email sent successfully:', response);
    }, function(error) {
      console.error('Email sending failed:', error);
    });
}

function startWeatherMonitoring(location, preferences) {
  // Check weather immediately
  checkWeatherForLocation(location, preferences);
  
  // Set up periodic checks (every 30 minutes)
  const monitoringInterval = setInterval(() => {
    checkWeatherForLocation(location, preferences);
  }, 30 * 60 * 1000);
  
  // Store interval ID for cleanup
  localStorage.setItem('weatherMonitoringInterval', monitoringInterval);
}

function checkWeatherForLocation(location, preferences) {
  // Fetch current weather for the location using the existing API
  fetchWeatherForLocation(location.lat, location.lon)
    .then(weatherData => {
      if (weatherData) {
        // Check for severe weather conditions
        if (preferences.severeWeather && isSevereWeather(weatherData)) {
          sendWeatherAlert(location, 'severe', weatherData);
        }
        
        // Check for rain conditions
        if (preferences.rainAlerts && isRainExpected(weatherData)) {
          sendWeatherAlert(location, 'rain', weatherData);
        }
      }
    })
    .catch(error => {
      console.error('Error checking weather for location:', error);
    });
}

async function fetchWeatherForLocation(lat, lon) {
  try {
    const url = `https://weatherapi-com.p.rapidapi.com/current.json?q=${lat},${lon}`;
    const response = await fetch(url, { headers });
    const data = await response.json();
    
    if (data.current) {
      return {
        condition: data.current.condition.text,
        temperature: data.current.temp_c,
        windSpeed: data.current.wind_kph,
        humidity: data.current.humidity,
        pressure: data.current.pressure_mb,
        precipitation: data.current.precip_mm,
        uv: data.current.uv,
        feelsLike: data.current.feelslike_c,
        location: data.location.name
      };
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
  return null;
}

function isSevereWeather(weather) {
  // Define severe weather conditions
  const severeConditions = [
    'thunderstorm', 'tornado', 'hurricane', 'blizzard', 
    'extreme heat', 'extreme cold', 'heavy snow', 'heavy rain',
    'storm', 'severe', 'dangerous'
  ];
  
  const condition = weather.condition.toLowerCase();
  
  return severeConditions.some(severe => condition.includes(severe)) ||
         weather.windSpeed > 50 || 
         weather.temperature > 40 || 
         weather.temperature < -10 ||
         weather.uv > 10;
}

function isRainExpected(weather) {
  const rainConditions = ['rain', 'drizzle', 'shower', 'storm', 'thunder'];
  const condition = weather.condition.toLowerCase();
  
  return rainConditions.some(rain => condition.includes(rain)) || 
         weather.precipitation > 0;
}

function sendWeatherAlert(location, alertType, weatherData) {
  const subscription = JSON.parse(localStorage.getItem('weatherNotificationSubscription') || '{}');
  const config = JSON.parse(localStorage.getItem('emailjsConfig') || '{}');
  
  if (!subscription.email || !config.serviceId || !config.templateId) {
    return;
  }
  
  const alertMessages = {
    severe: `Severe weather alert for ${weatherData.location}: ${weatherData.condition}. Temperature: ${weatherData.temperature}°C, Wind: ${weatherData.windSpeed} km/h`,
    rain: `Rain alert for ${weatherData.location}: ${weatherData.condition} expected. Don't forget your umbrella!`,
    daily: `Daily weather update for ${weatherData.location}: ${weatherData.condition}, ${weatherData.temperature}°C`
  };
  
  const templateParams = {
    to_email: subscription.email,
    alert_type: alertType,
    weather_condition: weatherData.condition,
    temperature: weatherData.temperature,
    wind_speed: weatherData.windSpeed,
    humidity: weatherData.humidity,
    location: weatherData.location,
    message: alertMessages[alertType]
  };
  
  emailjs.send(config.serviceId, config.templateId, templateParams)
    .then(function(response) {
      console.log('Weather alert sent:', response);
    }, function(error) {
      console.error('Weather alert failed:', error);
    });
}

// Daily weather update function
function sendDailyWeatherUpdate() {
  const subscription = JSON.parse(localStorage.getItem('weatherNotificationSubscription') || '{}');
  
  if (subscription.email && subscription.preferences.dailyUpdates && subscription.location) {
    fetchWeatherForLocation(subscription.location.lat, subscription.location.lon)
      .then(weatherData => {
        if (weatherData) {
          sendWeatherAlert(subscription.location, 'daily', weatherData);
        }
      });
  }
}

// Initialize notifications when page loads
document.addEventListener('DOMContentLoaded', function() {
  initWeatherNotifications();
  
  // Send daily update at 8 AM
  const now = new Date();
  const nextUpdate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
  if (now > nextUpdate) {
    nextUpdate.setDate(nextUpdate.getDate() + 1);
  }
  
  setTimeout(() => {
    sendDailyWeatherUpdate();
    // Set up daily updates
    setInterval(sendDailyWeatherUpdate, 24 * 60 * 60 * 1000);
  }, nextUpdate.getTime() - now.getTime());
});
