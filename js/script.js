let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || ['Food', 'Transport', 'Fun'];
let chartInstance = null;

const form = document.getElementById('transaction-form');
const itemNameInput = document.getElementById('item-name');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const customCategoryInput = document.getElementById('custom-category');
const addCategoryBtn = document.getElementById('add-category-btn');
const transactionList = document.getElementById('transaction-list');
const totalBalanceDisplay = document.getElementById('total-balance');
const sortBySelect = document.getElementById('sort-by');
const themeToggleBtn = document.getElementById('theme-toggle-btn');

document.addEventListener('DOMContentLoaded', () => {
    populateCategoryDropdown();
    updateUI();
    initTheme();
});

function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('categories', JSON.stringify(categories));
}

function populateCategoryDropdown() {
    categorySelect.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

addCategoryBtn.addEventListener('click', () => {
    const newCategory = customCategoryInput.value.trim();
    if (newCategory && !categories.includes(newCategory)) {
        categories.push(newCategory);
        saveData();
        populateCategoryDropdown();
        categorySelect.value = newCategory;
        customCategoryInput.value = '';
    }
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = itemNameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;

    if (!name || isNaN(amount) || amount <= 0 || !category) {
        alert('Mohon isi semua field dengan benar!');
        return;
    }

    const newTransaction = {
        id: Date.now(),
        name,
        amount,
        category
    };

    transactions.push(newTransaction);
    saveData();
    updateUI();

    itemNameInput.value = '';
    amountInput.value = '';
});

function deleteTransaction(id) {
    transactions = transactions.filter(item => item.id !== id);
    saveData();
    updateUI();
}

function updateUI() {
    renderList();
    renderBalance();
    renderChart();
}

sortBySelect.addEventListener('change', renderList);

function renderList() {
    transactionList.innerHTML = '';

    let sortedList = [...transactions];
    const sortBy = sortBySelect.value;

    if (sortBy === 'amount-desc') {
        sortedList.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'amount-asc') {
        sortedList.sort((a, b) => a.amount - b.amount);
    } else if (sortBy === 'category') {
        sortedList.sort((a, b) => a.category.localeCompare(b.category));
    } else {
        sortedList.reverse();
    }

    if (sortedList.length === 0) {
        transactionList.innerHTML = '<p style="text-align:center; color:#888;">Belum ada transaksi.</p>';
        return;
    }

    sortedList.forEach(item => {
        const div = document.createElement('div');
        div.className = 'transaction-item';
        div.innerHTML = `
            <div class="item-info">
                <div class="item-title">${escapeHTML(item.name)}</div>
                <div class="item-amount">$${item.amount.toFixed(2)}</div>
                <span class="item-badge">${escapeHTML(item.category)}</span>
            </div>
            <button class="btn-delete" onclick="deleteTransaction(${item.id})">Delete</button>
        `;
        transactionList.appendChild(div);
    });
}

function renderBalance() {
    const total = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    totalBalanceDisplay.textContent = `$${total.toFixed(2)}`;
}

function renderChart() {
    const ctx = document.getElementById('spending-chart').getContext('2d');

    const categoryTotals = {};
    transactions.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels.length ? labels : ['No Data'],
            datasets: [{
                data: data.length ? data : [1],
                backgroundColor: [
                    '#2ecc71', '#3498db', '#e67e22', '#9b59b6', '#f1c40f', '#e74c3c'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggleBtn.textContent = newTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggleBtn.textContent = savedTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}