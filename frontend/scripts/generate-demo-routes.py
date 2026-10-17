"""Refresh route IDs from actual inbox records; never read labels or scorer data."""
import hashlib
import json
from pathlib import Path
import re
import zipfile

frontend = Path(__file__).resolve().parents[1]
bundle = frontend.parent / "data" / "sdoc-hackathon-bundle.zip"
with zipfile.ZipFile(bundle) as archive:
    email_ids = []
    for name in archive.namelist():
        if re.fullmatch(r"inbox/[^/]+\.json", name):
            email_id = json.loads(archive.read(name))["email_id"]
            if not isinstance(email_id, str) or not re.fullmatch(r"email_\d+", email_id):
                raise ValueError(f"Invalid email ID in {name}")
            email_ids.append(email_id)
if not email_ids or len(email_ids) != len(set(email_ids)):
    raise ValueError("The inbox must contain unique, nonempty email IDs")
manifest = {
    "source": "data/sdoc-hackathon-bundle.zip:inbox/*.json",
    "bundle_sha256": hashlib.sha256(bundle.read_bytes()).hexdigest(),
    "email_ids": sorted(email_ids),
}
target = frontend / "data" / "demo-routes.json"
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
print(f"Wrote {len(email_ids)} actual email route IDs to {target.relative_to(frontend)}")
