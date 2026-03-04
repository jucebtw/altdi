import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert } from 'react-bootstrap';
import { useAuth } from '../utils/AuthContext';
import api from '../utils/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    if (user && user.role === 'Admin') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [productsRes, usersRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/admin/users'),
      ]);
      setProducts(productsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Удалить пользователя?')) return;

    try {
      await api.delete(`/admin/users/${id}`);
      loadData();
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  if (!user || user.role !== 'Admin') {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Доступ запрещен</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>Админ-панель</h2>
          <Button
            variant={activeTab === 'products' ? 'primary' : 'outline-primary'}
            onClick={() => setActiveTab('products')}
            className="me-2"
          >
            Товары
          </Button>
          <Button
            variant={activeTab === 'users' ? 'primary' : 'outline-primary'}
            onClick={() => setActiveTab('users')}
          >
            Пользователи
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div>Загрузка...</div>
      ) : activeTab === 'products' ? (
        <Row>
          {products.map((product) => (
            <Col key={product.id} md={4} className="mb-4">
              <Card>
                {product.images && product.images.length > 0 && (
                  <Card.Img
                    variant="top"
                    src={product.images[0]}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <Card.Title>{product.title}</Card.Title>
                  <Card.Text>
                    {product.price} ₽ | Мастер: {product.master?.fio}
                  </Card.Text>
                  <Button variant="danger" size="sm">
                    Удалить
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>ФИО</th>
              <th>Роль</th>
              <th>Telegram</th>
              <th>Верифицирован</th>
              <th>Товаров</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.fio}</td>
                <td>{u.role}</td>
                <td>@{u.telegramId}</td>
                <td>{u.verified ? 'Да' : 'Нет'}</td>
                <td>{u._count?.products || 0}</td>
                <td>
                  {u.id !== user.id && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteUser(u.id)}
                    >
                      Удалить
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default AdminDashboard;
