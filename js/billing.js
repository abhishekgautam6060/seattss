const CURRENT_LIBRARY_ID = Number(localStorage.getItem("LIBRARY_ID"));

const HOST_URL ="https://seatmanager-service-128817862922.us-central1.run.app";

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;

document.addEventListener("DOMContentLoaded", () => {
  loadBillingSummary();
  loadExpenses();
});

function loadBillingSummary() {
    fetch(
        `${HOST_URL}/api/billing/summary/${CURRENT_LIBRARY_ID}?year=${year}&month=${month}`
        , { credentials: "include" })
      .then(res => res.json())
      .then(d => {

      console.log("Data of Expense : ", d)
        document.getElementById("revenueCard").innerHTML = `
          <div class="card-top">
            <span>Total Revenue</span>
            <i class="fa-solid fa-money-bill-wave card-icon revenue"></i>
          </div>
          <h2>₹${d.monthlyRevenue}</h2>
        `;

        document.getElementById("expenseCard").innerHTML = `
          <div class="card-top">
            <span>Total Expenses</span>
            <i class="fa-solid fa-receipt card-icon expense"></i>
          </div>
          <h2>₹${d.monthlyExpenses}</h2>
        `;

        document.getElementById("profitCard").innerHTML = `
          <div class="card-top">
            <span>Net Profit</span>
            <i class="fa-solid fa-chart-line card-icon profit"></i>
          </div>
          <h2>₹${d.monthlyProfit}</h2>
        `;

        document.getElementById("projectedCard").innerHTML = `
          <div class="card-top">
            <span>Avg Profit</span>
            <i class="fa-solid fa-chart-pie card-icon projected"></i>
          </div>
          <h2>₹${d.averageMonthlyProfit}</h2>
        `;
      });
}
function loadExpenses() {
  fetch(
          `${HOST_URL}/api/billing/expenses/library/${CURRENT_LIBRARY_ID}`, { credentials: "include" }
        )
    .then(res => res.json())
    .then(data => {

      console.log("Data of Expense : ", data);

      const body = document.getElementById("expenseBody");
      const empty = document.getElementById("expenseEmpty");

      body.innerHTML = "";

      if (data.length === 0) {
        empty.classList.remove("hidden");
        return;
      }

      empty.classList.add("hidden");

      data.forEach(e => {
        const tr = document.createElement("tr");

        console.log("Data of category : ", e.category);
        console.log("Data of status : ", e.status);
        console.log("Data of amount : ", e.amount);
        console.log("Data of expenseDate : ", e.expenseDate);

        tr.innerHTML = `
          <td class="category-cell">
            <span class="cat-icon ${getCategoryClass(e.category)}">
              <i class="${getCategoryIcon(e.category)}"></i>
            </span>
            ${e.category}
          </td>

          <td>${formatDate(e.expenseDate)}</td>

          <td class="amount">₹${e.amount}</td>

          <td>
            <span class="status-badge ${e.status}">
              ${e.status}
            </span>
          </td>

          <td>
            ${
              e.receipt
                ? `<a href="${e.receipt}" class="receipt-link">
                     <i class="fa-solid fa-file"></i> ${e.receipt}
                   </a>`
                : `<span class="no-receipt">No receipt</span>`
            }
          </td>

          <td class="actions">
            <button class="icon-btn" onclick="editExpense(${e.id})">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="icon-btn danger" onclick="deleteExpense(${e.id})">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        `;

        body.appendChild(tr);
      });
    });
}

function openExpenseModal() {
  document.getElementById("expenseModal").classList.remove("hidden");
}

function closeExpenseModal() {
  document.getElementById("expenseModal").classList.add("hidden");
}

function saveExpense() {
  const payload = {
    category: exCategory.value,
    amount: exAmount.value,
    expenseDate: exDate.value,
    status: exStatus.value
  };

  fetch(`${HOST_URL}/api/expenses/library/${CURRENT_LIBRARY_ID}`, { credentials: "include" }, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(() => {
    closeExpenseModal();
    loadExpenses();
  });
}

function formatDate(d) {
  return new Date(d).toLocaleDateString();
}


function getCategoryIcon(category) {
  const c = category.toLowerCase();
  if (c.includes("rent")) return "fa-solid fa-house";
  if (c.includes("electric")) return "fa-solid fa-bolt";
  if (c.includes("wifi")) return "fa-solid fa-wifi";
  if (c.includes("clean")) return "fa-solid fa-broom";
  return "fa-solid fa-receipt";
}

function getCategoryClass(category) {
  const c = category.toLowerCase();
  if (c.includes("rent")) return "rent";
  if (c.includes("electric")) return "electric";
  if (c.includes("wifi")) return "wifi";
  return "default";
}

function deleteExpense(id) {
  if (!confirm("Delete this expense?")) return;

  fetch(`${HOST_URL}/api/billing/expenses/${id}/library/${CURRENT_LIBRARY_ID}`, { credentials: "include" }, { method: "DELETE" })
    .then(() => loadExpenses());
}


function editExpense(id) {
  fetch(`${HOST_URL}/api/billing/expenses/library/${CURRENT_LIBRARY_ID}`, { credentials: "include" })
    .then(res => res.json())
    .then(list => {
      const e = list.find(x => x.id === id);

      editId.value = e.id;
      editCategory.value = e.category;
      editAmount.value = e.amount;
      editDate.value = e.expenseDate;
      editStatus.value = e.status;

      document
        .getElementById("editExpenseModal")
        .classList.remove("hidden");
    });
}

function closeEditExpense() {
  document
    .getElementById("editExpenseModal")
    .classList.add("hidden");
}

function goTo(path) {
  window.location.href = path;
}

function updateExpense() {
  const id = editId.value;

  const payload = {
    category: editCategory.value,
    amount: parseInt(editAmount.value),
    expenseDate: editDate.value,
    status: editStatus.value
  };

  fetch(`${HOST_URL}/api/billing/expenses/${id}/library/${CURRENT_LIBRARY_ID}`, { credentials: "include" }, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(() => {
    closeEditExpense();
    loadExpenses();
  });
}