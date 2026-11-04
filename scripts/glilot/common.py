import json, urllib.request, time
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
def get(url, accept="application/json", tries=3, headers=None):
    h = {"User-Agent": UA, "Accept": accept, "Accept-Language": "he-IL,he;q=0.9,en;q=0.8"}
    h.update(headers or {})
    for i in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=40).read()
        except Exception:
            if i == tries - 1: raise
            time.sleep(3 * (i + 1))
def get_json(url, **kw): return json.loads(get(url, **kw))
