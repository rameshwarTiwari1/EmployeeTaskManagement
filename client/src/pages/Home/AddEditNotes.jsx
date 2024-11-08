import React, { useState, useEffect } from "react";
import TagInput from "../../components/Input/TagInput";
import { MdClose } from "react-icons/md";
import axiosInstance from "../../utils/axiosInstance";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./AddEditNoteModal.css";
const AddEditNotes = ({
  noteData,
  type,
  getAllTasks,
  onClose,
  showToastMessage,
}) => {
  const [title, settitle] = useState(noteData?.title || "");
  const [content, setcontent] = useState(noteData?.content || "");
  const [tags, setTags] = useState(noteData?.tags || []);
  const [status, setStatus] = useState(noteData?.status || "ToDo");
  const [priority, setPriority] = useState(noteData?.priority || "medium");
  const [dueDate, setDueDate] = useState(
    noteData?.dueDate ? new Date(noteData.dueDate) : null
  );
  const [error, seterror] = useState(null);
  const addNewNote = async () => {
    try {
      const response = await axiosInstance.post("/add-task", {
        title,
        content,
        tags,
        status,
        priority,
        dueDate,
      });
      if (response.data && response.data.task) {
        showToastMessage("Task Added Successfully", "add");
        getAllTasks();
        onClose();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        seterror(error.response.data.message);
      }
    }
  };
  const editNote = async () => {
    const taskId = noteData._id;
    try {
      const response = await axiosInstance.put("/edit-task/" + taskId, {
        title,
        content,
        tags,
        status,
        priority,
        dueDate,
      });
      if (response.data && response.data.task) {
        showToastMessage("Task Updated Successfully", "edit");
        getAllTasks();
        onClose();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        seterror(error.response.data.message);
      }
    }
  };

  const handleAddNote = () => {
    if (!title) {
      seterror("Please enter title");
      return;
    }
    if (!content) {
      seterror("Please enter the content");
      return;
    }
    seterror("");
    if (type === "edit") {
      editNote();
    } else {
      addNewNote();
    }
  };

  const [role, setRole] = useState("");
  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole) {
      setRole(userRole);
    }
  }, []);
  console.log("role in addedit", role);

  return (
    <div className="relative">
      <button
        className="w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 -right-3 hover:bg-slate-500 "
        onClick={onClose}
      >
        <MdClose className="text-xl text-slate-400" />
      </button>

      {role === "admin" && (
        <div className="flex flex-col gap-2">
          <label className="input-label">TITLE</label>
          <input
            type="text"
            className="text-2xl text-slate-950 outline-none"
            placeholder="Title"
            value={title}
            onChange={({ target }) => settitle(target.value)}
          />
        </div>
      )}

      {role === "admin" && (
        <div className="flex flex-col gap-2 mt-4">
          <label className="input-label">CONTENT</label>
          <textarea
            type="text"
            className="text-sm text-slate-500 outline-none bg-slate-50 p-2 rounded"
            placeholder="content"
            rows={10}
            value={content}
            // disabled={role !== "admin"}
            onChange={({ target }) => setcontent(target.value)}
          />
        </div>
      )}

      {role === "admin" && (
        <div className="mt-3">
          <label className="input-label">TAGS</label>
          <TagInput tags={tags} setTags={setTags} />
        </div>
      )}

      <div className="flex flex-col gap-2 mt-4">
        <label className="input-label">STATUS</label>
        <select
          className="text-sm text-slate-500 outline-none bg-slate-50 p-2 rounded"
          value={status}
          onChange={({ target }) => setStatus(target.value)}
        >
          <option value="ToDo">To Do</option>
          <option value="InProgress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {role === "admin" && (
        <div className="flex flex-col gap-2 mt-4">
          <label className="input-label">PRIORITY</label>
          <select
            className="text-sm text-slate-500 outline-none bg-slate-50 p-2 rounded"
            value={priority}
            onChange={({ target }) => setPriority(target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      )}

      {role === "admin" && (
        <div className="flex flex-col gap-2 mt-4">
          <label className="input-label">DUE DATE</label>
          <DatePicker
            selected={dueDate}
            onChange={(date) => setDueDate(date)}
            dateFormat="yyyy-MM-dd"
            className="text-sm text-slate-500 outline-none bg-slate-50 p-2 rounded"
            placeholderText="Select a due date"
          />
        </div>
      )}

      {error && <p className="text-red-500 text-xs pt-4">{error}</p>}
      <button
        className="btn-primary font-medium mt-5 p-3"
        onClick={handleAddNote}
      >
        {type === "edit" ? "UPDATE" : "ADD"}
      </button>
    </div>
  );
};

export default AddEditNotes;
