#!/bin/bash
# Скрипт для обновления frontend файлов на сервере
# Запускать на сервере: bash update-frontend-server.sh

set -e

FRONTEND_DIR="/var/www/vitrina/frontend"

echo "🔄 Обновление frontend файлов..."

# Обновляем Navbar.jsx
cat > "$FRONTEND_DIR/src/components/Navbar.jsx" << 'EOF'
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
EOF

# Обновляем Home.jsx
cat > "$FRONTEND_DIR/src/pages/Home.jsx" << 'EOF'
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useAuth } from '../utils/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <Container>
      <Row className="mt-5">
        <Col>
          <div className="hero-section text-center">
            <h1 className="display-4 mb-4">🏔️ Витрина мастеров Алтая</h1>
            <p className="lead mb-4">
              Уникальные изделия ручной работы от талантливых мастеров Алтайского края
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link to="/catalog">
                <Button variant="primary" size="lg">
                  Перейти в каталог
                </Button>
              </Link>
              {user ? (
                <Link to="/master">
                  <Button variant="success" size="lg" style={{ fontSize: '18px', padding: '12px 24px' }}>
                    ➕ Добавить товар
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button variant="outline-success" size="lg">
                    Стать мастером
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Col>
      </Row>
      <Row className="mt-5">
        <Col md={4}>
          <div className="feature-card text-center p-4">
            <h3>🎨 Уникальные изделия</h3>
            <p>Каждое изделие создано вручную с любовью и вниманием к деталям</p>
          </div>
        </Col>
        <Col md={4}>
          <div className="feature-card text-center p-4">
            <h3>🌲 Натуральные материалы</h3>
            <p>Используем только экологически чистые материалы Алтайского края</p>
          </div>
        </Col>
        <Col md={4}>
          <div className="feature-card text-center p-4">
            <h3>👨‍🎨 Мастера</h3>
            <p>Работаем с проверенными мастерами с многолетним опытом</p>
          </div>
        </Col>
      </Row>
      {!user && (
        <Row className="mt-4">
          <Col>
            <Alert variant="info" className="text-center">
              <strong>Хотите добавить свои товары?</strong>
              <br />
              Зарегистрируйтесь и напишите боту{' '}
              <a href="https://t.me/altdiverf_bot" target="_blank" rel="noopener noreferrer">
                @altdiverf_bot
              </a>{' '}
              команду <strong>/start</strong> для получения кода верификации
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Home;
EOF

# Обновляем Catalog.jsx
cat > "$FRONTEND_DIR/src/pages/Catalog.jsx" << 'EOF'
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import api from '../utils/api';

const Catalog = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sort: 'priority_desc',
    price_min: '',
    price_max: '',
    category: '',
    material: '',
    search: '',
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const [productsRes, categoriesRes, materialsRes] = await Promise.all([
        api.get(`/catalog/products?${params}`),
        api.get('/catalog/categories'),
        api.get('/catalog/materials'),
      ]);

      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setMaterials(materialsRes.data);
    } catch (error) {
      console.error('Ошибка загрузки каталога:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <Container className="mt-4">
      {user && (
        <Row className="mb-4">
          <Col xs={12}>
            <Link to="/master">
              <Button variant="success" size="lg" className="w-100" style={{ fontSize: '18px', padding: '12px' }}>
                ➕ Добавить товар
              </Button>
            </Link>
          </Col>
        </Row>
      )}
      <Row>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Header>Фильтры</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Поиск</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Название товара..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Сортировка</Form.Label>
                <Form.Select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  <option value="priority_desc">По популярности</option>
                  <option value="price_asc">Цена: по возрастанию</option>
                  <option value="price_desc">Цена: по убыванию</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Цена от</Form.Label>
                <Form.Control
                  type="number"
                  value={filters.price_min}
                  onChange={(e) => handleFilterChange('price_min', e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Цена до</Form.Label>
                <Form.Control
                  type="number"
                  value={filters.price_max}
                  onChange={(e) => handleFilterChange('price_max', e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Категория</Form.Label>
                <Form.Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">Все категории</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Материал</Form.Label>
                <Form.Select
                  value={filters.material}
                  onChange={(e) => handleFilterChange('material', e.target.value)}
                >
                  <option value="">Все материалы</option>
                  {materials.map((mat) => (
                    <option key={mat} value={mat}>
                      {mat}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          {loading ? (
            <div className="text-center">Загрузка...</div>
          ) : products.length === 0 ? (
            <div className="text-center">Товары не найдены</div>
          ) : (
            <Row>
              {products.map((product) => (
                <Col key={product.id} md={6} lg={4} className="mb-4">
                  <Card
                    className="shelf-card h-100"
                    style={{
                      '--size-boost': product.sizeBoost,
                    }}
                  >
                    {product.images && product.images.length > 0 && (
                      <Card.Img
                        variant="top"
                        src={product.images[0]}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    )}
                    <Card.Body>
                      <Card.Title>{product.title}</Card.Title>
                      <Card.Text className="text-muted">
                        {product.description.substring(0, 100)}...
                      </Card.Text>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="h5 mb-0">{product.price} ₽</span>
                        <Link to={`/product/${product.id}`}>
                          <Button variant="primary" size="sm">
                            Подробнее
                          </Button>
                        </Link>
                      </div>
                      <small className="text-muted d-block mt-2">
                        Мастер: {product.master?.fio}
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Catalog;
EOF

# Обновляем Register.jsx
cat > "$FRONTEND_DIR/src/pages/Register.jsx" << 'EOF'
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import api from '../utils/api';

const Register = () => {
  const [step, setStep] = useState(1); // 1 - регистрация, 2 - верификация
  const [formData, setFormData] = useState({
    fio: '',
    password: '',
    telegram_username: '',
  });
  const [verifyData, setVerifyData] = useState({ code: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      setUserId(response.data.user_id);
      setStep(2);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Ошибка регистрации';
      console.error('Ошибка регистрации:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/verify', {
        telegram_username: formData.telegram_username,
        code: verifyData.code,
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка верификации');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card>
              <Card.Header>
                <h3>Регистрация</h3>
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Alert variant="warning" className="mb-4">
                  <strong>⚠️ ВАЖНО!</strong> Перед регистрацией обязательно напишите боту{' '}
                  <a href="https://t.me/altdiverf_bot" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold' }}>
                    @altdiverf_bot
                  </a>{' '}
                  команду <strong>/start</strong>
                  <br />
                  <small>Иначе код верификации не будет отправлен и вы не сможете завершить регистрацию!</small>
                </Alert>
                <Form onSubmit={handleRegister}>
                  <Form.Group className="mb-3">
                    <Form.Label>ФИО</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.fio}
                      onChange={(e) => setFormData({ ...formData, fio: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Пароль</Form.Label>
                    <Form.Control
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Telegram username (без @)</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.telegram_username}
                      onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value })}
                      placeholder="username"
                      required
                    />
                    <Form.Text className="text-muted">
                      Код верификации будет отправлен в Telegram боту @altdiverf_bot
                    </Form.Text>
                  </Form.Group>
                  <Button variant="primary" type="submit" disabled={loading} className="w-100">
                    {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                  </Button>
                </Form>
                <div className="mt-3 text-center">
                  <Link to="/login">Уже есть аккаунт? Войти</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h3>Верификация</h3>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <Alert variant="info">
                <strong>Код верификации отправлен в Telegram</strong>
                <br />
                Проверьте сообщения от бота{' '}
                <a href="https://t.me/altdiverf_bot" target="_blank" rel="noopener noreferrer">
                  @altdiverf_bot
                </a>{' '}
                на аккаунте @{formData.telegram_username}
                <br />
                <small className="text-muted">
                  Если код не пришел, убедитесь, что вы написали боту /start перед регистрацией
                </small>
              </Alert>
              <Form onSubmit={handleVerify}>
                <Form.Group className="mb-3">
                  <Form.Label>Код верификации</Form.Label>
                  <Form.Control
                    type="text"
                    value={verifyData.code}
                    onChange={(e) => setVerifyData({ code: e.target.value })}
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={loading} className="w-100">
                  {loading ? 'Проверка...' : 'Подтвердить'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
EOF

echo "✅ Файлы обновлены"
echo "🔨 Пересборка frontend..."

cd "$FRONTEND_DIR"
npm run build

echo "🔄 Перезагрузка Nginx..."
sudo systemctl reload nginx

echo "✅ Готово! Обновите страницу в браузере (Ctrl+Shift+R)"
EOF
