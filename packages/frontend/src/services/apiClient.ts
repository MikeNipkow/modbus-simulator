import axios from "axios";

const defaultBase = "http://127.0.0.1:3000/api/v1";
const runtimeBase = (window as any).__API_BASE_URL__ as string | undefined;

export default axios.create({
  baseURL: runtimeBase && runtimeBase.length ? runtimeBase : defaultBase,
});
