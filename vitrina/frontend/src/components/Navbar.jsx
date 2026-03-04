import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Button } from 'react-bootstrap';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <BootstrapNavbar expand="lg" className="navbar">
      <BootstrapNavbar.Brand as={Link} to="/" className="ms-3">
        🏔️ Витрина Алтая
      </BootstrapNavbar.Brand>
      <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
      <BootstrapNavbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/" className="text-white">
            Главная
          </Nav.Link>
          <Nav.Link as={Link} to="/catalog" className="text-white">
            Каталог
          </Nav.Link>
          {user?.role === 'Master' && (
            <Nav.Link as={Link} to="/master" className="text-white">
              Кабинет мастера
            </Nav.Link>
          )}
          {user?.role === 'Admin' && (
            <Nav.Link as={Link} to="/admin" className="text-white">
              Админ-панель
            </Nav.Link>
          )}
        </Nav>
        <Nav className="me-3">
          {token ? (
            <>
              <Nav.Link className="text-white">
                {user?.fio}
              </Nav.Link>
              <Button variant="outline-light" onClick={handleLogout}>
                Выход
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline-light" as={Link} to="/login" className="me-2">
                Вход
              </Button>
              <Button variant="light" as={Link} to="/register">
                Регистрация
              </Button>
            </>
          )}
        </Nav>
      </BootstrapNavbar.Collapse>
    </BootstrapNavbar>
  );
}

export default Navbar;
