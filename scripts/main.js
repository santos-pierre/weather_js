/** @type {HTMLFormElement} */
const form = document.forms['city-weather'];
const result = document.querySelector('#result');
const historyElement = document.querySelector('#history');

const weatherHistory = [];

form.addEventListener('submit', async (e) => {
	e.preventDefault();

	const city = form.city.value;
	const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=e0ceeda39c4e4968fbfe7f7904f73b1c&units=metric&lang=fr`;

	try {
		const response = await fetch(url);

		const data = await response.json();

		const city = data.name;
		const icon = data.weather[0].icon;
		const temp = data.main.temp;

		result.innerHTML = template(city, icon, temp);
		weatherHistory.push({ city, icon, temp, url });
		refreshHistory();
	} catch (error) {
		result.innerHTML = `<h4>City ${city} not found</h4>`
	} finally {
		form.reset();
	}
});

const template = (name, img, temp) => {
	const urlImg = `http://openweathermap.org/img/wn/${img}@2x.png`;

	return `
		<div class="weather-display">
			<div>
				<img
					src=${urlImg}
					alt='weather-icon'
				/>
			</div>
			<div class="content">
				<span class="name">${name}</span>
				<span class="temp">${temp}°C</span>
			</div>
		</div>
	`
}

const refresh = async () => {
	const fetchRequests = [];

	for (const weather of weatherHistory) {
		const fetchReq = await fetch(weather.url);

		fetchRequests.push(fetchReq.json());
	}

	const allWeather = await Promise.all(fetchRequests);

	weatherHistory.length = 0;

	for (const weather of allWeather) {
		const newWeather = {
			city: weather.name,
			icon: weather.weather[0].icon,
			temp: weather.main.temp,
			url: `https://api.openweathermap.org/data/2.5/weather?q=${weather.name}&appid=e0ceeda39c4e4968fbfe7f7904f73b1c&units=metric&lang=fr`
		}

		weatherHistory.push(newWeather);
	}

	refreshHistory();
}

const btn = document.getElementById('refresh-btn');
btn.addEventListener('click', () => {
	refresh();
})

function refreshHistory() {
	while (historyElement.firstChild) {
		historyElement.removeChild(historyElement.firstChild);
	}

	for (const { icon, city, temp } of weatherHistory) {
		const weather = document.createElement('div');
		weather.innerHTML = template(city, icon, temp);

		historyElement.appendChild(weather);
	}

}
