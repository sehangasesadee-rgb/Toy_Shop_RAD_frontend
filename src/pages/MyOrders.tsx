import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../App.css";


interface OrderItem {
  productId: string | {
    _id: string;
    image: string;
  };
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalPrice: number;
  orderStatus: string;
  createdAt: string;
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyOrders = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(
          'http://localhost:5000/api/orders/my-orders',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load orders');
        }

        setOrders(data.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Something went wrong'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [navigate]);

  if (loading) {
    return <div className="my-orders-message">Loading your orders...</div>;
  }

  if (error) {
    return <div className="my-orders-message">{error}</div>;
  }

  return (
    <div className="my-orders-page">
      <div className="my-orders-container">
        <h1>My Orders 🧸</h1>
        <p className="my-orders-subtitle">
          Your little treasures, all in one place!
        </p>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <h2>No orders yet!</h2>
            <p>Start shopping and find something lovely.</p>
            <button onClick={() => navigate('/')}>Continue Shopping</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div className="order-card" key={order._id}>
                <div className="order-card-header">
                  <div>
                    <h3>Order #{order._id.slice(-6)}</h3>
                    <p>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className={`order-status ${order.orderStatus.toLowerCase()}`}>
                    {order.orderStatus}
                  </span>
                </div>

                <div className="order-items">
                  {order.items.map((item, index) => {
                    const productImage =
                    item.image ||
                    (item.productId && typeof item.productId === 'object'
                      ? item.productId.image
                      : '');
  
  
    
    

                    return (
                      <div className="order-item" key={index}>
                        <div className="order-item-details">
                          {productImage && (
                            <img src={`http://localhost:5173${productImage}`} alt={item.name} className="my-order-product-image"/>
                          )}

                          <div>
                            <span>{item.name}</span>
                            <p>Quantity: {item.quantity}</p>
                          </div>
                        </div>

                        <span>
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="order-total">
                  <strong>Total</strong>
                  <strong>Rs. {order.totalPrice.toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;