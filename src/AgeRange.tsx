
import { useNavigate } from 'react-router-dom';
import './App.css';

const ageRanges = [
  {
    image: '/0-2.png',
    label: '0–2 Years',
    description: 'Soft toys for little ones',
    ageRange: '0-2',
  },
  {
    image: '/3-5.png',
    label: '3–5 Years',
    description: 'Cute toys and teddy bears',
    ageRange: '3-5',
  },
  {
    image: '/6-8.png',
    label: '6–8 Years',
    description: 'Fun toys for curious kids',
    ageRange: '6-8',
  },
  {
    image: '/6-12.png',
    label: '9–12 Years',
    description: 'Creative play and building',
    ageRange: '9-12',
  },
  {
    image: '/12+.png',
    label: '13+ Years',
    description: 'Gifts for growing teens',
    ageRange: '13+',
  },
];

function AgeRange() {
  const navigate = useNavigate();

  return (
    <section className="age-range-section" id="age-range">
      <div className="age-range-container">

        <div className="age-range-heading">
          <span className="age-range-tag">SHOP BY AGE</span>

          <h2>
            Find the Perfect Toy for <span>Every Age!</span>
          </h2>

          <p>
            Discover toys made for every stage of childhood.
          </p>
        </div>

        <div className="age-range-grid">
          {ageRanges.map((age) => (
            <div
              className="age-range-card"
              key={age.label}
              onClick={() =>
                navigate(`/products?ageRange=${encodeURIComponent(age.ageRange)}`)
              }
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/products?ageRange=${encodeURIComponent(age.ageRange)}`);
                }
              }}
            >
              <div className="age-range-image-wrapper">
                <img
                  className="age-range-image"
                  src={age.image}
                  alt={`Toys for ${age.label}`}
                />
              </div>

              <div className="age-range-card-content">
                <h3>{age.label}</h3>
                <p>{age.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default AgeRange;
