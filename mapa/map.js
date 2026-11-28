/* מפת הסטייל · בניית המפה האישית מתוך קוד התשובות (?c=...). בלי שם ובלי מייל. */
(function () {
  var D = window.MAPDATA, SM = window.StyleMap;
  var root = document.getElementById("map");
  var code = new URLSearchParams(location.search).get("c");
  var a = SM.decode(code);

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in (attrs || {})) {
      if (k === "text") n.textContent = attrs[k];
      else if (attrs[k] != null && attrs[k] !== false) n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function pick(o, key, modest) { return (modest && o[key + "M"]) || o[key]; }

  if (!a) {
    root.appendChild(el("section", { class: "missing" }, [
      el("h1", { text: "לא מצאנו את המפה" }),
      el("p", { text: "נראה שהקישור נקטע בדרך. נסי לפתוח שוב את הקישור מהמייל, או למלא את השאלון מחדש." }),
      el("a", { class: "btn", href: "./" }, ["לשאלון"])
    ]));
    return;
  }

  var modest = a.modest;
  var bodyKey = SM.body(a);
  var body = bodyKey ? D.bodies[bodyKey] : null;
  var lookKey = bodyKey || D.openBody.useLooks;
  var looks = pick(D.bodies[lookKey], "looks", modest);
  var col = SM.color(a);
  var form = D.formality[a.q7];
  var styles = a.q6.map(function (k) { return D.styles[k]; });

  /* ---------- צבע ---------- */
  var palette, colorTitle, colorText, combo, colorNote;
  if (col.open) {
    var oc = D.openColor[col.open];
    palette = oc.colors; colorTitle = oc.title; colorText = oc.text;
  } else {
    var s = D.seasons[col.season];
    var q = (col.deep ? s.deep : s.light);
    palette = q.colors; combo = q.combo;
    colorTitle = "הצבעים שכדאי לך לנסות";
    var warm = a.q3 === 0;
    var parts = ["לפי התשובות שלך, תת־הגוון שלך " + (warm ? "חם" : "קר")];
    if (a.q4 === 0) parts.push("והפנים שלך נראות רעננות בצבעים נקיים וברורים");
    if (a.q4 === 1) parts.push("והפנים שלך נראות רעננות בצבעים רכים ומעושנים");
    var first = parts.join(" ") + ".";
    var second = a.q5 === 0 ? " הקונטרסט בין העור, השיער והעיניים בולט, ולכן כדאי להתחיל מהגוונים העמוקים של ה" + s.name + "."
      : a.q5 === 1 ? " הקונטרסט בין העור, השיער והעיניים עדין, ולכן כדאי להתחיל מהגוונים הבהירים והרכים של ה" + s.name + "."
      : " נסי ארבעה גוונים מפלטת ה" + s.name + ".";
    colorText = first + second;
    if (col.unsure) colorNote = D.contrastUnsure;
  }

  /* ---------- סגנון ---------- */
  var styleTitle, styleText = [];
  if (!form && !styles.length) { styleTitle = "נתחיל מהגזרות ומהצבעים"; styleText.push(D.noStyle); }
  else {
    var touchNames = styles.map(function (s) { return s.touch; });
    var touchLine = touchNames.length === 2 ? touchNames[0] + " ו" + touchNames[1].replace("נגיעה ", "").replace("נגיעת ", "") : touchNames[0];
    if (form) styleTitle = form.name + (touchLine ? " עם " + touchLine : "");
    else styleTitle = touchLine.replace(/^נגיע(ה|ת) /, function (m) { return m; });
    if (form) styleText.push(form.text);
    if (styles[0]) styleText.push(styles[0].text);
    if (styles[0]) styleText.push("הנגיעה שלך: " + pick(styles[0], "yours", modest));
  }

  /* ---------- לוק לנסות ---------- */
  var tryIt = form ? pick(form, "tryIt", modest) : (styles[0] ? pick(styles[0], "yours", modest) : D.closing);
  if (combo) tryIt += " ובצבעים: " + combo + ".";

  /* ---------- משיחת מכחול ---------- */
  function swatch(name, hex, i) {
    var w = 120, h = 108;
    var svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true">' +
      '<path filter="url(#brush)" fill="' + hex + '" d="M14 16 C40 9 82 11 106 15 C110 40 109 70 104 94 C78 99 40 98 16 93 C11 66 10 40 14 16 Z" ' +
      'transform="rotate(' + ((i % 2 ? 1 : -1) * (1.5 + i)) + ' 60 54)"/></svg>';
    var fig = el("figure", { class: "sw" + (hex.toUpperCase() === "#FFFFFF" || hex.toUpperCase() === "#F7F7FA" ? " light" : "") });
    fig.insertAdjacentHTML("afterbegin", svg); // SVG קבוע מתוך הקוד, בלי קלט של משתמשת
    fig.appendChild(el("figcaption", { text: name }));
    return fig;
  }

  /* ---------- בנייה ---------- */
  var bodyTitle = bodyKey ? "מבנה הגוף שלך הוא " + bodyKey.replace("-", "/") : D.openBody.title;
  var bodyText = body ? body.text : D.openBody.text;
  var tip = body ? pick(body, "tip", modest) : D.bodies.H.tip;

  root.appendChild(el("header", { class: "mast" }, [
    el("p", { class: "pre", text: "לפי התשובות שלך לשאלון" }),
    el("h1", { text: "מפת הסטייל האישית שלך" })
  ]));

  var figImg = bodyKey ? el("img", { class: "bodyfig", src: "img/bodies/" + bodyKey + ".png", alt: "איור של מבנה גוף " + bodyKey }) : null;
  root.appendChild(el("section", { class: "row two" }, [
    el("div", { class: "cell" }, [el("h2", { text: bodyTitle }), body ? el("p", { class: "sub", text: body.title }) : null, el("p", { text: bodyText })]),
    figImg ? el("div", { class: "figcell" }, [figImg]) : null,
    el("div", { class: "cell" }, [el("h2", { text: "סגנון הלבוש שלך" }), el("p", { class: "sub", text: styleTitle })].concat(
      styleText.map(function (t) { return el("p", { text: t }); })))
  ]));

  root.appendChild(el("section", { class: "row looks" }, [
    el("h2", { text: "שלושה שילובי גזרות שכדאי לך לנסות" }),
    el("div", { class: "strip" }, looks.map(function (l, i) {
      return el("figure", { class: "look" }, [
        el("img", { src: "img/" + (modest ? "looks-modest" : "looks") + "/" + lookKey + "_" + (i + 1) + ".jpg", alt: l.t + ". " + l.d, loading: "lazy" }),
        el("figcaption", {}, [el("strong", { text: (i + 1) + ". " + l.t }), el("span", { text: l.d })])
      ]);
    }))
  ]));

  root.appendChild(el("section", { class: "row two colors" }, [
    el("div", { class: "cell" }, [
      el("h2", { text: colorTitle }),
      el("p", { text: colorText }),
      el("div", { class: "swatches" }, palette.map(function (c, i) { return swatch(c[0], c[1], i); })),
      colorNote ? el("p", { class: "note", text: colorNote }) : null
    ]),
    el("div", { class: "cell tipcell" }, [
      el("h2", { text: "לוק אחד לנסות השבוע" }),
      el("p", { text: tryIt }),
      el("h3", { text: "הטיפ שלך" }),
      el("p", { text: tip })
    ])
  ]));

  /* ---------- הזמנה להמשך, עם ההטבה ל־48 שעות ---------- */
  var mapId = new URLSearchParams(location.search).get("t");
  var api = (window.QUIZ && window.QUIZ.endpoint) || "";
  function ping(what) {
    if (!api || !mapId) return;
    try { fetch(api + "?k=click&w=" + what + "&t=" + encodeURIComponent(mapId), { mode: "no-cors", keepalive: true }); } catch (e) {}
  }
  var wa = "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(D.whatsappText);
  var regularBtn = el("a", { class: "btn", href: wa, target: "_blank", rel: "noopener" }, [D.cta]);
  regularBtn.addEventListener("click", function () { ping("regular"); });
  var endBox = el("div", { class: "endbox" }, [regularBtn]);
  root.appendChild(el("section", { class: "row end" }, [
    el("p", { class: "closing", text: D.closing }),
    endBox,
    el("button", { class: "pdf", type: "button", id: "pdf" }, ["לשמור את המפה כ־PDF"])
  ]));

  function offerBox(endMs, skew) {
    var O = D.offer;
    var clock = el("div", { class: "clock", "aria-live": "off" });
    var detail = el("div", { class: "offer-detail", hidden: "hidden" });
    var openBtn = el("button", { class: "btn", type: "button" }, [O.open]);
    var waOffer = el("a", { class: "btn ghost", href: "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(O.whatsappText), target: "_blank", rel: "noopener" }, [O.whatsappCta]);
    waOffer.addEventListener("click", function () { ping("whatsapp"); });
    var actions = [];
    if (O.calendar) {
      var cal = el("a", { class: "btn", href: O.calendar, target: "_blank", rel: "noopener" }, [O.calendarCta]);
      cal.addEventListener("click", function () { ping("calendar"); });
      actions.push(cal);
    }
    actions.push(waOffer);
    [el("h3", { text: O.name }), el("p", { text: O.what }),
     el("p", { class: "price" }, [el("s", { text: O.priceWas }), " ", el("strong", { text: O.priceNow })]),
     el("div", { class: "offer-actions" }, actions)].forEach(function (n) { detail.appendChild(n); });
    openBtn.addEventListener("click", function () { detail.hidden = false; openBtn.hidden = true; ping("offer"); });
    var box = el("div", { class: "offer" }, [
      el("p", { class: "offer-title", text: D.cta }),
      el("p", { class: "badge", text: O.badge }),
      el("p", { class: "clock-label", text: O.timerLabel }), clock, openBtn, detail
    ]);
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var left = Math.max(0, endMs - (Date.now() + skew));
      if (!left) { endBox.replaceChildren(regularBtn); return; }
      var s = Math.floor(left / 1000);
      clock.textContent = pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60);
      setTimeout(tick, 1000);
    }
    endBox.replaceChildren(box);
    tick();
  }
  if (api && mapId && /^[0-9a-f]{32}$/.test(mapId)) {
    fetch(api + "?o=" + mapId).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.end && j.end > j.now) offerBox(j.end, j.now - Date.now());
    }).catch(function () {});
  }
  root.appendChild(el("footer", { class: "sig" }, [
    el("span", { text: "עינת רן אלקיים | סטיילינג · תדמית · מסר חזותי" }),
    el("span", { class: "site", text: "Einatran.com" })
  ]));
  document.getElementById("pdf").addEventListener("click", function () { window.print(); });
})();
