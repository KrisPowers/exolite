lucide.createIcons();

async function fetchAnalytics() {
  const res = await fetch("/api/analytics");
  if (!res.ok) throw new Error("Failed to fetch KPI Data");
  return res.json();
}

function fillTable(el, data, suffix = "") {
  el.innerHTML = Object.entries(data)
    .map(([k, v]) =>
      `<tr><td>${k}</td><td>${v}${suffix}</td></tr>`
    ).join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  const logList = document.getElementById("logList");
  const logDetail = document.getElementById("logDetail");

  let logs = [];

  async function fetchLogs() {
    const res = await fetch("/api/logs/all");
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
          <span>${log.ip}</span>
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

      <div class="detail-card full">
              <h4>Agent</h4>
              <p class="normal">${log.agent}</p>
      </div>

        <div class="detail-card">
          <h4>Request</h4>
          <ul>
            <li><span>Internal ID</span><b>${log.id}</b></li>
            <li><span>Method</span><b>${log.method}</b></li>
            <li><span>Path</span><b>${log.path}</b></li>
            <li><span>Status</span><b>${log.status}</b></li>
            <li><span>Processing</span><b>${log.timing.proccessing}</b></li>
            <li><span>Time of Request</span><b>${log.time}</b></li>
          </ul>
        </div>

        <div class="detail-card">
          <h4>Device & Client</h4>
          <ul>
            <li><span>Operating System</span><b>${log.os}</b></li>
            <li><span>Device Type</span><b>${log.deviceType}</b></li>
            <li><span>Device Model</span><b>${log.deviceModel}</b></li>
            <li><span>Device Vendor</span><b>${log.deviceVendor}</b></li>
            <li><span>Engine Name</span><b>${log.engineName}</b></li>
            <li><span>Engine Version</span><b>${log.engineVersion}</b></li>
            <li><span>CPU Architecture</span><b>${log.cpu}</b></li>
          </ul>
        </div>

        <div class="detail-card">
          <h4>Browser</h4>
          <ul>
            <li><span>Browser Name</span><b>${log.browserName}</b></li>
            <li><span>Browser Version</span><b>${log.browserVersion}</b></li>
            <li><span>Browser Major</span><b>${log.browserMajor}</b></li>
            <li><span>Browser Type</span><b>${log.browserType}</b></li>
            <li><span>IP Address</span><b>${log.ip}</b></li>
            <li><span>Region</span><b>${log.region}</b></li>
          </ul>
        </div>

        <div class="detail-card">
          <h4>Security</h4>
          <ul>
            <li><span>Bot Traffic</span><b class="${log.bot}">${log.bot}</b></li>
            <li><span>AI Crawler</span><b class="${log.aiCrailer}">${log.aiCrailer}</b></li>
            <li><span>AI Assistant</span><b class="${log.aiAssistant}">${log.aiAssistant}</b></li>
          </ul>
        </div>

      ${
        log.flagged
          ? `<div class="detail-card full">
              <h4>Security Notes</h4>
              <p class="alert">⚠ ${log.note}</p>
            </div>`
          : ""
      }
    `;
  }

  // INIT
  logs = await fetchLogs();
  renderLogList();
});

(async () => {

  const analyticData = await fetchAnalytics();

  const paths = analyticData.path;
  const os = analyticData.os;
  const browsers = analyticData.browser;

  const sortedPaths = Object.fromEntries(
    Object.entries(paths).sort((a, b) => b[1] - a[1])
  );

  fillTable(document.getElementById("pathsTable"), sortedPaths);
  fillTable(document.getElementById("osTable"), os, "%");
  fillTable(document.getElementById("browserTable"), browsers, "%");

  document.getElementById("kpiRequests").textContent = analyticData.requests.all;
  document.getElementById("kpiVisits").textContent = analyticData.requests.visits;
  document.getElementById("kpiHidden").textContent = analyticData.requests.hidden;

})()