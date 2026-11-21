const opacityBar = document.querySelector(".opacityBar");
const slider = document.getElementById("opacitySlider");
const opacityLevel = document.getElementById("opacityLevel");
const opacityBarControl = document.getElementById("opacityBarControl");
function setSliderPosition(percentage) {
    const posPercent = Math.min(100, Math.max(20, percentage));
    slider.style.width = `${posPercent}%`;
    opacityLevel.textContent = `${localizeNumbers(Math.round(posPercent).toString(), currentLanguage)}%`;
    document.documentElement.style.setProperty("--transparency", `${Math.round(posPercent)}%`);
    localStorage.setItem("bgOpacity", posPercent);
}
function handleDrag(e) {
    const clientX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
    const rect = opacityBar.getBoundingClientRect();
    let newPos = isRTL
        ? rect.right - clientX
        : clientX - rect.left;
    newPos = Math.max(0, Math.min(rect.width, newPos));
    const percentage = +((newPos / rect.width) * 100).toFixed(2);
    setSliderPosition(percentage);
}
function startDrag() {
    const onMove = e => handleDrag(e);
    const onEnd = () => {
        ["mousemove", "touchmove"].forEach(evt => document.removeEventListener(evt, onMove));
        ["mouseup", "touchend"].forEach(evt => document.removeEventListener(evt, onEnd));
    };
    ["mousemove", "touchmove"].forEach(evt => document.addEventListener(evt, onMove));
    ["mouseup", "touchend"].forEach(evt => document.addEventListener(evt, onEnd));
}
["mousedown", "touchstart"].forEach(evt => {
    opacityBar.addEventListener(evt, e => {
        e.preventDefault();
        handleDrag(e);
        startDrag();
    }, { passive: false });
});
const savedOpacity = localStorage.getItem("bgOpacity") || 90;
setSliderPosition(Number(savedOpacity));