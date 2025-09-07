(function () {
  const consoleEl = document.getElementById("console");

  function append(text) {
    consoleEl.textContent += text;
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }

  function run(scriptName) {
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${location.host}/ws/exec?script=${encodeURIComponent(scriptName)}`;
    const ws = new WebSocket(wsUrl);

    append(`$ bash ${scriptName}\n`);

    ws.onmessage = (ev) => append(ev.data);
    ws.onclose = () => append("\n[closed]\n");
    ws.onerror = () => append("\n[error]\n");
  }

  document.querySelectorAll(".run-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const scriptName = btn.getAttribute("data-script");
      run(scriptName);
    });
  });
})();
