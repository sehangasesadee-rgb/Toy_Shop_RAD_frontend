
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate , Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";
import "../App.css";

import {
  FaArrowLeft,
  FaArrowRight,
  FaBoxOpen,
  FaCheckCircle,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import type { AppDispatch, RootState } from "../redux/store";
import {
  fetchProfile,
  updateProfile,
} from "../redux/profileSlice";

const MyAccount = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { profile, loading, saving, error } = useSelector(
    (state: RootState) => state.profile
  );

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("authToken")) {
      navigate("/login");
      return;
    }

    dispatch(fetchProfile());
  }, [dispatch, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setPhone(profile.phone);
    }
  }, [profile]);

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (!phone || !isValidPhoneNumber(phone)) {
        setMessage("Please enter a valid phone number for the selected country.");
        return;
    }

    try {
      await dispatch(
        updateProfile({ fullName: fullName.trim(), phone: phone.trim() })
      ).unwrap();

      setMessage("Your account details have been updated successfully.");
    } catch {
      setMessage("");
    }
  };

  if (!localStorage.getItem("authToken")) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="account-loading">
        <div className="account-loader"></div>
        <p>Preparing your account...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="account-page">
        <div className="account-error-screen">
          <h2>We couldn't load your account</h2>
          <p>{error || "Please try again."}</p>
          <button onClick={() => dispatch(fetchProfile())}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="account-page">
      <div className="account-wrapper">

        <button
          className="account-back-button"
          onClick={() => navigate("/")}
        >
          <FaArrowLeft />
          <span>Back to Home</span>
        </button>

        <div className="account-heading">
          <div className="account-heading-text">
            <span className="account-eyebrow">
              YOUR TOOTIETOYS SPACE
            </span>

            <h1>My Account</h1>

            <p>
              Everything about your account, all in one place.
            </p>
          </div>

          <div className="account-heading-logo">
            <img
              src="/TootieToys_Kawaii_Bear_Logo.png"
              alt="TootieToys"
            />
          </div>
        </div>

       
        <section className="account-profile-card">
          <div className="account-profile-left">
            <div className="account-logo-frame">
              <img
                src="/TootieToys_Kawaii_Bear_Logo.png"
                alt="TootieToys Logo"
              />
            </div>

            <div className="account-profile-info">
              <span className="account-welcome">
                WELCOME BACK
              </span>

              <h2>{profile.fullName}</h2>

              <p>{profile.email}</p>

              <span className="account-role">
                {profile.role}
              </span>
            </div>
          </div>

          <div className="account-profile-decoration">
            <span>Made for little smiles</span>
            <div className="account-decoration-line"></div>
            <strong>TootieToys</strong>
          </div>
        </section>

        {/* Account Content */}
        <div className="account-content-grid">

          {/* Personal Information */}
          <section className="account-information-card">
            <div className="account-section-heading">
              <div className="account-section-icon">
                <FaUser />
              </div>

              <div>
                <h3>Personal Information</h3>
                <p>Manage your personal details.</p>
              </div>
            </div>

            <form
              className="account-form"
              onSubmit={handleUpdate}
            >
              <div className="account-field">
                <label htmlFor="account-name">
                  Full Name
                </label>

                <div className="account-input-wrapper">
                  <FaUser />

                  <input
                    id="account-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    minLength={2}
                  />
                </div>
              </div>

              <div className="account-field">
                <label htmlFor="account-email">
                  Email Address
                </label>

                <div className="account-input-wrapper account-disabled-input">
                  <FaEnvelope />

                  <input
                    id="account-email"
                    type="email"
                    value={profile.email}
                    disabled
                  />

                  <span className="account-lock-icon">
                    <FaLock />
                  </span>
                </div>

                <small>
                  Your registered email address cannot be changed here.
                </small>
              </div>

              <div className="account-field">
                <label htmlFor="account-phone">
                    Phone Number
                </label>
                <PhoneInput
                international
                defaultCountry="LK"
                value={phone || undefined}
                onChange={(value) => setPhone(value || "")}
                placeholder="Enter your phone number"
                required
                />
              </div>

              {error && (
                <div className="account-message account-error">
                  {error}
                </div>
              )}

              {message && (
                <div className="account-message account-success">
                  <FaCheckCircle />
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="account-save-button"
                disabled={saving}
              >
                {saving ? "Saving Changes..." : "Save Changes"}
                {!saving && <FaArrowRight />}
              </button>
            </form>
          </section>

          <aside className="account-side-column">

            <div className="account-side-card">
              <div className="account-side-icon">
                <FaBoxOpen />
              </div>

              <h3>Your Orders</h3>

              <p>
                Keep track of your purchases and check your order
                history whenever you need.
              </p>

              <button
                className="account-outline-button"
                onClick={() => navigate("/my-orders")}
              >
                View My Orders
                <FaArrowRight />
              </button>
            </div>

            <div className="account-security-card">
              <div className="account-security-icon">
                <FaLock />
              </div>

              <div>
                <h4>Your information matters</h4>

                <p>
                  Your account details are protected. Only your
                  personal information is displayed here.
                </p>
              </div>
            </div>

            <div className="account-brand-note">
              <img
                src="/TootieToys_Kawaii_Bear_Logo.png"
                alt="TootieToys"
              />

              <p>
                Thank you for being part of our little world.
              </p>

              <span>TOOTIETOYS</span>
            </div>

          </aside>
        </div>

        <div className="account-bottom">
          <span>TOOTIETOYS</span>
          <p>A little happiness in every little detail.</p>
        </div>

      </div>
    </main>
  );
};

export default MyAccount;
