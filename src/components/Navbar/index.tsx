import { NavLink } from "react-router-dom";
import "./styles.scss";

interface NavbarProps {
  token: string | null;
  title: string;
  profile: { display_name: string } | null;
  onLogout: () => void;
}

function Navbar({ token, title, profile, onLogout }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-title">{title}</div>
      {token && profile?.display_name && (
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
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
