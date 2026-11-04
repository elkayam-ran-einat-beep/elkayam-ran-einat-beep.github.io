import sys,os; sys.path.insert(0,os.path.dirname(__file__))
from common import get_json
cats=get_json("https://www.zara.com/il/en/categories?ajax=true")["categories"]
def walk(cs,d,path):
    for c in cs:
        p=path+[c.get("name","")]
        if any(k in p for k in ["TROUSERS","JEANS"]) and p[0] in("WOMAN","MAN"):
            print("  "*d,c["id"],c.get("name"),c.get("redirectCategoryId"),c.get("layout"),[a.get("key") for a in (c.get("attributes") or [])][:5] if isinstance(c.get("attributes"),list) else "")
        walk(c.get("subcategories",[]),d+1,p)
walk(cats,0,[])
# also inspect filters in a listing
for cid in ["2420795","2432131"]:
    d=get_json(f"https://www.zara.com/il/en/category/{cid}/products?ajax=true")
    print(cid, list(d.keys()))
    for k in d:
        if "filter" in k.lower() or "facet" in k.lower(): print(k, str(d[k])[:1500])
