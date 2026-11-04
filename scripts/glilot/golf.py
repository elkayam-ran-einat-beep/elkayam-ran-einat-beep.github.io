"""Golf (golf-il.co.il, Magento): parse category listing pages."""
import re, html, json, time
from common import get
from classify import classify, color_families

BASE = "https://www.golf-il.co.il"
# category path -> (gender, fallback path when the name alone is not enough)
CATS = {
  "women/shirts-and-tops": ("women", ["top"]), "women/jeans": ("women", ["bottom","long"]),
  "women/pants": ("women", ["bottom","long"]), "women/dresses-and-overalls": ("women", ["dress"]),
  "women/skirts": ("women", ["bottom","skirt"]), "women/sweater-and-knitted-shirts": ("women", ["top","knit"]),
  "women/cardigans": ("women", ["top","knit"]), "women/jackets-and-coats": ("women", ["jacket"]),
  "women/sets": ("women", None), "shoes/shoes-women": ("women", ["shoes"]), "women/accessories": ("women", None),
  "men/t-shirts": ("men", ["top","tee"]), "men/polo-shirts": ("men", ["top","polo"]), "men/button-up-shirts": ("men", ["top","shirt"]),
  "men/denim": ("men", ["bottom","long"]), "men/pants": ("men", ["bottom","long"]),
  "men/sweaters-and-knitted-shirts": ("men", ["top","knit"]), "men/sweatshirts": ("men", ["top","hood"]),
  "men/jackets-and-coats": ("men", ["jacket"]), "men/g-collection": ("men", None),
  "men/shoes": ("men", ["shoes"]), "shoes/shoes-men": ("men", ["shoes"]), "men/accessories": ("men", None),
}
LI = re.compile(r'<li data-unique-selector-key="\d+" id="product_category_(\d+)"(.*?)</form>\s*</li>', re.S)

def norm(s): return html.unescape(s or "").replace("’", "'").replace("׳", "'").strip()

def parse(page):
    out = []
    for pid, body in LI.findall(page):
        sku = re.search(r'data-product-sku="([^"]+)"', body)
        img = re.search(r'<img class="product-image-photo" src="([^"]+)"[^>]*alt="([^"]*)"', body)
        link = re.search(r'<a[^>]+class="product-item-link"[^>]*href="([^"]+)"', body) or re.search(r'href="(https://www\.golf-il\.co\.il/[^"]+)"', body)
        col = re.search(r'swatch_color-selected" style="background:\s*(#[0-9a-fA-F]{6})[^"]*">\s*<span[^>]*>([^<]*)</span>', body)
        prices = re.search(r'"optionPrices":\{"\d+":\{"oldPrice":\{"amount":([\d.]+)\},"basePrice":\{"amount":[\d.]+\},"costPrice":\{"amount":[^}]*\},"finalPrice":\{"amount":([\d.]+)\}', body)
        if not prices:
            prices = re.search(r'data-price-amount="([\d.]+)"', body)
            old, final = None, float(prices.group(1)) if prices else None
        else:
            old, final = float(prices.group(1)), float(prices.group(2))
        if not (img and final): continue
        out.append({"id": pid, "sku": sku.group(1) if sku else pid, "name": norm(img.group(2)), "img": img.group(1),
                    "url": link.group(1) if link else f"{BASE}/{sku.group(1) if sku else ''}",
                    "hex": col.group(1) if col else None, "cn": norm(col.group(2)) if col else "",
                    "pr": final, "old": old if old and old > final else None,
                    "oos": 'product_outofstock="true"' in body})
    return out

def collect(log):
    items, seen = [], set()
    for path, (g, fallback) in CATS.items():
        n = kept = 0
        for p in range(1, 40):
            try: page = get(f"{BASE}/{path}?p={p}", accept="text/html").decode("utf-8", "replace")
            except Exception as ex: log(f"golf {path} p{p}: {ex}"); break
            rows = parse(page); fresh = [r for r in rows if r["id"] not in seen]
            if not fresh: break
            for r in fresh:
                seen.add(r["id"]); n += 1
                if r["oos"]: continue
                cpath = classify(r["name"], g)
                if not cpath:
                    if not fallback: continue
                    cpath = fallback
                elif fallback and len(cpath) == 1 and len(fallback) > 1 and fallback[0] == cpath[0]:
                    cpath = fallback
                it = {"s":"golf","g":g,"p":"/".join(cpath),"n":r["name"],"pr":r["pr"],
                      "c": color_families(r["cn"], r["hex"]), "cn": r["cn"], "img": r["img"], "u": r["url"]}
                if r["old"]: it["old"] = r["old"]
                items.append(it); kept += 1
            time.sleep(0.6)
        log(f"golf {g} {path}: {n} listed, {kept} kept")
    return items
