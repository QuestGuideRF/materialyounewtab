document.addEventListener("DOMContentLoaded", function () {
    const hideWeather = document.getElementById("hideWeather");
    const hideWeatherCheckbox = document.getElementById("hideWeatherCheckbox");
    const elementsToDisable = document.querySelectorAll(".weather");
    const savedState = localStorage.getItem("hideWeatherVisible") === "true";
    hideWeatherCheckbox.checked = savedState;
    function applyVisibilityState(isHidden) {
        hideWeather.classList.toggle("weather-hidden", isHidden);
    }
    function toggleInactiveState(isInactive) {
        elementsToDisable.forEach(element => {
            element.classList.toggle("inactive", isInactive);
        });
    }
    toggleInactiveState(savedState);
    applyVisibilityState(savedState);
    if (hideWeather && !hideWeather.hasAttribute("data-weather-click-handler")) {
        hideWeather.setAttribute("data-weather-click-handler", "true");
        hideWeather.style.cursor = "pointer";
        hideWeather.addEventListener("click", (e) => {
            if (!e.target.closest(".location-icon")) {
                window.open("https://yandex.ru/pogoda/ru/moscow", "_blank");
            }
        });
    }
    if (!savedState) {
        getWeatherData();
    }
    hideWeatherCheckbox.addEventListener("change", () => {
        const isChecked = hideWeatherCheckbox.checked;
        applyVisibilityState(isChecked);
        localStorage.setItem("hideWeatherVisible", isChecked);
        toggleInactiveState(isChecked);
        if (!isChecked) {
            getWeatherData();
        }
    });
});
async function getWeatherData() {
    document.getElementById("conditionText").textContent = translations[currentLanguage]?.conditionText || translations["en"].conditionText;
    document.getElementById("humidityLevel").textContent = translations[currentLanguage]?.humidityLevel || translations["en"].humidityLevel;
    document.getElementById("location").textContent = translations[currentLanguage]?.location || translations["en"].location;
    const userAPIInput = document.getElementById("userAPI");
    const userLocInput = document.getElementById("userLoc");
    const saveAPIButton = document.getElementById("saveAPI");
    const saveLocButton = document.getElementById("saveLoc");
    const gpsToggle = document.getElementById("useGPScheckbox");
    const locationCont = document.getElementById("locationCont");
    const locationSuggestions = document.getElementById("locationSuggestions");
    const savedApiKey = localStorage.getItem("weatherApiKey");
    const savedLocation = localStorage.getItem("weatherLocation");
    if (savedLocation) userLocInput.value = savedLocation;
    if (savedApiKey) userAPIInput.value = savedApiKey;
    const minMaxTempCheckbox = document.getElementById("minMaxTempCheckbox");
    const isMinMaxEnabled = localStorage.getItem("minMaxTempEnabled") === "true";
    minMaxTempCheckbox.checked = isMinMaxEnabled;
    document.getElementById("feelsLike").textContent = isMinMaxEnabled
        ? translations[currentLanguage]?.minMaxTemp || translations["en"].minMaxTemp
        : translations[currentLanguage]?.feelsLike || translations["en"].feelsLike;
    function handleEnterPress(event, buttonId) {
        if (event.key === "Enter") {
            document.getElementById(buttonId).click();
        }
    }
    userAPIInput.addEventListener("keydown", (event) => handleEnterPress(event, "saveAPI"));
    userLocInput.addEventListener("keydown", (event) => handleEnterPress(event, "saveLoc"));
    saveAPIButton.addEventListener("click", () => {
        const apiKey = userAPIInput.value.trim();
        localStorage.setItem("weatherApiKey", apiKey);
        userAPIInput.value = "";
        location.reload();
    });
    gpsToggle.addEventListener("change", async () => {
        if (gpsToggle.checked) {
            const message = translations[currentLanguage]?.GPSDisclaimer || translations["en"].GPSDisclaimer;
            const confirmGPS = await confirmPrompt(message, agreeText, cancelText);
            if (!confirmGPS) {
                gpsToggle.checked = false;
                return;
            }
            localStorage.setItem("useGPS", true);
            locationCont.classList.add("inactive");
        } else {
            localStorage.setItem("useGPS", false);
            locationCont.classList.remove("inactive");
        }
        location.reload();
    });
    saveLocButton.addEventListener("click", () => {
        const userLocation = userLocInput.value.trim();
        localStorage.setItem("weatherLocation", userLocation);
        localStorage.setItem("useGPS", false);
        userLocInput.value = "";
        fetchWeather();
        location.reload();
    });
    const weatherApiKeys = [
        "d36ce712613d4f21a6083436240910",
        "db0392b338114f208ee135134240312",
        "de5f7396db034fa2bf3140033240312",
        "c64591e716064800992140217240312",
        "9b3204c5201b4b4d8a2140330240312",
        "eb8a315c15214422b60140503240312",
        "cd148ebb1b784212b74140622240312",
        "7ae67e219af54df2840140801240312",
        "0a6bc8a404224c8d89953341241912",
        "f59e58d7735d4739ae953115241912",
        "17859d22a346495c988115334252703",
        "97cc2ef3bc4f45b3b0d120816252703",
        "51348f046e3f47ee99d120933252703",
        "ddbba7cc66044f96b43121046252703",
        "ab1b595515084775be2121201252703"
    ];
    const defaultApiKey = weatherApiKeys[Math.floor(Math.random() * weatherApiKeys.length)];
    const apiKey = savedApiKey || defaultApiKey;
    let activeIndex = -1;
    let suggestions = [];
    function toggleAutocomplete() {
        if (suggestions.length > 0) {
            userLocInput.setAttribute("autocomplete", "off");
        } else {
            userLocInput.removeAttribute("autocomplete");
        }
    }
    async function fetchLocationSuggestions(query) {
        if (!savedApiKey || query.length < 3) {
            suggestions = [];
            locationSuggestions.style.display = "none";
            toggleAutocomplete();
            return;
        }
        try {
            const response = await fetch(`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${query}`);
            suggestions = await response.json();
            if (suggestions.length > 0) {
                displaySuggestions(suggestions);
                toggleAutocomplete();
            } else {
                locationSuggestions.style.display = "none";
                toggleAutocomplete();
            }
        } catch (error) {
            console.error("Ошибка при получении предложений по местоположению:", error);
            suggestions = [];
            toggleAutocomplete();
        }
    }
    function displaySuggestions(locations) {
        locationSuggestions.innerHTML = "";
        locations.forEach((location, index) => {
            const div = document.createElement("div");
            div.classList.add("location-suggestion-item");
            const locationText = location.region
                ? `${location.name}, ${location.region}, ${location.country}`
                : `${location.name}, ${location.country}`;
            div.textContent = locationText;
            div.dataset.index = index;
            div.addEventListener("click", () => {
                selectLocation(index);
                locationSuggestions.style.display = "none";
                suggestions = [];
                toggleAutocomplete();
            });
            div.addEventListener("mouseenter", () => {
                activeIndex = index;
                updateActiveSuggestion();
            });
            locationSuggestions.appendChild(div);
        });
        locationSuggestions.style.display = "block";
        activeIndex = -1;
    }
    function updateActiveSuggestion() {
        const items = locationSuggestions.querySelectorAll(".location-suggestion-item");
        items.forEach((item, i) => {
            item.classList.toggle("active", i === activeIndex);
            if (i === activeIndex) {
                item.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }
        });
    }
    function selectLocation(index) {
        const selectedLocation = suggestions[index];
        const locationText = selectedLocation.region
            ? `${selectedLocation.name}, ${selectedLocation.region}, ${selectedLocation.country}`
            : `${selectedLocation.name}, ${selectedLocation.country}`;
        userLocInput.value = locationText;
        locationSuggestions.style.display = "none";
        localStorage.setItem("weatherLocation", JSON.stringify(selectedLocation));
        saveLocButton.click();
        suggestions = [];
        toggleAutocomplete();
    }
    userLocInput.addEventListener("input", () => {
        fetchLocationSuggestions(userLocInput.value)
    });
    userLocInput.addEventListener("focus", () => {
        if (userLocInput.value.length >= 3) {
            fetchLocationSuggestions(userLocInput.value);
        }
    });
    userLocInput.addEventListener("keydown", (e) => {
        const items = locationSuggestions.querySelectorAll(".location-suggestion-item");
        if (items.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % items.length;
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + items.length) % items.length;
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            selectLocation(activeIndex);
            locationSuggestions.style.display = "none";
            return;
        }
        updateActiveSuggestion();
    });
    document.addEventListener("click", (e) => {
        if (!locationSuggestions.contains(e.target) && !userLocInput.contains(e.target)) {
            locationSuggestions.style.display = "none";
            suggestions = [];
            toggleAutocomplete();
        }
    });
    let currentUserLocation = savedLocation;
    const useGPS = JSON.parse(localStorage.getItem("useGPS")) || false;
    gpsToggle.checked = useGPS;
    if (useGPS) locationCont.classList.add("inactive");
    async function fetchGPSLocation() {
        const getLocationFromGPS = () => {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });
                    },
                    (error) => reject(error),
                    { timeout: 6000 }
                );
            });
        };
        try {
            const { latitude, longitude } = await getLocationFromGPS();
            return `${latitude},${longitude}`;
        } catch (error) {
            console.error("Не удалось получить местоположение GPS:", error);
        }
    }
    await (async function initializeLocation() {
        try {
            if (useGPS) currentUserLocation = await fetchGPSLocation();
            if (!currentUserLocation) {
                const ipInfo = "https://ipinfo.io/json/";
                const locationData = await fetch(ipInfo);
                const ipLocation = await locationData.json();
                currentUserLocation = ipLocation.loc;
            }
            fetchWeather();
        } catch (error) {
            console.error("Не удалось получить местоположение по IP:", error);
            currentUserLocation = "auto:ip";
            fetchWeather();
        }
    })();
    async function fetchWeather() {
        try {
            let parsedData = JSON.parse(localStorage.getItem("weatherParsedData"));
            const weatherParsedTime = parseInt(localStorage.getItem("weatherParsedTime"));
            const weatherParsedLocation = localStorage.getItem("weatherParsedLocation");
            const weatherParsedLang = localStorage.getItem("weatherParsedLang");
            const retentionTime = savedApiKey ? 435000 : 960000;
            if (!parsedData ||
                ((Date.now() - weatherParsedTime) > retentionTime) ||
                (weatherParsedLocation !== currentUserLocation) ||
                (weatherParsedLang !== currentLanguage)) {
                let lang = currentLanguage === "zh_TW" ? currentLanguage : currentLanguage.split("_")[0];
                let weatherApi = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${currentUserLocation}&lang=${lang}&days=1`;
                let data = await fetch(weatherApi);
                parsedData = await data.json();
                if (!parsedData.error) {
                    const filteredData = {
                        location: {
                            name: parsedData.location.name,
                        },
                        current: {
                            condition: {
                                text: parsedData.current.condition.text,
                                icon: parsedData.current.condition.icon,
                            },
                            temp_c: parsedData.current.temp_c,
                            temp_f: parsedData.current.temp_f,
                            humidity: parsedData.current.humidity,
                            feelslike_c: parsedData.current.feelslike_c,
                            feelslike_f: parsedData.current.feelslike_f,
                        },
                        forecast: {
                            forecastday: [
                                {
                                    day: {
                                        mintemp_c: parsedData.forecast.forecastday[0].day.mintemp_c,
                                        maxtemp_c: parsedData.forecast.forecastday[0].day.maxtemp_c,
                                        mintemp_f: parsedData.forecast.forecastday[0].day.mintemp_f,
                                        maxtemp_f: parsedData.forecast.forecastday[0].day.maxtemp_f
                                    }
                                }
                            ]
                        }
                    };
                    localStorage.setItem("weatherParsedData", JSON.stringify(filteredData));
                    localStorage.setItem("weatherParsedTime", Date.now());
                    localStorage.setItem("weatherParsedLocation", currentUserLocation);
                    localStorage.setItem("weatherParsedLang", currentLanguage);
                }
            }
            UpdateWeather();
            function UpdateWeather() {
                const conditionText = parsedData.current.condition.text;
                const tempCelsius = Math.round(parsedData.current.temp_c);
                const tempFahrenheit = Math.round(parsedData.current.temp_f);
                const humidity = parsedData.current.humidity;
                const feelsLikeCelsius = parsedData.current.feelslike_c;
                const feelsLikeFahrenheit = parsedData.current.feelslike_f;
                document.getElementById("conditionText").textContent = conditionText;
                const localizedHumidity = localizeNumbers(humidity.toString(), currentLanguage);
                const localizedTempCelsius = localizeNumbers(tempCelsius.toString(), currentLanguage);
                const localizedFeelsLikeCelsius = localizeNumbers(feelsLikeCelsius.toString(), currentLanguage);
                const localizedTempFahrenheit = localizeNumbers(tempFahrenheit.toString(), currentLanguage);
                const localizedFeelsLikeFahrenheit = localizeNumbers(feelsLikeFahrenheit.toString(), currentLanguage);
                const minTempC = parsedData.forecast.forecastday[0].day.mintemp_c;
                const maxTempC = parsedData.forecast.forecastday[0].day.maxtemp_c;
                const minTempF = parsedData.forecast.forecastday[0].day.mintemp_f;
                const maxTempF = parsedData.forecast.forecastday[0].day.maxtemp_f;
                const localizedMinTempC = localizeNumbers(minTempC.toString(), currentLanguage);
                const localizedMaxTempC = localizeNumbers(maxTempC.toString(), currentLanguage);
                const localizedMinTempF = localizeNumbers(minTempF.toString(), currentLanguage);
                const localizedMaxTempF = localizeNumbers(maxTempF.toString(), currentLanguage);
                const humidityLabel = translations[currentLanguage]?.humidityLevel || translations["en"].humidityLevel;
                document.getElementById("humidityLevel").textContent = isRTL
                    ? `${humidityLabel} %${localizedHumidity}`
                    : `${humidityLabel} ${localizedHumidity} %`;
                const fahrenheitCheckbox = document.getElementById("fahrenheitCheckbox");
                const updateTemperatureDisplay = () => {
                    const tempElement = document.getElementById("temp");
                    const feelsLikeElement = document.getElementById("feelsLike");
                    const feelsLikeLabel = translations[currentLanguage]?.feelsLike || translations["en"].feelsLike;
                    const langWithSpaceBeforeDegree = ["cs"];
                    const rangeSeparator = {
                        cs: "až",
                        default: "~"
                    };
                    const separator = rangeSeparator[currentLanguage] || rangeSeparator.default;
                    if (fahrenheitCheckbox.checked) {
                        tempElement.textContent = localizedTempFahrenheit;
                        const tempUnitF = document.createElement("span");
                        tempUnitF.className = "tempUnit";
                        tempUnitF.textContent = "°F";
                        tempElement.appendChild(tempUnitF);
                        const feelsLikeFUnit = langWithSpaceBeforeDegree.includes(currentLanguage) ? " °F" : "°F";
                        if (isMinMaxEnabled) {
                            feelsLikeElement.textContent = `${localizedMinTempF} ${separator} ${localizedMaxTempF}${feelsLikeFUnit}`;
                        }
                        else {
                            feelsLikeElement.textContent = isRTL
                                ? `${localizedFeelsLikeFahrenheit}${feelsLikeFUnit} ${feelsLikeLabel}`
                                : `${feelsLikeLabel} ${localizedFeelsLikeFahrenheit}${feelsLikeFUnit}`;
                        }
                    } else {
                        tempElement.textContent = localizedTempCelsius;
                        const tempUnitC = document.createElement("span");
                        tempUnitC.className = "tempUnit";
                        tempUnitC.textContent = "°C";
                        tempElement.appendChild(tempUnitC);
                        const feelsLikeCUnit = langWithSpaceBeforeDegree.includes(currentLanguage) ? " °C" : "°C";
                        if (isMinMaxEnabled) {
                            feelsLikeElement.textContent = `${localizedMinTempC} ${separator} ${localizedMaxTempC}${feelsLikeCUnit}`;
                        }
                        else {
                            feelsLikeElement.textContent = isRTL
                                ? `${localizedFeelsLikeCelsius}${feelsLikeCUnit} ${feelsLikeLabel}`
                                : `${feelsLikeLabel} ${localizedFeelsLikeCelsius}${feelsLikeCUnit}`;
                        }
                    }
                };
                updateTemperatureDisplay();
                const newWIcon = parsedData.current.condition.icon;
                const weatherIcon = newWIcon.replace("//cdn.weatherapi.com/weather/64x64/", "https://cdn.weatherapi.com/weather/128x128/");
                const wIcon = document.getElementById("wIcon");
                wIcon.onerror = () => {
                    wIcon.src = './svgs/defaultWeather.svg';
                };
                wIcon.src = weatherIcon;
                const humidityMinWidth = {
                    idn: "47%",
                    hu: "48%",
                    de: "51%",
                    ta: "46%",
                    en: "42%"
                };
                const slider = document.getElementById("slider");
                slider.style.minWidth = humidityMinWidth[currentLanguage] || humidityMinWidth["en"];
                if (humidity > 40) {
                    slider.style.width = `calc(${humidity}% - 60px)`;
                }
                let city = parsedData.location.name;
                let maxLength = 10;
                let isLocationHidden = localStorage.getItem("locationHidden") === "true";
                const locationTile = document.querySelector(".tiles.location");
                const locationIcon = locationTile.querySelector(".location-icon");
                const locationText = document.getElementById("location");
                function updateLocationText() {
                    if (isLocationHidden) {
                        locationText.textContent = translations[currentLanguage]?.location || translations.en.location;
                    } else {
                        const limitedText = city.length > maxLength ? city.slice(0, maxLength) + "..." : city;
                        locationText.textContent = limitedText;
                    }
                }
                updateLocationText();
                function getToggleIcon() {
                    return isLocationHidden ? "./svgs/location-show.svg" : "./svgs/location-hide.svg";
                }
                let hoverTimeout;
                locationTile.addEventListener("mouseenter", () => {
                    hoverTimeout = setTimeout(() => {
                        locationIcon.src = getToggleIcon();
                    }, 120);
                });
                locationTile.addEventListener("mouseleave", () => {
                    clearTimeout(hoverTimeout);
                    locationIcon.src = "./svgs/location.svg";
                });
                locationIcon.addEventListener("click", (e) => {
                    e.stopPropagation();
                    isLocationHidden = !isLocationHidden;
                    localStorage.setItem("locationHidden", isLocationHidden);
                    updateLocationText();
                    if (locationTile.matches(":hover")) {
                        locationIcon.src = getToggleIcon();
                    }
                });
            }
        } catch (error) {
            console.error("Ошибка при получении данных о погоде:", error);
        }
    }
}
const hideWeatherCard = document.getElementById("hideWeatherCard");
const fahrenheitCheckbox = document.getElementById("fahrenheitCheckbox");
const minMaxTempCheckbox = document.getElementById("minMaxTempCheckbox");

hideWeatherCard.addEventListener("change", function () {
    saveCheckboxState("hideWeatherCardState", hideWeatherCard);
});
fahrenheitCheckbox.addEventListener("change", function () {
    saveCheckboxState("fahrenheitCheckboxState", fahrenheitCheckbox);
});
loadCheckboxState("hideWeatherCardState", hideWeatherCard);
loadCheckboxState("fahrenheitCheckboxState", fahrenheitCheckbox);

if (minMaxTempCheckbox) {
    minMaxTempCheckbox.addEventListener("change", () => {
        const isChecked = minMaxTempCheckbox.checked;
        localStorage.setItem("minMaxTempEnabled", isChecked);
        location.reload();
    });
}
