import axios from "axios";

const getApiBaseUrl = () => {
    const configuredUrl = process.env.NEXT_PUBLIC_API_URL;

    if (typeof configuredUrl === "string" && configuredUrl.trim()) {
        return configuredUrl.trim().replace(/\/$/, "");
    }

    return "http://localhost:5000";
};

export const BASEURL = getApiBaseUrl();

export const clientServer = axios.create({
    baseURL: BASEURL,
});