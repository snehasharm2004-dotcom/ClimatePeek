const API_KEY = 'bd5e378503939ddaee76f12ad7a97608'; // public demo key
let unit = 'C';
let currentData = null;
 
/* ─── Unit toggle ─── */
function setUnit(u) {
  unit = u;
  document.getElementById('btn-c').classList.toggle('active', u === 'C');
  document.getElementById('btn-f').classList.toggle('active', u === 'F');
  if (currentData) renderCurrent(currentData.current, currentData.forecast);
}
 
function toDisplay(kelvin) {
  if (unit === 'C') return Math.round(kelvin - 273.15) + '°C';
  return Math.round((kelvin - 273.15) * 9/5 + 32) + '°F';
}
function toDisplayRaw(kelvin) {
  if (unit === 'C') return Math.round(kelvin - 273.15);
  return Math.round((kelvin - 273.15) * 9/5 + 32);
}
 
/* ─── Weather emoji mapping ─── */
function conditionEmoji(id, icon) {
  const night = icon && icon.endsWith('n');
  if (id >= 200 && id < 300) return '⛈️';
  if (id >= 300 && id < 400) return '🌦️';
  if (id >= 500 && id < 511) return '🌧️';
  if (id === 511) return '🌨️';
  if (id >= 511 && id < 600) return '🌧️';
  if (id >= 600 && id < 700) return '❄️';
  if (id >= 700 && id < 800) return '🌫️';
  if (id === 800) return night ? '🌙' : '☀️';
  if (id === 801) return night ? '🌤️' : '🌤️';
  if (id === 802) return '⛅';
  if (id >= 803) return '☁️';
  return '🌡️';
}
 
/* ─── History ─── */
function getHistory() {
  try { return JSON.parse(localStorage.getItem('nimbus_history') || '[]'); } catch { return []; }
}
function saveHistory(city) {
  let h = getHistory().filter(c => c.toLowerCase() !== city.toLowerCase());
  h.unshift(city);
  h = h.slice(0, 5);
  localStorage.setItem('nimbus_history', JSON.stringify(h));
  renderHistory();
}
function renderHistory() {
  const h = getHistory();
  const row = document.getElementById('history-row');
  row.innerHTML = '';
  if (h.length) {
    const lbl = document.createElement('span');
    lbl.className = 'history-label';
    lbl.textContent = 'Recent:';
    row.appendChild(lbl);
  }
  h.forEach(city => {
    const pill = document.createElement('button');
    pill.className = 'history-pill';
    pill.textContent = city;
    pill.onclick = () => { document.getElementById('city-input').value = city; fetchWeather(); };
    row.appendChild(pill);
  });
}
 
/* ─── UI helpers ─── */
function showSpinner(v) { document.getElementById('spinner').classList.toggle('show', v); }
function showError(msg) {
  const b = document.getElementById('error-box');
  b.classList.add('show');
  document.getElementById('error-text').textContent = msg;
}
function hideError() { document.getElementById('error-box').classList.remove('show'); }
function showMain(v) { document.getElementById('weather-main').classList.toggle('show', v); }
 
