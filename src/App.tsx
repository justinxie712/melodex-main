import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import "./App.scss";

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ display_name: string } | null>(null);
  const navigate = useNavigate();

  // Fetch profile from Spotify API
  const fetchProfile = (accessToken: string) => {
    fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => setProfile({ display_name: data.display_name }))
      .catch(() => setProfile(null));
  };

  // Load token on mount and when login/logout event fires
  useEffect(() => {
    const loadToken = () => {
      const storedToken = localStorage.getItem("spotify_token");
      if (storedToken) {
        setToken(storedToken);
        fetchProfile(storedToken);
      } else {
        setToken(null);
        setProfile(null);
      }
    };

    loadToken();

    // Listen to custom login/logout event
    const handleAuthEvent = () => loadToken();
    window.addEventListener("spotify-auth-changed", handleAuthEvent);

    return () => {
      window.removeEventListener("spotify-auth-changed", handleAuthEvent);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("spotify_token");
    setToken(null);
    setProfile(null);
    window.dispatchEvent(new Event("spotify-auth-changed"));
    navigate("/");
  };

  return (
    <div className="app-container">
      <Navbar
        token={token}
        profile={profile}
        onLogout={handleLogout}
        title="Melodex"
      />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
