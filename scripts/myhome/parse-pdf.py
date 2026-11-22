"""Extract searchable text, and identify consistently structured selection tables."""

import json
import re
import sys

import pdfplumber


def cleaned(value):
    return " ".join((value or "").replace("\x00", "").split())


def identify_table(rows):
    if not rows:
        return None
    headers = [cleaned(cell) for cell in rows[0]]
    headers_compact = [header.replace(" ", "") for header in headers]
    if headers_compact[:2] == ["순위", "자격요건"]:
        label = "입주 순위"
    elif headers_compact[:3] in (
        ["평가항목", "평가요소", "배점"],
        ["배점항목", "평가요소", "점수"],
    ):
        label = "배점 기준"
    else:
        return None

    width = len(headers)
    data = [[cleaned(cell) for cell in row] for row in rows[1:]]
    if not data or not all(len(row) == width and all(row[:3]) for row in data):
        return None
    if label == "입주 순위" and not all(re.fullmatch(r"\d+\s*순위", row[0]) for row in data):
        return None
    return {"label": label, "headers": headers, "rows": data}


def extract(filename):
    pages = []
    sections = []
    with pdfplumber.open(filename) as document:
        for page in document.pages:
            text = (page.extract_text(layout=True) or "").replace("\x00", "").strip()
            pages.append({"number": page.page_number, "text": text})
            # Full documents are retained, but automatic display uses only recognized tables.
            if "평가요소" in text.replace(" ", "") or "자격요건" in text.replace(" ", ""):
                for rows in page.extract_tables():
                    section = identify_table(rows)
                    if section:
                        sections.append({**section, "sourcePage": page.page_number})
            page.close()
    return {
        "pageCount": len(pages),
        "textPages": sum(bool(re.search(r"[가-힣A-Za-z]{2,}", page["text"])) for page in pages),
        "pages": pages,
        "sections": sections,
    }


if __name__ == "__main__":
    print(json.dumps(extract(sys.argv[1]), ensure_ascii=False))
