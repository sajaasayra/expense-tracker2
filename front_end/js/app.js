// Base API URL
const API_URL = 'http://localhost:3000/api/expenses';

// Global State
let allExpenses = [];
let expenseModalInstance = null;
let categoryChart = null;

// DOM Elements
const expensesTableBody = document.getElementById('expensesTableBody');
const totalAmountEl = document.getElementById('totalAmount');
const totalCountEl = document.getElementById('totalCount');
const highestExpenseEl = document.getElementById('highestExpense');
const loadingSpinner = document.getElementById('loadingSpinner');
const alertContainer = document.getElementById('alertContainer');
const filterCategory = document.getElementById('filterCategory');
const darkModeToggle = document.getElementById('darkModeToggle');

const expenseForm = document.getElementById('expenseForm');
const expenseIdInput = document.getElementById('expenseId');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const modalTitle = document.getElementById('expenseModalLabel');
const saveBtn = document.getElementById('saveBtn');

// SVG Icons
const sunSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-brightness-high-fill" viewBox="0 0 16 16">
    <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
</svg>`;

const moonSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-moon-fill" viewBox="0 0 16 16">
    <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/>
</svg>`;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Bootstrap Modal Instance
    const modalEl = document.getElementById('expenseModal');
    if (modalEl) {
        expenseModalInstance = new bootstrap.Modal(modalEl);
    }

    // Event Listeners
    expenseForm.addEventListener('submit', handleFormSubmit);
    filterCategory.addEventListener('change', handleFilterChange);
    
    // Dark Mode Initialization
    initDarkMode();

    // Fetch initial data
    fetchExpenses();
});

// Dark Mode Toggle Logic
function initDarkMode() {
    const isDarkMode = localStorage.getItem('theme') === 'dark';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = sunSvg;
    } else {
        darkModeToggle.innerHTML = moonSvg;
    }

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const activeDark = document.body.classList.contains('dark-mode');
        
        localStorage.setItem('theme', activeDark ? 'dark' : 'light');
        darkModeToggle.innerHTML = activeDark ? sunSvg : moonSvg;
        
        // Refresh Chart to adapt colors if needed
        updateChart(allExpenses);
    });
}

// Fetch all expenses from Backend
async function fetchExpenses() {
    showSpinner(true);
    clearAlert();

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Failed to load expenses (Status: ${response.status})`);
        }

        const data = await response.json();
        allExpenses = data;

        applyFilterAndRender();
        updateSummaryCards(allExpenses);
        updateChart(allExpenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        showAlert('Cannot connect to the server. Please make sure the backend is running.', 'danger');
        expensesTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No data available</td></tr>`;
    } finally {
        showSpinner(false);
    }
}

// Render Expenses in Table
function renderExpenses(expenses) {
    if (!expenses || expenses.length === 0) {
        expensesTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">No expenses found.</td>
            </tr>
        `;
        return;
    }

    expensesTableBody.innerHTML = expenses.map(expense => `
        <tr>
            <td class="fw-semibold">${escapeHtml(expense.title)}</td>
            <td class="fw-bold" style="color: var(--pink-accent);">$${Number(expense.amount).toFixed(2)}</td>
            <td>
                <span class="badge badge-category bg-${expense.category.toLowerCase()}">
                    ${escapeHtml(expense.category)}
                </span>
            </td>
            <td class="text-muted small">${expense.date}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-secondary me-1" onclick="openEditModal(${expense.id})">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteExpense(${expense.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Render Chart (Chart.js)
function updateChart(expenses) {
    const ctx = document.getElementById('categoryChart').getContext('2d');

    const categories = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];
    const totals = categories.map(cat => {
        return expenses
            .filter(item => item.category === cat)
            .reduce((sum, item) => sum + Number(item.amount), 0);
    });

    if (categoryChart) {
        categoryChart.destroy();
    }

    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#fce7f0' : '#3a2228';

    categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Total Expenses ($)',
                data: totals,
                backgroundColor: [
                    '#e0a3b7',
                    '#c084fc',
                    '#f87171',
                    '#fb7185',
                    '#94a3b8'
                ],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                x: {
                    ticks: { color: textColor },
                    grid: { display: false }
                },
                y: {
                    ticks: { color: textColor },
                    grid: { color: isDark ? '#3d2027' : '#f3dbe3' }
                }
            }
        }
    });
}

// Update Summary Cards
function updateSummaryCards(expenses) {
    if (!expenses || expenses.length === 0) {
        totalAmountEl.textContent = '$0.00';
        totalCountEl.textContent = '0';
        highestExpenseEl.textContent = '$0.00';
        return;
    }

    const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const count = expenses.length;
    const highest = Math.max(...expenses.map(item => Number(item.amount)));

    totalAmountEl.textContent = `$${total.toFixed(2)}`;
    totalCountEl.textContent = count;
    highestExpenseEl.textContent = `$${highest.toFixed(2)}`;
}

// Filter Handling
function handleFilterChange() {
    applyFilterAndRender();
}

function applyFilterAndRender() {
    const selectedCategory = filterCategory.value;
    if (selectedCategory === 'All') {
        renderExpenses(allExpenses);
    } else {
        const filtered = allExpenses.filter(item => item.category === selectedCategory);
        renderExpenses(filtered);
    }
}

// Prepare Modal for Adding
function prepareAddModal() {
    expenseForm.reset();
    expenseIdInput.value = '';
    modalTitle.textContent = 'Add Expense';
    saveBtn.textContent = 'Save Expense';

    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}

// Open Modal for Edit
function openEditModal(id) {
    const expense = allExpenses.find(item => item.id === id);
    if (!expense) return;

    expenseIdInput.value = expense.id;
    titleInput.value = expense.title;
    amountInput.value = expense.amount;
    categoryInput.value = expense.category;
    dateInput.value = expense.date;

    modalTitle.textContent = 'Edit Expense';
    saveBtn.textContent = 'Update Expense';

    if (expenseModalInstance) {
        expenseModalInstance.show();
    }
}

// Submit Form (POST/PUT)
async function handleFormSubmit(e) {
    e.preventDefault();

    const id = expenseIdInput.value;
    const payload = {
        title: titleInput.value.trim(),
        amount: parseFloat(amountInput.value),
        category: categoryInput.value,
        date: dateInput.value
    };

    if (!payload.title || isNaN(payload.amount) || payload.amount <= 0 || !payload.category || !payload.date) {
        showAlert('Please fill in all fields with valid information.', 'warning');
        return;
    }

    showSpinner(true);
    clearAlert();

    const isEdit = Boolean(id);
    const url = isEdit ? `${API_URL}/${id}` : API_URL;
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || result.message || 'Operation failed');
        }

        if (expenseModalInstance) {
            expenseModalInstance.hide();
        }

        await fetchExpenses();
    } catch (error) {
        console.error('Save error:', error);
        showAlert(error.message || 'An error occurred while saving.', 'danger');
    } finally {
        showSpinner(false);
    }
}

// Delete Expense
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }

    showSpinner(true);
    clearAlert();

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to delete expense');
        }

        await fetchExpenses();
    } catch (error) {
        console.error('Delete error:', error);
        showAlert(error.message || 'An error occurred while deleting.', 'danger');
    } finally {
        showSpinner(false);
    }
}

// UI Helpers
function showSpinner(show) {
    if (show) {
        loadingSpinner.classList.remove('d-none');
    } else {
        loadingSpinner.classList.add('d-none');
    }
}

function showAlert(message, type = 'danger') {
    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert" style="border-radius: 12px;">
            ${escapeHtml(message)}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}

function clearAlert() {
    alertContainer.innerHTML = '';
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}