// Create an Axios instance
// Set the base URL for the API
// Add an interceptor to include the access token in the request headers if it exists
// Export the Axios instance for use in other parts of the application
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  // Send/receive the backend-managed HttpOnly refresh_token cookie.
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    // If an access token exists in localStorage, add it to the Authorization header of the request
    //If not , the request will be sent without an Authorization header, which may result in a 401 Unauthorized response from the server if the endpoint requires authentication.
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration and unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (status === 401 || code === "token_not_valid") {
      // Keep a one-time message for Login after the expired token redirect.
      if (code === "token_not_valid") {
        sessionStorage.setItem(
          "authRedirectMessage",
          "Your session has expired. Please login again."
        );
      }

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
