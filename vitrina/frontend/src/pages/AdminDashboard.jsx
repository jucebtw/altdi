import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tabs, Tab, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import api from '../utils/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    material: '',
    priorityLevel: 0,
    sizeBoost: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || user.role !== 'Admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, usersRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/admin/users'),
      ]);
      setProducts(productsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      material: product.material,
      priorityLevel: product.priorityLevel,
      sizeBoost: product.sizeBoost,
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Удалить товар?')) return;

    try {
      await api.delete(`/admin/products/${id}`);
      fetchData();
    } catch (err) {
      alert('Ошибка удаления товара');
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Удалить пользователя?')) return;

    try {
      await api.delete(`/admin/users/${id}`);
      fetchData();
    } catch (err) {
      alert('Ошибка удаления пользователя');
      console.error(err);
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await api.put(`/admin/products/${editingProduct.id}`, formData);
      setShowProductModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка сохранения товара');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-5">Загрузка...</div>;
  }

  return (
    <div>
      <h2 className="mb-4">Админ-панель</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Tabs defaultActiveKey="products" className="mb-4">
        <Tab eventKey="products" title="Товары">
          <Card className="dashboard-card">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Мастер</th>
                  <th>Цена</th>
                  <th>Приоритет</th>
                  <th>Размер</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.title}</td>
                    <td>{product.master?.fio}</td>
                    <td>{product.price} ₽</td>
                    <td>{product.priorityLevel}</td>
                    <td>{product.sizeBoost}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                        className="me-2"
                      >
                        Редактировать
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Удалить
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Tab>

        <Tab eventKey="users" title="Пользователи">
          <Card className="dashboard-card">
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
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.fio}</td>
                    <td>{user.role}</td>
                    <td>@{user.telegramId}</td>
                    <td>{user.verified ? '✓' : '✗'}</td>
                    <td>{user._count?.products || 0}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.id === JSON.parse(localStorage.getItem('user') || '{}').id}
                      >
                        Удалить
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Tab>
      </Tabs>

      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Редактировать товар</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitProduct}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Название</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Цена (₽)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Категория</Form.Label>
              <Form.Control
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Материал</Form.Label>
              <Form.Control
                type="text"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Приоритет</Form.Label>
              <Form.Control
                type="number"
                value={formData.priorityLevel}
                onChange={(e) => setFormData({ ...formData, priorityLevel: parseInt(e.target.value) })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Размер (boost)</Form.Label>
              <Form.Control
                type="number"
                value={formData.sizeBoost}
                onChange={(e) => setFormData({ ...formData, sizeBoost: parseInt(e.target.value) })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowProductModal(false)}>
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              Сохранить
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminDashboard;
