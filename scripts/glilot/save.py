"""Publish freshly collected data without clobbering other runs: start from the latest main, copy in only the
store files this run produced, and merge their entries into index.json. Usage: save.py NEW_DATA_DIR"""
import json, os, shutil, sys
new_dir = sys.argv[1]
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "glilot", "data")
new_idx = json.load(open(os.path.join(new_dir, "index.json"), encoding="utf-8"))
idx_path = os.path.join(out, "index.json")
idx = json.load(open(idx_path, encoding="utf-8")) if os.path.exists(idx_path) else {"stores": {}}
for store in new_idx.get("produced", []):
    shutil.copy(os.path.join(new_dir, f"{store}.json"), os.path.join(out, f"{store}.json"))
    cache = os.path.join(new_dir, f"cuts-{store}.json")
    if os.path.exists(cache): shutil.copy(cache, os.path.join(out, f"cuts-{store}.json"))
    idx["stores"][store] = new_idx["stores"][store]
idx["names"] = {**idx.get("names", {}), **new_idx.get("names", {})}
idx.pop("produced", None)
json.dump(idx, open(idx_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("saved", new_idx.get("produced", []))
