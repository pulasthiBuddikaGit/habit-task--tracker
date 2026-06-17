import { useState } from "react";
import { useDispatch } from "react-redux";
import { createHabit } from "../features/habits/habitsSlice";

function HabitForm() {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    const result = await dispatch(createHabit(formData));

    if (createHabit.fulfilled.match(result)) {
      setFormData({
        title: "",
        description: "",
      });
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <h2 className="text-lg font-semibold text-gray-900">Add New Habit</h2>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
          placeholder="Example: Read 20 mins"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
          placeholder="Optional description"
          rows="3"
        />

        <button className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-800">
          Add Habit
        </button>
      </form>
    </div>
  );
}

export default HabitForm;