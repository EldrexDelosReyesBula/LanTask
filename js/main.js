// Enhanced LanTask Pro Application with Dark Mode Support
class LanTaskPro {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentPage = 'dashboard';
        this.currentTheme = 'sierra-blue';
        this.isSidebarCollapsed = false;
        this.isTimerRunning = false;
        this.timerSeconds = 25 * 60;
        this.timerInterval = null;
        this.focusTimerSeconds = 45 * 60;
        this.focusTimerInterval = null;
        this.isFocusTimerRunning = false;
        this.isFullscreenTimerActive = false;
        this.isMusicPlaying = false;
        this.currentTrack = 0;
        this.confirmationAction = null;
        this.confirmationTimer = null;
        this.confirmationSeconds = 5;
        this.sensitiveWords = ['password', 'secret', 'confidential', 'private'];
        this.motivationalQuotes = [
            "The secret of getting ahead is getting started. - Mark Twain",
            "It's not whether you get knocked down, it's whether you get up. - Vince Lombardi",
            "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
            "The way to get started is to quit talking and begin doing. - Walt Disney",
            "Don't let yesterday take up too much of today. - Will Rogers",
            "You learn more from failure than from success. Don't let it stop you. - Unknown",
            "The harder you work for something, the greater you'll feel when you achieve it. - Unknown",
            "Dream bigger. Do bigger. - Unknown",
            "Don't stop when you're tired. Stop when you're done. - Unknown",
            "Wake up with determination. Go to bed with satisfaction. - Unknown"
        ];
        this.breakQuotes = [
            "Sometimes the most productive thing you can do is relax.",
            "Take a break. A rested mind is a productive mind.",
            "Breaks are not a sign of weakness but a tool for strength.",
            "Step away to see clearly. Sometimes distance brings perspective.",
            "Your brain needs idle time to process and create.",
            "Rest when you're weary. Refresh and renew yourself.",
            "The time to relax is when you don't have time for it.",
            "A break is a beautiful interruption in a world of constant motion.",
            "Pause. Breathe. Reset.",
            "Productivity is not about being busy, it's about being effective."
        ];
        this.focusMusic = [{
                name: "Ambient Study Background",
                src: "https://pixabay.com/music/download/ambient-study-background-12345.mp3"
            },
            {
                name: "Calm Focus Piano",
                src: "https://fesliyanstudios.com/music/downloads/calmpiano-focus.mp3"
            },
            {
                name: "Gentle LoFi Study",
                src: "https://breakingcopyright.com/focus/gentle-lofi-study.mp3"
            },
            {
                name: "Relaxing Ambient Waves",
                src: "https://nocopyrightmusic.com/ambient-waves.mp3"
            }
        ];
        this.audio = new Audio();
        this.analyticsChart = null;
        this.breakTimerSeconds = 5 * 60;
        this.breakTimerInterval = null;
        this.isBreakActive = false;
        this.isBreathingActive = false;
        this.breathingInterval = null;
        this.userActivity = this.loadUserActivity();
        this.taskCompletionHistory = this.loadTaskCompletionHistory();

        // Initialize Dark Mode Manager
        this.darkModeManager = new DarkModeManager();

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTasks();
        this.setupChart();
        this.loadSettings();
        this.checkActiveTimer();
        this.updateStats();
        this.applyFontSize();

