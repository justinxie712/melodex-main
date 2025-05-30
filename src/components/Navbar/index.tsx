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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div
        onClick={isLoggedIn ? handleClick : undefined}
        onKeyDown={isLoggedIn ? handleKeyDown : undefined}
        className={`navbar-title ${isLoggedIn ? "navbar-clickable" : ""}`}
        role={isLoggedIn ? "button" : undefined}
        tabIndex={isLoggedIn ? 0 : undefined}
        aria-label={isLoggedIn ? "Go to profile page" : undefined}
      >
        <img src={logoIcon} alt="Melodex logo" className="melodex-icon" />
        {!isMobile && <span className="melodex-title">{title}</span>}
      </div>
      {isLoggedIn && profile?.display_name && (
        <div className="navbar-links">
          <ul
            className="navbar-nav-items"
            role="menubar"
            aria-label="Navigation menu"
          >
            <li role="none">
              <NavLink
                to="/profile"
                className={({ isActive }) => 
                  `focus-visible ${isActive ? "active" : ""}`
                }
                role="menuitem"
              >
                Profile
              </NavLink>
            </li>
            <li role="none">
              <NavLink
                to="/compare"
                className={({ isActive }) => 
                  `focus-visible ${isActive ? "active" : ""}`
                }
                role="menuitem"
              >
                Compare
              </NavLink>
            </li>
          </ul>
          <div
            className="navbar-user-section"
            role="region"
            aria-label="User account"
          >
            <span
              className="navbar-username"
              aria-label={`Logged in as ${profile.display_name}`}
            >
              {`Hello, ${profile.display_name}`}
            </span>
            <button
              onClick={onLogout}
              className="logout-button focus-visible"
              aria-label="Log out of your account"
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
export default Navbar;
