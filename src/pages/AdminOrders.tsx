
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../App.css";

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  userId?: {
    fullName: string;
    email: string;
    phone: string;
  } | string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalPrice: number;
  orderStatus: string;
  createdAt: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const navigate = useNavigate();

  const statuses = [
    'PENDING',
    'CONFIRMED',
    'DELIVERED',
    'CANCELLED',
  ];

  useEffect(() => {
    const fetchAllOrders = async () => {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user') || 'null');

      if (!token) {
        navigate('/login');
        return;
      }

      if (user?.role !== 'ADMIN') {
        navigate('/');
        return;
      }

      try {
        const response = await fetch(
          'http://localhost:5000/api/orders/all',
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

    fetchAllOrders();
  }, [navigate]);

  const handleStatusChange = async (
    orderId: string,
    orderStatus: string
  ) => {
    const token = localStorage.getItem('authToken');

    try {
      setUpdatingId(orderId);

      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Status update failed');
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId
            ? { ...order, orderStatus: data.data.orderStatus }
            : order
        )
      );
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Something went wrong'
      );
    } finally {
      setUpdatingId('');
    }
  };

  if (loading) {
    return (
      <div className="admin-orders-message">
        <span className="admin-loading-icon">🧸</span>
        <p>Loading your little orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-orders-message">
        {error}
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-container">

        <div className="admin-page-heading">
          <div>
            <span className="admin-eyebrow">TOOTIETOYS • ADMIN PANEL</span>
            <h1>Order Management <span>♡</span></h1>
            <p className="admin-orders-subtitle">
              Manage all customer orders in one happy place!
            </p>
          </div>

          <div className="admin-heading-decoration">🎀</div>
        </div>

        <div className="admin-dashboard-actions">
          <button type="button"onClick={() => navigate("/admin/products")}>
            🧸 Manage Products →
          </button>

          <button type="button"onClick={() => navigate("/admin/seasons")}>
            🎉 Season Management →
          </button>
        </div>

    

        <div className="admin-orders-summary">

          <div className="admin-summary-card total-card">
            <div className="summary-icon">📦</div>
            <div>
              <h3>Total Orders</h3>
              <p>{orders.length}</p>
            </div>
          </div>

          <div className="admin-summary-card pending-card">
            <div className="summary-icon">⏳</div>
            <div>
              <h3>Pending Orders</h3>
              <p>{orders.filter(order => order.orderStatus === 'PENDING').length}</p>
            </div>
          </div>

          <div className="admin-summary-card confirmed-card">
            <div className="summary-icon">✅</div>
            <div>
              <h3>Confirmed Orders</h3>
              <p>{orders.filter(order => order.orderStatus === 'CONFIRMED').length}</p>
            </div>
          </div>

          <div className="admin-summary-card delivered-card">
            <div className="summary-icon">🚚</div>
            <div>
              <h3>Delivered Orders</h3>
              <p>{orders.filter(order => order.orderStatus === 'DELIVERED').length}</p>
            </div>
          </div>

          <div className="admin-summary-card cancelled-card">
            <div className="summary-icon">❌</div>
            <div>
              <h3>Cancelled Orders</h3>
              <p>{orders.filter(order => order.orderStatus === 'CANCELLED').length}</p>
            </div>
          </div>

        </div>

    

        <div className="admin-orders-section-title">
          <div>
            <h2>Recent Orders <span>♡</span></h2>
            <p>All your customer orders in one place</p>
          </div>
          <span className="admin-order-count">{orders.length} Orders</span>
        </div>

        {orders.length === 0 ? (

          <div className="admin-empty-orders">
            <div>🧸</div>
            <h2>No orders yet!</h2>
            <p>Customer orders will appear here.</p>
          </div>

        ) : (

          <div className="admin-orders-list">

            {orders.map((order) => (

              <div className="admin-order-card" key={order._id}>

                <div className="admin-order-header">

                  <div className="admin-order-heading-left">
                    <div className="admin-order-bag">🛍️</div>
                    <div>
                      <h3>Order #{order._id.slice(-6)}</h3>
                      <p>
                        📅 {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <span className={`order-status ${order.orderStatus.toLowerCase()}`}>
                    {order.orderStatus}
                  </span>

                </div>

                <div className="admin-order-content">

            

                  <div className="admin-customer-details">
                    <h4>👤 Customer Details</h4>

                    <p>👤 <strong>{order.customerName}</strong></p>
                    <p>📞 {order.phone}</p>
                    <p>📍 {order.address}</p>

                    {typeof order.userId === 'object' &&
                      order.userId && (
                        <p className="admin-customer-email">
                          ✉️ {order.userId.email}
                        </p>
                      )}
                  </div>

            
                  <div className="admin-order-items">
                    <h4>📦 Order Items</h4>

                    {order.items.map((item, index) => (
                      <div
                        className="admin-order-item"
                        key={`${item.productId}-${index}`}
                      >
                        <div className="admin-item-info">
                          {/* <img src={`http://localhost:5173${item.image}`} /> */}
                          <img src={`http://localhost:5173${item.image || (item.productId as any)?.image || ""}`}alt={item.name} className="admin-product-image"/>

                          <div>
                            <p>{item.name}</p>
                            <small>Quantity: {item.quantity}</small>
                          </div>
                        </div>

                        <span className="admin-item-price">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

            
                  <div className="admin-order-actions">

                    <div className="admin-order-total">
                      <span>Total Amount</span>
                      <strong>
                        Rs. {order.totalPrice.toLocaleString()}
                      </strong>
                    </div>

                    <div className="admin-status-control">
                      <label>Update Status</label>

                      <div className="admin-status-row">
                        <select
                          value={order.orderStatus}
                          disabled={updatingId === order._id}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        {updatingId === order._id && (
                          <span className="admin-updating">Updating...</span>
                        )}
                      </div>
                    </div>

                  </div>

                </div>

                <div className="admin-card-bottom">
                  Made with love for little smiles <span>♡</span>
                </div>

              </div>

            ))}

          </div>

        )}

      </div>



      <footer className="admin-orders-footer">
        <div className="admin-footer-message">
          <span>✨</span>
          Thank you for being a part of TootieToys!
          <span>♡</span>
        </div>

        <div className="admin-footer-teddy">
          <img src="/teddy-hero.png" alt="Cute TootieToys teddy bear" />
          {/* <img src="/admin-teddy.png" alt="Cute TootieToys teddy bear" /> */}
        </div>

        <div className="admin-footer-gift">🎁</div>
      </footer>

    </div>
  );
};

export default AdminOrders;
