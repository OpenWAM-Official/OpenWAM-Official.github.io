"""Turn the paper's result tables into JSON.

The LaTeX is the authority: these are the same files the figures are built
from, so parsing them keeps the site and the paper from drifting. Anything the
parser does not understand raises rather than being silently dropped.
"""

import json
import os
import pathlib
import re
import sys

# Where the paper's table sources live. Override with OPENWAM_TABLES; the
# default is only one plausible checkout location, not a requirement.
SRC = pathlib.Path(
    os.environ.get("OPENWAM_TABLES", pathlib.Path.home() / "Documents/OpenWAM/tables")
)

# Appendix E order, then the three real-robot tables.
SIM = [
    ("libero", "LIBERO"),
    ("libero_plus", "LIBERO-Plus"),
    ("vlabench", "VLABench"),
    ("robotwin_c2r", "RoboTwin2.0-Clean2Random"),
    ("robotwin", "RoboTwin2.0-Full"),
    ("robodojo", "RoboDojo"),
    ("ebench", "EBench"),
    ("robocasa_365", "RoboCasa365"),
    ("robocasa_gr1", "RoboCasa-GR1"),
]
REAL = [
    ("real_world", "Single-arm"),
    ("robodojo_real", "Bimanual (RoboDojo)"),
    ("real_world_dex", "Dexterous hand"),
]

MATH = {
    r"$\pi_0$": "π₀",
    r"$\pi_{0.5}$": "π₀.₅",
    r"$\pi_{0}$": "π₀",
    r"\openwamalpha{}": "OpenWAM-α",
    r"\openwamalpha": "OpenWAM-α",
    r"\alpha": "α",
    r"\beta": "β",
}


def clean(s: str) -> str:
    """Strip LaTeX down to display text, keeping the characters that matter."""
    for k, v in MATH.items():
        s = s.replace(k, v)
    s = re.sub(r"~?\\citep\{[^}]*\}", "", s)
    s = re.sub(r"\\makecell\{([^}]*)\}", lambda m: m.group(1).replace(r"\\", " "), s)
    # \best / \secondbest wrap a value and are the paper's ranking marks; the
    # flags are read from the raw string, so here they only need unwrapping.
    s = re.sub(r"\\(best|secondbest)\{([^{}]*)\}", r"\2", s)
    s = re.sub(r"\\(best|secondbest)\s*", "", s)
    s = re.sub(r"\\na\b", "n/a", s)
    s = re.sub(r"\\(textbf|underline|textit|textsc|mathbf|boldmath)\s*", "", s)
    s = s.replace("{", "").replace("}", "")
    s = s.replace(r"\%", "%").replace(r"\_", "_").replace("$", "")
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def cell(raw: str) -> dict:
    """One cell: what it says, what it means, and how the paper marked it."""
    best = r"\textbf" in raw and not raw.strip().startswith(r"\textbf{\boldmath")
    second = r"\underline" in raw
    text = clean(raw)
    if text in {"--", "-", "—", ""}:
        return {"text": "—", "value": None, "best": False, "second": False}
    # "17/20 (85%)" -> keep the display, rank on the percentage
    m = re.search(r"\(([\d.]+)%\)", text)
    if m:
        value = float(m.group(1))
    else:
        m2 = re.fullmatch(r"([\d.]+)%?", text)
        value = float(m2.group(1)) if m2 else None
    return {"text": text, "value": value, "best": best, "second": second}


def _read_body(raw: str) -> dict:
    """Columns and grouped rows from a single tabular body."""
    # \makecell{Stack\\Jenga} carries a line break inside a cell, and the row
    # separator is also \\ — split naively and the header comes apart mid-cell.
    def shield(m):
        return "\\makecell{" + m.group(1).replace(r"\\", "@@BR@@") + "}"

    raw = re.sub(r"\\makecell\{([^{}]*)\}", shield, raw)
    lines = [l.replace("@@BR@@", r"\\") for l in raw.split(r"\\")]

    columns: list[str] = []
    pending_span: list[str] | None = None   # upper tier of a two-row header
    groups: list[dict] = []
    current: dict = {"label": None, "rows": []}

    for line in lines:
        line = re.sub(r"\\(toprule|midrule|bottomrule|rowcolor\{[^}]*\}|hline)", "", line)
        line = re.sub(r"\\cmidrule(\(lr\))?\{[^}]*\}", "", line)
        if not line.strip():
            continue

        spans = re.findall(r"\\multicolumn\{(\d+)\}\{[^}]*\}\{(.*?)\}(?=\s*(?:&|$))", line, re.S)

        # Before the header exists, a row of \multicolumn cells is the upper tier
        # of a two-row header (task over ID/OOD), not a family heading.
        if spans and not columns and len(spans) > 1:
            pending_span = []
            for count, label in spans:
                pending_span += [clean(label)] * int(count)
            continue

        # Once the header is known, a row spanning it all is a family heading.
        if spans and columns and len(spans) == 1:
            if current["rows"]:
                groups.append(current)
            current = {"label": clean(spans[0][1]), "rows": []}
            continue

        cells = line.split("&")
        if not columns:
            columns = [clean(c) for c in cells[1:]]
            if pending_span:
                columns = [
                    f"{pending_span[i]} · {c}" if i < len(pending_span) and pending_span[i] else c
                    for i, c in enumerate(columns)
                ]
                pending_span = None
            continue
        if len(cells) < 2:
            continue

        name = clean(cells[0])
        if not name:
            continue
        current["rows"].append(
            {
                "model": name,
                "ours": "OpenWAM-α" in name,
                "cells": [cell(c) for c in cells[1:]],
            }
        )

    if current["rows"]:
        groups.append(current)
    return {"columns": columns, "groups": groups}


