const STORAGE_KEY = "taskify-board-state";

const STATUS_CONFIG = {
    todo: {
        label: "To Do",
        containerId: "todoColumn"
    },
    "in-progress": {
        label: "In Progress",
        containerId: "progressColumn"
    },
    review: {
        label: "Under Review",
        containerId: "reviewColumn"
    },
    done: {
        label: "Completed",
        containerId: "doneColumn"
    }
};

const form = document.getElementById("taskForm");
const clearAllButton = document.getElementById("clearAllBtn");
const template = document.getElementById("taskCardTemplate");

let tasks = loadTasks();
let activeDragTaskId = null;

initialize();

function initialize() {
    form.addEventListener("submit", handleTaskSubmit);
    clearAllButton.addEventListener("click", handleClearBoard);

    Object.entries(STATUS_CONFIG).forEach(([status, config]) => {
        const dropzone = document.getElementById(config.containerId);
        dropzone.addEventListener("dragover", (event) => handleDragOver(event, status));
        dropzone.addEventListener("dragleave", () => dropzone.classList.remove("is-active"));
        dropzone.addEventListener("drop", (event) => handleDrop(event, status));
    });

    renderBoard();
}

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
        console.error("Unable to load task state:", error);
        return [];
    }
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function handleTaskSubmit(event) {
    event.preventDefault();

    const formData = new FormData(form);
    const title = formData.get("title").trim();
    const description = formData.get("description").trim();
    const dueDate = formData.get("dueDate");
    const priority = formData.get("priority");

    if (!title) {
        return;
    }

    tasks.unshift({
        id: crypto.randomUUID(),
        title,
        description,
        dueDate,
        priority,
        status: "todo",
        createdAt: new Date().toISOString()
    });

    saveTasks();
    renderBoard();
    form.reset();
    document.getElementById("taskPriority").value = "medium";
}

function handleClearBoard() {
    if (!tasks.length) {
        return;
    }

    const shouldClear = window.confirm("Clear every task from the board?");
    if (!shouldClear) {
        return;
    }

    tasks = [];
    saveTasks();
    renderBoard();
}

function handleDragOver(event, status) {
    event.preventDefault();
    document.getElementById(STATUS_CONFIG[status].containerId).classList.add("is-active");
}

function handleDrop(event, status) {
    event.preventDefault();
    const dropzone = document.getElementById(STATUS_CONFIG[status].containerId);
    dropzone.classList.remove("is-active");

    if (!activeDragTaskId) {
        return;
    }

    updateTaskStatus(activeDragTaskId, status);
    activeDragTaskId = null;
}

function updateTaskStatus(taskId, nextStatus) {
    tasks = tasks.map((task) => (
        task.id === taskId ? { ...task, status: nextStatus } : task
    ));
    saveTasks();
    renderBoard();
}

function deleteTask(taskId) {
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasks();
    renderBoard();
}

function renderBoard() {
    Object.entries(STATUS_CONFIG).forEach(([status, config]) => {
        const dropzone = document.getElementById(config.containerId);
        const taskCount = tasks.filter((task) => task.status === status).length;

        dropzone.innerHTML = "";
        document.querySelector(`[data-count="${status}"]`).textContent = String(taskCount);

        const tasksForColumn = tasks
            .filter((task) => task.status === status)
            .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

        if (!tasksForColumn.length) {
            const emptyState = document.createElement("div");
            emptyState.className = "empty-state";
            emptyState.textContent = `No tasks in ${config.label.toLowerCase()} yet.`;
            dropzone.appendChild(emptyState);
            return;
        }

        tasksForColumn.forEach((task) => {
            dropzone.appendChild(createTaskCard(task));
        });
    });

    updateSummary();
}

function createTaskCard(task) {
    const cardFragment = template.content.cloneNode(true);
    const card = cardFragment.querySelector(".task-card");
    const priority = cardFragment.querySelector(".task-card__priority");
    const title = cardFragment.querySelector(".task-card__title");
    const description = cardFragment.querySelector(".task-card__description");
    const dueDate = cardFragment.querySelector(".task-card__date");
    const status = cardFragment.querySelector(".task-card__status");
    const deleteButton = cardFragment.querySelector(".task-card__delete");

    priority.textContent = task.priority;
    priority.dataset.priority = task.priority;
    title.textContent = task.title;
    description.textContent = task.description || "No description provided.";
    dueDate.textContent = task.dueDate ? formatDate(task.dueDate) : "No due date";
    status.textContent = STATUS_CONFIG[task.status].label;

    card.dataset.taskId = task.id;
    card.addEventListener("dragstart", () => {
        activeDragTaskId = task.id;
    });
    card.addEventListener("dragend", () => {
        activeDragTaskId = null;
        document.querySelectorAll(".column__dropzone").forEach((zone) => zone.classList.remove("is-active"));
    });

    deleteButton.addEventListener("click", () => {
        deleteTask(task.id);
    });

    return cardFragment;
}

function updateSummary() {
    const completedTasks = tasks.filter((task) => task.status === "done").length;
    const urgentTasks = tasks.filter((task) => task.priority === "urgent").length;

    document.getElementById("totalTasks").textContent = String(tasks.length);
    document.getElementById("completedTasks").textContent = String(completedTasks);
    document.getElementById("urgentTasks").textContent = String(urgentTasks);
}

function formatDate(dateString) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    }).format(new Date(dateString));
}