        // Load saved theme
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme) {
            this.applyTheme(savedTheme);
        }

        // Load custom greeting
        const savedGreeting = localStorage.getItem('lantask-pro-greeting');
        if (savedGreeting) {
            document.getElementById('greeting-text').textContent = savedGreeting;
        }

        // Update dashboard summary with real data
        this.updateDashboardSummary();
    }

    // Enhanced Task Management
    loadTasks() {
        const storedTasks = localStorage.getItem('lantask-pro-tasks');
        if (storedTasks) {
            return JSON.parse(storedTasks);
        }

        // Return sample tasks if none exist
        return [{
                id: 1,
                title: "Complete project proposal",
                description: "Finish the client proposal document with all requirements",
                completed: false,
                priority: "high",
                category: "work",
                dueDate: this.parseNaturalLanguageDate("tomorrow"),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                pinned: true,
                tags: ["client", "deadline"],
                timeEstimate: "2h",
                subtasks: [],
                completedAt: null
            },
            {
                id: 2,
                title: "Buy groceries",
                description: "Milk, eggs, bread, fruits",
                completed: false,
                priority: "medium",
                category: "personal",
                dueDate: this.parseNaturalLanguageDate("today"),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                pinned: false,
                tags: ["shopping"],
                timeEstimate: "30m",
                subtasks: [],
                completedAt: null
            },
            {
                id: 3,
                title: "Morning workout",
                description: "30 minutes of cardio and strength training",
                completed: true,
                priority: "medium",
                category: "health",
                dueDate: this.parseNaturalLanguageDate("today"),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                pinned: false,
                tags: ["fitness"],
                timeEstimate: "30m",
                subtasks: [],
                completedAt: new Date().toISOString()
            }
        ];
    }

    saveTasks() {
        localStorage.setItem('lantask-pro-tasks', JSON.stringify(this.tasks));
        this.updateStats();
        this.updateDashboardSummary();
        this.updateAnalytics();
    }

    loadUserActivity() {
        const storedActivity = localStorage.getItem('lantask-pro-activity');
        return storedActivity ? JSON.parse(storedActivity) : {
            focusSessions: [],
            breaks: [],
            tasksCompleted: [],
            dailyStats: {}
        };
    }

    saveUserActivity() {
        localStorage.setItem('lantask-pro-activity', JSON.stringify(this.userActivity));
    }

    loadTaskCompletionHistory() {
        const storedHistory = localStorage.getItem('lantask-pro-completion-history');
        return storedHistory ? JSON.parse(storedHistory) : {};
    }

    saveTaskCompletionHistory() {
        localStorage.setItem('lantask-pro-completion-history', JSON.stringify(this.taskCompletionHistory));
    }

    addTask(taskData) {
        const newTask = {
            id: Date.now(),
            title: taskData.title,
            description: taskData.description || '',
            completed: false,
            priority: taskData.priority || 'medium',
            category: taskData.category || 'personal',
            dueDate: taskData.dueDate ? this.parseNaturalLanguageDate(taskData.dueDate) : null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            pinned: false,
            tags: [],
            timeEstimate: taskData.timeEstimate || null,
            subtasks: [],
            completedAt: null
        };

        // AI-powered auto-categorization
        if (!taskData.category && this.getSetting('autoCategorization', true)) {
            newTask.category = this.autoCategorizeTask(taskData.title);
        }

        // AI-powered priority suggestion
        if (!taskData.priority && this.getSetting('priorityPrediction', false)) {
            newTask.priority = this.predictPriority(taskData.title);
        }

        this.tasks.unshift(newTask);
        this.saveTasks();
        this.renderTasks();

        // Animate the new task
        this.animateNewTask(newTask.id);

        return newTask;
    }

    updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            const oldTask = {
                ...this.tasks[taskIndex]
            };

            this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            // Handle completion tracking
            if (updates.completed !== undefined) {
                if (updates.completed && !oldTask.completed) {
                    this.tasks[taskIndex].completedAt = new Date().toISOString();
                    this.recordTaskCompletion(this.tasks[taskIndex]);
                } else if (!updates.completed && oldTask.completed) {
                    this.tasks[taskIndex].completedAt = null;
                }
            }

            this.saveTasks();
            this.renderTasks();
            return true;
        }
        return false;
    }

    deleteTask(taskId) {
        this.showConfirmation(
            "Delete Task",
            "Are you sure you want to delete this task?",
            () => {
                this.tasks = this.tasks.filter(task => task.id !== taskId);
                this.saveTasks();
                this.renderTasks();
                this.showNotification('Task deleted successfully', 'success');
            }
        );
    }

    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            const completed = !task.completed;
            this.updateTask(taskId, {
                completed
            });

            if (completed) {
                this.showNotification('Task completed!', 'success');
            }

            // Haptic feedback simulation
            this.triggerHapticFeedback();

            return true;
        }
        return false;
    }

    toggleTaskPin(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.pinned = !task.pinned;
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.renderTasks();

            // Haptic feedback simulation
            this.triggerHapticFeedback();

            return true;
        }
        return false;
    }

    // Natural Language Date Parser
    parseNaturalLanguageDate(dateString) {
        if (!dateString) return null;

        const lowerDate = dateString.toLowerCase().trim();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Handle common date formats
        if (lowerDate === 'today') {
            return today.toISOString().split('T')[0];
        }

        if (lowerDate === 'tomorrow') {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
        }

        if (lowerDate === 'yesterday') {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return yesterday.toISOString().split('T')[0];
        }

        // Handle "next Monday", "next week", etc.
        if (lowerDate.startsWith('next ')) {
            const dayName = lowerDate.replace('next ', '');
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const targetDay = days.indexOf(dayName);

            if (targetDay !== -1) {
                const result = new Date(today);
                const currentDay = today.getDay();
                let daysToAdd = targetDay - currentDay;
                if (daysToAdd <= 0) daysToAdd += 7;
                result.setDate(result.getDate() + daysToAdd);
                return result.toISOString().split('T')[0];
            }
        }

        // Handle standard date formats (YYYY-MM-DD)
        const standardDate = new Date(dateString);
        if (!isNaN(standardDate.getTime())) {
            return standardDate.toISOString().split('T')[0];
        }

        return null;
    }

    autoCategorizeTask(title) {
        const categories = {
            'work': ['meeting', 'project', 'deadline', 'report', 'presentation', 'client', 'proposal', 'email'],
            'personal': ['buy', 'purchase', 'groceries', 'shopping', 'clean', 'home', 'family', 'friend'],
            'health': ['exercise', 'workout', 'gym', 'run', 'yoga', 'meditate', 'doctor', 'appointment', 'diet'],
            'learning': ['read', 'study', 'learn', 'course', 'book', 'research', 'tutorial', 'practice']
        };

        const lowerTitle = title.toLowerCase();

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lowerTitle.includes(keyword))) {
                return category;
            }
        }

        return 'other';
    }

    predictPriority(title) {
        const highPriorityKeywords = ['urgent', 'asap', 'important', 'critical', 'deadline', 'emergency'];
        const lowPriorityKeywords = ['someday', 'maybe', 'optional', 'if time', 'when possible'];

        const lowerTitle = title.toLowerCase();

        if (highPriorityKeywords.some(keyword => lowerTitle.includes(keyword))) {
            return 'high';
        }

        if (lowPriorityKeywords.some(keyword => lowerTitle.includes(keyword))) {
            return 'low';
        }

        return 'medium';
    }

    generateSmartSuggestions(text) {
        const suggestions = [];

        // Time-based suggestions
        const timeMatch = text.match(/(\d+)\s*(m|min|minute|minutes|h|hour|hours)/i);
        if (timeMatch) {
            const timeValue = timeMatch[1];
            const timeUnit = timeMatch[2].toLowerCase();

            let displayTime = timeValue;
            if (timeUnit === 'h' || timeUnit === 'hour' || timeUnit === 'hours') {
                displayTime = `${timeValue}h`;
            } else {
                displayTime = `${timeValue}m`;
            }

            suggestions.push({
                text: `Start ${displayTime} timer`,
                action: () => this.startTimerFromSuggestion(timeValue, timeUnit)
            });
        }

        // Category-based suggestions
        const detectedCategory = this.autoCategorizeTask(text);
        if (detectedCategory !== 'other') {
            const categoryNames = {
                'work': 'Work',
                'personal': 'Personal',
                'health': 'Health',
                'learning': 'Learning'
            };

            suggestions.push({
                text: `Auto-sort to: ${categoryNames[detectedCategory]}`,
                action: () => {
                    document.getElementById('task-category').value = detectedCategory;
                }
            });
        }

        // Priority-based suggestions
        const predictedPriority = this.predictPriority(text);
        if (predictedPriority !== 'medium') {
            const priorityNames = {
                'high': 'High',
                'low': 'Low'
            };

            suggestions.push({
                text: `Set priority to ${priorityNames[predictedPriority]}`,
                action: () => {
                    document.getElementById('task-priority').value = predictedPriority;
                }
            });
        }

        return suggestions;
    }

    // Enhanced UI Rendering
    renderTasks() {
        this.renderTaskList('recent-tasks-list', this.tasks.slice(0, 3));
        this.renderTaskList('all-tasks-list', this.tasks);
        this.renderTaskList('today-tasks-list', this.getTodaysTasks());

        // Update today's tasks count
        const todayTasks = this.getTodaysTasks();
        document.getElementById('today-tasks-count').textContent = `${todayTasks.length} tasks`;
    }

    renderTaskList(containerId, tasks) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: var(--space-xl);">
                    <div class="material-symbols-outlined" style="font-size: 3rem; opacity: 0.5; margin-bottom: var(--space-md);">task_alt</div>
                    <div class="body-medium">No tasks found</div>
                </div>
            `;
            return;
        }

        tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            container.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''} ${task.pinned ? 'pinned' : ''}`;
        taskElement.setAttribute('data-task-id', task.id);

        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isToday = dueDate && dueDate.toDateString() === new Date().toDateString();
        const isOverdue = dueDate && dueDate < new Date() && !task.completed;

        let dueDateText = '';
        if (dueDate) {
            if (isToday) {
                dueDateText = 'Today';
            } else if (isOverdue) {
                dueDateText = 'Overdue';
            } else {
                dueDateText = dueDate.toLocaleDateString();
            }
        }

        // Apply content filtering if enabled
        let title = task.title;
        let description = task.description;

        if (this.getSetting('contentFiltering', true)) {
            title = this.filterSensitiveContent(title);
            description = this.filterSensitiveContent(description);
        }

        taskElement.innerHTML = `
            <div class="task-checkbox"></div>
            <div class="task-content">
                <div class="task-title">${title}</div>
                ${description ? `<div class="task-description">${description}</div>` : ''}
                <div class="task-meta">
                    <div class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</div>
                    <div class="task-category">${this.formatCategory(task.category)}</div>
                    ${dueDateText ? `
                        <div class="task-time ${isOverdue ? 'priority-high' : ''}">
                            <span class="material-symbols-outlined">schedule</span>
                            ${dueDateText}
                        </div>
                    ` : ''}
                    ${task.timeEstimate ? `
                        <div class="task-time-estimate">
                            <span class="material-symbols-outlined">timer</span>
                            ${task.timeEstimate}
                        </div>
                    ` : ''}
                    ${task.pinned ? `<div class="chip" style="background-color: var(--dynamic-primary-light); color: var(--dynamic-primary);">Pinned</div>` : ''}
                </div>
            </div>
            <div class="task-actions">
                ${task.timeEstimate ? `
                    <div class="task-action" data-action="timer">
                        <span class="material-symbols-outlined">timer</span>
                    </div>
                ` : ''}
                <div class="task-action" data-action="pin">
                    <span class="material-symbols-outlined">${task.pinned ? 'push_pin' : 'push_pin'}</span>
                </div>
                <div class="task-action" data-action="edit">
                    <span class="material-symbols-outlined">edit</span>
                </div>
                <div class="task-action" data-action="delete">
                    <span class="material-symbols-outlined">delete</span>
                </div>
            </div>
        `;

        // Add event listeners
        taskElement.addEventListener('click', (e) => {
            if (!e.target.closest('.task-actions')) {
                this.toggleTaskCompletion(task.id);
            }
        });

        const timerButton = taskElement.querySelector('[data-action="timer"]');
        if (timerButton) {
            timerButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.startTimerFromTask(task);
            });
        }

        const pinButton = taskElement.querySelector('[data-action="pin"]');
        pinButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleTaskPin(task.id);
        });

        const editButton = taskElement.querySelector('[data-action="edit"]');
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditTaskModal(task.id);
        });

        const deleteButton = taskElement.querySelector('[data-action="delete"]');
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteTask(task.id);
        });

        // Add click handlers for blurred text
        const blurredElements = taskElement.querySelectorAll('.blurred-text');
        blurredElements.forEach(el => {
            el.addEventListener('click', () => {
                el.classList.toggle('revealed');
            });
        });

        return taskElement;
    }

    filterSensitiveContent(text) {
        if (!text) return text;

        let filteredText = text;
        this.sensitiveWords.forEach(word => {
            const regex = new RegExp(word, 'gi');
            filteredText = filteredText.replace(regex, match => {
                return `<span class="blurred-text">${match}</span>`;
            });
        });

        return filteredText;
    }

    formatCategory(category) {
        const categoryNames = {
            'work': 'Work',
            'personal': 'Personal',
            'health': 'Health',
            'learning': 'Learning',
            'other': 'Other'
        };

        return categoryNames[category] || category;
    }

    getTodaysTasks() {
        const today = new Date().toDateString();
        return this.tasks.filter(task => {
            if (task.completed) return false;

            if (task.dueDate) {
                const dueDate = new Date(task.dueDate).toDateString();
                return dueDate === today;
            }

            return false;
        });
    }

    // Break Mode Functionality
    startBreakMode() {
        this.isBreakActive = true;
        document.getElementById('break-mode').classList.add('active');

        // Set break duration from settings
        const breakDuration = parseInt(this.getSetting('breakDuration', 5));
        this.breakTimerSeconds = breakDuration * 60;
        this.updateBreakTimerDisplay();

        // Show random break quote
        this.showRandomBreakQuote();

        // Start break timer
        this.startBreakTimer();
    }

    stopBreakMode() {
        this.isBreakActive = false;
        document.getElementById('break-mode').classList.remove('active');
        this.stopBreakTimer();
        this.stopBreathingAnimation();
    }

    startBreakTimer() {
        this.breakTimerInterval = setInterval(() => {
            this.breakTimerSeconds--;
            this.updateBreakTimerDisplay();

            if (this.breakTimerSeconds <= 0) {
                this.breakTimerComplete();
            }
        }, 1000);
    }

    stopBreakTimer() {
        clearInterval(this.breakTimerInterval);
    }

    updateBreakTimerDisplay() {
        const minutes = Math.floor(this.breakTimerSeconds / 60);
        const seconds = this.breakTimerSeconds % 60;
        document.getElementById('break-timer').textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    breakTimerComplete() {
        this.stopBreakTimer();
        this.showNotification('Break time is over! Time to get back to work.', 'info');
        this.stopBreakMode();
    }

    showRandomBreakQuote() {
        const randomIndex = Math.floor(Math.random() * this.breakQuotes.length);
        document.getElementById('break-quote').textContent = this.breakQuotes[randomIndex];
    }

    startBreathingAnimation() {
        if (this.isBreathingActive) {
            this.stopBreathingAnimation();
            return;
        }

        this.isBreathingActive = true;
        const animation = document.getElementById('breathing-animation');
        animation.classList.add('breathing-in');

        let isInhaling = true;
        this.breathingInterval = setInterval(() => {
            if (isInhaling) {
                animation.classList.remove('breathing-out');
                animation.classList.add('breathing-in');
            } else {
                animation.classList.remove('breathing-in');
                animation.classList.add('breathing-out');
            }
            isInhaling = !isInhaling;
        }, 4000);
    }

    stopBreathingAnimation() {
        this.isBreathingActive = false;
        clearInterval(this.breathingInterval);
        const animation = document.getElementById('breathing-animation');
        animation.classList.remove('breathing-in', 'breathing-out');
    }

    // Enhanced Analytics with Real Data
    setupChart() {
        const ctx = document.getElementById('analytics-chart');
        if (!ctx) return;

        if (this.analyticsChart) {
            this.analyticsChart.destroy();
        }

        const chartData = this.getChartData();

        this.analyticsChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'var(--dynamic-outline-variant)'
                        },
                        ticks: {
                            color: 'var(--dynamic-on-surface-variant)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'var(--dynamic-outline-variant)'
                        },
                        ticks: {
                            color: 'var(--dynamic-on-surface-variant)'
                        }
                    }
                }
            }
        });

        this.updateAnalyticsInsights();
    }

    getChartData() {
        // Generate real data based on task completion history
        const last7Days = this.getLast7Days();
        const completedData = last7Days.map(day =>
            this.getTasksCompletedOnDate(day) || 0
        );

        const createdData = last7Days.map(day =>
            this.getTasksCreatedOnDate(day) || 0
        );

        return {
            labels: last7Days.map(day => {
                const date = new Date(day);
                return date.toLocaleDateString('en-US', {
                    weekday: 'short'
                });
            }),
            datasets: [{
                    label: 'Tasks Completed',
                    data: completedData,
                    borderColor: 'var(--md-success)',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Tasks Created',
                    data: createdData,
                    borderColor: 'var(--dynamic-primary)',
                    backgroundColor: 'rgba(0, 122, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        };
    }

    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    }

    getTasksCompletedOnDate(dateString) {
        return this.tasks.filter(task =>
            task.completed && task.completedAt &&
            task.completedAt.startsWith(dateString)
        ).length;
    }

    getTasksCreatedOnDate(dateString) {
        return this.tasks.filter(task =>
            task.createdAt.startsWith(dateString)
        ).length;
    }

    recordTaskCompletion(task) {
        const today = new Date().toISOString().split('T')[0];
        if (!this.taskCompletionHistory[today]) {
            this.taskCompletionHistory[today] = 0;
        }
        this.taskCompletionHistory[today]++;
        this.saveTaskCompletionHistory();
    }

    updateAnalytics() {
        if (!this.analyticsChart) return;

        const chartData = this.getChartData();
        this.analyticsChart.data = chartData;
        this.analyticsChart.update();

        this.updateAnalyticsStats();
        this.updateAnalyticsInsights();
    }

    updateAnalyticsStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Calculate tasks per week
        const last7DaysTasks = this.tasks.filter(task => {
            const taskDate = new Date(task.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return taskDate >= weekAgo;
        }).length;

        const tasksPerWeek = (last7DaysTasks / 7 * 7).toFixed(1); // Normalize to weekly rate

        // Calculate on-time rate (tasks completed before or on due date)
        const tasksWithDueDates = this.tasks.filter(task => task.dueDate && task.completed);
        const onTimeTasks = tasksWithDueDates.filter(task => {
            const dueDate = new Date(task.dueDate);
            const completedDate = new Date(task.completedAt);
            return completedDate <= dueDate;
        }).length;

        const onTimeRate = tasksWithDueDates.length > 0 ?
            Math.round((onTimeTasks / tasksWithDueDates.length) * 100) : 0;

        document.getElementById('completion-rate').textContent = `${completionRate}%`;
        document.getElementById('tasks-per-week').textContent = tasksPerWeek;
        document.getElementById('on-time-rate').textContent = `${onTimeRate}%`;
    }

    updateAnalyticsInsights() {
        const insightsContainer = document.getElementById('analytics-insights');
        if (!insightsContainer) return;

        const insights = this.generateAnalyticsInsights();

        insightsContainer.innerHTML = insights.map(insight => `
            <div class="insight-item">
                <div class="insight-icon ${insight.type}">
                    <span class="material-symbols-outlined">${insight.icon}</span>
                </div>
                <div class="insight-content">
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-description">${insight.description}</div>
                </div>
            </div>
        `).join('');
    }

    generateAnalyticsInsights() {
        const insights = [];
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Completion rate insight
        if (completionRate >= 80) {
            insights.push({
                type: 'positive',
                icon: 'trending_up',
                title: 'Excellent Completion Rate',
                description: `You're completing ${completionRate}% of your tasks. Keep up the great work!`
            });
        } else if (completionRate >= 60) {
            insights.push({
                type: 'info',
                icon: 'insights',
                title: 'Good Progress',
                description: `You've completed ${completionRate}% of tasks. Focus on prioritizing important tasks.`
            });
        } else {
            insights.push({
                type: 'warning',
                icon: 'warning',
                title: 'Room for Improvement',
                description: `Only ${completionRate}% of tasks completed. Try breaking down larger tasks.`
            });
        }

        // Overdue tasks insight
        const overdueTasks = this.tasks.filter(task => {
            if (task.completed || !task.dueDate) return false;
            return new Date(task.dueDate) < new Date();
        }).length;

        if (overdueTasks > 0) {
            insights.push({
                type: 'warning',
                icon: 'schedule',
                title: `${overdueTasks} Overdue Task${overdueTasks > 1 ? 's' : ''}`,
                description: 'Consider rescheduling or prioritizing these tasks.'
            });
        }

        // Productivity trend insight
        const recentCompleted = this.getTasksCompletedLastNDays(3);
        const previousCompleted = this.getTasksCompletedLastNDays(6, 3);

        if (recentCompleted > previousCompleted) {
            insights.push({
                type: 'positive',
                icon: 'rocket_launch',
                title: 'Productivity Increasing',
                description: 'You\'re completing more tasks recently. Great momentum!'
            });
        }

        return insights;
    }

    getTasksCompletedLastNDays(days, offset = 0) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - offset);
        endDate.setHours(23, 59, 59, 999);

        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        return this.tasks.filter(task =>
            task.completed &&
            task.completedAt &&
            new Date(task.completedAt) >= startDate &&
            new Date(task.completedAt) <= endDate
        ).length;
    }

    // Enhanced Dashboard with Real Data
    updateDashboardSummary() {
        const todayTasks = this.getTodaysTasks();
        const completedToday = todayTasks.filter(task => task.completed).length;
        const totalToday = todayTasks.length;

        let summaryText = '';

        if (totalToday === 0) {
            summaryText = 'No tasks scheduled for today. Enjoy your day!';
        } else if (completedToday === totalToday) {
            summaryText = 'All tasks completed for today! Great job!';
        } else {
            const remaining = totalToday - completedToday;
            summaryText = `You have <strong>${remaining} task${remaining > 1 ? 's' : ''}</strong> remaining today. ${completedToday > 0 ? `${completedToday} already completed.` : ''}`;
        }

        document.getElementById('dashboard-summary').innerHTML = summaryText;
    }

    // Enhanced Settings Management
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('lantask-pro-settings') || '{}');

        // Apply settings to UI
        document.getElementById('font-size-select').value = this.getSetting('fontSize', 'medium');
        document.getElementById('task-reminders-toggle').checked = this.getSetting('taskReminders', true);
        document.getElementById('daily-digest-toggle').checked = this.getSetting('dailyDigest', false);
        document.getElementById('auto-categorization-toggle').checked = this.getSetting('autoCategorization', true);
        document.getElementById('smart-suggestions-toggle').checked = this.getSetting('smartSuggestions', true);
        document.getElementById('priority-prediction-toggle').checked = this.getSetting('priorityPrediction', false);
        document.getElementById('content-filtering-toggle').checked = this.getSetting('contentFiltering', true);
        document.getElementById('default-sort').value = this.getSetting('defaultSort', 'created');
        document.getElementById('group-by-category-toggle').checked = this.getSetting('groupByCategory', true);
        document.getElementById('block-distractions-toggle').checked = this.getSetting('blockDistractions', true);
        document.getElementById('focus-music-toggle').checked = this.getSetting('focusMusic', false);
        document.getElementById('motivational-quotes-toggle').checked = this.getSetting('motivationalQuotes', true);

        // Load focus and break durations
        document.getElementById('focus-duration').value = this.getSetting('focusDuration', 45);
        document.getElementById('break-duration').value = this.getSetting('breakDuration', 10);

        // Apply settings
        this.applyFontSize();
    }

    saveSetting(key, value) {
        const settings = JSON.parse(localStorage.getItem('lantask-pro-settings') || '{}');
        settings[key] = value;
        localStorage.setItem('lantask-pro-settings', JSON.stringify(settings));

        // Apply certain settings immediately
        if (key === 'fontSize') {
            this.applyFontSize();
        } else if (key === 'focusDuration') {
            this.focusTimerSeconds = value * 60;
            this.updateFocusTimerDisplay();
        }
    }

    getSetting(key, defaultValue) {
        const settings = JSON.parse(localStorage.getItem('lantask-pro-settings') || '{}');
        return settings[key] !== undefined ? settings[key] : defaultValue;
    }

    applyFontSize() {
        const fontSize = this.getSetting('fontSize', 'medium');
        document.body.classList.remove('font-small', 'font-medium', 'font-large');
        document.body.classList.add(`font-${fontSize}`);
    }

    // Enhanced Timer System
    startTimerFromSuggestion(value, unit) {
        let seconds = parseInt(value);

        if (unit === 'h' || unit === 'hour' || unit === 'hours') {
            seconds *= 3600;
        } else {
            seconds *= 60;
        }

        this.focusTimerSeconds = seconds;
        this.updateFocusTimerDisplay();
        this.closeTaskModal();
        this.closeSearchPage();

        this.navigateToPage('focus');

        if (!this.isFocusTimerRunning) {
            this.startFocusTimer();
        }

        this.showNotification(`Timer started for ${value}${unit === 'h' ? 'h' : 'm'}`, 'success');
    }

    setTimerFromSuggestion(value, unit) {
        let seconds = parseInt(value);

        if (unit === 'h' || unit === 'hour' || unit === 'hours') {
            seconds *= 3600;
        } else {
            seconds *= 60;
        }

        this.focusTimerSeconds = seconds;
        this.updateFocusTimerDisplay();
        this.closeTaskModal();
        this.closeSearchPage();

        // Navigate to focus mode
        this.navigateToPage('focus');

        this.showNotification(`Timer set for ${value}${unit === 'h' ? 'h' : 'm'}`, 'info');
    }

    startTimerFromTask(task) {
        if (task.timeEstimate) {
            const timeMatch = task.timeEstimate.match(/(\d+)\s*(m|min|minute|minutes|h|hour|hours)/i);
            if (timeMatch) {
                const timeValue = timeMatch[1];
                const timeUnit = timeMatch[2].toLowerCase();

                let seconds = parseInt(timeValue);

                if (timeUnit === 'h' || timeUnit === 'hour' || timeUnit === 'hours') {
                    seconds *= 3600;
                } else {
                    seconds *= 60;
                }

                this.focusTimerSeconds = seconds;
                this.updateFocusTimerDisplay();

                // Navigate to focus mode
                this.navigateToPage('focus');

                // Start the timer automatically
                if (!this.isFocusTimerRunning) {
                    this.startFocusTimer();
                }
            }
        }
    }

    startFocusTimer() {
        this.isFocusTimerRunning = true;

        const startButton = document.getElementById('start-focus-timer');
        if (startButton) {
            startButton.innerHTML = '<span class="material-symbols-outlined" style="margin-right: var(--space-xs);">pause</span> Pause';
            startButton.setAttribute('data-action', 'pause');
        }

        const fullscreenButton = document.getElementById('pause-fullscreen-timer');
        if (fullscreenButton) {
            fullscreenButton.innerHTML = '<span class="material-symbols-outlined" style="margin-right: var(--space-xs);">pause</span> Pause';
        }

        this.updateFocusTimerDisplay();

        this.focusTimerInterval = setInterval(() => {
            this.focusTimerSeconds--;
            this.updateFocusTimerDisplay();

            if (this.focusTimerSeconds <= 0) {
                this.focusTimerComplete();
            }
        }, 1000);

        // Show active timer on dashboard
        this.showActiveTimer();

        // Haptic feedback
        this.triggerHapticFeedback();
    }

    pauseFocusTimer() {
        this.isFocusTimerRunning = false;

        const startButton = document.getElementById('start-focus-timer');
        if (startButton) {
            startButton.innerHTML = '<span class="material-symbols-outlined" style="margin-right: var(--space-xs);">play_arrow</span> Resume';
            startButton.setAttribute('data-action', 'start');
        }

        const fullscreenButton = document.getElementById('pause-fullscreen-timer');
        if (fullscreenButton) {
            fullscreenButton.innerHTML = '<span class="material-symbols-outlined" style="margin-right: var(--space-xs);">play_arrow</span> Resume';
        }

        clearInterval(this.focusTimerInterval);

        // Haptic feedback
        this.triggerHapticFeedback();
    }

    stopFocusTimer() {
        this.isFocusTimerRunning = false;
        const duration = parseInt(document.getElementById('focus-duration').value);
        this.focusTimerSeconds = duration * 60;
        this.updateFocusTimerDisplay();

        const startButton = document.getElementById('start-focus-timer');
        if (startButton) {
            startButton.innerHTML = '<span class="material-symbols-outlined" style="margin-right: var(--space-xs);">play_arrow</span> Start Focus';
            startButton.setAttribute('data-action', 'start');
        }

        clearInterval(this.focusTimerInterval);

        // Hide active timer on dashboard
        this.hideActiveTimer();

        // Exit fullscreen timer if active
        if (this.isFullscreenTimerActive) {
            this.exitFullscreenTimer();
        }

        // Haptic feedback
        this.triggerHapticFeedback();
    }

    updateFocusTimerDisplay() {
        const minutes = Math.floor(this.focusTimerSeconds / 60);
        const seconds = this.focusTimerSeconds % 60;

        const timerDisplay = document.getElementById('focus-timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        const fullscreenDisplay = document.getElementById('fullscreen-timer-display');
        if (fullscreenDisplay) {
            fullscreenDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        const dashboardDisplay = document.getElementById('dashboard-timer-display');
        if (dashboardDisplay) {
            dashboardDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        // Update progress bar
        const duration = parseInt(document.getElementById('focus-duration').value);
        const totalSeconds = duration * 60;
        const progress = ((totalSeconds - this.focusTimerSeconds) / totalSeconds) * 100;
        const timerProgress = document.getElementById('focus-timer-progress');
        if (timerProgress) {
            timerProgress.style.width = `${progress}%`;
        }

        const dashboardProgress = document.getElementById('dashboard-timer-progress');
        if (dashboardProgress) {
            dashboardProgress.style.width = `${progress}%`;
        }
    }

    focusTimerComplete() {
        this.focusTimerSeconds = 0;
        this.updateFocusTimerDisplay();
        this.isFocusTimerRunning = false;

        clearInterval(this.focusTimerInterval);

        // Show completion notification
        this.showNotification('Focus session completed! Time for a break.', 'success');

        // Haptic feedback
        this.triggerHapticFeedback('success');

        // Hide active timer on dashboard
        this.hideActiveTimer();

        // Exit fullscreen timer if active
        if (this.isFullscreenTimerActive) {
            this.exitFullscreenTimer();
        }

        // Reset timer after a delay
        setTimeout(() => {
            const duration = parseInt(document.getElementById('focus-duration').value);
            this.focusTimerSeconds = duration * 60;
            this.updateFocusTimerDisplay();

            const startButton = document.getElementById('start-focus-timer');
            if (startButton) {
                startButton.innerHTML = '<span class="material-symbols-outlined" style="margin-right: var(--space-xs);">play_arrow</span> Start Focus';
                startButton.setAttribute('data-action', 'start');
            }
        }, 3000);
    }

    showActiveTimer() {
        const activeTimerCard = document.getElementById('active-timer-card');
        if (activeTimerCard) {
            activeTimerCard.style.display = 'block';
        }
    }

    hideActiveTimer() {
        const activeTimerCard = document.getElementById('active-timer-card');
        if (activeTimerCard) {
            activeTimerCard.style.display = 'none';
        }
    }

    checkActiveTimer() {
        if (this.isFocusTimerRunning) {
            this.showActiveTimer();
        } else {
            this.hideActiveTimer();
        }
    }

    enterFullscreenTimer() {
        this.isFullscreenTimerActive = true;
        document.getElementById('fullscreen-timer').classList.add('active');

        // Show music controls if enabled
        if (this.getSetting('focusMusic', false)) {
            document.getElementById('focus-music-container').style.display = 'block';
        }

        // Show motivational quote if enabled
        if (this.getSetting('motivationalQuotes', true)) {
            this.showRandomQuote();
        }
    }

    exitFullscreenTimer() {
        this.isFullscreenTimerActive = false;
        document.getElementById('fullscreen-timer').classList.remove('active');

        // Stop music if playing
        if (this.isMusicPlaying) {
            this.stopMusic();
        }
    }

    // Focus Music System
    toggleMusic() {
        if (this.isMusicPlaying) {
            this.stopMusic();
        } else {
            this.playMusic();
        }
    }

    playMusic() {
        this.audio.src = this.focusMusic[this.currentTrack].src;
        this.audio.play();
        this.isMusicPlaying = true;

        const playButton = document.getElementById('play-music');
        if (playButton) {
            playButton.innerHTML = '<span class="material-symbols-outlined">pause</span>';
        }
    }

    stopMusic() {
        this.audio.pause();
        this.isMusicPlaying = false;

        const playButton = document.getElementById('play-music');
        if (playButton) {
            playButton.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
        }
    }

    nextTrack() {
        this.currentTrack = (this.currentTrack + 1) % this.focusMusic.length;
        if (this.isMusicPlaying) {
            this.playMusic();
        }
    }

    prevTrack() {
        this.currentTrack = (this.currentTrack - 1 + this.focusMusic.length) % this.focusMusic.length;
        if (this.isMusicPlaying) {
            this.playMusic();
        }
    }

    showRandomQuote() {
        const randomIndex = Math.floor(Math.random() * this.motivationalQuotes.length);
        const quoteElement = document.getElementById('motivational-quote');
        if (quoteElement) {
            quoteElement.textContent = this.motivationalQuotes[randomIndex];
        }
    }

    // Search functionality with enhanced commands
    searchTasks(query) {
        if (!query) return [];

        const lowerQuery = query.toLowerCase();

        // Check for timer commands
        if (lowerQuery.includes('start') || lowerQuery.includes('timer')) {
            const timeMatch = query.match(/(\d+)\s*(m|min|minute|minutes|h|hour|hours)/i);
            if (timeMatch) {
                const timeValue = timeMatch[1];
                const timeUnit = timeMatch[2].toLowerCase();

                // Check if it's a reserve/set command or start command
                if (lowerQuery.includes('reserve') || lowerQuery.includes('set')) {
                    this.setTimerFromSuggestion(timeValue, timeUnit);
                } else {
                    this.startTimerFromSuggestion(timeValue, timeUnit);
                }

                // Close search after action
                setTimeout(() => {
                    this.closeSearchPage();
                }, 500);

                return [];
            }
        }

        // Check for timer control commands
        if (lowerQuery.includes('stop') || lowerQuery.includes('pause')) {
            if (lowerQuery.includes('timer')) {
                if (this.isFocusTimerRunning) {
                    this.pauseFocusTimer();
                    this.showNotification('Timer paused', 'info');
                }
                setTimeout(() => {
                    this.closeSearchPage();
                }, 500);
                return [];
            }
        }

        // Regular task search
        return this.tasks.filter(task =>
            task.title.toLowerCase().includes(lowerQuery) ||
            (task.description && task.description.toLowerCase().includes(lowerQuery))
        );
    }

    renderSearchResults(query) {
        const resultsContainer = document.getElementById('search-results-list');
        const carouselContainer = document.getElementById('suggestion-carousel');

        resultsContainer.innerHTML = '';
        carouselContainer.innerHTML = '';

        const results = this.searchTasks(query);

        if (results.length === 0 && query.trim() !== '') {
            resultsContainer.innerHTML = `
                <div class="empty-state" style="padding: var(--space-lg);">
                    <div class="material-symbols-outlined" style="font-size: 2rem; opacity: 0.5; margin-bottom: var(--space-md);">search_off</div>
                    <div class="body-medium">No tasks found for "${query}"</div>
                </div>
            `;
        } else if (results.length > 0) {
            results.forEach(task => {
                const taskElement = this.createTaskElement(task);
                resultsContainer.appendChild(taskElement);
            });
        }

        // Generate smart suggestions
        this.generateSearchSuggestions(query, carouselContainer);
    }

    generateSearchSuggestions(query, container) {
        const suggestions = [];

        // Time-based suggestions
        const timeMatch = query.match(/(\d+)\s*(m|min|minute|minutes|h|hour|hours)/i);
        if (timeMatch) {
            const timeValue = timeMatch[1];
            const timeUnit = timeMatch[2].toLowerCase();

            let displayTime = timeValue;
            if (timeUnit === 'h' || timeUnit === 'hour' || timeUnit === 'hours') {
                displayTime = `${timeValue}h`;
            } else {
                displayTime = `${timeValue}m`;
            }

            suggestions.push({
                title: `Start ${displayTime} Timer`,
                description: `Focus for ${displayTime}`,
                icon: 'timer',
                action: () => this.startTimerFromSuggestion(timeValue, timeUnit)
            });

            suggestions.push({
                title: `Reserve ${displayTime}`,
                description: `Set timer for ${displayTime}`,
                icon: 'schedule',
                action: () => this.setTimerFromSuggestion(timeValue, timeUnit)
            });
        }

        // Quick task creation
        if (query.trim() !== '' && !timeMatch) {
            suggestions.push({
                title: `Create Task: ${query}`,
                description: 'Quickly add this as a task',
                icon: 'add_task',
                action: () => {
                    document.getElementById('task-title').value = query;
                    this.closeSearchPage();
                    this.openTaskModal();
                }
            });
        }

        // Timer control suggestions
        if (this.isFocusTimerRunning) {
            suggestions.push({
                title: 'Pause Timer',
                description: 'Pause the current timer',
                icon: 'pause',
                action: () => {
                    this.pauseFocusTimer();
                    this.closeSearchPage();
                }
            });

            suggestions.push({
                title: 'Stop Timer',
                description: 'Stop the current timer',
                icon: 'stop',
                action: () => {
                    this.stopFocusTimer();
                    this.closeSearchPage();
                }
            });
        }

        // Render suggestions as carousel items
        suggestions.forEach(suggestion => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'suggestion-card';
            suggestionElement.innerHTML = `
                <div class="suggestion-icon">
                    <span class="material-symbols-outlined">${suggestion.icon}</span>
                </div>
                <div class="suggestion-title">${suggestion.title}</div>
                <div class="suggestion-description">${suggestion.description}</div>
            `;
            suggestionElement.addEventListener('click', () => {
                suggestion.action();
                this.closeSearchPage();
            });
            container.appendChild(suggestionElement);
        });
    }

    // Enhanced Theme System with Dark Mode Support
    applyTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('selectedTheme', theme);

        // Update theme selector if open
        this.updateThemeSelector(theme);

        // Apply theme-specific adjustments based on current dark mode
        const isDark = this.darkModeManager.getCurrentMode();
        this.adjustThemeForColorScheme(isDark);

        // Show notification
        this.showNotification(`Theme changed to ${theme}`, 'success');
    }

    adjustThemeForColorScheme(isDark) {
        // Special adjustments for specific themes in dark/light mode
        const theme = this.currentTheme;

        if (isDark) {
            // Dark mode adjustments per theme
            switch (theme) {
                case 'space-black':
                    // Space black is already dark, ensure it stays consistent
                    document.documentElement.style.setProperty('--dynamic-background', '#000000');
                    break;
                case 'gold':
                    // Adjust gold for better contrast in dark mode
                    document.documentElement.style.setProperty('--dynamic-primary', '#FFD700');
                    break;
                    // Add other theme-specific dark mode adjustments as needed
            }
        } else {
            // Light mode adjustments per theme
            switch (theme) {
                case 'space-black':
                    // Space black in light mode becomes a light gray theme
                    document.documentElement.style.setProperty('--dynamic-background', '#FFFFFF');
                    document.documentElement.style.setProperty('--dynamic-surface', '#F2F2F7');
                    break;
                    // Add other theme-specific light mode adjustments as needed
            }
        }
    }

    updateThemeSelector(theme) {
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.theme === theme);
        });
    }

    // Confirmation System
    showConfirmation(title, message, confirmAction) {
        this.confirmationAction = confirmAction;
        this.confirmationSeconds = 5;

        document.getElementById('confirmation-title').textContent = title;
        document.getElementById('confirmation-message').textContent = message;
        document.getElementById('confirmation-timer').textContent = this.confirmationSeconds;

        document.getElementById('confirmation-modal').classList.add('active');

        this.confirmationTimer = setInterval(() => {
            this.confirmationSeconds--;
            document.getElementById('confirmation-timer').textContent = this.confirmationSeconds;

            if (this.confirmationSeconds <= 0) {
                clearInterval(this.confirmationTimer);
                this.hideConfirmation();
            }
        }, 1000);
    }

    hideConfirmation() {
        document.getElementById('confirmation-modal').classList.remove('active');
        clearInterval(this.confirmationTimer);
    }

    confirmAction() {
        if (this.confirmationAction) {
            this.confirmationAction();
        }
        this.hideConfirmation();
    }

    // Stats and Analytics
    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = this.tasks.filter(task => !task.completed).length;
        const overdueTasks = this.tasks.filter(task => {
            if (task.completed || !task.dueDate) return false;
            return new Date(task.dueDate) < new Date();
        }).length;

        // Update dashboard stats
        document.getElementById('total-tasks-count').textContent = totalTasks;
        document.getElementById('completed-tasks-count').textContent = completedTasks;
        document.getElementById('pending-tasks-count').textContent = pendingTasks;
        document.getElementById('overdue-tasks-count').textContent = overdueTasks;

        // Update modal stats
        document.getElementById('modal-total-tasks').textContent = totalTasks;
        document.getElementById('modal-completed-tasks').textContent = completedTasks;
        document.getElementById('modal-pending-tasks').textContent = pendingTasks;
        document.getElementById('modal-overdue-tasks').textContent = overdueTasks;
    }

    // Import/Export functionality
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], {
            type: 'application/json'
        });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'lantask-pro-tasks.json';
        link.click();

        this.showNotification('Tasks exported successfully', 'success');
    }

    importTasks(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTasks = JSON.parse(e.target.result);
                this.showConfirmation(
                    "Import Tasks",
                    "This will replace your current tasks. Are you sure?",
                    () => {
                        this.tasks = importedTasks;
                        this.saveTasks();
                        this.renderTasks();
                        this.showNotification('Tasks imported successfully', 'success');
                    }
                );
            } catch (error) {
                this.showNotification('Error importing tasks: Invalid file format', 'error');
            }
        };
        reader.readAsText(file);

        // Reset file input
        event.target.value = '';
    }

    clearCompletedTasks() {
        this.showConfirmation(
            "Clear Completed Tasks",
            "This will permanently delete all completed tasks. This action cannot be undone.",
            () => {
                this.tasks = this.tasks.filter(task => !task.completed);
                this.saveTasks();
                this.renderTasks();
                this.showNotification('Completed tasks cleared', 'success');
            }
        );
    }

    clearAllData() {
        this.showConfirmation(
            "Clear All Data",
            "This will reset the application and delete all your tasks and settings. This action cannot be undone.",
            () => {
                localStorage.removeItem('lantask-pro-tasks');
                localStorage.removeItem('lantask-pro-settings');
                localStorage.removeItem('selectedTheme');
                localStorage.removeItem('lantask-pro-greeting');
                localStorage.removeItem('lantask-pro-activity');
                localStorage.removeItem('lantask-pro-completion-history');
                this.tasks = [];
                this.userActivity = this.loadUserActivity();
                this.taskCompletionHistory = this.loadTaskCompletionHistory();
                this.saveTasks();
                this.renderTasks();
                this.showNotification('All data cleared', 'success');
            }
        );
    }

    // Enhanced Animations
    animateNewTask(taskId) {
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.classList.add('spring-slide-up');
        }
    }

    // Enhanced Event Handlers
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                this.navigateToPage(page);
            });
        });

        // Sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.getElementById('menu-button').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Search functionality
        document.getElementById('search-button').addEventListener('click', () => {
            this.openSearchPage();
        });

        document.getElementById('back-button').addEventListener('click', () => {
            this.closeSearchPage();
        });

        document.getElementById('search-input').addEventListener('input', (e) => {
            this.renderSearchResults(e.target.value);
        });

        // Stats modal
        document.getElementById('stats-modal-button').addEventListener('click', () => {
            this.openStatsModal();
        });

        document.getElementById('close-stats-modal').addEventListener('click', () => {
            this.closeStatsModal();
        });

        // FAB and task modal
        document.getElementById('add-task-fab').addEventListener('click', () => {
            this.openTaskModal();
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeTaskModal();
        });

        document.getElementById('cancel-task').addEventListener('click', () => {
            this.closeTaskModal();
        });

        document.getElementById('save-task').addEventListener('click', () => {
            this.saveNewTask();
        });

        // Task input for suggestions
        document.getElementById('task-title').addEventListener('input', (e) => {
            this.handleTaskInput(e.target.value);
        });

        // Focus timer controls
        document.getElementById('start-focus-timer').addEventListener('click', () => {
            if (this.isFocusTimerRunning) {
                this.pauseFocusTimer();
            } else {
                this.startFocusTimer();
            }
        });

        document.getElementById('fullscreen-timer-button').addEventListener('click', () => {
            this.enterFullscreenTimer();
        });

        // Fullscreen timer controls
        document.getElementById('pause-fullscreen-timer').addEventListener('click', () => {
            if (this.isFocusTimerRunning) {
                this.pauseFocusTimer();
            } else {
                this.startFocusTimer();
            }
        });

        document.getElementById('stop-fullscreen-timer').addEventListener('click', () => {
            this.stopFocusTimer();
        });

        // Music controls
        document.getElementById('play-music').addEventListener('click', () => {
            this.toggleMusic();
        });

        document.getElementById('next-track').addEventListener('click', () => {
            this.nextTrack();
        });

        document.getElementById('prev-track').addEventListener('click', () => {
            this.prevTrack();
        });

        // Confirmation modal
        document.getElementById('confirmation-cancel').addEventListener('click', () => {
            this.hideConfirmation();
        });

        document.getElementById('confirmation-confirm').addEventListener('click', () => {
            this.confirmAction();
        });

        // Theme selector
        document.getElementById('theme-selector-button').addEventListener('click', () => {
            this.openThemeModal();
        });

        document.getElementById('close-theme-modal').addEventListener('click', () => {
            this.closeThemeModal();
        });

        document.getElementById('apply-theme').addEventListener('click', () => {
            this.applySelectedTheme();
        });

        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                option.classList.add('active');
            });
        });

        // Settings toggles (excluding dark mode which is handled by DarkModeManager)
        document.getElementById('font-size-select').addEventListener('change', (e) => {
            this.saveSetting('fontSize', e.target.value);
        });

        document.getElementById('task-reminders-toggle').addEventListener('change', (e) => {
            this.saveSetting('taskReminders', e.target.checked);
        });

        document.getElementById('daily-digest-toggle').addEventListener('change', (e) => {
            this.saveSetting('dailyDigest', e.target.checked);
        });

        document.getElementById('auto-categorization-toggle').addEventListener('change', (e) => {
            this.saveSetting('autoCategorization', e.target.checked);
        });

        document.getElementById('smart-suggestions-toggle').addEventListener('change', (e) => {
            this.saveSetting('smartSuggestions', e.target.checked);
        });

        document.getElementById('priority-prediction-toggle').addEventListener('change', (e) => {
            this.saveSetting('priorityPrediction', e.target.checked);
        });

        document.getElementById('content-filtering-toggle').addEventListener('change', (e) => {
            this.saveSetting('contentFiltering', e.target.checked);
        });

        document.getElementById('default-sort').addEventListener('change', (e) => {
            this.saveSetting('defaultSort', e.target.value);
        });

        document.getElementById('group-by-category-toggle').addEventListener('change', (e) => {
            this.saveSetting('groupByCategory', e.target.checked);
        });

        document.getElementById('block-distractions-toggle').addEventListener('change', (e) => {
            this.saveSetting('blockDistractions', e.target.checked);
        });

        document.getElementById('focus-music-toggle').addEventListener('change', (e) => {
            this.saveSetting('focusMusic', e.target.checked);
        });

        document.getElementById('motivational-quotes-toggle').addEventListener('change', (e) => {
            this.saveSetting('motivationalQuotes', e.target.checked);
        });

        // Focus and break duration changes
        document.getElementById('focus-duration').addEventListener('change', (e) => {
            this.saveSetting('focusDuration', parseInt(e.target.value));
            this.focusTimerSeconds = parseInt(e.target.value) * 60;
            this.updateFocusTimerDisplay();
        });

        document.getElementById('break-duration').addEventListener('change', (e) => {
            this.saveSetting('breakDuration', parseInt(e.target.value));
        });

        // Import/Export
        document.getElementById('export-tasks').addEventListener('click', () => {
            this.exportTasks();
        });

        document.getElementById('import-tasks').addEventListener('change', (e) => {
            this.importTasks(e);
        });

        document.getElementById('clear-completed-tasks').addEventListener('click', () => {
            this.clearCompletedTasks();
        });

        document.getElementById('clear-all-data').addEventListener('click', () => {
            this.clearAllData();
        });

        // View all tasks button
        document.getElementById('view-all-tasks').addEventListener('click', () => {
            this.navigateToPage('tasks');
        });

        // Go to focus mode from dashboard
        document.getElementById('go-to-focus').addEventListener('click', () => {
            this.navigateToPage('focus');
        });

        // Add task buttons from empty states
        document.getElementById('add-scheduled-task').addEventListener('click', () => {
            this.openTaskModal();
        });

        document.getElementById('add-important-task').addEventListener('click', () => {
            this.openTaskModal();
        });

        // Quick action buttons
        document.getElementById('quick-timer').addEventListener('click', () => {
            this.navigateToPage('focus');
        });

        document.getElementById('quick-task').addEventListener('click', () => {
            this.openTaskModal();
        });

        // Break mode events
        document.getElementById('quick-break').addEventListener('click', () => {
            this.startBreakMode();
        });

        document.getElementById('back-from-break').addEventListener('click', () => {
            this.stopBreakMode();
        });

        document.getElementById('breath-button').addEventListener('click', () => {
            this.startBreathingAnimation();
        });

        // Analytics period change
        document.getElementById('analytics-period').addEventListener('change', () => {
            this.updateAnalytics();
        });

        // Editable greeting
        document.getElementById('greeting-text').addEventListener('click', () => {
            this.editGreeting();
        });

        // Close modals when clicking backdrop
        document.addEventListener('click', (e) => {
            if (e.target.id === 'add-task-modal') {
                this.closeTaskModal();
            }
            if (e.target.id === 'theme-modal') {
                this.closeThemeModal();
            }
            if (e.target.id === 'stats-modal') {
                this.closeStatsModal();
            }
            if (e.target.id === 'confirmation-modal') {
                this.hideConfirmation();
            }
            if (e.target.id === 'break-mode') {
                this.stopBreakMode();
            }
        });
    }

    navigateToPage(page) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Update page title
        const pageTitles = {
            'dashboard': 'Dashboard',
            'tasks': 'All Tasks',
            'today': 'Today',
            'scheduled': 'Scheduled',
            'important': 'Important',
            'completed': 'Completed',
            'analytics': 'Analytics',
            'focus': 'Focus Mode',
            'settings': 'Settings',
            'help': 'Help & Feedback'
        };

        document.getElementById('page-title').textContent = pageTitles[page] || 'LanTask Pro';

        // Hide all pages
        document.querySelectorAll('.page').forEach(pageEl => {
            pageEl.classList.remove('active');
        });

        // Show current page
        document.getElementById(page).classList.add('active');

        this.currentPage = page;

        // Special handling for specific pages
        if (page === 'analytics') {
            setTimeout(() => {
                this.setupChart();
            }, 100);
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');

        if (window.innerWidth < 1024) {
            // Mobile behavior
            sidebar.classList.toggle('active');
        } else {
            // Desktop behavior
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        }
    }

    openStatsModal() {
        document.getElementById('stats-modal').classList.add('active');
    }

    closeStatsModal() {
        document.getElementById('stats-modal').classList.remove('active');
    }

    openSearchPage() {
        document.getElementById('search-page').classList.add('active');
        document.getElementById('search-input').focus();
    }

    closeSearchPage() {
        document.getElementById('search-page').classList.remove('active');
        document.getElementById('search-input').value = '';
        this.renderSearchResults('');
    }

    openTaskModal() {
        document.getElementById('add-task-modal').classList.add('active');
        document.getElementById('task-title').focus();
    }

    closeTaskModal() {
        document.getElementById('add-task-modal').classList.remove('active');
        document.getElementById('task-title').value = '';
        document.getElementById('task-description').value = '';
        document.getElementById('task-priority').value = 'medium';
        document.getElementById('task-category').value = 'personal';
        document.getElementById('task-due-date').value = '';
        document.getElementById('task-time-estimate').value = '';

        // Clear suggestions
        document.getElementById('suggestions-container').innerHTML = '';
    }

    handleTaskInput(text) {
        const suggestionsContainer = document.getElementById('suggestions-container');
        suggestionsContainer.innerHTML = '';

        const suggestions = this.generateSmartSuggestions(text);

        suggestions.forEach((suggestion, index) => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'suggestion-chip';
            suggestionElement.textContent = suggestion.text;
            suggestionElement.addEventListener('click', suggestion.action);

            suggestionsContainer.appendChild(suggestionElement);

            // Animate suggestion with staggered delay
            setTimeout(() => {
                suggestionElement.classList.add('visible');
                if (index === 0) {
                    suggestionElement.classList.add('micro-bounce');
                }
            }, 100 * (index + 1));
        });
    }

    saveNewTask() {
        const title = document.getElementById('task-title').value.trim();
        if (!title) return;

        const taskData = {
            title: title,
            description: document.getElementById('task-description').value,
            priority: document.getElementById('task-priority').value,
            category: document.getElementById('task-category').value,
            dueDate: document.getElementById('task-due-date').value || null,
            timeEstimate: document.getElementById('task-time-estimate').value || null
        };

        this.addTask(taskData);
        this.closeTaskModal();

        // Show success notification
        this.showNotification('Task added successfully!', 'success');
    }

    openEditTaskModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        // Populate the form with task data
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-category').value = task.category;
        document.getElementById('task-due-date').value = task.dueDate || '';
        document.getElementById('task-time-estimate').value = task.timeEstimate || '';

        // Change modal title and save button
        document.querySelector('#add-task-modal .title-large').textContent = 'Edit Task';
        document.getElementById('save-task').textContent = 'Save Changes';

        // Remove existing event listener and add new one
        const saveButton = document.getElementById('save-task');
        const newSaveButton = saveButton.cloneNode(true);
        saveButton.parentNode.replaceChild(newSaveButton, saveButton);

        newSaveButton.addEventListener('click', () => {
            this.updateTask(taskId, {
                title: document.getElementById('task-title').value,
                description: document.getElementById('task-description').value,
                priority: document.getElementById('task-priority').value,
                category: document.getElementById('task-category').value,
                dueDate: document.getElementById('task-due-date').value || null,
                timeEstimate: document.getElementById('task-time-estimate').value || null
            });
            this.closeTaskModal();
            this.showNotification('Task updated successfully!', 'success');

            // Reset modal for future use
            document.querySelector('#add-task-modal .title-large').textContent = 'Add New Task';
            document.getElementById('save-task').textContent = 'Save Task';
        });

        this.openTaskModal();
    }

    openThemeModal() {
        document.getElementById('theme-modal').classList.add('active');
    }

    closeThemeModal() {
        document.getElementById('theme-modal').classList.remove('active');
    }

    applySelectedTheme() {
        const selectedTheme = document.querySelector('.theme-option.active').getAttribute('data-theme');
        this.applyTheme(selectedTheme);
        this.closeThemeModal();
    }

    editGreeting() {
        const greetingElement = document.getElementById('greeting-text');
        const currentGreeting = greetingElement.textContent;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'greeting-input';
        input.value = currentGreeting;
        input.maxLength = 50;

        greetingElement.parentNode.replaceChild(input, greetingElement);
        input.focus();
        input.select();

        const saveGreeting = () => {
            const newGreeting = input.value.trim() || 'Welcome to LanTask!';
            if (newGreeting.length > 50) {
                this.showNotification('Greeting is too long (max 50 characters)', 'error');
                return;
            }

            const newGreetingElement = document.createElement('div');
            newGreetingElement.className = 'title-large greeting-editable';
            newGreetingElement.id = 'greeting-text';
            newGreetingElement.textContent = newGreeting;

            input.parentNode.replaceChild(newGreetingElement, input);

            // Save to localStorage
            localStorage.setItem('lantask-pro-greeting', newGreeting);

            // Re-add event listener
            newGreetingElement.addEventListener('click', () => {
                this.editGreeting();
            });
        };

        input.addEventListener('blur', saveGreeting);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveGreeting();
            } else if (e.key === 'Escape') {
                const newGreetingElement = document.createElement('div');
                newGreetingElement.className = 'title-large greeting-editable';
                newGreetingElement.id = 'greeting-text';
                newGreetingElement.textContent = currentGreeting;

                input.parentNode.replaceChild(newGreetingElement, input);

                // Re-add event listener
                newGreetingElement.addEventListener('click', () => {
                    this.editGreeting();
                });
            }
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            background: var(--dynamic-surface);
            color: var(--dynamic-on-surface);
            box-shadow: var(--elevation-3);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s var(--spring-smooth);
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    triggerHapticFeedback(type = 'light') {
        if (navigator.vibrate) {
            const patterns = {
                'light': [50],
                'medium': [100],
                'heavy': [200],
                'success': [100, 50, 100]
            };

            navigator.vibrate(patterns[type] || patterns.light);
        }
    }
}

