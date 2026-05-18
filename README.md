🌤️ ClimatePeek — Weather Dashboard
A sleek, feature-rich weather dashboard built with HTML, CSS & Vanilla JavaScript using the free OpenWeatherMap API. Search any city in the world and get real-time weather data with a stunning dark UI.

✨ Features

🔍 City Search — Search any city worldwide instantly
📅 5-Day Forecast — Daily cards showing high/low temps, condition & rain accumulation
🌡️ °C / °F Toggle — Switch units without re-fetching data
🕐 Search History — Last 5 searched cities saved in localStorage, click to reload
⏳ Loading Spinner — Animated spinner while data is being fetched
⚠️ Error Handling — Clear error messages if city is not found (try/catch)
🌦️ Dynamic Weather Icons — Emoji icons change based on condition (☀️ sunny, 🌧️ rain, ⛈️ storm, ❄️ snow, 🌙 night, etc.)
💨 Wind Speed Bar — Visual wind indicator
🌅 Sunrise & Sunset — Accurate local time display
📱 Responsive Design — Works on mobile, tablet and desktop


🖥️ Live Demo
🚀 View Live on Vercel →https://climate-peek.vercel.app/

🛠️ Tech Stack
TechnologyUsageHTML5StructureCSS3Styling, animations, responsive layoutVanilla JavaScriptLogic, API calls, DOM manipulationOpenWeatherMap APICurrent weather + 5-day forecastlocalStorageSearch history persistenceGoogle FontsDM Sans + Syne typography

🚀 Getting Started
1. Clone the repository
bashgit clone https://github.com/your-username/climatePeek-weather.git
cd nimbus-weather
2. Get your free API Key

Go to openweathermap.org and create a free account
Navigate to API Keys in your dashboard
Copy your personal API key

3. Add your API Key
Open index.html and find this line near the bottom:
javascriptconst API_KEY = 'your_api_key_here';
Replace it with your own key.
4. Open in browser
No build tools or dependencies needed — just open index.html in any modern browser!
bash# Or use Live Server in VS Code

📡 API Endpoints Used
Both endpoints are available on the free tier of OpenWeatherMap:
GET https://api.openweathermap.org/data/2.5/weather?q={city}&appid={key}
GET https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={key}

📁 Project Structure
climatePeek-weather/
│
└── index.html       # Everything in one file (HTML + CSS + JS)

⚙️ How It Works
User searches city
      ↓
Promise.all([current weather, 5-day forecast])  ← parallel API calls
      ↓
try { render data } catch { show error message }
      ↓
Save city to localStorage history
      ↓
Unit toggle (°C/°F) converts temps without re-fetching

🌍 Deploy to Vercel

Push this repo to GitHub
Go to vercel.com → New Project
Import your GitHub repository
Click Deploy — done! 🎉

