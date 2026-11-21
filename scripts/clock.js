let analogIntervalId = null;
let digitalIntervalId = null;
let lastDateString = null;
let lastDigitalDateString = null;
const leftDiv = document.getElementById("leftDiv");
const rightDiv = document.getElementById("rightDiv");
const hideClockCheckbox = document.getElementById("hideClock");
const elementsToHide = document.querySelectorAll(".clockRegion");
function toggleHideState(isHidden) {
    elementsToHide.forEach(element => {
        if (isHidden) {
            element.style.transform = "translateY(-20px)";
            setTimeout(() => {
                element.style.display = "none";
            }, 250);
        } else {
            element.style.display = "flex";
            setTimeout(() => {
                element.style.transform = "translateY(0)";
            }, 50);
        }
    });
}
function applyClockState(isHidden) {
    leftDiv.classList.toggle("clock-hidden-left", isHidden);
    rightDiv.classList.toggle("clock-shifted-right", isHidden);
    rightDiv.classList.toggle("clock-shifted-right-wide", !isHidden);
    rightDiv.classList.toggle("clock-padding-adjusted", isHidden);
}
function handleClockVisibility() {
    if (window.matchMedia("(max-width: 500px)").matches) {
        initializeClock();
        elementsToHide.forEach(element => {
            element.style.display = "flex";
            element.style.transform = "translateY(0)";
        });
        rightDiv.classList.remove("clock-padding-adjusted");
    }
    else {
        const isClockHidden = localStorage.getItem("hideClockVisible") === "true";
        hideClockCheckbox.checked = isClockHidden;
        applyClockState(isClockHidden);
        toggleHideState(isClockHidden);
        if (!isClockHidden) {
            initializeClock();
        }
        hideClockCheckbox.addEventListener("change", function () {
            const isChecked = hideClockCheckbox.checked;
            localStorage.setItem("hideClockVisible", isChecked);
            applyClockState(isChecked);
            toggleHideState(isChecked);
            if (!isChecked) {
                initializeClock();
            }
        });
    }
}
handleClockVisibility();
window.addEventListener("resize", handleClockVisibility);
async function initializeClock() {
    if (analogIntervalId) {
        clearInterval(analogIntervalId);
        analogIntervalId = null;
    }
    if (digitalIntervalId) {
        clearInterval(digitalIntervalId);
        digitalIntervalId = null;
    }
    let clocktype;
    let cumulativeSecondRotation = 0;
    let cumulativeMinuteRotation = 0;
    let cumulativeHourRotation = 0;
    let isFirstLoad = true;
    var currentTime = new Date();
    var initialSeconds = currentTime.getSeconds();
    var initialMinutes = currentTime.getMinutes();
    var initialHours = currentTime.getHours();
    cumulativeSecondRotation = initialSeconds * 6;
    cumulativeMinuteRotation = initialMinutes * 6 + (initialSeconds / 10);
    cumulativeHourRotation = (30 * initialHours + initialMinutes / 2);
    document.getElementById("second").style.transform = `rotate(${cumulativeSecondRotation}deg)`;
    document.getElementById("minute").style.transform = `rotate(${cumulativeMinuteRotation}deg)`;
    document.getElementById("hour").style.transform = `rotate(${cumulativeHourRotation}deg)`;
    function initializeClockType() {
        const savedClockType = localStorage.getItem("clocktype");
        clocktype = savedClockType ? savedClockType : "analog";
        localStorage.setItem("clocktype", clocktype);
    }
    initializeClockType();
    function updateDate() {
        if (clocktype === "analog") {
            var currentTime = new Date();
            var dayOfWeek = currentTime.getDay();
            var dayOfMonth = currentTime.getDate();
            var month = currentTime.getMonth();
            const currentLanguage = getLanguageStatus("selectedLanguage") || "ru";
            var dayName = translations[currentLanguage]?.days?.[dayOfWeek] ?? translations["ru"].days[dayOfWeek];
            var monthName = translations[currentLanguage]?.months?.[month] ?? translations["ru"].months[month];
            var localizedDayOfMonth = localizeNumbers(dayOfMonth.toString(), currentLanguage);
            const dateDisplay = {
                bn: `${dayName}, ${localizedDayOfMonth} ${monthName}`,
                mr: `${dayName}, ${localizedDayOfMonth} ${monthName}`,
                np: `${dayName}, ${localizedDayOfMonth} ${monthName}`,
                zh: `${month + 1}月${dayOfMonth}日，${dayName}`,
                zh_TW: `${month + 1}月${dayOfMonth}日，${dayName}`,
                cs: `${dayName}, ${dayOfMonth}. ${monthName}`,
                hi: `${dayName}, ${dayOfMonth} ${monthName}`,
                it: `${dayName.substring(0, 3)} ${dayOfMonth} ${monthName.substring(0, 3)}`,
                ja: `${monthName} ${dayOfMonth}日(${dayName.substring(0, 1)})`,
                ko: `${monthName} ${dayOfMonth}일(${dayName.substring(0, 1)})`,
                pl: `${dayName}, ${dayOfMonth}. ${monthName}`,
                pt: `${dayName.substring(0, 3)}, ${dayOfMonth} ${monthName.substring(0, 3)}`,
                ru: `${dayName}, ${dayOfMonth} ${monthName}`,
                es: `${dayName.substring(0, 3)}, ${dayOfMonth} ${monthName.substring(0, 3)}`,
                tr: `${dayName.substring(0, 3)}, ${dayOfMonth} ${monthName}`,
                uz: `${dayName.substring(0, 3)}, ${dayOfMonth}-${monthName}`,
                vi: `${dayName}, ngày ${dayOfMonth} ${monthName}`,
                idn: `${dayName}, ${dayOfMonth} ${monthName}`,
                fr: `${dayName.substring(0, 3)}, ${dayOfMonth} ${monthName.substring(0, 3)}`,
                az: `${dayName.substring(0, 3)}, ${dayOfMonth} ${monthName.substring(0, 3)}`,
                sl: `${dayName}, ${dayOfMonth}. ${monthName.substring(0, 3)}.`,
                hu: `${monthName.substring(0, 3)} ${dayOfMonth}, ${dayName}`,
                ta: `${monthName} ${localizedDayOfMonth}, ${dayName}`,
                ur: `${dayName}، ${dayOfMonth} ${monthName}`,
                de: `${dayName}, ${dayOfMonth}. ${monthName}`,
                fa: `${dayName}، ${localizedDayOfMonth} ${monthName}`,
                ar_SA: `${dayName}, ${localizedDayOfMonth} ${monthName}`,
                el: `${dayName.substring(0, 3)} ${dayOfMonth} ${monthName}`,
                th: `วัน${dayName}ที่ ${dayOfMonth} ${monthName}`,
                uk: `${dayName}, ${dayOfMonth} ${monthName.substring(0, 4)}`,
                default: `${dayName.substring(0, 3)}, ${monthName.substring(0, 3)} ${dayOfMonth}`
            };
            const newDateString = dateDisplay[currentLanguage] || dateDisplay.default;
            if (newDateString !== lastDateString) {
                document.getElementById("date").innerText = newDateString;
                lastDateString = newDateString;
            }
        }
    }
    function updateHandRotation(handId, newRotation, currentTotal, isResetCondition) {
        let newTotal;
        const diff = newRotation - (currentTotal % 360);
        if (isFirstLoad) {
            newTotal = newRotation;
        } else if (isResetCondition && Math.abs(diff + 360) < Math.abs(diff)) {
            newTotal = newRotation + (Math.floor(currentTotal / 360) + 1) * 360;
        } else {
            newTotal = newRotation + Math.floor(currentTotal / 360) * 360;
        }
        document.getElementById(handId).style.transition = "transform 1s ease";
        document.getElementById(handId).style.transform = `rotate(${newTotal}deg)`;
        return newTotal;
    }
    function updateanalogclock() {
        var currentTime = new Date();
        var currentSeconds = currentTime.getSeconds();
        var currentMinutes = currentTime.getMinutes();
        var currentHours = currentTime.getHours();
        let newSecondRotation = currentSeconds * 6;
        let newMinuteRotation = currentMinutes * 6 + (currentSeconds / 10);
        let newHourRotation = (30 * (currentHours % 12) + currentMinutes / 2);
        const secondReset = currentSeconds === 0;
        const minuteReset = currentMinutes === 0 && currentSeconds === 0;
        const hourReset = currentHours % 12 === 0 && currentMinutes === 0 && currentSeconds === 0;
        cumulativeSecondRotation = updateHandRotation("second", newSecondRotation, cumulativeSecondRotation, secondReset);
        cumulativeMinuteRotation = updateHandRotation("minute", newMinuteRotation, cumulativeMinuteRotation, minuteReset);
        cumulativeHourRotation = updateHandRotation("hour", newHourRotation, cumulativeHourRotation, hourReset);
        isFirstLoad = false;
        updateDate();
    }
    function updatedigiClock() {
        const hourformatstored = localStorage.getItem("hourformat");
        let hourformat = hourformatstored === "true";
        const now = new Date();
        const dayOfWeek = now.getDay();
        const dayOfMonth = now.getDate();
        const currentLanguage = getLanguageStatus("selectedLanguage") || "ru";
        let dayName = translations[currentLanguage]?.days?.[dayOfWeek] ?? translations["ru"].days[dayOfWeek];
        const localizedDayOfMonth = localizeNumbers(dayOfMonth.toString(), currentLanguage);
        const dateFormats = {
            az: `${dayName} ${dayOfMonth}`,
            bn: `${dayName}, ${localizedDayOfMonth}`,
            mr: `${dayName}, ${localizedDayOfMonth}`,
            np: `${dayName}, ${localizedDayOfMonth}`,
            zh: `${dayOfMonth}日${dayName}`,
            zh_TW: `${dayOfMonth}日${dayName}`,
            cs: `${dayName}, ${dayOfMonth}.`,
            hi: `${dayName}, ${dayOfMonth}`,
            ja: `${dayOfMonth}日 (${dayName[0]})`,
            ko: `${dayOfMonth}일 (${dayName[0]})`,
            pl: `${dayName}, ${dayOfMonth}`,
            pt: `${dayName}, ${dayOfMonth}`,
            ru: `${dayOfMonth} ${dayName}`,
            ta: `${localizedDayOfMonth} ${dayName.substring(0, 2)}`,
            vi: `${dayOfMonth} ${dayName}`,
            idn: `${dayOfMonth} ${dayName}`,
            fr: `${dayName} ${dayOfMonth}`,
            hu: `${dayName} ${dayOfMonth}`,
            ur: `${dayName}، ${dayOfMonth}`,
            de: `${dayOfMonth}. ${dayName}`,
            fa: `${dayName} ${localizedDayOfMonth}`,
            ar_SA: `${dayName}, ${localizedDayOfMonth}`,
            el: `${dayName.substring(0, 3)} ${dayOfMonth}`,
            th: `${dayName}ที่ ${dayOfMonth}`,
            uk: `${dayOfMonth} ${dayName}`,
            default: `${dayOfMonth} ${dayName.substring(0, 3)}`,
        };
        const newDigitalDateString = dateFormats[currentLanguage] || dateFormats.default;
        if (newDigitalDateString !== lastDigitalDateString) {
            document.getElementById("digidate").textContent = newDigitalDateString;
            lastDigitalDateString = newDigitalDateString;
        }
        let timeString;
        let period = "";
        const specialLanguages = ["tr", "zh", "zh_TW", "ja", "ko", "hu"];
        const localizedLanguages = Object.keys(numberMappings);
        const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: hourformat };
        const locale = specialLanguages.includes(currentLanguage) || localizedLanguages.includes(currentLanguage) ? "en-US" : currentLanguage;
        timeString = now.toLocaleTimeString(locale, timeOptions);
        if (hourformat) {
            [timeString, period] = timeString.split(" ");
        }
        let [hours, minutes] = timeString.split(":");
        if (hourformat) {
            hours = parseInt(hours, 10).toString();
        }
        const localizedHours = localizeNumbers(hours, currentLanguage);
        const localizedMinutes = localizeNumbers(minutes, currentLanguage);
        document.getElementById("digihours").textContent = localizedHours;
        document.getElementById("digicolon").textContent = ":";
        document.getElementById("digiminutes").textContent = localizedMinutes;
        if (isFirefoxAll)
            document.getElementById("digicolon").classList.add("no-blink");
        if (hourformat && (specialLanguages.includes(currentLanguage) || localizedLanguages.includes(currentLanguage))) {
            let realHours = new Date().getHours();
            if (currentLanguage === "fa") {
                period = realHours < 12 ? "ق.ظ" : "ب.ظ";
            } else if (currentLanguage === "ar_SA") {
                period = realHours < 12 ? "ص" : "م";
            } else if (currentLanguage === "ta") {
                if (realHours < 2) {
                    period = "யாமம்"
                } else if (realHours < 6) {
                    period = "வைகறை"
                } else if (realHours < 10) {
                    period = "காலை"
                } else if (realHours < 14) {
                    period = "நண்பகல்"
                } else if (realHours < 18) {
                    period = "எற்பாடு"
                } else if (realHours < 22) {
                    period = "மாலை"
                } else {
                    period = "யாமம்"
                }
            } else {
                period = realHours < 12 ? "AM" : "PM";
            }
        }
        if (hourformat) {
            document.getElementById("amPm").textContent = period;
        } else {
            document.getElementById("amPm").textContent = "";
        }
        document.getElementById("date").style.display = "none";
    }
    function startAnalogClock() {
        if (!analogIntervalId) {
            analogIntervalId = setInterval(updateanalogclock, 500);
        }
    }
    function stopAnalogClock() {
        if (analogIntervalId) {
            clearInterval(analogIntervalId);
            analogIntervalId = null;
        }
    }
    function startDigitalClock() {
        if (!digitalIntervalId) {
            digitalIntervalId = setInterval(updatedigiClock, 1000);
        }
    }
    function stopDigitalClock() {
        if (digitalIntervalId) {
            clearInterval(digitalIntervalId);
            digitalIntervalId = null;
        }
    }
    displayClock();
    updateanalogclock();
    if (clocktype === "digital") {
        updatedigiClock();
        startDigitalClock();
        stopAnalogClock();
    } else if (clocktype === "analog") {
        if (document.visibilityState === "visible") {
            startAnalogClock();
            updateDate();
        }
        stopDigitalClock();
    }
    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") {
            if (clocktype === "analog") {
                startAnalogClock();
                updateDate();
            } else if (clocktype === "digital") {
                startDigitalClock();
            }
        } else {
            stopAnalogClock();
            stopDigitalClock();
        }
    });
    function displayClock() {
        const analogClock = document.getElementById("analogClock");
        const digitalClock = document.getElementById("digitalClock");
        if (clocktype === "analog") {
            analogClock.style.display = "block";
            digitalClock.style.display = "none";
            document.getElementById("date").style.display = "block";
        } else if (clocktype === "digital") {
            digitalClock.style.display = "block";
            analogClock.style.display = "none";
            document.getElementById("date").style.display = "none";
        }
    }
    function resetDateDisplay() {
        const dateElement = document.getElementById("date");
        dateElement.style.display = "block";
        dateElement.innerText = "";
        lastDateString = null;
        updateDate();
    }
    document.addEventListener("DOMContentLoaded", function () {
        const timeformatField = document.getElementById("timeformatField");
        const hourcheckbox = document.getElementById("12hourcheckbox");
        const digitalCheckbox = document.getElementById("digitalCheckbox");
        digitalCheckbox.addEventListener("change", function () {
            saveCheckboxState("digitalCheckboxState", digitalCheckbox);
            if (digitalCheckbox.checked) {
                timeformatField.classList.remove("inactive");
                localStorage.setItem("clocktype", "digital");
                clocktype = localStorage.getItem("clocktype");
                displayClock();
                stopAnalogClock();
                startDigitalClock();
                updatedigiClock();
                saveActiveStatus("timeformatField", "active");
            } else {
                timeformatField.classList.add("inactive");
                localStorage.setItem("clocktype", "analog");
                clocktype = localStorage.getItem("clocktype");
                stopDigitalClock();
                startAnalogClock();
                updateanalogclock();
                displayClock();
                resetDateDisplay();
                saveActiveStatus("timeformatField", "inactive");
            }
        });
        hourcheckbox.addEventListener("change", function () {
            saveCheckboxState("hourcheckboxState", hourcheckbox);
            if (hourcheckbox.checked) {
                localStorage.setItem("hourformat", "true");
            } else {
                localStorage.setItem("hourformat", "false");
            }
        });
        loadCheckboxState("digitalCheckboxState", digitalCheckbox);
        loadCheckboxState("hourcheckboxState", hourcheckbox);
        loadActiveStatus("timeformatField", timeformatField);
    });
}
