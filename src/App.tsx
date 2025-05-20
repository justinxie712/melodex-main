// src/App.tsx
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import "./App.scss";

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
