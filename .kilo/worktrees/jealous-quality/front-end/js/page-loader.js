(function () {
  "use strict";
  var loader = document.getElementById("emspPageLoader");
  if (!loader) return;

  // Au premier accès, l'introduction complète remplace la mini animation.
  var intro = document.getElementById("introOverlay");
  var introForced = new URLSearchParams(window.location.search).get("intro") === "1";
  var introSeen = sessionStorage.getItem("emsp_intro_seen") === "1";
  if (intro && (!introSeen || introForced)) loader.classList.add("is-loaded");

  function hideLoader() { loader.classList.add("is-loaded"); }
  window.addEventListener("load", function () { window.setTimeout(hideLoader, 450); });
  window.setTimeout(hideLoader, 1800);

  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a[href]");
    if (!link || link.target === "_blank" || link.hasAttribute("download") || event.defaultPrevented) return;
    var url;
    try { url = new URL(link.href, window.location.href); } catch (error) { return; }
    if (url.origin !== window.location.origin || url.pathname === window.location.pathname && url.hash) return;
    loader.classList.remove("is-loaded");
  });
})();
