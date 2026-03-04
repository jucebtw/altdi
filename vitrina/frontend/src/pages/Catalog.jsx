import { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../utils/api';

function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [sort, setSort] = useState('priority_desc');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [category, setCategory] = useState('');
  const [material, setMaterial] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [sort, priceMin, priceMax, category, material, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (sort) params.append('sort', sort);
      if (priceMin) params.append('price_min', priceMin);
      if (priceMax) params.append('price_max', priceMax);
      if (category) params.append('category', category);
      if (material) params.append('material', material);
      if (search) params.append('search', search);

      const response = await api.get(`/catalog/products?${params}`);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки каталога');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSort('priority_desc');
    setPriceMin('');
    setPriceMax('');
    setCategory('');
    setMaterial('');
    setSearch('');
  };

  // Get unique categories and materials
  const categories = [...new Set(products.map(p => p.category))];
  const materials = [...new Set(products.map(p => p.material))];

  return (
    <div>
      <h2 className="mb-4">Каталог товаров</h2>

      <div className="filter-section">
        <Row>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Поиск</Form.Label>
              <Form.Control
                type="text"
                placeholder="Название или описание"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Сортировка</Form.Label>
              <Form.Select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="priority_desc">По приоритету</option>
                <option value="price_asc">Цена: по возрастанию</option>
                <option value="price_desc">Цена: по убыванию</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Цена от</Form.Label>
              <Form.Control
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Цена до</Form.Label>
              <Form.Control
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Категория</Form.Label>
              <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Все</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Материал</Form.Label>
              <Form.Select value={material} onChange={(e) => setMaterial(e.target.value)}>
                <option value="">Все</option>
                {materials.map(mat => (
                  <option key={mat} value={mat}>{mat}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Button variant="outline-secondary" onClick={handleReset} className="mt-3">
          Сбросить фильтры
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <p>Загрузка...</p>
        </div>
      ) : products.length === 0 ? (
        <Alert variant="info">Товары не найдены</Alert>
      ) : (
        <div className="catalog-grid">
          {products.map(product => (
            <Card
              key={product.id}
              className="shelf-card"
              style={{
                '--size-boost': product.sizeBoost || 0,
                width: `calc(200px + ${product.sizeBoost || 0} * 50px)`,
              }}
            >
              {product.images && product.images.length > 0 && (
                <Card.Img
                  variant="top"
                  src={`http://localhost:3000${product.images[0]}`}
                  alt={product.title}
                />
              )}
              <Card.Body>
                <Card.Title>{product.title}</Card.Title>
                <Card.Text>{product.description.substring(0, 100)}...</Card.Text>
                <div className="card-price">{product.price} ₽</div>
                <div className="card-master">Мастер: {product.master?.fio}</div>
                <Button
                  as={Link}
                  to={`/product/${product.id}`}
                  variant="primary"
                  className="mt-3"
                >
                  Подробнее
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Catalog;
