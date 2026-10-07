/*!
 * Chatty4Everyone widget loader.
 *   <script src="https://YOUR-HOST/widget.js" data-bot="bot_xxxxxxxx" async></script>
 * Optional attributes:
 *   data-inline            render in place (Inline template) instead of floating
 *   data-target="#id"      element to render into (implies inline)
 *   data-height="600"      inline height in px
 * API: window.Chatty.open() / .close() / .toggle()
 */
(function () {
  "use strict";
  if (window.Chatty && window.Chatty.__loaded) return;

  var script =
    document.currentScript ||
    document.querySelector('script[src*="widget.js"][data-bot]');
  if (!script) return;

  var bot = script.getAttribute("data-bot") || "";
  if (!/^bot_[a-z0-9]{8,32}$/.test(bot)) {
    console.warn("[Chatty4Everyone] Missing or invalid data-bot attribute on the widget script.");
    return;
  }

  var origin = new URL(script.src, location.href).origin;
  var targetSel = script.getAttribute("data-target");
  var inline = script.hasAttribute("data-inline") || !!targetSel;
  var inlineHeight = parseInt(script.getAttribute("data-height") || "600", 10) || 600;
  var meta = {};
  var queued = [];
  var ready = false;

  var frame = document.createElement("iframe");
  frame.src = origin + "/embed/" + bot;
  frame.title = "Chat assistant";
  // Lets the embed page check the embedding site against the bot's allowed domains.
  frame.setAttribute("referrerpolicy", "origin");
  frame.setAttribute("allow", "clipboard-write");
  frame.setAttribute("allowtransparency", "true");

  var base =
    "border:0;margin:0;padding:0;background:transparent;color-scheme:normal;display:block;";
  if (inline) {
    frame.style.cssText = base + "width:100%;height:" + inlineHeight + "px;border-radius:16px;";
  } else {
    frame.style.cssText =
      base + "position:fixed;z-index:2147483000;width:0;height:0;visibility:hidden;max-width:100vw;max-height:100vh;";
  }

  function send(msg) {
    msg.__c4e = true;
    if (!ready) { queued.push(msg); return; }
    if (frame.contentWindow) frame.contentWindow.postMessage(msg, origin);
  }

  function env() {
    send({ type: "env", mobile: window.innerWidth < 640, vw: window.innerWidth, vh: window.innerHeight });
  }

  function place(box) {
    if (inline) return;
    var s = frame.style;
    s.top = s.right = s.bottom = s.left = s.transform = "auto";
    s.visibility = "visible";
    s.width = s.height = "auto";
    if (box.kind === "fill") {
      s.top = s.left = "0"; s.width = "100%"; s.height = "100%";
    } else if (box.kind === "corner") {
      var p = box.pos || "br";
      s[p.charAt(0) === "t" ? "top" : "bottom"] = box.y + "px";
      s[p.charAt(1) === "l" ? "left" : "right"] = box.x + "px";
      s.width = box.w + "px"; s.height = box.h + "px";
    } else if (box.kind === "bottom") {
      s.bottom = box.y + "px"; s.height = box.h + "px";
      // Iframes don't stretch between left/right, so give the full width explicitly.
      if (box.w == null) { s.left = "-16px"; s.width = "calc(100% + 32px)"; }
      else { s.left = "50%"; s.transform = "translateX(-50%)"; s.width = box.w + "px"; }
    } else if (box.kind === "edge") {
      s.right = "0"; s.top = "50%"; s.transform = "translateY(-50%)";
      s.width = box.w + "px"; s.height = box.h + "px";
    } else if (box.kind === "side") {
      s.top = s.right = "0"; s.height = "100%";
      s.width = box.w == null ? "100%" : box.w + "px";
    }
  }

  window.addEventListener("message", function (e) {
    if (e.source !== frame.contentWindow || e.origin !== origin) return;
    var d = e.data;
    if (!d || d.__c4e !== true) return;
    if (d.type === "ready") {
      meta = d;
      ready = true;
      env();
      for (var i = 0; i < queued.length; i++) frame.contentWindow.postMessage(queued[i], origin);
      queued = [];
    } else if (d.type === "box" && d.box) {
      place(d.box);
    } else if (d.type === "hide") {
      frame.style.display = "none";
      if (d.reason) console.warn("[Chatty4Everyone] " + d.reason);
    }
  });

  var t;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(env, 150);
  });

  // ⌘K / Ctrl+K opens the "Ask AI search" template.
  document.addEventListener("keydown", function (e) {
    if (meta.shortcut && (e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      send({ type: "open" });
    }
  });

  window.Chatty = {
    __loaded: true,
    open: function () { send({ type: "open" }); },
    close: function () { send({ type: "close" }); },
    toggle: function () { send({ type: "toggle" }); },
  };

  function mount() {
    if (inline) {
      var target = targetSel ? document.querySelector(targetSel) : null;
      if (target) target.appendChild(frame);
      else script.parentNode.insertBefore(frame, script.nextSibling);
    } else {
      document.body.appendChild(frame);
    }
  }
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
