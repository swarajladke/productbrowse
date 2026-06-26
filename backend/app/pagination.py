import base64
import json
from datetime import datetime

def encode_cursor(updated_at: datetime, product_id: int) -> str:
    cursor_dict = {
        "updated_at": updated_at.isoformat(),
        "id": product_id
    }
    cursor_json = json.dumps(cursor_dict)
    return base64.b64encode(cursor_json.encode('utf-8')).decode('utf-8')

def decode_cursor(cursor_str: str) -> dict:
    try:
        cursor_json = base64.b64decode(cursor_str).decode('utf-8')
        cursor_dict = json.loads(cursor_json)
        # Parse datetime string back to datetime object
        cursor_dict["updated_at"] = datetime.fromisoformat(cursor_dict["updated_at"])
        return cursor_dict
    except Exception:
        raise ValueError("Invalid cursor")
