// Initialize the map with proper theme
let map;
let baseLayer;
let radarLayers = [];
let currentFrame = 0;
let maxFrames = 0;
let radarInterval;

// Function to initialize map with current theme
function initializeMap() {
  // Remove existing map if it exists
  if (map) {
    map.remove();
  }
  
  // Create new map
  map = L.map("map").setView([20.5937, 78.9629], 5);
  
  // Get tile layer based on current theme
  const tileLayerUrl = getComputedStyle(document.body).getPropertyValue('--tile-layer').replace(/"/g, '');
  baseLayer = L.tileLayer(tileLayerUrl);
  baseLayer.addTo(map);
  
  // Add click handler
  map.on("click", handleMapClick);
  
  // Load radar data if not already loaded
  if (radarLayers.length === 0) {
    loadRadar();
  } else {
    // Re-add radar layers if they exist
    if (radarLayers[currentFrame]) {
      radarLayers[currentFrame].addTo(map);
    }
  }
}

// Function to update map theme
function updateMapTheme() {
  if (map && baseLayer) {
    map.removeLayer(baseLayer);
    const tileLayerUrl = getComputedStyle(document.body).getPropertyValue('--tile-layer').replace(/"/g, '');
    baseLayer = L.tileLayer(tileLayerUrl);
    baseLayer.addTo(map);
  }
}

// Map click handler for weather info
function handleMapClick(e) {
  const { lat, lng } = e.latlng;
  const url = `https://weatherapi-com.p.rapidapi.com/current.json?q=${lat},${lng}`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '7b94334822mshac221ccfdec8553p14bebejsn581b69669a45',
      'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
    }
  };
  
  try {
    fetch(url, options)
      .then(res => res.json())
      .then(data => {
        const popup = `<b>${data.location.name}, ${data.location.region}</b><br/>
          🌡️ Temp: ${data.current.temp_c}°C<br/>
          ☁️ ${data.current.condition.text}<br/>
          💧 ${data.current.humidity}% humidity<br/>
          💨 Wind: ${data.current.wind_kph} kph`;
        L.popup().setLatLng([lat, lng]).setContent(popup).openOn(map);
      })
      .catch(err => {
        alert("⚠️ Weather info not available.");
        console.error("Weather fetch error:", err);
      });
  } catch (err) {
    alert("⚠️ Weather info not available.");
    console.error("Weather fetch error:", err);
  }
}

// Load radar data and start animation
async function loadRadar() {
  try {
    const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
    const data = await res.json();
    const timestamps = data.radar.past.map(f => f.time);
    maxFrames = timestamps.length;

    // Create radar layers
    radarLayers = timestamps.map(t =>
      L.tileLayer(`https://tilecache.rainviewer.com/v2/radar/${t}/256/{z}/{x}/{y}/2/1_1.png`, { 
        opacity: 0.6,
        zIndex: 1000
      })
    );

    // Hide loader and start animation
    document.getElementById('loader').style.display = 'none';
    
    if (radarLayers.length > 0 && map) {
      radarLayers[0].addTo(map);
      startRadarAnimation();
    }
  } catch (error) {
    console.error('Error loading radar data:', error);
    document.getElementById('loader').innerHTML = '<p>⚠️ Radar data unavailable</p>';
  }
}

// Start radar animation
function startRadarAnimation() {
  if (radarInterval) clearInterval(radarInterval);
  
  radarInterval = setInterval(() => {
    if (!map) return;
    
    // Remove current frame
    if (radarLayers[currentFrame]) {
      radarLayers[currentFrame].remove();
    }
    
    // Move to next frame
    currentFrame = (currentFrame + 1) % maxFrames;
    
    // Add new frame
    if (radarLayers[currentFrame]) {
      radarLayers[currentFrame].addTo(map);
    }
  }, 800); // Update every 800ms
}

// Initialize radar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit for theme to be applied
  setTimeout(() => {
    initializeMap();
  }, 100);
});

// Listen for theme changes (if any other page changes theme)
window.addEventListener('storage', function(e) {
  if (e.key === 'theme') {
    // Update theme class
    if (e.newValue === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    
    // Update map theme
    setTimeout(() => {
      updateMapTheme();
    }, 100);
  }
});
