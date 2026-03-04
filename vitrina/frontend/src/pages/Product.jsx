import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Alert, Button, Row, Col } from 'react-bootstrap';
import api from '../utils/api';

function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/catalog/products/${id}`);
      setProduct(response.data);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки товара');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (level) => {
    try {
      const response = await api.post('/payment/create', {
        productId: parseInt(id),
        level,
      });
      window.location.href = response.data.paymentUrl;
    } catch (err) {
      alert('Ошибка создания платежа');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-5">Загрузка...</div>;
  }

  if (error || !product) {
    return <Alert variant="danger">{error || 'Товар не найден'}</Alert>;
  }

  const images = product.images || [];

  return (
    <div className="product-detail">
      <Button as={Link} to="/catalog" variant="outline-secondary" className="mb-4">
        ← Назад к каталогу
      </Button>

      <Row>
        <Col md={6}>
          {images.length > 0 && (
            <div>
              <img
                src={`http://localhost:3000${images[0]}`}
                alt={product.title}
                className="img-fluid mb-3"
                style={{ maxWidth: '100%', borderRadius: '8px' }}
              />
              {images.length > 1 && (
                <div className="product-images">
                  {images.slice(1).map((img, idx) => (
                    <img
                      key={idx}
                      src={`http://localhost:3000${img}`}
                      alt={`${product.title} ${idx + 2}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </Col>
        <Col md={6}>
          <h2>{product.title}</h2>
          <p className="text-muted">Мастер: {product.master?.fio}</p>
          <p className="lead">{product.description}</p>
          <div className="mb-3">
            <strong>Категория:</strong> {product.category}
          </div>
          <div className="mb-3">
            <strong>Материал:</strong> {product.material}
          </div>
          <div className="mb-4">
            <h3 className="text-primary">{product.price} ₽</h3>
          </div>

          {(user?.role === 'Master' && user?.id === product.masterId) || user?.role === 'Admin' ? (
            <div className="mt-4">
              <h5>Продвижение товара</h5>
              <p className="text-muted">
                Уровень 1: +5 к приоритету, +1 к размеру (1000 ₽)
              </p>
              <Button
                variant="success"
                onClick={() => handlePromote(1)}
                className="me-2"
              >
                Продвинуть (1000 ₽)
              </Button>
            </div>
          ) : null}
        </Col>
      </Row>
    </div>
  );
}

export default Product;
