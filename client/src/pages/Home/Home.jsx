import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Taskcard from "../../components/cards/Taskcard";
import { MdAdd } from "react-icons/md";
import AddEditNotes from "./AddEditNotes";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Toast from "../../components/Toastmessage/Toast";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import addtask from "../../assets/addtask.png";
import noDataImg from "../../assets/noDataImg.png";
import io from "socket.io-client";
const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });
  const [showToastMsg, setshowToastmsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  });
  const [userInfo, setUserInfo] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [alltasks, setAlltasks] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const navigate = useNavigate();
  const handleEdit = (taskDetails) => {
    setOpenAddEditModal({ isShown: true, data: taskDetails, type: "edit" });
  };

  const showToastMessage = (message, type) => {
    setshowToastmsg({
      isShown: true,
      message: message,
      type: type || "add",
    });
  };

  const handleCloseToast = () => {
    setshowToastmsg({
      isShown: false,
      message: "",
    });
  };

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };
  const deleteTask = async (data) => {
    const taskId = data._id;
    try {
      const response = await axiosInstance.delete("/delete-task/" + taskId);
      if (response.data && !response.data.error) {
        showToastMessage("Task Deleted Successfully", "delete");
        getAllTasks();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.log("An unexpected error occured.Please try again.");
      }
    }
  };
  const getAllTasks = async () => {
    try {
      const response = await axiosInstance.get("/get-all-tasks");
      if (response.data && response.data.tasks) {
        setAlltasks(response.data.tasks);
      }
    } catch (error) {
      console.log("An unexpected error occured.Please try again later");
    }
  };

  const onSearchTask = async (query) => {
    try {
      const response = await axiosInstance.get("/search-tasks", {
        params: { query },
      });
      if (response.data && response.data.tasks) {
        setIsSearch(true);
        setAlltasks(response.data.tasks);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleClearSearch = () => {
    setIsSearch(false);
    getAllTasks();
  };
  const updateIsPinned = async (taskData) => {
    const taskId = taskData._id;
    try {
      const response = await axiosInstance.put(
        "/update-note-pinned/" + taskId,
        {
          isPinned: !taskData.isPinned,
        }
      );
      if (response.data && response.data.task) {
        showToastMessage(
          `Task ${taskData.isPinned ? "unpinned" : "pinned"} successfully`,
          "edit"
        );
        getAllTasks();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const handleFilterChange = (event) => {
    const newStatus = event.target.value;
    setStatusFilter(newStatus);
    getFilteredTasks(newStatus, priorityFilter);
  };
  const handlePriorityFilterChange = (event) => {
    const newPriority = event.target.value;
    setPriorityFilter(newPriority);
    getFilteredTasks(statusFilter, newPriority);
  };

  const getFilteredTasks = async (status, priority) => {
    try {
      const response = await axiosInstance.get("/get-all-tasks", {
        params: { status, priority },
      });
      if (response.data && response.data.tasks) {
        console.log("response data", response.data.tasks);
        setAlltasks(response.data.tasks);
      }
    } catch (error) {
      console.log("Error fetching filtered tasks:", error);
    }
  };
  const socket = io("http://localhost:8000", {
    transports: ["websocket", "polling"],
  });
  useEffect(() => {
    console.log("useEffect is called", socket.on);
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
    socket.on("taskCreated", (data) => {
      showToastMessage(data.message, "add");
      getAllTasks();
    });

    socket.on("taskUpdated", (data) => {
      console.log("task updated frontend", data);
      showToastMessage(data.message, "edit");
      getAllTasks();
    });

    socket.on("taskDeleted", (data) => {
      console.log("Data", data);
      showToastMessage(data.message, "delete");
      getAllTasks();
    });

    socket.on("taskPinnedUpdated", (data) => {
      showToastMessage(data.message, "edit");
      getAllTasks();
    });
    return () => {
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
      socket.off("taskPinnedUpdated");
      socket.disconnect();
      socket.off();
    };
  }, []);

  useEffect(() => {
    getAllTasks();
    getUserInfo();
    return () => {};
  }, []);

  //   const sortedTasks = () => {
  //     return [...alltasks].sort((a, b) => {
  //         const dateA = new Date(a.dueDate);
  //         const dateB = new Date(b.dueDate);
  //         return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  //     });
  // };
  const sortedTasks = () => {
    const pinnedTasks = alltasks.filter((task) => task.isPinned);
    const unpinnedTasks = alltasks.filter((task) => !task.isPinned);

    // Sort unpinned tasks by due date
    const sortedUnpinnedTasks = [...unpinnedTasks].sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    // Combine pinned tasks with sorted unpinned tasks
    return [...pinnedTasks, ...sortedUnpinnedTasks];
  };

  const [role, setRole] = useState("");
  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole) {
      setRole(userRole);
    }
  }, []);
  console.log("role in home", role);

  return (
    <>
      <Navbar
        userInfo={userInfo}
        onSearchTask={onSearchTask}
        handleClearSearch={handleClearSearch}
      />
      <div className="container mx-auto p-5 md:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
          <div>
            <label htmlFor="statusFilter" className="font-semibold">
              Filter by status:
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={handleFilterChange}
              className="ml-2 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="ToDo">ToDo</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label htmlFor="priorityFilter" className="font-semibold">
              Filter by priority:
            </label>
            <select
              id="priorityFilter"
              value={priorityFilter}
              onChange={handlePriorityFilterChange}
              className="ml-2 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortOrder" className="font-semibold">
              Sort by Due Date:
            </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="ml-2 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
        {sortedTasks().length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            {sortedTasks().map((item, index) => (
              <Taskcard
                key={item._id}
                title={item.title}
                date={item.createdOn}
                content={item.content}
                tags={item.tags}
                status={item.status}
                priority={item.priority}
                dueDate={item.dueDate}
                isPinned={item.isPinned}
                onEdit={() => {
                  handleEdit(item);
                }}
                onDelete={() => {
                  deleteTask(item);
                }}
                onPinNote={() => {
                  updateIsPinned(item);
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyCard
            imgSrc={isSearch ? noDataImg : addtask}
            message={
              isSearch
                ? `Oops! No Tasks found matching your search.`
                : `Start Creating your first task! Click the 'Add' Button to jot down your tasks,reminders.Lets Get Started!`
            }
          />
        )}
      </div>
      {role === "admin" && (
        <button
          className="w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-blue-600 fixed right-4 bottom-10 transition-transform transform hover:scale-110 z-50"
          onClick={() => {
            setOpenAddEditModal({ isShown: true, type: "add", data: null });
          }}
        >
          <MdAdd className="text-[32px] text-white" />
        </button>
      )}
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000, // Ensure it is above other elements
          },
          content: {
            width: "90%",
            maxWidth: "600px",
            maxHeight: "80vh",
            margin: "auto",
            borderRadius: "10px",
            overflowY: "auto",
          },
        }}
        contentLabel=""
        className="modal-content w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null });
          }}
          getAllTasks={getAllTasks}
          showToastMessage={showToastMessage}
          ariaHideApp={false}
        />
      </Modal>

      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default Home;
