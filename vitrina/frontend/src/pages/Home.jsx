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
      </Row>
    </Container>
  );
};

export default Home;
