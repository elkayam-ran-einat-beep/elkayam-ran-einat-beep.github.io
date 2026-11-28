/* מפת הסטייל · הלוגיקה המשותפת לשאלון ולמפה.
   קוד המפה (9 תווים): q1 q2 q3 q4 q5 · סגנון1 סגנון2 · q7 · צנוע
   למשל "12010" + "2n" + "1" + "0" = "120102n10". סגנון חסר = "n". בלי שם ובלי מייל. */
(function () {
  function encode(a) {
    var s = (a.q6 || []).slice(0, 2);
    return [a.q1, a.q2, a.q3, a.q4, a.q5].join("") +
      (s[0] != null ? s[0] : "n") + (s[1] != null ? s[1] : "n") + a.q7 + (a.modest ? 1 : 0);
  }

  function decode(code) {
    if (!/^[0-3][0-3][0-2][0-2][0-2][0-8n][0-8n][0-4][01]$/.test(code || "")) return null;
    var c = code.split("");
    var q6 = [c[5], c[6]].filter(function (x) { return x !== "n"; }).map(Number);
    return { q1: +c[0], q2: +c[1], q3: +c[2], q4: +c[3], q5: +c[4], q6: q6, q7: +c[7], modest: c[8] === "1" };
  }

  /* מבנה הגוף, לפי עמוד 15 בבנק.
     q1: 0 רחבות מהאגן · 1 צרות מהאגן · 2 באותו רוחב · 3 קשה להעריך
     q2: 0 מותן צרה · 1 קו ישר · 2 מרכז רחב · 3 קשה להחליט
     מחזיר "X" "H" "A" "V-Y" "O" או null (כיוון גוף פתוח). */
  function body(a) {
    if (a.q2 === 2) return (a.q1 === 2 || a.q1 === 3) ? "O" : null;
    if (a.q1 === 1) return "A";
    if (a.q1 === 0) return "V-Y";
    if (a.q1 === 2 && a.q2 === 0) return "X";
    if (a.q1 === 2 && a.q2 === 1) return "H";
    return null;
  }

  /* העונה והרביעייה, לפי האפיון (סעיף 2).
     q3: 0 חם · 1 קר · 2 לא יודעת   q4: 0 נקי · 1 רך · 2 לא שמתי לב   q5: 0 בולט · 1 עדין · 2 קשה להחליט
     מחזיר {season, deep, unsure} או {open:"warm"|"cool"|"none"} */
  function color(a) {
    var warm = a.q3 === 0, cool = a.q3 === 1;
    if (!warm && !cool) return { open: "none" };
    var clear;
    if (a.q4 === 0) clear = true;
    else if (a.q4 === 1) clear = false;
    else if (a.q5 === 0) clear = warm ? false : true;   // בולט: סתיו או חורף
    else if (a.q5 === 1) clear = warm ? true : false;   // עדין: אביב או קיץ
    else return { open: warm ? "warm" : "cool" };
    var season = warm ? (clear ? "spring" : "autumn") : (clear ? "winter" : "summer");
    return { season: season, deep: a.q5 === 0, unsure: a.q5 === 2 };
  }

  window.StyleMap = { encode: encode, decode: decode, body: body, color: color };
})();
