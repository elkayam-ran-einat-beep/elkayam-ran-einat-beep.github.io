import json, urllib.request, collections, time
H = {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36","Accept":"application/json"}
def get(u): return json.loads(urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=40).read())
WANT = {"WOMAN":["JACKETS","DRESSES","SHIRTS","TOPS | BODIES","T-SHIRTS","JEANS","TROUSERS","SKIRTS","BLAZERS","KNITWEAR","COATS","PUFFERS | TECHNICAL","SWEATSHIRTS | JOGGERS","SHORTS | BERMUDAS","JUMPERS | CARDIGANS","LEATHER","SHOES","BAGS","ACCESSORIES"],
        "MAN":["VIEW ALL","SHOES","TRAINERS","BAGS | BACKPACKS","ACCESSORIES"]}
cats = get("https://www.zara.com/il/en/categories?ajax=true")["categories"]
for sec in cats:
    if sec["name"] not in WANT: continue
    found = {}
    def walk(cs):
        for c in cs:
            if c["name"] in WANT[sec["name"]] and c["name"] not in found: found[c["name"]] = c.get("redirectCategoryId") or c["id"]
            walk(c.get("subcategories",[]))
    walk(sec.get("subcategories",[]))
    print("==", sec["name"], found)
    agg = collections.defaultdict(list); seen=set()
    for name,cid in found.items():
        try: d = get(f"https://www.zara.com/il/en/category/{cid}/products?ajax=true")
        except Exception as e: print(name,"ERR",e); continue
        n=0
        for g in d.get("productGroups",[]):
            for e in g.get("elements",[]):
                for c in e.get("commercialComponents") or []:
                    if c.get("type")!="Product" or c["id"] in seen: continue
                    seen.add(c["id"]); n+=1
                    agg[(c.get("sectionName"),c.get("familyName"),c.get("subfamilyName"))].append(c["name"])
        print(" ", name, cid, n); time.sleep(1)
    print("TOTAL", len(seen))
    for k,v in sorted(agg.items(), key=lambda x:-len(x[1])):
        print(" ", k, len(v), "|", " / ".join(v[:4]))
