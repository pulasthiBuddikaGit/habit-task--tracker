import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  completeHabit,
  deleteHabit,
  updateHabit,
} from "../features/habits/habitsSlice";

function HabitCard({ habit }) {
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: habit.title,
    description: habit.description || "",
  });

  const handleComplete = () => {
    dispatch(completeHabit(habit.id));
  };

  const handleDelete = () => {
    const confirmed = window.confirm("Are you sure you want to delete this habit?");

    if (confirmed) {
      dispatch(deleteHabit(habit.id));
    }
  };

  const handleEditChange = (e) => {
    setEditData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const result = await dispatch(
      updateHabit({
        id: habit.id,
        formData: editData,
      })
    );

    if (updateHabit.fulfilled.match(result)) {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="rounded-xl bg-white p-5 shadow">
        <form onSubmit={handleUpdate} className="space-y-3">
          <input
            name="title"
            value={editData.title}
            onChange={handleEditChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
          />

          <textarea
            name="description"
            value={editData.description}
            onChange={handleEditChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
            rows="3"
          />

          <div className="flex gap-2">
            <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
              Save
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{habit.title}</h3>

          {habit.description && (
            <p className="mt-1 text-sm text-gray-500">{habit.description}</p>
          )}
        </div>

        <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
          🔥 {habit.streak_count} day streak
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={handleComplete}
          disabled={habit.is_completed_today}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {habit.is_completed_today ? "Done Today" : "Mark Done"}
        </button>

        <button
          onClick={() => setIsEditing(true)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Edit
        </button>

        <button
          onClick={handleDelete}
          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default HabitCard;