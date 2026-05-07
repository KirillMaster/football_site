"""Extract plain text from DOCX files in mail4."""
import zipfile
import re
import xml.etree.ElementTree as ET
from pathlib import Path

src = Path(r"C:\Pet\footbal_content_2\mail4")

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

def extract(p: Path) -> str:
    with zipfile.ZipFile(p) as z:
        with z.open("word/document.xml") as f:
            tree = ET.parse(f)
    root = tree.getroot()
    out: list[str] = []
    for para in root.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"):
        pieces: list[str] = []
        for t in para.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t"):
            if t.text:
                pieces.append(t.text)
        line = "".join(pieces).strip()
        if line:
            out.append(line)
    return "\n".join(out)

for fname in ["Презентация трайаут.docx", "Сборы - подготовка к просмотрам в Европе..docx"]:
    p = src / fname
    if not p.exists():
        print(f"MISSING: {p}")
        continue
    print(f"=== {fname} ===")
    print(extract(p))
    print()
