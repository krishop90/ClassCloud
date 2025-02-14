import React, { useState, useEffect } from "react";
import "../style/TodoList.css";

const TodoList = () => {
    const [tasks, setTasks] = useState(() => {
        const savedTasks = localStorage.getItem("tasks");
        return savedTasks ? JSON.parse(savedTasks) : [];
    });
    const [formVisible, setFormVisible] = useState(false);
    const [newTask, setNewTask] = useState({
        name: "",
        description: "",
        estimationTime: "",
        priority: "",
        completed: false,
    });

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask({ ...newTask, [name]: value });
    };

    const handleAddTask = () => {
        setFormVisible(true);
    };

    const handleSaveTask = () => {
        setTasks([...tasks, newTask]);
        setNewTask({
            name: "",
            description: "",
            estimationTime: "",
            priority: "",
            completed: false,
        });
        setFormVisible(false);
    };

    const handleCancel = () => {
        setNewTask({
            name: "",
            description: "",
            estimationTime: "",
            priority: "",
            completed: false,
        });
        setFormVisible(false);
    };

    const handleCompleteTask = (index) => {
        const updatedTasks = [...tasks];
        updatedTasks[index].completed = true;
        setTasks(updatedTasks);

        // Delete task after marking as complete with a small delay for visual feedback
        setTimeout(() => {
            handleDeleteTask(index);
        }, 500);
    };

    const handleDeleteTask = (index) => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
    };



    return (
        <div className="todo-container">
            <div className="todo-header">
                <div className="todo-title">
                    <h1>To-Do List</h1>
                </div>
                <button className="add-task-button" onClick={handleAddTask}>
                    + Add Task
                </button>
            </div>
            <div className="todo-stats">
                <div className="stat-box">
                    <h3>Total Task</h3>
                    <span>{tasks.length}</span>
                </div>
                <div className="stat-box">
                    <h3>Remaining</h3>
                    <span>{tasks.filter(task => !task.completed).length}</span>
                </div>
                <div className="stat-box">
                    <h3>Completed</h3>
                    <span>{tasks.filter(task => task.completed).length}</span>
                </div>
            </div>
            <div className="todo-table">
                <table>
                    <thead>
                        <tr>
                            <th>Task Name</th>
                            <th>Description</th>
                            <th>Estimation Time</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task, index) => (
                            <tr key={index} className={task.completed ? 'completed-row' : ''}>
                                <td>{task.name}</td>
                                <td>{task.description}</td>
                                <td>{task.estimationTime}</td>
                                <td>{task.priority}</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => handleCompleteTask(index)}
                                        className="task-checkbox"
                                    />
                                </td>
                                <td>
                                    <button onClick={() => handleDeleteTask(index)} className="t-delete">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {formVisible && (
                <div className="full-page-modal">
                    <div className="task-form">
                        <div className="task-menu">
                            <h3>Add New Task</h3>
                            <button className="close-btn" onClick={handleCancel}>✖</button>
                        </div>
                        <div className="form-group">
                            <label>Task Name</label>
                            <input
                                type="text"
                                name="name"
                                value={newTask.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={newTask.description}
                                onChange={handleInputChange}
                            ></textarea>
                        </div>
                        <div className="form-group">
                            <label>Estimation Time</label>
                            <input
                                type="text"
                                name="estimationTime"
                                value={newTask.estimationTime}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Priority</label>
                            <select
                                name="priority"
                                value={newTask.priority}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Priority</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div className="form-actions">
                            <button className="save-button" onClick={handleSaveTask}>
                                Save Task
                            </button>
                            <button className="cancel-button" onClick={handleCancel}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TodoList;
