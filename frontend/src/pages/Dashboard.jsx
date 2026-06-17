import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import HabitCard from "../components/HabitCard";
import HabitForm from "../components/HabitForm";
import Navbar from "../components/Navbar";
import { fetchHabits } from "../features/habits/habitsSlice";

function Dashboard() {
  const dispatch = useDispatch();
  const { habits, loading, error } = useSelector((state) => state.habits);

  useEffect(() => {
    dispatch(fetchHabits());
  }, [dispatch]);

  const getErrorMessage = () => {
    if (!error) return null;

    if (error.detail) return error.detail;

    return "Something went wrong.";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Habits</h2>
          <p className="mt-1 text-gray-500">
            Add habits, mark them done, and track your daily streaks.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[350px_1fr]">
          <HabitForm />

          <section>
            {getErrorMessage() && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {getErrorMessage()}
              </div>
            )}

            {loading ? (
              <div className="rounded-xl bg-white p-6 text-center shadow">
                Loading habits...
              </div>
            ) : habits.length === 0 ? (
              <div className="rounded-xl bg-white p-6 text-center shadow">
                <h3 className="font-semibold text-gray-900">No habits yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Create your first habit using the form.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {habits.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
