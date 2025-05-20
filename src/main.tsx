import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Profile from "./pages/Profile";
import Compare from "./pages/Compare";
import Callback from "./pages/Callback";
import Login from "./components/Login";
import "./index.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Login />} />
        <Route path="profile" element={<Profile />} />
        <Route path="compare" element={<Compare />} />
        <Route path="callback" element={<Callback />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
