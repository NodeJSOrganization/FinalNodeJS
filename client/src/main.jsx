import "./index.css";
import App from "./App.jsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// React Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
// Theme
// import "./styles/Theme.css";
// Redux
import { Provider } from "react-redux";
import store from "./store"; // Đường dẫn tới file store của bạn
import "react-datepicker/dist/react-datepicker.css";
// Google OAuth
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={clientId}>
          <App />
        </GoogleOAuthProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
