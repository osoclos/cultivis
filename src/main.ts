import { mount } from "svelte";
import "./style.css";

const ENABLE_MOBILE_CONSOLE_PARAM_NAME: string = "enable-mobile-console";
import.meta.env.DEV && new URLSearchParams(window.location.search).has(ENABLE_MOBILE_CONSOLE_PARAM_NAME) && eruda.default.init();

import App from "./App.svelte";
export default mount(App, { target: document.getElementById("app")! });
