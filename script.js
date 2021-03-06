const containerToday = document.getElementById('weatherToday');
const containerForecast = document.getElementById('weatherForecast');
let citySearched = 'Kil';

//Fetch weather today API
const fetchWeatherToday = citySearched => {
	fetch(
		`https://api.openweathermap.org/data/2.5/weather?q=${citySearched}&units=metric&APPID=a0a9672a941bc58ae811a05987143dd5`
	)
		.then(response => {
			return response.json();
		})
		.then(weatherToday => {
			containerToday.innerHTML += generatedHTMLForWeatherToday(weatherToday);
		})
		.catch(error => {
			console.log(error);
			document.getElementById('cityNamePicked').value = '';
			containerToday.innerHTML = '';
			containerForecast.innerHTML = '';
			location.reload();
			return alert('Searched city is not found, try again');
		});
};
fetchWeatherToday(citySearched);

//Function to invoke already created functions and manipulate the DOM
const generatedHTMLForWeatherToday = weatherToday => {
	const temperature = calculatedTemperature(weatherToday.main.temp);
	const timeInCity = calculatingTime(weatherToday.dt, weatherToday.timezone);
	const sunrise = calculatingTime(
		weatherToday.sys.sunrise,
		weatherToday.timezone
	);
	const sunset = calculatingTime(
		weatherToday.sys.sunset,
		weatherToday.timezone
	);
	const iconToday = iconDependingOnWeather(weatherToday.weather[0].main);
	const description = descriptionUppercase(weatherToday.weather[0].description);
	weatherTodayBackgroundColor(weatherToday.main.temp);

	//separate and build up the HTML tree
	let weatherTodayHTML = '';
	weatherTodayHTML += `<div class="weather-information">`;
	weatherTodayHTML += `<img src='${iconToday}'/>`;
	weatherTodayHTML += `<h1 class="temp"> ${temperature} \xB0c </h1>`;

	weatherTodayHTML += `<div class="location-information">`;
	weatherTodayHTML += `<h2> ${weatherToday.name} </h2> `;
	weatherTodayHTML += `<p> ${timeInCity} </p>`;
	weatherTodayHTML += `<p> ${description}</p>`;
	weatherTodayHTML += `</div>`;
	weatherTodayHTML += `</div>`;
	weatherTodayHTML += `<div class="sun-information">`;
	weatherTodayHTML += `<p> Sun &uarr; ${sunrise}</p>`;
	weatherTodayHTML += `<p> Sun &darr; ${sunset}</p>`;
	weatherTodayHTML += `</div>`;
	return weatherTodayHTML;
};

//Fetch weather forcast API
const fetchWeatherForcast = citySearched => {
	fetch(
		`https://api.openweathermap.org/data/2.5/forecast?q=${citySearched}&units=metric&APPID=a0a9672a941bc58ae811a05987143dd5`
	)
		.then(response => {
			return response.json();
		})
		.then(weatherForcast => {
			const filteredForcast = weatherForcast.list.filter(item =>
				item.dt_txt.includes('12:00')
			);

			filteredForcast.forEach(forcast => {
				containerForecast.innerHTML += generatedHTMLForWeatherForcast(forcast);
			});
		})
		.catch(error => {
			console.log(error);
		});
};
fetchWeatherForcast(citySearched);

//Functions to invoke already created functions and manipulate the DOM
const generatedHTMLForWeatherForcast = filteredForcast => {
	const weekday = printDay(filteredForcast.dt);
	const dailyTemp = calculatedTemperature(filteredForcast.main.temp);
	const wind = calculatedTemperature(filteredForcast.wind.speed);
	const iconForcast = iconDependingOnWeather(filteredForcast.weather[0].main);
	//separate and build up the HTML tree
	let weatherForcast = '';
	weatherForcast += `<div class="weather-forcast">`;
	weatherForcast += `<div class="day">${weekday}</div>`;
	weatherForcast += `<img src='${iconForcast}'/>`;
	weatherForcast += `<p>${dailyTemp} \xB0c | ${wind} m/s</p>`;
	weatherForcast += `</div>`;
	return weatherForcast;
};

//function invoked when search button is clicked (enter)
const citySelected = () => {
	const city = document.getElementById('cityNamePicked').value;
	if (city) {
		containerToday.innerHTML = '';
		containerForecast.innerHTML = '';
		citySearched = document.getElementById('cityNamePicked').value;
		fetchWeatherForcast(citySearched);
		fetchWeatherToday(citySearched);
		document.getElementById('cityNamePicked').value = '';
	}
};

//Function for temp rounded to one decimal
const calculatedTemperature = number => {
	return Math.round(number * 10) / 10;
};

//Function for local time, time for sunset and sunrise
const calculatingTime = (timestamp, timezone) => {
	const timeSetString = timeConvertedToLocal(timestamp, timezone);
	return timeSetString;
};

//functions to print a short day of our 5 day weather forcast
const printDay = timestamp => {
	const forcastDays = new Date(timestamp * 1000);
	const forcastDaysString = forcastDays.toLocaleDateString('en-SE', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	});
	return forcastDaysString;
};

/*This function takes the timestamp and the timezone (offset from UTC in seconds), 
creates a UTC date object and returns a string without any conversion based on the location of the client. */
//help from Karolin
const timeConvertedToLocal = (timestamp, timezone) => {
	let time = timestamp * 1000;
	let tz = timezone * 1000;
	let date = new Date(time + tz);
	let year = date.getUTCFullYear();
	let month = date.getUTCMonth() + 1;
	let day = date.getUTCDate();
	let hour = date.getUTCHours();
	let minute = date.getUTCMinutes();
	let milliseconds = date.getUTCMilliseconds();
	//UTC date object
	const dateWithoutConversion = new Date(
		Date.UTC(year, month, day, hour, minute, milliseconds)
	);
	//Make it to string
	let dateString = dateWithoutConversion.toUTCString().toString();
	//using substring to extract the hour and minutes
	let subHour = dateString.substring(
		dateString.indexOf(':') - 2,
		dateString.indexOf(':')
	);
	let subMinutes = dateString.substring(
		dateString.indexOf(':') + 1,
		dateString.indexOf(':') + 3
	);
	//Put the hour and minutes back together in a fullTime String, no conversion to the clients timezone will be done.
	let fullTime = `${subHour}:${subMinutes}`;
	return fullTime;
};

//capitalize first letter in weather description
const descriptionUppercase = string => {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

//Function to limit the amount of weather descriptionss and to link them to an icon
const iconDependingOnWeather = item => {
	if (item === 'Clouds') {
		return './images/cloud.png';
	} else if (item === 'Clear') {
		return './images/sun.png';
	} else if (item === 'Rain') {
		return './images/rainy.png';
	} else if (item === 'Thunderstorm') {
		return './images/thunder.png';
	} else if (item === 'Drizzle') {
		return './images/drizzle.png';
	} else if (item === 'Snow') {
		return './images/snow.png';
	} else return './images/drizzle.png';
};

//Change background color depending on temperature
const weatherTodayBackgroundColor = temp => {
	const containerColor = document.querySelector('.background-color');
	if (temp < 0 && temp <= 6) {
		containerColor.style.backgroundColor = '#5555ff';
	} else if (temp > 6 && temp <= 20) {
		containerColor.style.backgroundColor = '#ffa500';
	} else containerColor.style.backgroundColor = '#FF0000';
};
