async function loadThemeCss(darkMode: boolean, disabled: boolean) {
    return new Promise<void>((resolve, reject) => {
        const link = document.createElement("link");
        link.id = `prism-vs-${darkMode ? "dark" : "light"}`;
        link.type = "text/css";
        link.rel = "stylesheet";
        link.disabled = disabled;
        link.onload = () => resolve();
        link.href = `/css/${link.id}.css`;
        document.head.appendChild(link);
    });
}

async function enableThemeCss(darkMode: boolean) {
    // retrieve the element
    const element = document.getElementById(
        `prism-vs-${darkMode ? "dark" : "light"}`
    );

    if (!element) {
        await loadThemeCss(darkMode, false);
    } else {
        element.removeAttribute("disabled");
    }
}

async function disableThemeCss(darkMode: boolean) {
    // retrieve the element
    const element = document.getElementById(
        `prism-vs-${darkMode ? "dark" : "light"}`
    );

    if (!element) {
        await loadThemeCss(darkMode, true);
    } else {
        element.setAttribute("disabled", "");
    }
}

export function selectCodeEditorTheme(darkMode: boolean) {
    // enable the theme
    enableThemeCss(darkMode);
    disableThemeCss(!darkMode);
}
