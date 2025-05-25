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
          <div className="navbar-nav-items">
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
          </div>
          <div className="navbar-user-section">
            {profile.display_name && (
              <span className="navbar-username">
                {`Hello, ${profile.display_name}`}
              </span>
            )}
            <button onClick={onLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
