import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Product from './pages/Product';
import Login from './pages/Login';
import Register from './pages/Register';
import MasterDashboard from './pages/MasterDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <>
      <Navbar />
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/master" element={<MasterDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
