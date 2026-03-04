import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Catalog = () => {
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
