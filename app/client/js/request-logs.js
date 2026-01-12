document.addEventListener("DOMContentLoaded", async () => {
  const logList = document.getElementById("logList");
  const logDetail = document.getElementById("logDetail");

  let logs = [];

  async function fetchLogs() {
    const res = await fetch("/api/logs");
    if (!res.ok) throw new Error("Failed to fetch logs");
    return res.json();
  }

  function renderLogList() {
    logList.innerHTML = "";

    logs.forEach(log => {
      const row = document.createElement("div");
      row.className = `log-row ${log.flagged ? "flagged" : ""}`;
      row.dataset.id = log.id;

      row.innerHTML = `
        <div class="log-row-main">
          <strong>${log.method}</strong> ${log.path}
          ${log.flagged ? `<span class="flag-icon">⚠</span>` : ""}
        </div>
        <div class="log-row-meta">
          <span class="status ${log.status >= 400 ? "error" : ""}">
            ${log.status}
          </span>
          <span>${log.device}</span>
          <span>${log.time}</span>
        </div>
      `;

      row.addEventListener("click", () => selectLog(log.id));
      logList.appendChild(row);
    });
  }

  async function selectLog(id) {
    const res = await fetch(`/api/logs/${id}`);
    if (!res.ok) return;

    const log = await res.json();

    document.querySelectorAll(".log-row").forEach(r =>
      r.classList.toggle("active", Number(r.dataset.id) === id)
    );

    logDetail.innerHTML = `
      <div class="detail-header">
        <h2>${log.method} ${log.path}</h2>
        <span class="detail-status ${log.status >= 400 ? "error" : ""}">
          ${log.status}
        </span>
      </div>

      ${
        log.flagged
          ? `<div class="detail-card full">
              <h4>Security Notes</h4>
              <p class="alert">⚠ ${log.note}</p>
            </div>`
          : ""
      }

      <div class="detail-grid">
        <div class="detail-card">
          <h4>Request</h4>
          <ul>
            <li><span>Internal ID</span><b>${log.id}</b></li>
            <li><span>Method</span><b>${log.method}</b></li>
            <li><span>Path</span><b>${log.path}</b></li>
            <li><span>Status</span><b>${log.status}</b></li>
            <li><span>Processing</span><b>${log.timing.proccessing}</b></li>
          </ul>
        </div>

        <div class="detail-card">
          <h4>Client</h4>
          <ul>
            <li><span>IP Address</span><b>${log.ip}</b></li>
            <li><span>Device</span><b>${log.device}</b></li>
            <li><span>OS</span><b>${log.os}</b></li>
            <li><span>Browser</span><b>${log.browser}</b></li>
          </ul>
        </div>
      </div>
    `;
  }

  // INIT
  logs = await fetchLogs();
  renderLogList();
});
