const currentLanguage = localStorage.getItem("selectedLanguage") || "ru";
const isRTL = rtlLanguages.includes(currentLanguage);
const menuButton = document.getElementById("menuButton");
const menuBar = document.getElementById("menuBar");
const menuCont = document.getElementById("menuCont");
const optCont = document.getElementById("optCont");
const overviewPage = document.getElementById("overviewPage");
const shortcutEditPage = document.getElementById("shortcutEditPage");
const shortcutEditButton = document.getElementById("shortcutEditButton");
const backButton = document.getElementById("backButton");
function pageReset() {
    optCont.scrollTop = 0;
    overviewPage.style.transform = "translateX(0)";
    overviewPage.style.opacity = "1";
    overviewPage.style.display = "block";
    shortcutEditPage.style.transform = "translateX(120%)";
    shortcutEditPage.style.opacity = "0";
    shortcutEditPage.style.display = "none";
}
const closeMenuBar = () => {
    requestAnimationFrame(() => {
        optCont.style.opacity = "0"
        optCont.style.transform = "translateX(100%)"
    });
    setTimeout(() => {
        requestAnimationFrame(() => {
            menuBar.style.opacity = "0"
            menuCont.style.transform = "translateX(100%)"
        });
    }, 14);
    setTimeout(() => {
        menuCont.style.scrollBehavior = "auto";
        menuCont.scrollTop = 0;
        requestAnimationFrame(() => {
            menuCont.style.scrollBehavior = "smooth";
        });
        menuBar.style.display = "none";
    }, 555);
}
const openMenuBar = () => {
    setTimeout(() => {
        menuBar.style.display = "block";
        pageReset();
    });
    setTimeout(() => {
        requestAnimationFrame(() => {
            menuBar.style.opacity = "1"
            menuCont.style.transform = "translateX(0px)"
        });
    }, 7);
    setTimeout(() => {
        requestAnimationFrame(() => {
            optCont.style.opacity = "1"
            optCont.style.transform = "translateX(0px)"
        });
    }, 11);
}
menuButton.addEventListener("click", () => {
    if (menuBar.style.display === "none" || menuBar.style.display === "") {
        openMenuBar();
    } else {
        closeMenuBar();
    }
});
menuBar.addEventListener("click", (event) => {
    if (event.target === menuBar) {
        closeMenuBar()
    }
});
document.getElementById("menuCloseButton").onclick = () => {
    closeMenuBar()
}
shortcutEditButton.onclick = () => {
    setTimeout(() => {
        shortcutEditPage.style.display = "block"
    });
    requestAnimationFrame(() => {
        overviewPage.style.transform = "translateX(-120%)"
        overviewPage.style.opacity = "0"
    });
    setTimeout(() => {
        requestAnimationFrame(() => {
            shortcutEditPage.style.transform = "translateX(0)"
            shortcutEditPage.style.opacity = "1"
        });
    }, 50);
    setTimeout(() => {
        overviewPage.style.display = "none";
    }, 650);
}
backButton.onclick = () => {
    setTimeout(() => {
        overviewPage.style.display = "block"
    });
    requestAnimationFrame(() => {
        shortcutEditPage.style.transform = "translateX(120%)";
        shortcutEditPage.style.opacity = "0";
    });
    setTimeout(() => {
        requestAnimationFrame(() => {
            overviewPage.style.transform = "translateX(0)";
            overviewPage.style.opacity = "1";
        });
    }, 50);
    setTimeout(() => {
        shortcutEditPage.style.display = "none";
    }, 650);
}
