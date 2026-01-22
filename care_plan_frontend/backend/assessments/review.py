def flatten_for_review(data: dict, prefix=""):
    """
    Yields (path, value) for leaf nodes.
    """
    if isinstance(data, dict):
        for k, v in data.items():
            new_prefix = f"{prefix}.{k}" if prefix else k
            yield from flatten_for_review(v, new_prefix)
    elif isinstance(data, list):
        for i, v in enumerate(data):
            new_prefix = f"{prefix}[{i}]"
            yield from flatten_for_review(v, new_prefix)
    else:
        yield (prefix, data)

def to_review_list(final_json: dict, confidence_map: dict | None = None):
    """
    confidence_map: dict[path] -> float (0..1)
    """
    confidence_map = confidence_map or {}
    out = []
    for path, value in flatten_for_review(final_json):
        if value is None or value == "" or value == []:
            continue
        out.append({
            "field": path,
            "value": value if not isinstance(value, (dict, list)) else str(value),
            "confidence": float(confidence_map.get(path, 0.75)),
            "accepted": None
        })
    return out
