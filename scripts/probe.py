import json, urllib.request
H = {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36","Accept":"application/json"}
def get(u):
    return json.loads(urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=30).read())
for lang in ["en","he"]:
    for cid in ["2420794","2420795"]:
        u=f"https://www.zara.com/il/{lang}/category/{cid}/products?ajax=true"
        try:
            d=get(u); groups=d.get("productGroups",[])
            els=[c for g in groups for e in g.get("elements",[]) for c in (e.get("commercialComponents") or [])]
            print(u,"groups",len(groups),"components",len(els))
            if els and lang=="en" and cid=="2420795":
                s=json.dumps(els[0],ensure_ascii=False); print(s[:6000])
            if els and lang=="he": print([ (c.get("id"),c.get("name")) for c in els[:5]])
        except Exception as e: print(u,"ERR",e)
