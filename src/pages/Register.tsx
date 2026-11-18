import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";
import "../App.css";

const images = [
  "/pic1.jpg",
  "/pic2.jpg",
  "/pic3.jpg",
  "/pic4.jpg",
  "/pic5.jpg",
];

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [currentImage, setCurrentImage] = useState(0);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailPattern.test(email.trim())) {
      alert("Please enter a valid email address.");
    return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!phone || !isValidPhoneNumber(phone)) {
      alert("Please enter a valid phone number.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName,
            email,
            phone,
            password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      alert("Account created successfully! 💗");
      navigate("/login");

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong";

      alert(message);
    }
  };

  return (
    <div className="register-page">

      <div className="register-left">

        <div className="register-content">

          <div className="register-brand">
            <img
              src="/TootieToys_Kawaii_Bear_Logo.png"
              alt="TootieToys Logo"
              className="register-brand-image"
            />

            <span>TootieToys</span>
          </div>

          <div className="register-heading">
            <h1>Create your account</h1>
          </div>

          <form onSubmit={handleRegister}>

            <div className="register-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="register-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="register-field">
              <label>Phone Number</label>
              <PhoneInput
              international
              defaultCountry="LK"
              value={phone}
              onChange={(value) => setPhone(value || "")}
              placeholder="Enter your phone number"
              required
            />
            </div>

            <div className="register-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div className="register-field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="register-submit"
            >
              Create Account <span>→</span>
            </button>

          </form>

          <div className="register-bottom">
            Already have an account?
            <Link to="/login"> Login</Link>
          </div>

        </div>

      </div>

      <div className="register-right">

        <div className="register-image-container">

          {images.map((image, index) => (
            <img
              key={image}
              src={image}
              alt={`TootieToys collection ${index + 1}`}
              className={`register-slide ${
                currentImage === index ? "active" : ""
              }`}
            />
          ))}

          <div className="register-image-overlay">

            <div className="image-bottom-content">

              <h2>
                A little joy
                <br />
                in every toy.
              </h2>

              <p>
                Discover adorable toys, sweet surprises
                and beautiful moments for your little ones.
              </p>

              <div className="slider-indicators">
                {images.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={
                      currentImage === index ? "selected" : ""
                    }
                    onClick={() => setCurrentImage(index)}
                    aria-label={`Show image ${index + 1}`}
                  />
                ))}
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Register;