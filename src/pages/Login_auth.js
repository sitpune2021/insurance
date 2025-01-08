import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Slide, toast } from "react-toastify";

function Login_auth() {
  const navigate = useNavigate();
  const [username, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await axios.post("http://3.109.174.127:3005/checkLogin", {
        username,
        password,
      });

      if (result.data.status === "1") {
        toast.success("Login Successfully", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
          transition: Slide,
        });

        // Redirect based on user role
        const userRole = result.data.post;
        if (userRole === "laboratory") {
          navigate("/LaboratoryDashboard");
        } else if (userRole === "assistant") {
          navigate("/AssistantDashboard");
        } else {
          navigate("/Dashboard"); // Fallback route
        }
      } else {
        toast.error("Invalid credentials", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
          transition: Slide,
        });
      }
    } catch (err) {
      console.error("Login Error:", err);
      toast.error("Failed to login. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        transition: Slide,
      });
    }
  };

  return (
    <div>
      <div className="main-wrapper login-body">
        <div className="container-fluid px-0">
          <div className="row">
            <div className="col-lg-6 login-wrap">
              <div className="login-sec">
                <div className="log-img">
                  <img
                    className="img-fluid"
                    src="assets/img/login-02.png"
                    alt="Logo"
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-6 login-wrap-bg">
              <div className="login-wrapper">
                <div className="loginbox">
                  <div className="login-right">
                    <div className="login-right-wrap">
                      <div className="account-logo">
                        <a href="index.html">
                          <img src="assets/img/login-logo.png" alt="" />
                        </a>
                      </div>
                      <h2>Login</h2>

                      <form onSubmit={handleSubmit}>
                        <div className="input-block">
                          <label>
                            Email <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            name="username"
                            value={username}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                        <div className="input-block">
                          <label>
                            Password <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control pass-input"
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <span className="profile-views feather-eye-off toggle-password"></span>
                        </div>
                        <div className="forgotpass">
                          <div className="remember-me">
                            <label className="custom_check mr-2 mb-0 d-inline-flex remember-me">
                              Remember me
                              <input type="checkbox" name="radio" />
                              <span className="checkmark"></span>
                            </label>
                          </div>
                          <a href="forgot-password.html">Password?</a>
                        </div>
                        <div className="input-block login-btn">
                          <button
                            className="btn btn-primary btn-block"
                            type="submit"
                          >
                            Login
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login_auth;
