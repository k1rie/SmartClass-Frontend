import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard,
  Users,
  ScanLine,
  Menu,
  X,
  Sun,
  Moon,
  User,
  LogOut
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/logo.png";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("email") || "Usuario";

  const navigation = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/grupos", label: "Grupos", icon: Users },
    { path: "/scanner", label: "Scanner", icon: ScanLine },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("password");
    navigate("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.navContent}>
          {/* Logo y Título */}
          <div className={styles.logoSection}>
            <Link to="/" className={styles.logoLink}>
              <img src={logo} alt="Logo" className={styles.logo} />
            </Link>
          </div>

          {/* Enlaces de navegación - Escritorio */}
          <div className={styles.desktopNav}>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${styles.navLink} ${
                    isActive(item.path) ? styles.navLinkActive : styles.navLinkInactive
                  }`}
                >
                  <Icon className={styles.navIcon} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className={styles.userControls}>
            {/* Cuenta de usuario y correo */}
            <div className={styles.userInfo}>
              <User className={styles.userIcon} />
              <span className={styles.userEmail}>{userEmail}</span>
            </div>

            {/* Botón de cerrar sesión */}
            <button
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              <LogOut className={styles.logoutIcon} />
              Cerrar sesión
            </button>

            <button
              onClick={toggleTheme}
              className={styles.themeButton}
              aria-label={isDarkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
              title={isDarkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            >
              {isDarkMode ? (
                <Sun className={styles.themeIcon} />
              ) : (
                <Moon className={styles.themeIcon} />
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={styles.mobileMenuButton}
            >
              {isOpen ? (
                <X className={styles.mobileMenuIcon} />
              ) : (
                <Menu className={styles.mobileMenuIcon} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <div
        className={`${styles.mobileMenu} ${isOpen ? "" : styles.mobileMenuHidden}`}
      >
        <div className={styles.mobileMenuContent}>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`${styles.mobileNavLink} ${
                  isActive(item.path) ? styles.mobileNavLinkActive : styles.mobileNavLinkInactive
                }`}
              >
                <Icon className={styles.mobileNavIcon} />
                {item.label}
              </Link>
            );
          })}
          
          {/* Información de usuario en menú móvil */}
          <div className={styles.mobileUserInfo}>
            <User className={styles.mobileUserIcon} />
            <span className={styles.mobileUserEmail}>{userEmail}</span>
          </div>
          
          {/* Botón de cerrar sesión en menú móvil */}
          <button
            onClick={handleLogout}
            className={styles.mobileLogoutButton}
          >
            <LogOut className={styles.mobileLogoutIcon} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 