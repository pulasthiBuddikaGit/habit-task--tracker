import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, logoutUser } from "../features/auth/authSlice";
import { clearHabits } from "../features/habits/habitsSlice";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    //runs the reducer func logout and clearHabits to clear the user and habits data from the state and localStorage, then navigates the user to the login page.
    //logoutUser asks the backend to delete the HttpOnly refresh_token cookie before frontend state is cleared.
    await dispatch(logoutUser());
    dispatch(logout());
    dispatch(clearHabits());
    navigate("/login");
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Habit Tracker</h1>
          <p className="text-sm text-gray-500">
            Track daily habits and streaks
          </p>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-600">
              Hi, {user.username}
            </span>
          )}

          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
