import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const API_URL = 'http://localhost:5000/api';
const IMAGE_URL = 'http://localhost:5000';

interface Season {
  _id: string;
  name: string;
  description: string;
  bannerImage: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const getImageUrl = (image?: string) => {
  if (!image || !image.trim()) {
    return '/placeholder.png';
  }

  const value = image.trim().replace(/\\/g, '/');

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  ) {
    return value;
  }

  return `${IMAGE_URL}/${value.replace(/^\/+/, '')}`;
};

const FlashSale: React.FC = () => {
  const navigate = useNavigate();

  const [activeSeasons, setActiveSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActiveSeasons = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_URL}/seasons/active`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || 'Unable to load special seasons.'
          );
        }

        setActiveSeasons(result.data || []);
      } catch (err) {
        console.error('Active Seasons Error:', err);

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load special events.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSeasons();
  }, []);

  const openSeason = (seasonId: string) => {
    navigate(`/season/${seasonId}`);
  };

  return (
    <main className="flash-page">

      <div className="flash-heading">
        <div>
          <span className="flash-eyebrow">
            DON'T MISS OUT
          </span>

          <h1>
            Flash Sale <span>✧</span>
          </h1>
        </div>

       
      </div>

      {loading && (
        <div className="flash-empty">
          <span>🧸</span>
          <h2>Loading Special Events...</h2>
          <p>Please wait a little! ❤️</p>
        </div>
      )}

      {!loading && error && (
        <div className="flash-empty">
          <span>🎁</span>
          <h2>Oops! Something went wrong.</h2>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && activeSeasons.length === 0 && (
        <div className="flash-empty">
          <span>🎀</span>
          <h2>No Special Events Available</h2>
          <p>
            New exciting toy offers are coming soon!
            Please check back again. ❤️
          </p>
        </div>
      )}

      {!loading && !error && activeSeasons.length > 0 && (
        <section className="flash-season-list">

          {activeSeasons.map((season) => (
            <div
              className="flash-season-banner"
              key={season._id}
              onClick={() => openSeason(season._id)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' ||
                  event.key === ' '
                ) {
                  event.preventDefault();
                  openSeason(season._id);
                }
              }}
              aria-label={`Explore ${season.name}`}
            >

              <img
                src={getImageUrl(season.bannerImage)}
                alt={season.name}
                onError={(event) => {
                  event.currentTarget.src = '/placeholder.png';
                }}
              />

              <div className="flash-season-banner-text">

                <span className="flash-season-eyebrow">
                  ✨ TOOTIETOYS SPECIAL EVENT ✨
                </span>

                <h2>{season.name}</h2>

                <p>{season.description}</p>

                <span className="flash-season-explore">
                  Explore Now →
                </span>

              </div>
            </div>
          ))}

        </section>
      )}

    </main>
  );
};

export default FlashSale;
