window.ERP_API =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:3000/api"
    : "/api";
