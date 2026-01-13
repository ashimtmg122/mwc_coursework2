import axios from "axios";

const Axios = axios.create({
    baseURL: "/api/",
    headers: {
        Accept: "application/json",
    },
});

Axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
Axios.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            window.location.href = "/";
        }
        if (err.response?.status === 403) {
            // redirect to login page

            toast.error("Unauthorised Access");
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1200);
        }
        return Promise.reject(err);
    }
);

export default Axios;
