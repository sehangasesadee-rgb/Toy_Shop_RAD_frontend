import { Link } from 'react-router-dom';
import { FaEnvelope, FaWhatsapp, FaHeadset, FaArrowLeft } from 'react-icons/fa';
import '../App.css';

const QualitySupport = () => {
  return (
    <section className="info-page support-page">
      <Link to="/" className="back-home">
        <FaArrowLeft /> Back to Home
      </Link>

      <div className="info-hero">
        <div className="support-icon">
          <FaHeadset />
        </div>

        <h1>We're Here to Help! 💗</h1>
        <p>
          Need a little help with your shopping?
          Our friendly team is always happy to assist you.
        </p>
      </div>

      <div className="support-contact-grid">
        <a
          href="mailto:sehangasesadee@gmail.com"
          className="support-contact-card"
        >
          <FaEnvelope />
          <div>
            <h3>Email Support</h3>
            <p>Send us your questions anytime.</p>
            <span>Contact by Email →</span>
          </div>
        </a>

        <a
          href="https://wa.me/94775731311"
          target="_blank"
          rel="noreferrer"
          className="support-contact-card"
        >
          <FaWhatsapp />
          <div>
            <h3>WhatsApp Support</h3>
            <p>Chat with us for quick assistance.</p>
            <span>Chat on WhatsApp →</span>
          </div>
        </a>
      </div>

      <div className="support-note">
        <h3>Have a question? 💌</h3>
        <p>
          Whether you need help choosing a toy or have a question
          about your order, feel free to contact us.
        </p>
        <p className="support-thanks">
          Thank you for choosing TootieToys! 🧸
        </p>
      </div>
    </section>
  );
};

export default QualitySupport;
