import axios from "axios";
import { LANGUAGE_VERSIONS } from "./lecture-constants.js";
import { executePython } from "../runners/python.js";

const API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
  withCredentials: false, // override global default so public API isn't treated as credentialed
  timeout: 15000,
});

export const executeCode = async (language, sourceCode, stdin = "", options = {}) => {
  if (language === "python") {
    return executePython(sourceCode, stdin, options);
  }

  try {
    const response = await API.post("/execute", {
      language,
      version: LANGUAGE_VERSIONS[language],
      files: [{ content: sourceCode }],
      stdin,
    }, { signal: options.signal });
    return response.data;
  } catch (error) {
    if ([401, 403].includes(error.response?.status)) {
      throw new Error(`The ${language} runner is currently unavailable. Please select Python to run code.`);
    }
    throw error;
  }
};