/* ─── Fetch ─── */
async function fetchWeather() {
  const city = document.getElementById('city-input').value.trim();
  if (!city) return;
  hideError(); showMain(false); showSpinner(true);
  try {
    const [curRes, fRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}`)
    ]);
    if (!curRes.ok) {
      const err = await curRes.json();
      throw new Error(err.message || 'City not found');
    }
    const [cur, forecast] = await Promise.all([curRes.json(), fRes.json()]);
    currentData = { current: cur, forecast };
    saveHistory(cur.name);
    renderCurrent(cur, forecast);
    showMain(true);
  } catch (e) {
    showError('❌ ' + (e.message.includes('not found') ? `"${city}" not found. Check spelling and try again.` : 'Something went wrong. Please try again.'));
  } finally {
    showSpinner(false);
  }
}
 
/* ─── Render current ─── */
function renderCurrent(cur, forecast) {
  const offset = cur.timezone;
  const now = new Date((Date.now() / 1000 + offset + new Date().getTimezoneOffset() * 60) * 1000);
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 
  document.getElementById('city-name').textContent = cur.name;
  document.getElementById('country-date').textContent =
    `${cur.sys.country} · ${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
 
  document.getElementById('temp-display').textContent = toDisplay(cur.main.temp);
  document.getElementById('feels-like').textContent = `Feels like ${toDisplay(cur.main.feels_like)}`;
 
  const wid = cur.weather[0].id;
  const wicon = cur.weather[0].icon;
  const emoji = conditionEmoji(wid, wicon);
  document.getElementById('weather-emoji').textContent = emoji;
  document.getElementById('cond-icon').textContent = emoji;
  document.getElementById('condition-text').textContent = cur.weather[0].description.replace(/\b\w/g,c=>c.toUpperCase());
 
  document.getElementById('stat-humidity').textContent = cur.main.humidity + '%';
  document.getElementById('stat-wind').textContent = Math.round(cur.wind.speed * 3.6);
  document.getElementById('stat-vis').textContent = (cur.visibility / 1000).toFixed(1);
  document.getElementById('stat-pressure').textContent = cur.main.pressure;
 
  // Sunrise / sunset
  function fmtTime(unix, tz) {
    const d = new Date((unix + tz + new Date().getTimezoneOffset() * 60) * 1000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  document.getElementById('info-sunrise').textContent = fmtTime(cur.sys.sunrise, offset);
  document.getElementById('info-sunset').textContent = fmtTime(cur.sys.sunset, offset);
 
  const windKmh = Math.round(cur.wind.speed * 3.6);
  document.getElementById('info-wind').textContent = windKmh;
  document.getElementById('wind-fill').style.width = Math.min(windKmh / 120 * 100, 100) + '%';
 
  renderForecast(forecast, offset);
}
 
/* ─── Render 5-day forecast ─── */
function renderForecast(data, tzOffset) {
  const grid = document.getElementById('forecast-grid');
  grid.innerHTML = '';
 
  // Group by day (noon reading closest)
  const days = {};
  data.list.forEach(item => {
    const d = new Date((item.dt + tzOffset + new Date().getTimezoneOffset() * 60) * 1000);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!days[key]) days[key] = [];
    days[key].push(item);
  });
 
  const dayKeys = Object.keys(days).slice(0, 5);
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
 
  dayKeys.forEach((key, i) => {
    const items = days[key];
    // Find noon or pick middle
    const noon = items.reduce((best, item) => {
      const h = new Date((item.dt + tzOffset + new Date().getTimezoneOffset() * 60) * 1000).getHours();
      return Math.abs(h - 12) < Math.abs(new Date((best.dt + tzOffset + new Date().getTimezoneOffset() * 60) * 1000).getHours() - 12) ? item : best;
    }, items[0]);
 
    const maxK = Math.max(...items.map(x => x.main.temp_max));
    const minK = Math.min(...items.map(x => x.main.temp_min));
    const rain = items.reduce((s, x) => s + (x.rain && x.rain['3h'] ? x.rain['3h'] : 0), 0);
 
    const d = new Date((noon.dt + tzOffset + new Date().getTimezoneOffset() * 60) * 1000);
    const label = i === 0 ? 'Today' : dayNames[d.getDay()];
    const emoji = conditionEmoji(noon.weather[0].id, noon.weather[0].icon);
 
    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <div class="forecast-day">${label}</div>
      <div class="forecast-icon">${emoji}</div>
      <div class="forecast-high">${toDisplay(maxK)}</div>
      <div class="forecast-low">${toDisplay(minK)}</div>
      ${rain > 0 ? `<div class="forecast-rain">💧 ${rain.toFixed(1)}mm</div>` : ''}
    `;
    grid.appendChild(card);
  });
}
 
/* ─── Init ─── */
renderHistory();
 
// Preload with a city if no history
const h = getHistory();
if (h.length) {
  document.getElementById('city-input').value = h[0];
  fetchWeather();
}