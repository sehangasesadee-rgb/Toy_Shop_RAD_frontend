import  {  useEffect } from 'react';
import './App.css';

import { BrowserRouter, Routes, Route , useLocation } from 'react-router-dom';

import Navbar from './Navbar';
import Hero from './Hero';
import Benefits from './Benefits';
import FlashSale from './FlashSale';
import AgeRange from './AgeRange';
import DealsSection from './DealsSection';
import TrendingItems from './TrendingItems';
import Footer from "./Footer";



import ReturnRefund from './pages/ReturnRefund';
import SecurePayment from './pages/SecurePayment';
import QualitySupport from './pages/QualitySupport';
// import DailyOffers from './pages/DailyOffers';
import Products from './Products';
import PopularBrands from './PopularBrands';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';
import MyAccount from './pages/MyAccount';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import Favorites from "./pages/Favorites";
import SeasonalOffers from "./pages/SeasonalOffers";
import SeasonDetails from './pages/SeasonDetails';
import AdminReturns from "./pages/AdminReturns";
import AdminPayments from './pages/AdminPayments';


function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollToTrending) {
      const timer = setTimeout(() => {
        document.getElementById("trending")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <>
      <Navbar />
      <Hero />
      <Benefits />
      <FlashSale />
      <AgeRange />
      <DealsSection />
      <TrendingItems />
      <PopularBrands />
      <Footer />
    </>
  );
}
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/returns" element={<ReturnRefund />} />
        <Route path="/payment" element={<SecurePayment />} />
        <Route path="/support" element={<QualitySupport />} />
        {/* <Route path="/offers" element={<DailyOffers />} /> */}
        <Route path='/products' element={<Products/>} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/product" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/login" element={<Login />} />
        <Route path='/register' element={<Register/>}/>
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/my-account" element={<MyAccount />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/admin/seasons" element={<SeasonalOffers />} />
        <Route path="/season/:id" element={<SeasonDetails />} />
        <Route path="/admin/returns" element={<AdminReturns />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        



      </Routes>
    </BrowserRouter>
  );
}

export default App;
