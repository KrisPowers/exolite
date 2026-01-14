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