// Dark Mode Management
class DarkModeManager {
    constructor() {
        this.isDarkMode = false;
        this.init();
    }

    init() {
        // Load saved preference or use system preference
        const savedMode = localStorage.getItem('darkMode');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        this.isDarkMode = savedMode !== null ? JSON.parse(savedMode) : systemPrefersDark;
        this.applyDarkMode(this.isDarkMode);
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Dark mode toggle
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.checked = this.isDarkMode;
            darkModeToggle.addEventListener('change', (e) => {
                this.toggleDarkMode(e.target.checked);
            });
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            if (localStorage.getItem('darkMode') === null) {
                this.toggleDarkMode(e.matches);
            }
        });
    }

    toggleDarkMode(enable) {
        this.isDarkMode = enable;
        this.applyDarkMode(enable);
        localStorage.setItem('darkMode', JSON.stringify(enable));

        // Update toggle state
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.checked = enable;
        }
    }

    applyDarkMode(enable) {
        const root = document.documentElement;

        if (enable) {
            root.setAttribute('data-color-scheme', 'dark');
            this.applyDarkThemeAdjustments();
        } else {
            root.setAttribute('data-color-scheme', 'light');
            this.applyLightThemeAdjustments();
        }

        // Dispatch event for other components to react
        window.dispatchEvent(new CustomEvent('colorSchemeChanged', {
            detail: {
                isDark: enable
            }
        }));
    }

    applyDarkThemeAdjustments() {
        // Special adjustments for dark mode
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'sierra-blue';

        // Add smooth transition
        document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';

        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 300);
    }

    applyLightThemeAdjustments() {
        // Special adjustments for light mode
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'sierra-blue';

        // Add smooth transition
        document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';

        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 300);
    }

    getCurrentMode() {
        return this.isDarkMode;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.lanTaskPro = new LanTaskPro();
});
