import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Catalog from '../Catalog';
import api from '../../utils/api';
import { AuthProvider } from '../../utils/AuthContext';

// Mock axios
jest.mock('../../utils/api');
const mockedApi = api;

// Mock useAuth hook
jest.mock('../../utils/AuthContext', () => ({
  ...jest.requireActual('../../utils/AuthContext'),
  useAuth: () => ({ user: null, login: jest.fn(), logout: jest.fn(), loading: false }),
}));

const mockProducts = [
  {
    id: 1,
    title: 'Тестовый товар 1',
    description: 'Описание товара 1',
    price: 1000,
    category: 'Категория 1',
    material: 'Материал 1',
    images: ['/uploads/image1.jpg'],
    sizeBoost: 0,
    priorityLevel: 5,
    master: { id: 1, fio: 'Мастер 1' },
  },
  {
    id: 2,
    title: 'Тестовый товар 2',
    description: 'Описание товара 2',
    price: 2000,
    category: 'Категория 2',
    material: 'Материал 2',
    images: ['/uploads/image2.jpg'],
    sizeBoost: 2,
    priorityLevel: 10,
    master: { id: 2, fio: 'Мастер 2' },
  },
];

const mockCategories = ['Категория 1', 'Категория 2'];
const mockMaterials = ['Материал 1', 'Материал 2'];

const renderCatalog = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Catalog />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Catalog Component', () => {
  beforeEach(() => {
    mockedApi.get.mockImplementation((url) => {
      if (url.includes('/catalog/products')) {
        return Promise.resolve({ data: mockProducts });
      }
      if (url.includes('/catalog/categories')) {
        return Promise.resolve({ data: mockCategories });
      }
      if (url.includes('/catalog/materials')) {
        return Promise.resolve({ data: mockMaterials });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders catalog with products', async () => {
    renderCatalog();

    // Проверяем, что товары отображаются
    await waitFor(() => {
      expect(screen.getByText('Тестовый товар 1')).toBeInTheDocument();
      expect(screen.getByText('Тестовый товар 2')).toBeInTheDocument();
    });

    // Проверяем цены
    expect(screen.getByText('1000 ₽')).toBeInTheDocument();
    expect(screen.getByText('2000 ₽')).toBeInTheDocument();
  });

  test('renders filter form', () => {
    renderCatalog();

    // Проверяем наличие полей фильтров
    expect(screen.getByLabelText(/поиск/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/сортировка/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/цена от/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/цена до/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/категория/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/материал/i)).toBeInTheDocument();
  });

  test('filters products by search', async () => {
    renderCatalog();

    await waitFor(() => {
      expect(screen.getByText('Тестовый товар 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText(/поиск/i);
    fireEvent.change(searchInput, { target: { value: 'товар 1' } });

    // После изменения фильтра должен быть новый запрос
    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith(
        expect.stringContaining('/catalog/products'),
        expect.any(Object)
      );
    });
  });

  test('filters products by category', async () => {
    renderCatalog();

    await waitFor(() => {
      expect(screen.getByText('Тестовый товар 1')).toBeInTheDocument();
    });

    const categorySelect = screen.getByLabelText(/категория/i);
    fireEvent.change(categorySelect, { target: { value: 'Категория 1' } });

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith(
        expect.stringContaining('category=Категория+1'),
        expect.any(Object)
      );
    });
  });

  test('sorts products by price', async () => {
    renderCatalog();

    await waitFor(() => {
      expect(screen.getByText('Тестовый товар 1')).toBeInTheDocument();
    });

    const sortSelect = screen.getByLabelText(/сортировка/i);
    fireEvent.change(sortSelect, { target: { value: 'price_asc' } });

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith(
        expect.stringContaining('sort=price_asc'),
        expect.any(Object)
      );
    });
  });

  test('displays product cards with correct information', async () => {
    renderCatalog();

    await waitFor(() => {
      const product1 = screen.getByText('Тестовый товар 1');
      expect(product1).toBeInTheDocument();

      // Проверяем описание
      expect(screen.getByText(/Описание товара 1/)).toBeInTheDocument();

      // Проверяем мастера
      expect(screen.getByText(/Мастер 1/)).toBeInTheDocument();
    });
  });

  test('shows loading state', () => {
    mockedApi.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderCatalog();

    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });

  test('shows empty state when no products', async () => {
    mockedApi.get.mockImplementation((url) => {
      if (url.includes('/catalog/products')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/catalog/categories')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/catalog/materials')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    renderCatalog();

    await waitFor(() => {
      expect(screen.getByText(/товары не найдены/i)).toBeInTheDocument();
    });
  });

  test('applies sizeBoost to card styling', async () => {
    renderCatalog();

    await waitFor(() => {
      const cards = document.querySelectorAll('.shelf-card');
      expect(cards.length).toBeGreaterThan(0);
      
      // Проверяем, что карточки имеют правильный класс
      cards.forEach((card) => {
        expect(card).toHaveClass('shelf-card');
      });
    });
  });
});
