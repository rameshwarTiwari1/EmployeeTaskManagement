import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/Input/PasswordInput";
import { validateEmail } from "../../utils/helper";
import Navbar from "../../components/Navbar/Navbar";
import axiosInstance from "../../utils/axiosInstance";

const Signup = () => {
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [role, setrole] = useState("");
  const [password, setpassword] = useState("");
  const [error, seterror] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name) {
      seterror("Please enter your name");
      return;
    }
    if (!validateEmail(email)) {
      seterror("Please enter a valid email address");
      return;
    }
    if (!role) {
      seterror("Please select a role");
      return;
    }
    if (!password) {
      seterror("Please enter password");
      return;
    }
    seterror("");
    try {
      const response = await axiosInstance.post("/create-account", {
        fullName: name,
        email: email,
        password: password,
        role: role,
      });

      if (response.data && response.data.error) {
        seterror(response.data.message);
      }
      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        navigate("/login");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        seterror(error.response.data.message);
      } else {
        seterror("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center mt-28">
        <div className="w-96 border rounded bg-white px-7 py-10">
          <form onSubmit={handleSignup}>
            <h4 className="text-2xl mb-7">SignUp</h4>
            <input
              type="text"
              placeholder="Name"
              className="input-box"
              value={name}
              onChange={(e) => setname(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="input-box"
              value={email}
              onChange={(e) => setemail(e.target.value)}
            />
            <select
              className="input-box"
              value={role}
              onChange={(e) => setrole(e.target.value)}
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </select>
            <PasswordInput
              value={password}
              onChange={(e) => setpassword(e.target.value)}
            />
            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}
            <button type="submit" className="btn-primary">
              Create Account
            </button>
            <p className="text-sm text-center mt-4">
              Already have an account?
              <Link to="/login" className="font-medium text-primary underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
