import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../features/auth/authSlice";

function Login() {
  // useDispatch gives the Redux dispatch function.thats what 'Returns the dispatch function from the Redux store.' means.
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [redirectMessage, setRedirectMessage] = useState(() => {
    // Read and clear the one-time expired-session message set before redirecting here.
    const message = sessionStorage.getItem("authRedirectMessage");
    sessionStorage.removeItem("authRedirectMessage");
    return message;
  });

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getErrorMessage = () => {
    if (redirectMessage) return redirectMessage;
    if (!error) return null;
    if (error.detail) return error.detail;
    return "Login failed.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRedirectMessage(null);

  // Here, dispatch runs the loginUser async action with the form data.
  // Since loginUser makes an API request, we await the returned Promise to get the result.
    const result = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-gray-900">Login</h1>
        <p className="mt-1 text-sm text-gray-500">
          Login to manage your daily habits.
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
              Password
            </label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
              placeholder="Enter password"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          New here?{" "}
          <Link to="/register" className="font-medium text-gray-900 underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
