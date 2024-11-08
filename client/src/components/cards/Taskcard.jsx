import React, { useState } from "react";
import { MdOutlinePushPin } from "react-icons/md";
import { MdCreate, MdDelete } from "react-icons/md";
import moment from "moment";
import { useEffect } from "react";
const Taskcard = ({
  title,
  date,
  content,
  tags,
  status,
  priority,
  isPinned,
  onEdit,
  onDelete,
  onPinNote,
  dueDate,
}) => {
  const statusColors = {
    ToDo: "bg-yellow-300 text-yellow-800",
    InProgress: "bg-blue-300 text-blue-800",
    Completed: "bg-green-300 text-green-800",
  };
  const priorityColors = {
    low: "bg-green-200 text-green-800",
    medium: "bg-yellow-200 text-yellow-800",
    high: "bg-red-200 text-red-800",
  };

  const [role, setRole] = useState("");
  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole) {
      setRole(userRole);
    }
  }, []);

  return (
    <div className="border rounded p-4 bg-white hover:shadow-xl transition-all ease-in-out">
      <div className="flex items-center justify-between">
        <div>
          <h6 className="text-lg font-semibold text-gray-800">{title}</h6>
          {/* <span className='text-xs text-gray-500'>{moment(date).format("Do MMM YYYY")}</span>
           */}
          <div className="flex gap-2">
            <span className="text-xs text-gray-500">
              Created On: {moment(date).format("Do MMM YYYY")}
            </span>
            {dueDate && (
              <span className="text-xs text-gray-500">
                Due Date: {moment(dueDate).format("Do MMM YYYY")}
              </span>
            )}
          </div>
        </div>
        <MdOutlinePushPin
          className={`icon-btn ${isPinned ? "text-primary" : "text-slate-300"}`}
          onClick={onPinNote}
        />
      </div>
      <p className="text-sm text-gray-700 mt-2 leading-tight">
        {content?.slice(0, 60)}
      </p>
      <div className="flex mt-2 gap-3 items-center">
        <div>
          <p className="text-sm font-medium" mr-2>
            Status:
          </p>
        </div>
        <div>
          <span
            className={`inline-block px-2 py-1 rounded ${statusColors[status]} text-xs font-medium`}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="flex mt-2 gap-3 items-center ">
        <div>
          <p className="text-sm font-medium mr-2">Priority:</p>
        </div>
        <div>
          <span
            className={`inline-block px-2 py-1 rounded ${priorityColors[priority]} text-xs font-medium`}
          >
            {priority}
          </span>
        </div>
      </div>

      <div className="flex  flex-wrap items-center gap-1 mt-3">
        {/* <div className='text-cs text-slate-500'>
{tags.map((item)=>`#${item}`)}
        </div> */}
        {tags.map((tag, index) => (
          <span
            key={index}
            className="text-sm bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <MdCreate
          className="icon-btn hover:text-green-600 cursor-pointer text-lg"
          onClick={onEdit}
        />
        {role === "admin" && (
          <div>
            <MdDelete
              className="icon-btn hover:text-red-500 cursor-pointer text-lg"
              onClick={onDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Taskcard;