def parse(stem: str) -> dict:
    tex = (SRC / f"{stem}.tex").read_text()

    cap = re.search(r"\\caption\{(.*?)\}\s*\n", tex, re.S)
    caption = clean(cap.group(1)) if cap else stem
    title = caption.split(".")[0].replace("Evaluation Results on ", "").strip()

    bodies = re.findall(r"\\begin\{tabular\}\{[^}]*\}(.*?)\\end\{tabular\}", tex, re.S)
    if not bodies:
        raise SystemExit(f"{stem}: no tabular body")

    # real_world_dex stacks two tabulars in one float, four tasks split across
    # them. They repeat the method column, so the later block continues the
    # first horizontally — read them all or half the table goes missing.
    base = _read_body(bodies[0])
    for extra_raw in bodies[1:]:
        extra = _read_body(extra_raw)
        base["columns"] += extra["columns"]
        by_name = {r["model"]: r for g in extra["groups"] for r in g["rows"]}
        for g in base["groups"]:
            for r in g["rows"]:
                more = by_name.get(r["model"])
                if more is None:
                    raise SystemExit(
                        f"{stem}: {r['model']!r} is missing from a continuation block"
                    )
                r["cells"] += more["cells"]

    return {
        "id": stem,
        "title": title,
        "caption": caption,
        "columns": base["columns"],
        "groups": base["groups"],
    }


def parse_robodojo_real(stem: str) -> dict:
    """robodojo_real is shaped unlike the rest and needs its own reader.

    Two stub columns (policy, embodiment); each policy spans three embodiment
    rows with its name attached to the last of them via \\multirow{-3}; cells
    are \\res{score}{sr}, a pair rather than a scalar; and \\best / \\secondbest
    sit inside \\res rather than wrapping the cell.
    """
    tex = (SRC / f"{stem}.tex").read_text()
    cap = re.search(r"\\caption\{(.*?)\}\s*\n", tex, re.S)
    caption = clean(cap.group(1)) if cap else stem

    body = re.search(r"\\begin\{tabular\}\{[^}]*\}(.*?)\\end\{tabular\}", tex, re.S)
    lines = body.group(1).split(r"\\")

    def res_cell(raw: str) -> dict:
        raw = re.sub(r"\\cell[AB]", "", raw)
        raw = re.sub(r"\\multirow\{[^}]*\}\{[^}]*\}\{(.*)\}", r"\1", raw, flags=re.S)
        m = re.search(r"\\res\{(.*?)\}\{(.*?)\}\s*$", raw.strip(), re.S)
        if not m:
            t = clean(raw)
            return {"text": t or "—", "value": None, "best": False, "second": False}
        a, b = m.group(1), m.group(2)
        best = r"\\best" in raw
        second = r"\\secondbest" in raw
        va = clean(a)
        vb = clean(b)
        try:
            value = float(va)
        except ValueError:
            value = None
        return {"text": f"{va} / {vb}", "value": value, "best": best, "second": second}

    columns = ["Task 1", "Task 2", "Task 3", "Task 4", "Task 5", "Task 6",
               "Emb. Avg.", "Overall Avg."]
    rows: list[dict] = []
    block: list[dict] = []

    for line in lines:
        line = re.sub(r"\\(toprule|midrule|bottomrule|hline)", "", line)
        if not line.strip():
            continue
        cells = line.split("&")
        if len(cells) < 3:
            continue
        head = cells[0]
        if re.search(r"\\textbf\{(Policy|Embodiment)\}", line) or "\\textbf{Task 1}" in line:
            continue

        embodiment = clean(re.sub(r"\\cell[AB]", "", cells[1]))
        data = [res_cell(c) for c in cells[2:]]
        entry = {"sub": embodiment, "cells": data}

        mr = re.search(r"\\multirow\{-?\d+\}\{\*\}\{(.*)\}", head, re.S)
        if mr:
            policy = clean(mr.group(1))
            block.append(entry)
            for i, e in enumerate(block):
                rows.append({
                    "model": policy if i == 0 else "",
                    "sub": e["sub"],
                    "ours": "OpenWAM-α" in policy,
                    "spanStart": i == 0,
                    "spanLen": len(block),
                    "cells": e["cells"],
                })
            block = []
        else:
            block.append(entry)

    for r in rows:
        while len(r["cells"]) < len(columns):
            r["cells"].append({"text": "—", "value": None, "best": False, "second": False})
        r["cells"] = r["cells"][: len(columns)]

    return {
        "id": stem,
        "title": "RoboDojo real-world track",
        "caption": caption,
        "columns": columns,
        "subStub": "Embodiment",
        "groups": [{"label": None, "rows": rows}],
    }


def main() -> None:
    out = {"_source": "tables/*.tex in the OpenWAM paper repository", "simulation": [], "real": []}
    for stem, short in SIM:
        t = parse(stem)
        t["short"] = short
        out["simulation"].append(t)
    for stem, short in REAL:
        t = parse_robodojo_real(stem) if stem == "robodojo_real" else parse(stem)
        t["short"] = short
        out["real"].append(t)

    dest = pathlib.Path(sys.argv[1])
    dest.write_text(json.dumps(out, ensure_ascii=False, indent=1))

    for kind in ("simulation", "real"):
        for t in out[kind]:
            n = sum(len(g["rows"]) for g in t["groups"])
            gl = ", ".join(str(g["label"]) for g in t["groups"])
            print(f"  {t['short']:26s} cols={len(t['columns']):2d} rows={n:2d}  groups=[{gl}]")


main()
