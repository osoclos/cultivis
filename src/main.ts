import { mount } from "svelte";
import "./style.css";

import App from "./App.svelte";

// enable console on phones/tablets in dev mode when needed.
const ENABLE_MOBILE_CONSOLE_PARAM_NAME: string = "enable-mobile-console";
import.meta.env.DEV && new URLSearchParams(window.location.search).has(ENABLE_MOBILE_CONSOLE_PARAM_NAME) && eruda.default.init();

export default mount(App, { target: document.getElementById("app")! });
