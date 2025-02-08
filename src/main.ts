import { mount } from "svelte";
import "./style.css";

import App from "./App.svelte";

// enable console on phones/tablets in dev mode when needed.
const ENABLE_MOBILE_CONSOLE_PARAM_NAME: string = "enable-mobile-console";
import.meta.env.DEV && new URLSearchParams(window.location.search).has(ENABLE_MOBILE_CONSOLE_PARAM_NAME) && eruda.default.init();

// for GTM
if (import.meta.env.PROD && window.location.origin === "https://cultivis.netlify.app") {
    const GTM_DATA = {
        "gtm.start": Date.now(),
        event: "gtm.js"
    };

    "dataLayer" in window && Array.isArray(window.dataLayer) ? window.dataLayer.push(GTM_DATA) : Object.assign(window, { dataLayer: [GTM_DATA] });
    
    const script = document.createElement("script");
    script.src = "https://www.googletagmanager.com/gtm.js?id=GTM-KH3PHZVF&l=dataLayer";
    script.async = true;

    document.head.appendChild(script);
}


export default mount(App, { target: document.getElementById("app")! });
