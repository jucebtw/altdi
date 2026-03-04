import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          🏔️ Витрина мастеров Алтая
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Главная</Nav.Link>
            <Nav.Link as={Link} to="/catalog">Каталог</Nav.Link>
          </Nav>
          <Nav>
            {user ? (
              <>
                <Nav.Item className="d-flex align-items-center me-2">
                  <Link to="/master" className="btn btn-success text-white" style={{ borderRadius: '4px', padding: '8px 16px', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none' }}>
                    ➕ Добавить товар
                  </Link>
                </Nav.Item>
                <Nav.Link as={Link} to="/master">
                  Мои товары
                </Nav.Link>
                {user.role === 'Admin' && (
                  <Nav.Link as={Link} to="/admin">
                    Админ-панель
                  </Nav.Link>
                )}
                <Nav.Link onClick={handleLogout}>Выход</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Вход</Nav.Link>
                <Nav.Link as={Link} to="/register">Регистрация</Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
