import sys,os,re,urllib.request; sys.path.insert(0,os.path.dirname(__file__))
from common import UA
for u in sys.argv[1:]:
    try:
        r=urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":UA,"Accept":"text/html,application/json"}),timeout=30)
        b=r.read().decode("utf-8","replace")
        hints=[h for h in ["Shopify","Magento","mage/","woocommerce","wp-content","__NEXT_DATA__","nuxt","salesforce","demandware","sfcc","vtex","konimbo","algolia","graphql","cdn.shopify","static/version"] if h.lower() in b.lower()]
        print("OK",u,r.status,r.geturl(),len(b),hints)
        print("   title:",(re.search(r"<title>(.*?)</title>",b,re.S) or [None,""])[1].strip()[:100])
        if u.endswith(".json") or "json" in r.headers.get("Content-Type",""): print("   ",b[:600])
    except Exception as e: print("ERR",u,e)
