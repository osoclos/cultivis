import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
    root: path.join(__dirname, "./generator"),
    resolve: { alias: { "@": path.resolve(__dirname, "../src") } },
});