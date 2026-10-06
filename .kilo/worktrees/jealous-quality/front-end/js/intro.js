(function () {
  "use strict";

  var overlay = document.getElementById("introOverlay");
  if (!overlay) return;

  var scenes = Array.prototype.slice.call(overlay.querySelectorAll("[data-intro-scene]"));
  var progress = document.getElementById("introProgress");
  var skip = document.getElementById("introSkip");
  var login = document.getElementById("introLogin");
  var introLoginForm = document.getElementById("introLoginForm");
  var replay = document.getElementById("replayIntro");
  var timers = [];
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var forced = new URLSearchParams(window.location.search).get("intro") === "1";
  var seen = sessionStorage.getItem("emsp_intro_seen") === "1";

  // L'introduction est lancée depuis l'accueil, jamais en arrivant directement sur la connexion.
  if (window.location.pathname === "/connexion") {
    overlay.classList.add("is-hidden");
    return;
  }

  function startNetworkBackground() {
    var canvas = document.getElementById("introBackground");
    if (!canvas || reducedMotion) return;
    var context = canvas.getContext("2d");
    var points = [];
    var animationFrame;
    var width = 0;
    var height = 0;
    var density = 70;

    function resize() {
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      points = [];
      density = Math.min(70, Math.floor(width * height / 18000));
      for (var index = 0; index < density; index += 1) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          dx: (Math.random() - 0.5) * 0.35,
          dy: (Math.random() - 0.5) * 0.35,
          radius: 1.6
        });
      }
    }

    function draw() {
      context.clearRect(0, 0, width, height);
      points.forEach(function (point) {
        point.x += point.dx;
        point.y += point.dy;
        if (point.x < 0 || point.x > width) point.dx *= -1;
        if (point.y < 0 || point.y > height) point.dy *= -1;
        context.beginPath();
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        context.fillStyle = "rgba(143, 224, 176, .58)";
        context.fill();
      });
      for (var first = 0; first < points.length; first += 1) {
        for (var second = first + 1; second < points.length; second += 1) {
          var dx = points[first].x - points[second].x;
          var dy = points[first].y - points[second].y;
          var distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 130) {
            context.beginPath();
            context.moveTo(points[first].x, points[first].y);
            context.lineTo(points[second].x, points[second].y);
            context.strokeStyle = "rgba(155, 227, 180, " + (0.18 * (1 - distance / 130)) + ")";
            context.lineWidth = 1;
            context.stroke();
          }
        }
      }
      animationFrame = window.requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();
    overlay.addEventListener("transitionend", function () {
      if (overlay.classList.contains("is-hidden") && animationFrame) window.cancelAnimationFrame(animationFrame);
    }, { once: true });
  }

  function clearTimers() {
    timers.forEach(window.clearTimeout);
    timers = [];
  }

  function focusLogin() {
    var field = document.getElementById("identifiant");
    if (field) field.focus({ preventScroll: true });
  }

  function finishIntro(markSeen) {
    clearTimers();
    if (markSeen !== false) sessionStorage.setItem("emsp_intro_seen", "1");
    overlay.classList.add("is-hidden");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("intro-active");
    if (replay) replay.hidden = false;
    focusLogin();
  }

  function showScene(index) {
    scenes.forEach(function (scene, sceneIndex) {
      scene.classList.toggle("is-active", sceneIndex === index);
    });
    skip.style.display = index === 2 ? "none" : "";
    if (replay) replay.hidden = index !== 2;
    if (index === 2) {
      try { sessionStorage.setItem("emsp_intro_seen", "1"); } catch (error) { /* stockage indisponible */ }
    }
  }

  function playIntro() {
    clearTimers();
    overlay.classList.remove("is-hidden");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("intro-active");
    if (replay) replay.hidden = true;
    showScene(0);
    progress.style.transition = "none";
    progress.style.width = "0";
    window.requestAnimationFrame(function () {
      progress.style.transition = "width " + (reducedMotion ? "2.2s" : "10s") + " linear";
      progress.style.width = "100%";
    });

    var firstDuration = reducedMotion ? 650 : 4800;
    var secondDuration = reducedMotion ? 800 : 5200;
    timers.push(window.setTimeout(function () { showScene(1); }, firstDuration));
    timers.push(window.setTimeout(function () { finishIntro(true); }, firstDuration + secondDuration));
  }

  skip.addEventListener("click", function () { finishIntro(true); });
  if (introLoginForm) introLoginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var targetIdentifier = document.getElementById("identifiant");
    var targetPassword = document.getElementById("password");
    var identifiant = document.getElementById("introIdentifiant").value.trim();
    var password = document.getElementById("introPassword").value;
    var loginForm = document.getElementById("loginForm");

    if (targetIdentifier && targetPassword && loginForm) {
      targetIdentifier.value = identifiant;
      targetPassword.value = password;
      finishIntro(true);
      loginForm.requestSubmit();
      return;
    }

    var button = document.getElementById("introLogin");
    button.disabled = true;
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifiant: identifiant, password: password })
    }).then(function (response) {
      return response.json().then(function (result) {
        if (!response.ok) throw new Error(result.error || "Identifiants incorrects.");
        return result;
      });
    }).then(function (result) {
      sessionStorage.setItem("emsp_authenticated", "true");
      window.location.assign(result.role === "admin" ? "/dashboard" : "/candidature");
    }).catch(function (error) {
      var message = introLoginForm.querySelector(".intro-news");
      message.textContent = error.message || "Serveur inaccessible.";
      message.style.color = "#e3a800";
      button.disabled = false;
    });
  });
  if (replay) replay.addEventListener("click", function () { playIntro(); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !overlay.classList.contains("is-hidden")) finishIntro(true);
  });

  // Une inscription fermée doit afficher immédiatement le message de la page de connexion.
  var registrationClosed = new URLSearchParams(window.location.search).get("inscriptions") === "ferme";
  startNetworkBackground();
  if (seen && !forced || registrationClosed && !forced) finishIntro(false);
  else playIntro();
})();
