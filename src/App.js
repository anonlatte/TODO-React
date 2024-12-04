import React, { useState, useEffect } from "react";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Container,
  IconButton,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Typography,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  DarkMode,
  LightMode,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
} from "@mui/icons-material";
import Cookies from "js-cookie";

const App = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = Cookies.get("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTask, setNewTask] = useState("");
  const [editMode, setEditMode] = useState(null);
  const [editedTask, setEditedTask] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = Cookies.get("darkMode");
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });
  const [currentTaskIndex, setCurrentTaskIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 минут
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    Cookies.set("tasks", JSON.stringify(tasks), { expires: 7 });
  }, [tasks]);

  useEffect(() => {
    Cookies.set("darkMode", JSON.stringify(darkMode), { expires: Infinity });
  }, [darkMode]);

  useEffect(() => {
    let timer = null;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Помидор завершён
      if (isWorkTime) {
        const updatedTasks = tasks.map((task, index) =>
          index === currentTaskIndex
            ? { ...task, pomodoros: (task.pomodoros || 0) + 1 }
            : task
        );
        setTasks(updatedTasks);
        alert("Помидор завершён! Время перерыва.");
      } else {
        alert("Перерыв окончен! Время работать.");
      }

      // Переключение между работой и перерывом
      setIsWorkTime(!isWorkTime);
      setTimeLeft(isWorkTime ? 5 * 60 : 25 * 60); // Переключаем длительность
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isWorkTime, tasks, currentTaskIndex]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  const addTask = () => {
    if (newTask.trim()) {
      const currentTime = new Date().toLocaleString();
      setTasks([
        ...tasks,
        {
          text: newTask,
          completed: false,
          createdAt: currentTime,
          completedAt: null,
          pomodoros: 0,
        },
      ]);
      setNewTask("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  const deleteTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
    if (currentTaskIndex === index) {
      resetTimer();
    }
  };

  const toggleTaskCompleted = (index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index
        ? {
            ...task,
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toLocaleString() : null,
          }
        : task
    );
    setTasks(updatedTasks);
  };

  const enableEditMode = (index) => {
    setEditMode(index);
    setEditedTask(tasks[index].text);
  };

  const saveEditedTask = (index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, text: editedTask } : task
    );
    setTasks(updatedTasks);
    setEditMode(null);
    setEditedTask("");
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const startTimer = (index) => {
    if (currentTaskIndex !== null && currentTaskIndex !== index) {
      const confirmSwitch = window.confirm(
        "Таймер уже запущен для другой задачи. Переключить?"
      );
      if (!confirmSwitch) {
        return;
      }
      resetTimer();
    }
    setCurrentTaskIndex(index);
    setIsRunning(true);
    setIsWorkTime(true);
    setTimeLeft(25 * 60);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsWorkTime(true);
    setTimeLeft(25 * 60);
    setCurrentTaskIndex(null);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container style={{ marginTop: "16px" }}>
        <IconButton
          onClick={toggleTheme}
          aria-label="switch theme"
          style={{ position: "fixed", top: 0, right: 0 }}
        >
          {darkMode ? <LightMode /> : <DarkMode />}
        </IconButton>

        <div className="task-input">
          <TextField
            label="Новая задача"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="outlined"
            fullWidth
            InputProps={{
              endAdornment: (
                <IconButton onClick={addTask} aria-label="add task">
                  <AddIcon />
                </IconButton>
              ),
            }}
          />
        </div>

        <List>
          {tasks.map((task, index) => (
            <ListItem key={index} divider>
              <Checkbox
                checked={task.completed}
                onChange={() => toggleTaskCompleted(index)}
                inputProps={{ "aria-label": "Mark as completed" }}
              />
              {editMode === index ? (
                <TextField
                  value={editedTask}
                  onChange={(e) => setEditedTask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEditedTask(index)}
                />
              ) : (
                <ListItemText
                  primary={`${task.text} ${
                    task.pomodoros ? `(${task.pomodoros} 🍅)` : ""
                  }`}
                  secondary={`Добавлено: ${task.createdAt}${
                    task.completedAt ? `, Завершено: ${task.completedAt}` : ""
                  }`}
                  style={{
                    textDecoration: task.completed ? "line-through" : "none",
                  }}
                />
              )}
              {editMode === index ? (
                <IconButton
                  onClick={() => saveEditedTask(index)}
                  aria-label="save task"
                >
                  <SaveIcon />
                </IconButton>
              ) : (
                <>
                  <IconButton
                    onClick={() => enableEditMode(index)}
                    aria-label="edit task"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => deleteTask(index)}
                    aria-label="delete task"
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => startTimer(index)}
                    aria-label="start timer"
                    color={
                      currentTaskIndex === index && isRunning ? "secondary" : "default"
                    }
                  >
                    {currentTaskIndex === index && isRunning ? (
                      <PauseIcon />
                    ) : (
                      <PlayIcon />
                    )}
                  </IconButton>
                </>
              )}
            </ListItem>
          ))}
        </List>

        {currentTaskIndex !== null && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Typography variant="h4" gutterBottom>
              {isWorkTime ? "Работаем над задачей" : "Перерыв"}
            </Typography>
            <Typography variant="h2">{formatTime(timeLeft)}</Typography>
            <LinearProgress
              variant="determinate"
              value={
                ((isWorkTime ? 25 * 60 - timeLeft : 5 * 60 - timeLeft) /
                  (isWorkTime ? 25 * 60 : 5 * 60)) *
                100
              }
              style={{ marginTop: "20px" }}
            />
            <div style={{ marginTop: "20px" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (isRunning) {
                    pauseTimer();
                  } else {
                    setIsRunning(true);
                  }
                }}
                startIcon={isRunning ? <PauseIcon /> : <PlayIcon />}
                style={{ marginRight: "10px" }}
              >
                {isRunning ? "Пауза" : "Продолжить"}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={resetTimer}
                startIcon={<StopIcon />}
              >
                Остановить
              </Button>
            </div>
          </div>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default App;