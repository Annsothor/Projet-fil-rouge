const toggle = document.getElementById("btnDalt");
const css = document.getElementById("css");

toggle.addEventListener("click", () => {
    if (css.getAttribute("href") === "pages/accueil/accueil.css") {
        css.setAttribute("href", "pages/accueil/accueilDalt.css");
    } else {
        css.setAttribute("href", "pages/accueil/accueil.css");
    }
});

