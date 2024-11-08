require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const app = express();

const User = require("./modals/UserModal");
const Task = require("./modals/TaskModal");
// const Role=require('./modals/Roles')
const { authenticateToken, checkRole } = require("./middleware/Chekroles");

// const {authenticateToken, ChekRole}=require("./utilities");

const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
app.use(express.json());

app.use(
  cors({
    // origin:"*"
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
const emitTaskUpdate = (event, taskData) => {
  console.log("emit task updayed");
  io.emit(event, taskData);
};

app.get("/", (req, res) => {
  res.json({ data: "hello" });
});

app.post("/create-account", async (req, res) => {
  const { fullName, email, password, role } = req.body;
  if (!fullName) {
    return res
      .status(400)
      .json({ error: true, message: "FullName is required" });
  }
  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }
  if (!role || !["admin", "employee"].includes(role)) {
    return res.status(400).json({
      error: true,
      message: "Valid role is required (admin or employee)",
    });
  }

  const IsUser = await User.findOne({ email: email });
  if (IsUser) {
    return res.json({
      error: true,
      message: "User already exist",
    });
  }
  const user = new User({
    fullName,
    email,
    role,
    password,
  });
  await user.save();
  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000h",
  });

  return res.json({
    error: false,
    user,
    accessToken,
    message: "Registration Successfull",
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }

  const userInfo = await User.findOne({ email: email });
  if (!userInfo) {
    return res.status(400).json({ error: true, message: "User not found" });
  }

  if (userInfo.email == email && userInfo.password == password) {
    const user = { user: userInfo };
    const accessToken = jwt.sign(
      { user: { _id: userInfo._id, role: userInfo.role } },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "36000h",
      }
    );
    return res.json({
      error: false,
      message: "Login successfull",
      role: userInfo.role,
      email,
      accessToken,
    });
  } else {
    return res.status(400).json({
      error: true,
      message: "Invalid credentials",
    });
  }
});

app.get("/get-user", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const isUser = await User.findOne({ _id: req.user._id });
  if (!isUser) {
    return res.sendStatus(401);
  }
  return res.json({
    user: isUser,
    message: "",
  });
});

app.post(
  "/add-task",
  authenticateToken,
  checkRole(["admin"]),
  async (req, res) => {
    const { title, content, tags, status, priority, dueDate } = req.body;

    // Ensure required fields are present
    if (!title || !content || !dueDate) {
      return res
        .status(400)
        .json({ error: true, message: "All required fields must be filled" });
    }

    try {
      // Use req.user._id to associate the task with the current user
      const isUser = await User.findOne({ _id: req.user._id });

      if (!isUser) {
        return res.status(404).json({ error: true, message: "User not found" });
      }

      const task = new Task({
        title,
        content,
        tags: tags || [],
        status,
        priority,
        userId: req.user._id, // Use req.user._id here
        dueDate: new Date(dueDate),
      });

      await task.save();
      return res.json({
        error: false,
        task,
        message: "Task created successfully",
      });
    } catch (error) {
      console.error("Error saving task:", error);
      return res
        .status(500)
        .json({ error: true, message: "Internal server error" });
    }
  }
);

// Edit a task (employee can only edit isPinned and status, admin can edit all)
app.put("/edit-task/:taskid", authenticateToken, async (req, res) => {
  const taskId = req.params.taskid;
  console.log("taskId:", taskId); // taskId should show correctly

  const { title, content, tags, isPinned, status, priority, dueDate } =
    req.body;
  const { role, _id } = req.user; // Access req.user directly

  console.log("User role:", role); // Log role to ensure it's available
  console.log("User ID:", _id); // Log _id to ensure it's available

  try {
    // Find the task without filtering by userId
    const task = await Task.findOne({ _id: taskId });
    if (!task) {
      return res.status(404).json({ error: true, message: "Task not found" });
    }

    // Update task based on user role
    if (role === "admin") {
      if (title) task.title = title;
      if (content) task.content = content;
      if (tags) task.tags = tags;

      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate) task.dueDate = new Date(dueDate);
    } else if (role === "employee") {
      if (status) task.status = status;
    } else {
      return res.status(403).json({ error: true, message: "Access denied" });
    }

    await task.save();
    return res.json({
      error: false,
      task,
      message: "Task updated successfully",
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

// Get all tasks (admin and employee)
app.get(
  "/get-all-tasks",
  authenticateToken, // Authenticates user token
  checkRole(["admin", "employee"]), // Allows access to both admin and employee roles
  async (req, res) => {
    const { status, priority } = req.query;

    try {
      // Define filter conditions based on query parameters
      const filter = {};

      if (status) filter.status = status; // Apply status filter if provided
      if (priority) filter.priority = priority; // Apply priority filter if provided

      // Fetch tasks with the applied filters, sorted by due date
      const tasks = await Task.find(filter).sort({ dueDate: 1 });

      return res.json({
        error: false,
        tasks,
        message: "All tasks retrieved successfully",
      });
    } catch (error) {
      console.error("Error retrieving tasks:", error);
      return res
        .status(500)
        .json({ error: true, message: "Internal server error" });
    }
  }
);

// Delete a task (admin only)
app.delete(
  "/delete-task/:taskid",
  authenticateToken,
  checkRole(["admin"]),
  async (req, res) => {
    const taskId = req.params.taskid;
    // const { _id } = req.user;

    try {
      const task = await Task.findOne({ _id: taskId });
      if (!task) {
        return res.status(404).json({ error: true, message: "Task not found" });
      }

      await Task.deleteOne({ _id: taskId });
      return res.json({ error: false, message: "Task deleted successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ error: true, message: "Internal server error" });
    }
  }
);

// Pin/Unpin a task (admin and employee)
app.put(
  "/update-note-pinned/:taskid",
  authenticateToken,
  checkRole(["admin", "employee"]),
  async (req, res) => {
    const taskId = req.params.taskid;
    const { isPinned } = req.body;

    // const { _id } = req.user;

    try {
      const task = await Task.findOne({ _id: taskId });
      if (!task) {
        return res.status(400).json({ error: true, message: "Task not found" });
      }

      task.isPinned = isPinned;
      await task.save();
      return res.json({
        error: false,
        task,
        message: "Task pinned status updated successfully",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: true, message: "Internal server error" });
    }
  }
);

// Search tasks (admin and employee)
app.get("/search-tasks", authenticateToken, async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({
      error: true,
      message: "Search query is required",
    });
  }

  try {
    // Search for tasks where title or content matches the query, case-insensitive
    const matchingTasks = await Task.find({
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });

    return res.json({
      error: false,
      tasks: matchingTasks,
      message: "Tasks matching the search query retrieved successfully",
    });
  } catch (error) {
    console.error("Error searching tasks:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

server.listen(process.env.PORT, () => {
  console.log("Server is running on port 8000");
});
module.exports = app;
