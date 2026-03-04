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
                      Код верификации будет отправлен в Telegram
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
                Код верификации отправлен в Telegram на @{formData.telegram_username}
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
