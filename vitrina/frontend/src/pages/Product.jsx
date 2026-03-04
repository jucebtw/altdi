import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import api from '../utils/api';
import { normalizeImagePath } from '../utils/api';

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await api.get(`/catalog/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Ошибка загрузки товара:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="mt-5">
        <h2>Товар не найден</h2>
        <Link to="/catalog">Вернуться в каталог</Link>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col md={6}>
          {product.images && product.images.length > 0 && (
            <div>
              <img
                src={normalizeImagePath(product.images[0])}
                alt={product.title}
                className="img-fluid rounded"
              />
              {product.images.length > 1 && (
                <Row className="mt-3">
                  {product.images.slice(1).map((img, idx) => (
                    <Col key={idx} xs={4}>
                      <img
                        src={normalizeImagePath(img)}
                        alt={`${product.title} ${idx + 2}`}
                        className="img-fluid rounded"
                      />
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          )}
        </Col>
        <Col md={6}>
          <h1>{product.title}</h1>
          <p className="text-muted">Мастер: {product.master?.fio}</p>
          <h3 className="text-primary mb-4">{product.price} ₽</h3>
          <div className="mb-4">
            <strong>Категория:</strong> {product.category}
            <br />
            <strong>Материал:</strong> {product.material}
          </div>
          <p>{product.description}</p>
          {product.master?.telegramId ? (
            <div className="mt-4">
              <h5>Контакты мастера:</h5>
              <p className="mb-2">
                <strong>Telegram:</strong>{' '}
                <a 
                  href={`https://t.me/${product.master.telegramId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-decoration-none"
                >
                  @{product.master.telegramId}
                </a>
              </p>
              <Button 
                variant="primary" 
                size="lg"
                as="a"
                href={`https://t.me/${product.master.telegramId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 Написать в Telegram
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-muted">Контактные данные мастера не указаны</p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Product;
