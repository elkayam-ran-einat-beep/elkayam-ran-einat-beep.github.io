import json, urllib.request, sys
H = {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36","Accept":"application/json","Accept-Language":"he-IL,he;q=0.9,en;q=0.8"}
def get(u):
    r = urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=30)
    return r.status, r.read()
for u in ["https://www.zara.com/il/en/categories?ajax=true","https://www.zara.com/il/he/categories?ajax=true"]:
    try:
        s,b = get(u); print(u, s, len(b)); d = json.loads(b)
        def walk(cs, depth=0):
            for c in cs:
                if depth < 3: print("  "*depth, c.get("id"), c.get("name"), c.get("layout"), c.get("redirectCategoryId"))
                walk(c.get("subcategories",[]), depth+1)
        walk(d.get("categories",[]))
    except Exception as e: print(u, "ERR", e)
