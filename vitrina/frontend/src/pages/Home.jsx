import { Container, Jumbotron, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <Container>
      <div className="text-center py-5">
        <h1 className="display-4 mb-4">🏔️ Витрина Алтая</h1>
        <p className="lead mb-4">
          Уникальные изделия ручной работы от мастеров Алтайского края
        </p>
        <p className="mb-4">
          Откройте для себя красоту традиционных ремесел и современных авторских работ
        </p>
        <Button as={Link} to="/catalog" variant="primary" size="lg">
          Перейти в каталог
        </Button>
      </div>
    </Container>
  );
}

export default Home;
