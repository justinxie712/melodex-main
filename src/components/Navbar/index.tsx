import { NavLink, useNavigate } from "react-router-dom";
import "./styles.scss";
import type { NavbarProps } from "../../types";
import logoIcon from "../../assets/favicon.png";
import { useMediaQuery } from "react-responsive";

function Navbar({ title, profile, onLogout, isLoggedIn }: NavbarProps) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });

  const handleClick = () => {
    navigate("/profile");
  };

  return (
    <nav className="navbar">
      <div
        onClick={isLoggedIn ? handleClick : undefined}
        className={`navbar-title ${isLoggedIn ? "navbar-clickable" : ""}`}
      >
        <img src={logoIcon} alt="Melodex Icon" className="melodex-icon" />
        {!isMobile && <span className="melodex-title">{title}</span>}
      </div>
      {isLoggedIn && profile?.display_name && (
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
            <span className="navbar-username">
              {`Hello, ${profile.display_name}`}
            </span>
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
