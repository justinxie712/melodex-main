import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./styles.scss";

function Navbar() {
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
    <nav className="navbar">
      <div className="navbar-title">Melodex</div>
      {token && (
        <div className="navbar-links">
          <NavLink
            to="/profile"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Profile
          </NavLink>
          <NavLink
            to="/compare"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Compare
          </NavLink>
          <span className="navbar-username">
            {profile ? `Hello, ${profile.display_name}` : "Loading..."}
          </span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
