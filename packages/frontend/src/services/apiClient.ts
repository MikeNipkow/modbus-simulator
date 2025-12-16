import axios from "axios";

const runtimeBase = (window as any).__API_BASE_URL__ as string | undefined;

// Fallback: use the same host the user accesses the frontend from, but force port 3000
const loc = window.location;
const defaultBase = `http://${loc.hostname}:3000/api/v1`;

export default axios.create({
  baseURL: runtimeBase && runtimeBase.length ? runtimeBase : defaultBase,
});
