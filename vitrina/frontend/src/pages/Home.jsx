import { Container, Row, Col, Jumbotron } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const Home = () => {
  return (
    <Container>
      <Row className="mt-5">
        <Col>
          <div className="hero-section text-center">
            <h1 className="display-4 mb-4">🏔️ Витрина мастеров Алтая</h1>
            <p className="lead mb-4">
              Уникальные изделия ручной работы от талантливых мастеров Алтайского края
            </p>
            <Link to="/catalog">
              <Button variant="primary" size="lg">
                Перейти в каталог
              </Button>
            </Link>
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
    </Container>
  );
};

export default Home;
