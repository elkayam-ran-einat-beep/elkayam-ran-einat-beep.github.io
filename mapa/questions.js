/* מפת הסטייל · השאלות. כל הטקסטים של השאלון יושבים כאן, ורק כאן.
   הקוד של התשובות נשמר כספרות לפי סדר האפשרויות (0, 1, 2...). לא לשנות סדר אפשרויות בלי לעדכן את map.js. */
window.QUIZ = {
  // כתובת הסקריפט בגוגל (Apps Script). ריקה = מצב בדיקה, שום דבר לא נשלח.
  endpoint: "",

  intro: {
    kicker: "מפת הסטייל",
    title: "רוצה לגלות סוף סוף אילו גזרות הכי יחמיאו לך? אילו צבעים יגרמו לעור שלך לזהור? ומה הסטייל שמבטא את האישה שאת היום?",
    lead: "עני על שבע שאלות קצרות, ומפת סטייל אישית תחכה לך במייל.",
    listTitle: "מה במפה?",
    list: ["שלוש גזרות לנסות, שידגישו את ההיילייטס שלך", "ארבעה צבעים שהכי יחמיאו לך", "לוק אחד שאפשר ללבוש כבר השבוע, עם מה שיש לך בארון"],
    meta: "שבע שאלות · שתי דקות",
    cta: "בואי נתחיל"
  },

  sections: {
    body: "עני לפי מה שאת רואה ומרגישה היום. גם \"קשה לי להחליט\" זו תשובה, ואפשר להתחיל ממנה.",
    color: "חשבי על האופן שבו הצבע נראה ליד הפנים שלך באור יום. אם עוד לא בדקת, אפשר לבחור \"לא יודעת\"."
  },

  questions: [
    { id: "q1", section: "body", kind: "pics", title: "איך הכתפיים שלך ביחס לאגן?",
      options: [
        { label: "רחבות יותר מהאגן", img: "img/bodies/V-Y.png" },
        { label: "צרות יותר מהאגן", img: "img/bodies/A.png" },
        { label: "בערך באותו רוחב", img: "img/bodies/H.png" },
        { label: "קשה לי להעריך", plain: true }
      ] },
    { id: "q2", section: "body", kind: "pics", title: "איזה תיאור הכי דומה לקו הגוף שלך?",
      options: [
        { label: "המותן שלי צרה בבירור ביחס לכתפיים ולאגן", img: "img/bodies/X.png" },
        { label: "המותן שלי פחות מודגשת, וקו הגוף די ישר", img: "img/bodies/H.png" },
        { label: "מרכז הגוף שלי רחב יותר מהאגן, והמותן פחות מודגשת", img: "img/bodies/O.png" },
        { label: "קשה לי להחליט", plain: true }
      ] },
    { id: "q3", section: "color", kind: "swatch", title: "מה מחמיא לך יותר ליד הפנים?",
      help: "חשבי על תכשיט או חולצה שקיבלת עליהם מחמאות.",
      options: [
        { label: "זהב ושמנת", colors: ["#C9A14A", "#F3E6CC"] },
        { label: "כסף ולבן צחור", colors: ["#B8BCC2", "#FFFFFF"] },
        { label: "שניהם במידה דומה / לא יודעת", plain: true }
      ] },
    { id: "q4", section: "color", kind: "swatch", title: "באילו צבעים הפנים שלך נראות רעננות יותר?",
      options: [
        { label: "צבעים נקיים וברורים, כמו קורל או כחול רויאל", colors: ["#EF826B", "#2851A8"] },
        { label: "צבעים רכים ומעושנים, כמו ורוד עתיק או ירוק זית רך", colors: ["#C28FAD", "#8E8A5E"] },
        { label: "עוד לא שמתי לב / לא יודעת", plain: true }
      ] },
    { id: "q5", section: "color", kind: "pics", wide: true,
      title: "כמה בולט ההבדל בין צבע העור שלך לבין צבע השיער הטבעי, הגבות והעיניים?",
      help: "הסתכלי במראה באור יום, בלי איפור.",
      options: [
        { label: "בולט: למשל עור בהיר עם שיער טבעי, גבות ועיניים כהים", img: "img/contrast/high.jpg" },
        { label: "עדין: הגוונים בפנים שלי קרובים זה לזה", img: "img/contrast/low.jpg" },
        { label: "קשה לי להחליט", plain: true }
      ] },
    { id: "q6", kind: "multi", max: 2, title: "איזה סגנון לבוש את הכי אוהבת?",
      help: "אפשר לבחור עד שני סגנונות.",
      options: [
        { label: "קלאסי", img: "img/q6/classic_trousers.jpg" },
        { label: "קז׳ואל", img: "img/q6/casual.jpg" },
        { label: "רומנטי", img: "img/q6/romantic.jpg" },
        { label: "בוהו", img: "img/q6/boho.jpg" },
        { label: "גותי", img: "img/q6/gothic.jpg" },
        { label: "דרמטי", img: "img/q6/dramatic.jpg" },
        { label: "אקלקטי", img: "img/q6/eclectic.jpg" },
        { label: "אלגנטי", img: "img/q6/elegant.jpg" },
        { label: "קשה לי לבחור", plain: true, exclusive: true }
      ] },
    { id: "q7", kind: "pics", confirm: true, title: "עד כמה את אוהבת להתלבש מחויט ביום רגיל?",
      help: "בחרי את הלוק שהכי מתאים ליום שלך.",
      options: [
        { label: "קז׳ואל", img: "img/q7/casual.jpg" },
        { label: "סמארט קז׳ואל", img: "img/q7/smart_casual.jpg" },
        { label: "קלאסי לייט", img: "img/q7/classic_light.jpg" },
        { label: "מחויט", img: "img/q7/tailored.jpg" },
        { label: "קשה לי לבחור", plain: true }
      ],
      modest: "אני לובשת רק חצאיות ושמלות, בלי מחשופים" }
  ],

  email: {
    title: "המפה שלך מוכנה. לאן לשלוח אותה?",
    name: "שם פרטי",
    mail: "מייל",
    consent: "אני רוצה לקבל ממך מיילים עם טיפים, השראה ועדכונים. אפשר להסיר את עצמי בכל רגע.",
    cta: "שלחי לי את המפה",
    badMail: "נראה שחסר משהו בכתובת המייל.",
    sending: "שולחת…"
  },

  peek: {
    bodyLine: "מבנה הגוף שלך הוא {L}, ולכן הגזרות שהכי מחמיאות לך הן...",
    openLine: "המפה שלך מוכנה, ויש בה כמה כיוונים לגזרות שכדאי לך לנסות...",
    onTheWay: "המפה המלאה בדרך אלייך במייל.",
    spam: "לא רואה אותה תוך כמה דקות? הציצי בתיקיית \"קידומי מכירות\" או \"ספאם\", וגררי אותה לתיבה הראשית כדי שהמיילים הבאים ממני יגיעו אלייך.",
    insta: "בינתיים, מוזמנת להמשיך לקבל ממני השראה ותוכן על סטייל באינסטגרם.",
    instaCta: "לעקוב אחריי באינסטגרם",
    instaUrl: "https://www.instagram.com/einat_ran_elkayam/"
  },

  nav: { next: "המשך", back: "חזרה" }
};
