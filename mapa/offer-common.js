/* מפת הסטייל · עזרים משותפים להטבה (המפה ודף ההטבה). */
(function () {
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  /* טיימר שיורד. endMs מגיע מהגיליון, skew מתקן הפרש שעון בין המחשב שלה לגוגל. */
  window.runClock = function (node, endMs, skew, onEnd) {
    (function tick() {
      var left = Math.max(0, endMs - (Date.now() + skew));
      if (!left) { if (onEnd) onEnd(); return; }
      var s = Math.floor(left / 1000);
      node.textContent = pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60);
      setTimeout(tick, 1000);
    })();
  };
  /* בזמן מבצעי נובמבר התווית מזכירה את הבלאק פריידיי, ואחריהם חוזרת לנוסח הרגיל */
  window.offerBadge = function (O) {
    return O.bfUntil && Date.now() < new Date(O.bfUntil).getTime() ? O.badgeBF : O.badge;
  };
})();
