import { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import api from '../utils/api';

function Register() {
  const [step, setStep] = useState(1); // 1: register, 2: verify
  const [formData, setFormData] = useState({
    fio: '',
    password: '',
    telegram_username: '',
    code: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        fio: formData.fio,
        password: formData.password,
        telegram_username: formData.telegram_username,
      });
      setUserId(response.data.userId);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/verify', {
        telegram_username: formData.telegram_username,
        code: formData.code,
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect based on role
      if (response.data.user.role === 'Admin') {
        window.location.href = '/admin';
      } else if (response.data.user.role === 'Master') {
        window.location.href = '/master';
      } else {
        window.location.href = '/catalog';
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка верификации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center">
      <Card style={{ width: '400px', marginTop: '50px' }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">
            {step === 1 ? 'Регистрация' : 'Верификация'}
          </Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {step === 1 ? (
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
                <Form.Label>Telegram Username (без @)</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.telegram_username}
                  onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value })}
                  placeholder="username"
                  required
                />
                <Form.Text className="text-muted">
                  Код верификации будет отправлен в Telegram
                </Form.Text>
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                {loading ? 'Отправка...' : 'Зарегистрироваться'}
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleVerify}>
              <Alert variant="info">
                Код верификации отправлен в Telegram на @{formData.telegram_username}
              </Alert>
              <Form.Group className="mb-3">
                <Form.Label>Код верификации</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                {loading ? 'Проверка...' : 'Подтвердить'}
              </Button>
              <Button
                variant="outline-secondary"
                className="w-100 mt-2"
                onClick={() => setStep(1)}
              >
                Назад
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default Register;
