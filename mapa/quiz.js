/* מפת הסטייל · מנוע השאלון. הטקסטים ב־questions.js, הלוגיקה ב־logic.js. */
(function () {
  var Q = window.QUIZ, SM = window.StyleMap;
  var app = document.getElementById("app");
  var backBtn = document.querySelector(".back");
  var progress = document.querySelector(".progress");
  var bar = document.querySelector(".progress .bar");
  var params = new URLSearchParams(location.search);
  var src = (params.get("src") || "").slice(0, 60);
  var answers = {};
  var step = -1; // -1 פתיחה, 0..6 שאלות, 7 מייל, 8 הצצה
  var total = Q.questions.length;

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in (attrs || {})) {
      if (k === "text") n.textContent = attrs[k];
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] != null) n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }

  function track(name, extra) {
    try { if (window.gtag) window.gtag("event", name, extra || {}); } catch (e) {}
  }

  function render() {
    app.innerHTML = "";
    backBtn.hidden = !(step >= 0 && step <= total);
    progress.hidden = !(step >= 0 && step <= total);
    bar.style.width = Math.round(((step + 1) / (total + 1)) * 100) + "%";
    var s;
    if (step === -1) s = intro();
    else if (step < total) s = question(Q.questions[step]);
    else if (step === total) s = emailScreen();
    else s = peek();
    s.classList.add("screen");
    app.appendChild(s);
    window.scrollTo(0, 0);
    var focusable = s.querySelector("h1, h2");
    if (focusable) { focusable.setAttribute("tabindex", "-1"); focusable.focus({ preventScroll: true }); }
  }

  function go(n) { step = n; render(); }

  backBtn.addEventListener("click", function () { if (step > -1) go(step - 1); });

  /* ---------- פתיחה ---------- */
  function intro() {
    var i = Q.intro;
    return el("section", { class: "intro" }, [
      el("h1", { text: i.title }),
      el("p", { class: "lead", text: i.lead }),
      el("p", { class: "list-title", text: i.listTitle }),
      el("ul", {}, i.list.map(function (t, k) {
        return el("li", {}, [el("span", { class: "n", text: String(k + 1) }), el("span", { text: t })]);
      })),
      el("div", { class: "meta", text: i.meta }),
      el("button", { class: "cta", type: "button", text: i.cta, onclick: function () { track("map_start", { src: src }); go(0); } })
    ]);
  }

  /* ---------- שאלה ---------- */
  function question(q) {
    var idx = Q.questions.indexOf(q);
    var cur = answers[q.id];
    var isMulti = q.kind === "multi";
    var picked = isMulti ? (cur || []).slice() : cur;
    var firstInSection = q.section && (idx === 0 || Q.questions[idx - 1].section !== q.section);

    var withImg = q.options.filter(function (o) { return !o.plain; }).length;
    var gridCls = "opts" + (q.kind === "swatch" ? "" : " pics") +
      (withImg === 2 ? " two" : withImg === 4 ? " four" : "") +
      (q.id === "q6" ? " styles four" : "") + (q.id === "q7" ? " formal" : "");
    var grid = el("div", { class: gridCls, role: isMulti ? "group" : "radiogroup" });
    var counter = el("p", { class: "counter" });
    var nextBtn = el("button", { class: "cta", type: "button", text: Q.nav.next });
    var modestBox;

    function refresh() {
      [].forEach.call(grid.children, function (b, k) {
        var on = isMulti ? picked.indexOf(k) > -1 : picked === k;
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (isMulti) counter.textContent = picked.length ? "נבחרו " + picked.length + " מתוך " + q.max : "";
      nextBtn.disabled = isMulti ? picked.length === 0 : picked == null;
    }

    q.options.forEach(function (o, k) {
      var kids = [];
      if (o.img) kids.push(el("img", { src: o.img, alt: "", loading: "lazy" }));
      if (o.colors) kids.push(el("span", { class: "sw" }, o.colors.map(function (c) { return el("i", { style: "background:" + c }); })));
      kids.push(el("span", { class: "lbl", text: o.label }));
      if (isMulti && !o.plain) kids.push(el("span", { class: "check", "aria-hidden": "true", text: "✓" }));
      var cls = "opt" + (o.plain ? " plain" : "") + (q.kind === "swatch" && !o.plain ? " row" : "");
      grid.appendChild(el("button", {
        class: cls, type: "button", "aria-pressed": "false",
        onclick: function () {
          if (isMulti) {
            var opt = q.options[k];
            if (opt.exclusive) picked = picked.indexOf(k) > -1 ? [] : [k];
            else {
              picked = picked.filter(function (x) { return !q.options[x].exclusive; });
              var at = picked.indexOf(k);
              if (at > -1) picked.splice(at, 1);
              else if (picked.length < q.max) picked.push(k);
              else { picked.shift(); picked.push(k); }
            }
            answers[q.id] = picked.slice();
            refresh();
          } else {
            picked = k; answers[q.id] = k; refresh();
            if (!q.confirm) setTimeout(function () { track("map_answer", { q: q.id }); go(step + 1); }, 260);
          }
        }
      }, kids));
    });

    var kids = [];
    if (firstInSection) kids.push(el("p", { class: "section-note", text: Q.sections[q.section] }));
    kids.push(el("h2", { text: q.title }));
    kids.push(el("p", { class: "help", text: q.help || "" }));
    kids.push(grid);
    if (isMulti) kids.push(counter);
    if (q.modest) {
      var cb = el("input", { type: "checkbox" });
      cb.checked = !!answers.modest;
      cb.addEventListener("change", function () { answers.modest = cb.checked; });
      modestBox = el("label", { class: "modest" }, [cb, el("span", { text: q.modest })]);
      kids.push(modestBox);
    }
    if (isMulti || q.confirm) {
      nextBtn.addEventListener("click", function () { track("map_answer", { q: q.id }); go(step + 1); });
      kids.push(nextBtn);
    }
    var sec = el("section", { class: "q" }, kids);
    refresh();
    return sec;
  }

  /* ---------- מייל ---------- */
  function emailScreen() {
    var e = Q.email;
    var name = el("input", { type: "text", id: "fn", autocomplete: "given-name", maxlength: "40" });
    var mail = el("input", { type: "email", id: "em", autocomplete: "email", inputmode: "email", maxlength: "120" });
    var ok = el("input", { type: "checkbox", id: "ok" });
    var err = el("p", { class: "err", role: "alert" });
    var btn = el("button", { class: "cta", type: "submit", text: e.cta, disabled: "disabled" });
    if (answers.name) name.value = answers.name;
    if (answers.email) mail.value = answers.email;

    function valid() { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim()); }
    function upd() { btn.disabled = !(ok.checked && name.value.trim() && valid()); }
    [name, mail].forEach(function (i) { i.addEventListener("input", function () { err.textContent = ""; upd(); }); });
    ok.addEventListener("change", upd);
    mail.addEventListener("blur", function () { if (mail.value.trim() && !valid()) err.textContent = e.badMail; });

    var form = el("form", { class: "form", novalidate: "novalidate" }, [
      el("h2", { text: e.title }),
      el("label", { class: "f", for: "fn", text: e.name }), name,
      el("label", { class: "f", for: "em", text: e.mail }), mail,
      err,
      el("label", { class: "consent", for: "ok" }, [ok, el("span", { text: e.consent })]),
      btn
    ]);
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (btn.disabled) return;
      answers.name = name.value.trim();
      answers.email = mail.value.trim();
      btn.disabled = true; btn.textContent = e.sending;
      submit().then(function () { track("map_submit", { src: src }); go(total + 1); });
    });
    return form;
  }

  function fullAnswers() {
    return Q.questions.map(function (q) {
      var a = answers[q.id];
      var txt = Array.isArray(a) ? a.map(function (k) { return q.options[k].label; }).join(" + ") : q.options[a].label;
      return { q: q.title, a: txt };
    });
  }

  function code() {
    var q6 = (answers.q6 || []).filter(function (k) { return !Q.questions[5].options[k].exclusive; });
    return SM.encode({ q1: answers.q1, q2: answers.q2, q3: answers.q3, q4: answers.q4, q5: answers.q5,
      q6: q6, q7: answers.q7, modest: answers.modest });
  }

  function submit() {
    var payload = {
      name: answers.name, email: answers.email, consent: true,
      code: code(), src: src, answers: fullAnswers(), modest: !!answers.modest,
      body: SM.body(answers) || "פתוח"
    };
    try { sessionStorage.setItem("mapa_code", payload.code); } catch (e) {}
    if (!Q.endpoint) { console.log("[mapa] test mode, not sent:", payload); return Promise.resolve(); }
    // text/plain כדי שלא תהיה בקשת preflight מול Apps Script
    return fetch(Q.endpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload) }).catch(function () {}).then(function () {});
  }

  /* ---------- הצצה ---------- */
  function peek() {
    var p = Q.peek, b = SM.body(answers);
    var kids = [];
    if (b) {
      kids.push(el("img", { class: "fig", src: "img/bodies/" + b + ".png", alt: "" }));
      kids.push(el("h2", { text: p.bodyLine.replace("{L}", b.replace("-", "/")) }));
    } else {
      kids.push(el("h2", { text: p.openLine }));
    }
    kids.push(el("p", { class: "way", text: p.onTheWay }));
    kids.push(el("p", { class: "spam", text: p.spam }));
    kids.push(el("div", { class: "insta" }, [
      el("p", { text: p.insta }),
      el("a", { class: "cta insta-btn", href: p.instaUrl, target: "_blank", rel: "noopener",
        onclick: function () { track("map_instagram"); } }, [p.instaCta])
    ]));
    kids.push(el("div", { class: "sig" }, [
      el("span", { text: "עינת רן אלקיים | סטיילינג · תדמית · מסר חזותי" }),
      el("span", { class: "site", text: "Einatran.com" })
    ]));
    return el("section", { class: "peek" }, kids);
  }

  render();
})();
