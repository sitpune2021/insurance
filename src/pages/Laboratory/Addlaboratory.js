//Code by Prajwal Punekar


import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import Navbar from "../navBar";

const AddLaboratory = () => {
  const [formData, setFormData] = useState({
    title: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    address: "",
    name: "",
    mobileno: "",
    email: "",
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false); // Modal visibility state

  const navigate = useNavigate(); // Use navigate for navigation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const {
      title,
      country,
      state,
      city,
      pincode,
      address,
      name,
      mobileno,
      email,
      username,
      password,
    } = formData;

    if (
      !title ||
      !country ||
      !state ||
      !city ||
      !address ||
      !pincode ||
      !name ||
      !mobileno ||
      !email ||
      !username ||
      !password
    ) {
      return "All fields are required!";
    }

    // Pincode validation (assuming it's a 6-digit number)
    if (isNaN(pincode) || pincode.length !== 6) {
      return "Pincode must be a 6-digit number.";
    }

    // Mobile number validation (assuming 10 digits)
    if (isNaN(mobileno) || mobileno.length !== 10) {
      return "Mobile number must be a 10-digit number.";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await axios.post(
        "http://103.165.118.71:3005/addLaboratory",
        formData
      );
      setMessage(response.data);

      // Show modal after success
      setShowModal(true);

      // Reset the form after submission
      setFormData({
        title: "",
        country: "",
        state: "",
        city: "",
        pincode: "",
        address: "",
        name: "",
        mobileno: "",
        email: "",
        username: "",
        password: "",
      });

      // Navigate to the Laboratory page after 2 seconds
      setTimeout(() => {
        navigate("/laboratory"); // Navigate to the laboratory page
      }, 4000);
    } catch (err) {
      setError(err.response?.data || "Failed to add laboratory");
    }
  };

  // Close the modal and navigate to the Laboratory page
  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/laboratory"); // Navigate to the laboratory page when closing the modal
  };

  return (
    <div className="main-wrapper">
      <Navbar />

      <div className="page-wrapper" style={{ marginTop: "50px" }}>
        {/* Main Content */}
        <div style={{ flex: 1, padding: "20px", backgroundColor: "#fff" }}>
          <h2
            style={{
              fontSize: "28px",
              marginBottom: "20px",
              borderBottom: "1px solid #ddd",
              paddingBottom: "10px",
            }}
          >
            Add Laboratory
          </h2>

          {/* Form Section */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              maxWidth: "100%",
            }}
          >
            {[
              { name: "title", type: "text", placeholder: "Title" },
              { name: "country", type: "text", placeholder: "Country" },
              { name: "state", type: "text", placeholder: "State" },
              { name: "city", type: "text", placeholder: "City" },
              { name: "pincode", type: "number", placeholder: "Pincode" },
              { name: "address", type: "textarea", placeholder: "Address" },
              { name: "name", type: "text", placeholder: "Name" },
              {
                name: "mobileno",
                type: "number",
                placeholder: "Mobile Number",
              },
              { name: "email", type: "email", placeholder: "Email" },
              { name: "username", type: "text", placeholder: "Username" },
              { name: "password", type: "password", placeholder: "Password" },
            ].map((field) => (
              <div
                key={field.name}
                style={{
                  flex:
                    field.name === "address"
                      ? "1 1 100%"
                      : "1 1 calc(33.33% - 20px)",
                  minWidth: field.name === "address" ? "100%" : "200px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required
                    style={{
                      padding: "12px",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      resize: "none",
                      fontSize: "14px",
                      height: "80px",
                    }}
                  ></textarea>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required
                    style={{
                      padding: "12px",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                )}
              </div>
            ))}

            {/* Submit Button */}
            <div
              style={{
                width: "100%",
                textAlign: "center",
                marginTop: "20px",
              }}
            >
              <button
                type="submit"
                style={{
                  padding: "12px 30px",
                  backgroundColor: "#2E37A4",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                Add Laboratory
              </button>
            </div>
          </form>

          {showModal && (
            <div
              style={{
                position: "fixed",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  textAlign: "center",
                  maxWidth: "400px",
                  width: "100%",
                }}
              >
                <h3>Laboratory Added Successfully!</h3>
                <p>Your laboratory has been added successfully.</p>
                <button
                  onClick={handleCloseModal} // Direct navigation after closing
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#2E37A4",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "16px",
                    marginTop: "20px",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLaboratory;
