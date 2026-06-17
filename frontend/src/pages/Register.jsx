import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../features/auth/authSlice";

function Register() {
  //dispatch - sending someone or something to a specific destination
  const dispatch = useDispatch();
  const navigate = useNavigate();
  //selecting a specific part of the state from the Redux store, in this case, the authentication state
  //loading and error are global states managed by the auth slice in the Redux store.
  const { loading, error } = useSelector((state) => state.auth);
  //this state is an object type
  //these are not global states, they are local to the Register component. 
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  //this function is used to update the formData state whenever an input field changes. It takes the event object as an argument and updates the corresponding field in the formData state based on the name attribute of the input element.
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  //this function is used to generate a user-friendly error message based on the error object received from the Redux store. 
  // It checks for specific error fields (username, email, password) and returns a formatted message accordingly. If no specific error is found, it returns a generic "Registration failed" message.
  const getErrorMessage = () => {
    if (!error) return null;

    if (error.username) return `Username: ${error.username[0]}`;
    if (error.email) return `Email: ${error.email[0]}`;
    if (error.password) return `Password: ${error.password[0]}`;
    if (error.detail) return error.detail;

    return "Registration failed.";
  };
  //this function is an asynchronous function that handles the form submission for user registration. 
  // It prevents the default form submission behavior, dispatches the registerUser action with the formData, and checks the result. If the registration is successful (fulfilled), it navigates the user to the login page.
  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await dispatch(registerUser(formData));

    if (registerUser.fulfilled.match(result)) {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Register to start tracking your habits.
        </p>

        {getErrorMessage() && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {getErrorMessage()}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
              placeholder="Enter password"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-gray-900 underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;