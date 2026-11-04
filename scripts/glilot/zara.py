"""Zara Israel: women's and men's clothing, shoes, bags and belts."""
import time
from common import get_json
from classify import classify, color_families

BASE = "https://www.zara.com/il"
WANT = {
  "WOMAN": ["JACKETS","DRESSES","SHIRTS","TOPS | BODIES","T-SHIRTS","JEANS","TROUSERS","SKIRTS","BLAZERS","KNITWEAR","COATS",
            "PUFFERS | TECHNICAL","SWEATSHIRTS | JOGGERS","SHORTS | BERMUDAS","JUMPERS | CARDIGANS","LEATHER","CO-ORD SETS",
            "SHOES","BAGS","ACCESSORIES"],
  "MAN": ["JACKETS | GILETS","PUFFERS","COATS","SWEATERS | CARDIGANS","SWEATSHIRTS | SWEATPANTS","JEANS","TROUSERS","LEATHER",
          "T-SHIRTS","LONG SLEEVE T-SHIRTS","SHIRTS","POLO SHIRTS","OVERSHIRTS","SUITS","BLAZERS","SUMMERY GARMENTS","VIEW ALL",
          "SHOES","TRAINERS","BAGS | BACKPACKS","ACCESSORIES"],
}
GENDER = {"WOMAN": "women", "MAN": "men"}

def components(cid, lang):
    d = get_json(f"{BASE}/{lang}/category/{cid}/products?ajax=true")
    for g in d.get("productGroups", []):
        for e in g.get("elements", []):
            for c in e.get("commercialComponents") or []:
                if c.get("type") == "Product": yield c

def pick_image(col, seo_id):
    media = col.get("xmedia") or []
    for m in media:
        if seo_id and m.get("name","").startswith(seo_id) and m.get("url"): return m["url"]
    for m in media:
        if m.get("url"): return m["url"]
    return None

def collect(log):
    cats = get_json(f"{BASE}/en/categories?ajax=true")["categories"]
    items, seen = [], set()
    for sec in cats:
        if sec.get("name") not in WANT: continue
        g = GENDER[sec["name"]]; found = {}
        def walk(cs):
            for c in cs:
                if c.get("name") in WANT[sec["name"]] and c["name"] not in found:
                    found[c["name"]] = c.get("redirectCategoryId") or c["id"]
                walk(c.get("subcategories", []))
        walk(sec.get("subcategories", []))
        for cname, cid in found.items():
            try:
                en = list(components(cid, "en")); time.sleep(0.7)
                he = {c["id"]: c for c in components(cid, "he")}; time.sleep(0.7)
            except Exception as ex:
                log(f"zara {sec['name']}/{cname}: {ex}"); continue
            kept = 0
            for c in en:
                if c["id"] in seen: continue
                seen.add(c["id"])
                if c.get("sectionName") and GENDER.get(c["sectionName"]) != g: continue
                path = classify(c.get("name",""), g, c.get("familyName",""))
                if not path: continue
                cols = (c.get("detail") or {}).get("colors") or []
                col = cols[0] if cols else {}
                if col.get("availability") == "out_of_stock": continue
                h = he.get(c["id"], {})
                hcol = (((h.get("detail") or {}).get("colors")) or [{}])[0]
                seo = c.get("seo") or {}
                hexc = ((c.get("colorInfo") or {}).get("mainColorHexCode"))
                img = pick_image(col, seo.get("seoProductId",""))
                price = (col.get("price") or c.get("price") or 0) / 100
                old = col.get("oldPrice") or c.get("oldPrice")
                it = {"s":"zara","g":g,"p":"/".join(path),
                      "n": h.get("name") or c.get("name"),
                      "en": c.get("name"),
                      "pr": round(price, 2),
                      "c": color_families(col.get("name",""), hexc),
                      "cn": hcol.get("name") or col.get("name",""),
                      "img": img.replace("{width}","563") if img else None,
                      "u": f"https://www.zara.com/il/he/{seo.get('keyword','p')}-p{seo.get('seoProductId','')}.html?v1={seo.get('discernProductId', c['id'])}"}
                if old: it["old"] = round(old/100, 2)
                if "NEW" in (c.get("productTag") or []): it["new"] = 1
                items.append(it); kept += 1
            log(f"zara {g} {cname}: {len(en)} listed, {kept} kept")
    return items
