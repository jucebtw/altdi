import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const AddProductButton = ({ variant = 'success', size = 'lg', className = '', style = {} }) => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Link to="/master">
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        style={{ fontSize: '18px', padding: '12px 24px', ...style }}
      >
        ➕ Добавить товар
      </Button>
    </Link>
  );
};

export default AddProductButton;
