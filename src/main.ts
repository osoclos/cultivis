import { mount } from "svelte";
import "./style.css";

import App from "./App.svelte";

// enable console on phones/tablets in dev mode when needed.
const ENABLE_MOBILE_CONSOLE_PARAM_NAME: string = "enable-mobile-console";
import.meta.env.DEV && new URLSearchParams(window.location.search).has(ENABLE_MOBILE_CONSOLE_PARAM_NAME) && eruda.default.init();

// for analytics
if (import.meta.env.PROD && window.location.origin === "https://cultivis.netlify.app") {
    const GTAG_DATA: any[] = [["js", new Date()], ["config", "G-WL5CJBQ7FH"]];
    "dataLayer" in window && Array.isArray(window.dataLayer) ? window.dataLayer.push(...GTAG_DATA) : Object.assign(window, { dataLayer: GTAG_DATA });
}

export default mount(App, { target: document.getElementById("app")! });
