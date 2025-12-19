        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const addTaskButton = document.getElementById('add-task-button');
            const addTaskContainer = document.getElementById('add-task-container');
            const taskForm = document.getElementById('add-task-form');
            const taskInput = document.getElementById('task-input');
            const taskCategory = document.getElementById('task-category');
            const taskPriority = document.getElementById('task-priority');
            const taskDueDate = document.getElementById('task-due-date');
            const taskList = document.getElementById('task-list');
            const emptyState = document.getElementById('empty-state');
            const filterButtons = document.querySelectorAll('.filter-button');
            const totalTasksElement = document.getElementById('total-tasks');
            const completedTasksElement = document.getElementById('completed-tasks');
            const pinnedTasksElement = document.getElementById('pinned-tasks');
            const settingsButton = document.getElementById('settings-button');
            const clearButton = document.getElementById('clear-button');
            const exportButton = document.getElementById('export-button');
            const importButton = document.getElementById('import-button');
            const summaryButton = document.getElementById('summary-button');
            const settingsModal = document.getElementById('settings-modal');
            const closeModal = document.getElementById('close-modal');
            const themeOptions = document.querySelectorAll('.theme-option');
            const colorOptions = document.querySelectorAll('.color-option');
            const layoutOptions = document.querySelectorAll('.layout-option');
            const animationOptions = document.querySelectorAll('.font-option');
            const userNameInput = document.getElementById('user-name-input');
            const greetingElement = document.getElementById('greeting');
            const searchForm = document.getElementById('search-form');
            const searchInput = document.getElementById('search-input');
            const wattModal = document.getElementById('watt-modal');
            const wattTitle = document.getElementById('watt-title');
            const wattDescription = document.getElementById('watt-description');
            const wattCountdown = document.getElementById('watt-countdown');
            const wattConfirm = document.getElementById('watt-confirm');
            const wattCancel = document.getElementById('watt-cancel');
            const summaryModal = document.getElementById('summary-modal');
            const summaryStats = document.getElementById('summary-stats');
            const summaryClose = document.getElementById('summary-close');
            const summaryCloseButton = document.getElementById('summary-close-button');
            const fileInput = document.getElementById('file-input');
            const progressPercent = document.getElementById('progress-percent');
            const progressFill = document.querySelector('.circular-progress-fill');
            const categorySelected = document.getElementById('category-selected');
            const categoryOptions = document.getElementById('category-options');
            const prioritySelected = document.getElementById('priority-selected');
            const priorityOptions = document.getElementById('priority-options');

            // State
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            let currentFilter = 'all';
            let editingTaskId = null;
            let searchQuery = '';
            let wattCallback = null;
            let selectedCategory = '';
            let selectedPriority = '';

            // User preferences
            let userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {
                theme: 'light',
                accentColor: '#007AFF',
                layout: 'spaced',
                animationStyle: 'smooth',
                userName: 'User'
            };

            // Initialize the app
            applyUserPreferences();
            updateGreeting();
            updateTaskList();
            updateStats();
            setupCustomSelects();

            // Event Listeners
            addTaskButton.addEventListener('click', function() {
                addTaskContainer.classList.toggle('active');
                if (addTaskContainer.classList.contains('active')) {
                    taskInput.focus();
                }
            });

            taskForm.addEventListener('submit', addTask);

            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Update active filter button
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');

                    // Set current filter and update list
                    currentFilter = this.dataset.filter;
                    updateTaskList();
                });
            });

            settingsButton.addEventListener('click', () => {
                settingsModal.classList.add('active');
            });

            closeModal.addEventListener('click', () => {
                settingsModal.classList.remove('active');
            });

            clearButton.addEventListener('click', () => {
                showWattModal(
                    'Clear Completed Tasks',
                    'This will permanently remove all completed tasks. This action cannot be undone.',
                    clearCompletedTasks
                );
            });

            exportButton.addEventListener('click', exportTasks);
            importButton.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', importTasks);

            summaryButton.addEventListener('click', showDailySummary);
            summaryClose.addEventListener('click', () => {
                summaryModal.classList.remove('active');
            });
            summaryCloseButton.addEventListener('click', () => {
                summaryModal.classList.remove('active');
            });

            // Theme selection
            themeOptions.forEach(option => {
                option.addEventListener('click', function() {
                    themeOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');

                    userPreferences.theme = this.dataset.theme;
                    saveUserPreferences();
                    applyUserPreferences();
                });
            });

            // Color selection
            colorOptions.forEach(option => {
                option.addEventListener('click', function() {
                    colorOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');

                    userPreferences.accentColor = this.dataset.color;
                    saveUserPreferences();
                    applyUserPreferences();
                });
            });

            // Layout selection
            layoutOptions.forEach(option => {
                option.addEventListener('click', function() {
                    layoutOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');

                    userPreferences.layout = this.dataset.layout;
                    saveUserPreferences();
                    applyUserPreferences();
                });
            });

            // Animation style selection
            animationOptions.forEach(option => {
                option.addEventListener('click', function() {
                    animationOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');

                    userPreferences.animationStyle = this.dataset.animation;
                    saveUserPreferences();
                });
            });

            // User name input
            userNameInput.value = userPreferences.userName;
            userNameInput.addEventListener('input', function() {
                userPreferences.userName = this.value || 'User';
                saveUserPreferences();
                updateGreeting();
            });

            // Search functionality
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                searchQuery = searchInput.value.trim().toLowerCase();
                updateTaskList();
            });

            searchInput.addEventListener('input', function() {
                searchQuery = this.value.trim().toLowerCase();
                updateTaskList();
            });

            // WATT modal events
            wattCancel.addEventListener('click', () => {
                wattModal.classList.remove('active');
            });

            wattConfirm.addEventListener('click', () => {
                if (wattCallback) {
                    wattCallback();
                }
                wattModal.classList.remove('active');
            });

            // Close modal when clicking outside
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    settingsModal.classList.remove('active');
                }
            });

            wattModal.addEventListener('click', (e) => {
                if (e.target === wattModal) {
                    wattModal.classList.remove('active');
                }
            });

            summaryModal.addEventListener('click', (e) => {
                if (e.target === summaryModal) {
                    summaryModal.classList.remove('active');
                }
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', function(e) {
                // Enter to add task when focused on input
                if (e.key === 'Enter' && document.activeElement === taskInput) {
                    // The form submit handler will handle this
                    return;
                }

                // Escape to cancel editing or close modals
                if (e.key === 'Escape') {
                    if (editingTaskId) {
                        cancelEdit();
                    } else if (addTaskContainer.classList.contains('active')) {
                        addTaskContainer.classList.remove('active');
                    } else if (settingsModal.classList.contains('active')) {
                        settingsModal.classList.remove('active');
                    } else if (wattModal.classList.contains('active')) {
                        wattModal.classList.remove('active');
                    } else if (summaryModal.classList.contains('active')) {
                        summaryModal.classList.remove('active');
                    }
                }

                // Delete key to delete focused task
                if (e.key === 'Delete' && document.activeElement.classList.contains('task-item')) {
                    const taskId = parseInt(document.activeElement.dataset.id);
                    if (taskId) {
                        showWattModal(
                            'Delete Task',
                            'This will permanently delete this task. This action cannot be undone.',
                            () => deleteTask(taskId)
                        );
                    }
                }
            });

            // Functions
            function setupCustomSelects() {
                // Category select
                categorySelected.addEventListener('click', function(e) {
                    e.stopPropagation();
                    closeAllSelects(this);
                    this.classList.toggle('select-arrow-active');
                    categoryOptions.classList.toggle('select-hide');
                });

                categoryOptions.querySelectorAll('div').forEach(option => {
                    option.addEventListener('click', function() {
                        categorySelected.textContent = this.textContent;
                        categorySelected.classList.remove('select-arrow-active');
                        categoryOptions.classList.add('select-hide');
                        selectedCategory = this.getAttribute('data-value');
                        taskCategory.value = selectedCategory;
                    });
                });

                // Priority select
                prioritySelected.addEventListener('click', function(e) {
                    e.stopPropagation();
                    closeAllSelects(this);
                    this.classList.toggle('select-arrow-active');
                    priorityOptions.classList.toggle('select-hide');
                });

                priorityOptions.querySelectorAll('div').forEach(option => {
                    option.addEventListener('click', function() {
                        prioritySelected.textContent = this.textContent;
                        prioritySelected.classList.remove('select-arrow-active');
                        priorityOptions.classList.add('select-hide');
                        selectedPriority = this.getAttribute('data-value');
                        taskPriority.value = selectedPriority;
                    });
                });

                // Close selects when clicking outside
                document.addEventListener('click', closeAllSelects);
            }

            function closeAllSelects(elmnt) {
                const selects = document.getElementsByClassName('select-items');
                const selected = document.getElementsByClassName('select-selected');
                
                for (let i = 0; i < selected.length; i++) {
                    if (elmnt !== selected[i]) {
                        selected[i].classList.remove('select-arrow-active');
                    }
                }
                
                for (let i = 0; i < selects.length; i++) {
                    if (elmnt !== selects[i]) {
                        selects[i].classList.add('select-hide');
                    }
                }
            }

            function addTask(e) {
                e.preventDefault();

                const taskText = taskInput.value.trim();
                if (taskText === '') return;

                // Create new task object
                const newTask = {
                    id: Date.now(),
                    text: taskText,
                    completed: false,
                    pinned: false,
                    important: false,
                    category: selectedCategory || 'personal',
                    priority: selectedPriority || 'medium',
                    dueDate: taskDueDate.value || '',
                    createdAt: new Date().toISOString()
                };

                // Add to tasks array
                tasks.unshift(newTask);

                // Save to localStorage
                saveTasks();

                // Clear input and reset selects
                taskInput.value = '';
                categorySelected.textContent = 'Select Category';
                prioritySelected.textContent = 'Priority';
                taskDueDate.value = '';
                selectedCategory = '';
                selectedPriority = '';

                // Hide the form
                addTaskContainer.classList.remove('active');

                // Update UI
                updateTaskList();
                updateStats();

                // Add animation to the new task
                const newTaskElement = document.querySelector(`[data-id="${newTask.id}"]`);
                if (newTaskElement) {
                    newTaskElement.classList.add('pulse');
                    setTimeout(() => {
                        newTaskElement.classList.remove('pulse');
                    }, 500);
                }
            }

            function toggleTaskCompletion(taskId) {
                // Find task and toggle completion status
                const taskIndex = tasks.findIndex(task => task.id === taskId);
                if (taskIndex !== -1) {
                    tasks[taskIndex].completed = !tasks[taskIndex].completed;

                    // Save to localStorage
                    saveTasks();

                    // Update UI
                    updateTaskList();
                    updateStats();

                    // Add bounce animation to the task item
                    const taskElement = document.querySelector(`[data-id="${taskId}"]`);
                    if (taskElement) {
                        taskElement.classList.add('bounce');
                        setTimeout(() => {
                            taskElement.classList.remove('bounce');
                        }, 500);
                    }
                }
            }

            function toggleTaskPin(taskId) {
                // Find task and toggle pin status
                const taskIndex = tasks.findIndex(task => task.id === taskId);
                if (taskIndex !== -1) {
                    tasks[taskIndex].pinned = !tasks[taskIndex].pinned;

                    // Save to localStorage
                    saveTasks();

                    // Update UI
                    updateTaskList();
                    updateStats();
                }
            }

            function toggleTaskImportance(taskId) {
                // Find task and toggle importance status
                const taskIndex = tasks.findIndex(task => task.id === taskId);
                if (taskIndex !== -1) {
                    tasks[taskIndex].important = !tasks[taskIndex].important;

                    // Save to localStorage
                    saveTasks();

                    // Update UI
                    updateTaskList();
                    updateStats();
                }
            }

            function deleteTask(taskId) {
                // Find task element for animation
                const taskElement = document.querySelector(`[data-id="${taskId}"]`);

                if (taskElement) {
                    // Add slide-out animation
                    taskElement.classList.add('slide-out');

                    // Remove from array after animation completes
                    setTimeout(() => {
                        tasks = tasks.filter(task => task.id !== taskId);

                        // Save to localStorage
                        saveTasks();

                        // Update UI
                        updateTaskList();
                        updateStats();
                    }, 400);
                }
            }

            function editTask(taskId) {
                // Set editing state
                editingTaskId = taskId;

                // Find task
                const task = tasks.find(t => t.id === taskId);
                if (!task) return;

                // Update UI to show edit form
                updateTaskList();
            }

            function saveTaskEdit(taskId, newText, newCategory, newPriority, newDueDate) {
                // Find task and update text
                const taskIndex = tasks.findIndex(task => task.id === taskId);
                if (taskIndex !== -1 && newText.trim() !== '') {
                    tasks[taskIndex].text = newText.trim();
                    tasks[taskIndex].category = newCategory || 'personal';
                    tasks[taskIndex].priority = newPriority || 'medium';
                    tasks[taskIndex].dueDate = newDueDate || '';

                    // Save to localStorage
                    saveTasks();

                    // Reset editing state
                    editingTaskId = null;

                    // Update UI
                    updateTaskList();

                    // Add pulse animation to the updated task
                    const taskElement = document.querySelector(`[data-id="${taskId}"]`);
                    if (taskElement) {
                        taskElement.classList.add('pulse');
                        setTimeout(() => {
                            taskElement.classList.remove('pulse');
                        }, 500);
                    }
                } else {
                    // If empty text, cancel edit
                    editingTaskId = null;
                    updateTaskList();
                }
            }

            function cancelEdit() {
                editingTaskId = null;
                updateTaskList();
            }

            function clearCompletedTasks() {
                // Filter out completed tasks
                const completedTasks = tasks.filter(task => task.completed);

                if (completedTasks.length === 0) return;

                // Animate removal of completed tasks
                completedTasks.forEach(task => {
                    const taskElement = document.querySelector(`[data-id="${task.id}"]`);
                    if (taskElement) {
                        taskElement.classList.add('slide-out');
                    }
                });

                // Remove completed tasks after animation
                setTimeout(() => {
                    tasks = tasks.filter(task => !task.completed);

                    // Save to localStorage
                    saveTasks();

                    // Update UI
                    updateTaskList();
                    updateStats();
                }, 400);
            }

            function updateTaskList() {
                // Clear current list
                taskList.innerHTML = '';

                // Filter tasks based on current filter and search query
                let filteredTasks = tasks;

                // Apply search filter
                if (searchQuery) {
                    filteredTasks = filteredTasks.filter(task => 
                        task.text.toLowerCase().includes(searchQuery) ||
                        task.category.toLowerCase().includes(searchQuery)
                    );
                }

                // Apply category/status filter
                if (currentFilter === 'active') {
                    filteredTasks = filteredTasks.filter(task => !task.completed);
                } else if (currentFilter === 'completed') {
                    filteredTasks = filteredTasks.filter(task => task.completed);
                } else if (currentFilter === 'pinned') {
                    filteredTasks = filteredTasks.filter(task => task.pinned);
                } else if (currentFilter === 'important') {
                    filteredTasks = filteredTasks.filter(task => task.important);
                } else if (currentFilter === 'work') {
                    filteredTasks = filteredTasks.filter(task => task.category === 'work');
                } else if (currentFilter === 'personal') {
                    filteredTasks = filteredTasks.filter(task => task.category === 'personal');
                } else if (currentFilter === 'school') {
                    filteredTasks = filteredTasks.filter(task => task.category === 'school');
                }

                // Sort tasks: pinned first, then by creation date (newest first)
                filteredTasks.sort((a, b) => {
                    if (a.pinned && !b.pinned) return -1;
                    if (!a.pinned && b.pinned) return 1;
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                // Show/hide empty state
                if (filteredTasks.length === 0) {
                    emptyState.style.display = 'block';
                } else {
                    emptyState.style.display = 'none';
                }

                // Add tasks to the list
                filteredTasks.forEach(task => {
                    const taskItem = document.createElement('div');
                    taskItem.className = `task-item ${task.completed ? 'completed' : ''} ${task.pinned ? 'pinned' : ''} ${task.important ? 'important' : ''}`;
                    taskItem.dataset.id = task.id;
                    taskItem.tabIndex = 0; // Make task focusable for keyboard navigation

                    // Check if this task is being edited
                    if (editingTaskId === task.id) {
                        taskItem.innerHTML = `
                            <form class="edit-task-form">
                                <div class="edit-task-input-row">
                                    <input type="text" class="edit-task-input" value="${task.text}" autofocus>
                                </div>
                                <div class="edit-meta-row">
                                    <select class="task-category edit-task-category">
                                        <option value="work" ${task.category === 'work' ? 'selected' : ''}>Work</option>
                                        <option value="personal" ${task.category === 'personal' ? 'selected' : ''}>Personal</option>
                                        <option value="school" ${task.category === 'school' ? 'selected' : ''}>School</option>
                                    </select>
                                    <select class="task-priority edit-task-priority">
                                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                                        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                                    </select>
                                    <input type="date" class="task-due-date edit-task-due-date" value="${task.dueDate}">
                                </div>
                                <div class="edit-actions">
                                    <button type="submit" class="save-button">
                                        <i class="fas fa-check"></i> Save
                                    </button>
                                    <button type="button" class="cancel-button">
                                        <i class="fas fa-times"></i> Cancel
                                    </button>
                                </div>
                            </form>
                        `;

                        // Add event listeners to the edit form
                        const editForm = taskItem.querySelector('.edit-task-form');
                        const cancelBtn = taskItem.querySelector('.cancel-button');
                        const categorySelect = taskItem.querySelector('.edit-task-category');
                        const prioritySelect = taskItem.querySelector('.edit-task-priority');
                        const dueDateInput = taskItem.querySelector('.edit-task-due-date');

                        editForm.addEventListener('submit', (e) => {
                            e.preventDefault();
                            const input = taskItem.querySelector('.edit-task-input');
                            saveTaskEdit(task.id, input.value, categorySelect.value, prioritySelect.value, dueDateInput.value);
                        });

                        cancelBtn.addEventListener('click', cancelEdit);
                    } else {
                        // Format due date if exists
                        let dueDateDisplay = '';
                        if (task.dueDate) {
                            const dueDate = new Date(task.dueDate);
                            dueDateDisplay = dueDate.toLocaleDateString();
                        }

                        taskItem.innerHTML = `
                            <div class="task-checkbox ${task.completed ? 'checked' : ''}"></div>
                            <div class="task-content">
                                ${task.text}
                                <div class="task-meta">
                                    ${task.category ? `<span class="task-category-tag">${task.category}</span>` : ''}
                                    ${task.priority ? `<span class="task-priority-tag ${task.priority}">${task.priority}</span>` : ''}
                                    ${dueDateDisplay ? `<span class="task-due-date-tag">Due: ${dueDateDisplay}</span>` : ''}
                                </div>
                            </div>
                            <div class="task-actions">
                                <button class="task-action pin-action ${task.pinned ? 'active' : ''}" title="${task.pinned ? 'Unpin' : 'Pin'}">
                                    <i class="fas fa-thumbtack"></i>
                                </button>
                                <button class="task-action important-action ${task.important ? 'active' : ''}" title="${task.important ? 'Unmark Important' : 'Mark Important'}">
                                    <i class="fas fa-star"></i>
                                </button>
                                <button class="task-action edit-action" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="task-action delete-action" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `;

                        // Add event listeners to the task item
                        const checkbox = taskItem.querySelector('.task-checkbox');
                        const content = taskItem.querySelector('.task-content');
                        const pinBtn = taskItem.querySelector('.pin-action');
                        const importantBtn = taskItem.querySelector('.important-action');
                        const editBtn = taskItem.querySelector('.edit-action');
                        const deleteBtn = taskItem.querySelector('.delete-action');

                        checkbox.addEventListener('click', () => toggleTaskCompletion(task.id));
                        content.addEventListener('click', () => editTask(task.id));
                        pinBtn.addEventListener('click', () => toggleTaskPin(task.id));
                        importantBtn.addEventListener('click', () => toggleTaskImportance(task.id));
                        editBtn.addEventListener('click', () => editTask(task.id));
                        deleteBtn.addEventListener('click', () => {
                            showWattModal(
                                'Delete Task',
                                'This will permanently delete this task. This action cannot be undone.',
                                () => deleteTask(task.id)
                            );
                        });
                    }

                    taskList.appendChild(taskItem);
                });
            }

            function updateStats() {
                const totalTasks = tasks.length;
                const completedTasks = tasks.filter(task => task.completed).length;
                const pinnedTasks = tasks.filter(task => task.pinned).length;

                totalTasksElement.textContent = `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`;
                completedTasksElement.textContent = `${completedTasks} completed`;
                pinnedTasksElement.textContent = `${pinnedTasks} pinned`;
            }

            function updateGreeting() {
                const hour = new Date().getHours();
                let timeGreeting = 'Hello';

                if (hour < 12) {
                    timeGreeting = 'Good morning';
                } else if (hour < 18) {
                    timeGreeting = 'Good afternoon';
                } else {
                    timeGreeting = 'Good evening';
                }

                greetingElement.textContent = `${timeGreeting}, ${userPreferences.userName}`;
            }

            function showWattModal(title, description, callback) {
                wattTitle.textContent = title;
                wattDescription.textContent = description;
                wattCallback = callback;
                
                // Disable confirm button and start countdown
                wattConfirm.disabled = true;
                let countdown = 5;
                
                wattCountdown.textContent = `You can proceed in ${countdown} seconds`;
                
                const countdownInterval = setInterval(() => {
                    countdown--;
                    wattCountdown.textContent = `You can proceed in ${countdown} seconds`;
                    
                    if (countdown <= 0) {
                        clearInterval(countdownInterval);
                        wattConfirm.disabled = false;
                        wattCountdown.textContent = 'You can now proceed';
                    }
                }, 1000);
                
                wattModal.classList.add('active');
            }

            function showDailySummary() {
                const totalTasks = tasks.length;
                const completedTasks = tasks.filter(task => task.completed).length;
                const pendingTasks = totalTasks - completedTasks;
                const pinnedTasks = tasks.filter(task => task.pinned).length;
                const importantTasks = tasks.filter(task => task.important).length;
                
                // Tasks due today
                const today = new Date().toISOString().split('T')[0];
                const dueToday = tasks.filter(task => task.dueDate === today && !task.completed).length;
                
                // Calculate completion percentage
                const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                
                // Update circular progress
                progressPercent.textContent = `${completionPercentage}%`;
                progressFill.style.strokeDasharray = `${completionPercentage}, 100`;
                
                let summaryHTML = `
                    <p>You have <strong>${pendingTasks} tasks</strong> left to complete today.</p>
                    <p><strong>${completedTasks} tasks</strong> are already completed.</p>
                `;
                
                if (pinnedTasks > 0) {
                    summaryHTML += `<p><strong>${pinnedTasks} tasks</strong> are pinned for attention.</p>`;
                }
                
                if (importantTasks > 0) {
                    summaryHTML += `<p><strong>${importantTasks} tasks</strong> are marked as important.</p>`;
                }
                
                if (dueToday > 0) {
                    summaryHTML += `<p><strong>${dueToday} tasks</strong> are due today.</p>`;
                }
                
                if (pendingTasks === 0 && totalTasks > 0) {
                    summaryHTML += `<p style="color: var(--success-color); margin-top: 10px;">Great job! You've completed all your tasks!</p>`;
                } else if (pendingTasks > 0) {
                    summaryHTML += `<p style="color: var(--warning-color); margin-top: 10px;">Keep going! You're making progress.</p>`;
                }
                
                summaryStats.innerHTML = summaryHTML;
                summaryModal.classList.add('active');
            }

            function exportTasks() {
                const dataStr = JSON.stringify({
                    version: "LanTask v1.0.1",
                    exportDate: new Date().toISOString(),
                    tasks: tasks
                }, null, 2);
                
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(dataBlob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = `lantask-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }

            function importTasks(event) {
                const file = event.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        
                        // Validate the imported data structure
                        if (!importedData.tasks || !Array.isArray(importedData.tasks)) {
                            alert('Invalid file format. Please select a valid LanTask export file.');
                            return;
                        }
                        
                        showWattModal(
                            'Import Tasks',
                            'This will replace all your current tasks with the imported ones. This action cannot be undone.',
                            () => {
                                tasks = importedData.tasks;
                                saveTasks();
                                updateTaskList();
                                updateStats();
                                fileInput.value = ''; // Reset file input
                            }
                        );
                    } catch (error) {
                        alert('Error reading file. Please make sure it\'s a valid JSON file.');
                        console.error('Import error:', error);
                    }
                };
                reader.readAsText(file);
            }

            function saveTasks() {
                localStorage.setItem('tasks', JSON.stringify(tasks));
            }

            function saveUserPreferences() {
                localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
            }

            function applyUserPreferences() {
                // Apply theme
                document.body.className = '';
                document.body.classList.add(`${userPreferences.theme}-theme`);
                document.body.classList.add(`${userPreferences.layout}-layout`);

                // Apply accent color
                document.documentElement.style.setProperty('--primary-color', userPreferences.accentColor);

                // Set active theme option
                themeOptions.forEach(option => {
                    option.classList.remove('active');
                    if (option.dataset.theme === userPreferences.theme) {
                        option.classList.add('active');
                    }
                });

                // Set active color option
                colorOptions.forEach(option => {
                    option.classList.remove('active');
                    if (option.dataset.color === userPreferences.accentColor) {
                        option.classList.add('active');
                    }
                });

                // Set active layout option
                layoutOptions.forEach(option => {
                    option.classList.remove('active');
                    if (option.dataset.layout === userPreferences.layout) {
                        option.classList.add('active');
                    }
                });

                // Set active animation option
                animationOptions.forEach(option => {
                    option.classList.remove('active');
                    if (option.dataset.animation === userPreferences.animationStyle) {
                        option.classList.add('active');
                    }
                });
            }
        });
