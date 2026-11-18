
import react ,{ useState , useEffect} from 'react';
import { useNavigate , useLocation} from 'react-router-dom';


const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(
  !!localStorage.getItem('authToken')
);

const [userRole, setUserRole] = useState("");
const [search, setSearch] = useState("");

const updateUserStatus = () => {
  setIsLoggedIn(!!localStorage.getItem("authToken"));

  const savedUser = localStorage.getItem("user");

  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      setUserRole((user.role || user.data?.role || "").toUpperCase());
    } catch {
      setUserRole("");
    }
  } else {
    setUserRole("");
  }
};

  useEffect(() => {
    updateUserStatus();
  }, [location.pathname]);
  const handleSearch = (e: React.FormEvent) => {
  e.preventDefault();

  if (search.trim()) {
    navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  }
};

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

    return (
      <header className="navbar">
        <div className="navbar-top">
          <h2 className="logo">
          <img src="/TootieToys_Kawaii_Bear_Logo.png" alt="TootieToys Logo" className="logo-image"/><span>TootieToys</span>
          </h2>
        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search toys..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button type="submit" aria-label="Search">
            ⌕
          </button>
        </form>

        <div className="navbar-actions">
          {isLoggedIn ? (
            <>
            <a href={userRole === "ADMIN" ? "/admin/orders" : "/my-account"}
            onClick={(e) => {
              e.preventDefault();
              if (userRole === "ADMIN") {
                navigate("/admin/orders");
              } else {
                navigate("/my-account");
              }
            }}>
              {userRole === "ADMIN" ? "Admin Dashboard" : "My Account"}
            </a>
  

            <a href="/" onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            >
              Logout
              </a>
    
    </>
    ) : (
      <>
        <a href="/login" onClick={(e) => {
          e.preventDefault();
          navigate('/login');
        }}
      >
        Login
      </a>

      <a href="/register" onClick={(e) => { 
        e.preventDefault();
        navigate('/register');
        }}
      >
        Sign In
      </a>
    </>
  )}

  <a href="/favorites" aria-label="Favorites"onClick={(e) => {
    e.preventDefault();
    navigate("/favorites");
  }}
  >
    ♡
</a>

  <a
    href="#cart"
    aria-label="Shopping Cart"
    onClick={(e) => {
      e.preventDefault();
      navigate('/cart');
    }}
  >
    🛒
  </a>
</div>
      </div>

      <div className="navbar-bottom">
        <nav>
          <a href="#home">Home</a>
          <a href="#categories">Categories</a>
          <a href="#products">Toys</a>
          <a href="#about">About Us</a>
        </nav>

        <button
          className="menu-button"
          onClick={() => setShowMenu(!showMenu)}
          aria-label="Toggle categories menu"
          aria-expanded={showMenu}
        >
          ☰
        </button>

        {showMenu && (
          <div className="category-menu">
            <a href="#soft-toys" onClick={() => setShowMenu(false)}>
              Soft Toys
            </a>
            <a href="#teddy-bears" onClick={() => setShowMenu(false)}>
              Teddy Bears
            </a>
            <a href="#baby-toys" onClick={() => setShowMenu(false)}>
              Baby Toys
            </a>
            <a
              href="#educational-toys"
              onClick={() => setShowMenu(false)}
            >
              Educational Toys
            </a>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
