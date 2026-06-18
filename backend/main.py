"""金属徽章 pin 交换记录 API。"""

from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from database import get_connection, init_db
from schemas import ContactCreate, ContactResponse, ContactUpdate, EventCreate, EventResponse, EventUpdate, PinCreate, PinPatch, PinResponse, PinUpdate, SeriesCreate, SeriesResponse, SeriesUpdate, WearingHistoryCreate, WearingHistoryResponse, WishCreate, WishResponse, WishUpdate

app = FastAPI(title="Pin Exchange API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    """应用启动时初始化数据库。"""
    init_db()


def row_to_pin(row) -> PinResponse:
    """将 SQLite Row 转为响应模型。"""
    return PinResponse(
        id=row["id"],
        pattern_description=row["pattern_description"],
        source=row["source"],
        exchange_partner=row["exchange_partner"],
        exchange_date=row["exchange_date"],
        worn=bool(row["worn"]),
        is_favorite=bool(row["is_favorite"]),
    )


def row_to_contact(row) -> ContactResponse:
    """将 SQLite Row 转为联系人响应模型。"""
    return ContactResponse(
        id=row["id"],
        nickname=row["nickname"],
        city=row["city"],
        contact_info=row["contact_info"],
        remark=row["remark"],
    )


def row_to_series(row) -> SeriesResponse:
    """将 SQLite Row 转为系列响应模型。"""
    return SeriesResponse(
        id=row["id"],
        name=row["name"],
        brand=row["brand"],
        description=row["description"],
    )


def row_to_wearing_history(row) -> WearingHistoryResponse:
    """将 SQLite Row 转为佩戴历史响应模型。"""
    return WearingHistoryResponse(
        id=row["id"],
        pin_id=row["pin_id"],
        wear_date=row["wear_date"],
        occasion=row["occasion"],
        remarks=row["remarks"],
    )


def row_to_wish(row) -> WishResponse:
    """将 SQLite Row 转为愿望清单响应模型。"""
    return WishResponse(
        id=row["id"],
        pattern_description=row["pattern_description"],
        expected_source=row["expected_source"],
        priority=row["priority"],
        achieved=bool(row["achieved"]),
    )


def row_to_event(row) -> EventResponse:
    """将 SQLite Row 转为线下交换活动响应模型。"""
    return EventResponse(
        id=row["id"],
        name=row["name"],
        event_date=row["event_date"],
        location=row["location"],
        max_attendees=row["max_attendees"],
        remark=row["remark"],
    )


ALLOWED_SORT_FIELDS = {"exchange_date", "source", "id"}
ALLOWED_SORT_ORDERS = {"asc", "desc"}


@app.get("/api/pins", response_model=List[PinResponse])
def list_pins(
    keyword: Optional[str] = Query(None, description="关键词，按图案描述或交换对象模糊匹配"),
    sort_by: Optional[str] = Query(None, description="排序字段，支持 exchange_date、source"),
    sort_order: Optional[str] = Query(None, description="排序方向，asc 升序或 desc 降序"),
) -> List[PinResponse]:
    """获取全部徽章交换记录，支持关键词搜索和排序。"""
    conn = get_connection()
    try:
        trimmed_keyword = keyword.strip() if keyword else None
        safe_sort_by = sort_by if sort_by in ALLOWED_SORT_FIELDS else "exchange_date"
        safe_sort_order = sort_order.lower() if sort_order and sort_order.lower() in ALLOWED_SORT_ORDERS else "desc"

        order_clause = f"ORDER BY {safe_sort_by} {safe_sort_order}, id DESC"

        if trimmed_keyword:
            like_pattern = f"%{trimmed_keyword}%"
            rows = conn.execute(
                f"SELECT * FROM pins WHERE pattern_description LIKE ? OR exchange_partner LIKE ? {order_clause}",
                (like_pattern, like_pattern),
            ).fetchall()
        else:
            rows = conn.execute(f"SELECT * FROM pins {order_clause}").fetchall()
        return [row_to_pin(row) for row in rows]
    finally:
        conn.close()


@app.get("/api/pins/{pin_id}", response_model=PinResponse)
def get_pin(pin_id: int) -> PinResponse:
    """获取单条徽章记录。"""
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM pins WHERE id = ?", (pin_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="记录不存在")
        return row_to_pin(row)
    finally:
        conn.close()


@app.post("/api/pins", response_model=PinResponse, status_code=201)
def create_pin(payload: PinCreate) -> PinResponse:
    """新增徽章交换记录。"""
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO pins (
                pattern_description, source, exchange_partner,
                exchange_date, worn, is_favorite
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                payload.pattern_description,
                payload.source,
                payload.exchange_partner,
                payload.exchange_date,
                1 if payload.worn else 0,
                1 if payload.is_favorite else 0,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM pins WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return row_to_pin(row)
    finally:
        conn.close()


@app.put("/api/pins/{pin_id}", response_model=PinResponse)
def update_pin(pin_id: int, payload: PinUpdate) -> PinResponse:
    """更新徽章交换记录。"""
    conn = get_connection()
    try:
        existing = conn.execute("SELECT id FROM pins WHERE id = ?", (pin_id,)).fetchone()
        if existing is None:
            raise HTTPException(status_code=404, detail="记录不存在")
        conn.execute(
            """
            UPDATE pins SET
                pattern_description = ?,
                source = ?,
                exchange_partner = ?,
                exchange_date = ?,
                worn = ?,
                is_favorite = ?
            WHERE id = ?
            """,
            (
                payload.pattern_description,
                payload.source,
                payload.exchange_partner,
                payload.exchange_date,
                1 if payload.worn else 0,
                1 if payload.is_favorite else 0,
                pin_id,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM pins WHERE id = ?", (pin_id,)).fetchone()
        return row_to_pin(row)
    finally:
        conn.close()


@app.patch("/api/pins/{pin_id}", response_model=PinResponse)
def patch_pin(pin_id: int, payload: PinPatch) -> PinResponse:
    """部分更新徽章交换记录（用于切换收藏状态）。"""
    conn = get_connection()
    try:
        existing = conn.execute("SELECT * FROM pins WHERE id = ?", (pin_id,)).fetchone()
        if existing is None:
            raise HTTPException(status_code=404, detail="记录不存在")

        update_fields = []
        update_values = []

        if payload.is_favorite is not None:
            update_fields.append("is_favorite = ?")
            update_values.append(1 if payload.is_favorite else 0)

        if not update_fields:
            return row_to_pin(existing)

        update_values.append(pin_id)
        update_clause = ", ".join(update_fields)

        conn.execute(
            f"UPDATE pins SET {update_clause} WHERE id = ?",
            tuple(update_values),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM pins WHERE id = ?", (pin_id,)).fetchone()
        return row_to_pin(row)
    finally:
        conn.close()


@app.delete("/api/pins/{pin_id}", status_code=204)
def delete_pin(pin_id: int) -> None:
    """删除徽章交换记录。"""
    conn = get_connection()
    try:
        cursor = conn.execute("DELETE FROM pins WHERE id = ?", (pin_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="记录不存在")
    finally:
        conn.close()


@app.get("/api/contacts", response_model=List[ContactResponse])
def list_contacts() -> List[ContactResponse]:
    """获取全部交换对象联系人。"""
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM contacts ORDER BY id DESC").fetchall()
        return [row_to_contact(row) for row in rows]
    finally:
        conn.close()


@app.get("/api/contacts/{contact_id}", response_model=ContactResponse)
def get_contact(contact_id: int) -> ContactResponse:
    """获取单条联系人。"""
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM contacts WHERE id = ?", (contact_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="联系人不存在")
        return row_to_contact(row)
    finally:
        conn.close()


@app.post("/api/contacts", response_model=ContactResponse, status_code=201)
def create_contact(payload: ContactCreate) -> ContactResponse:
    """新增交换对象联系人。"""
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO contacts (
                nickname, city, contact_info, remark
            ) VALUES (?, ?, ?, ?)
            """,
            (
                payload.nickname,
                payload.city,
                payload.contact_info,
                payload.remark,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM contacts WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return row_to_contact(row)
    finally:
        conn.close()


@app.put("/api/contacts/{contact_id}", response_model=ContactResponse)
def update_contact(contact_id: int, payload: ContactUpdate) -> ContactResponse:
    """更新交换对象联系人。"""
    conn = get_connection()
    try:
        existing = conn.execute("SELECT id FROM contacts WHERE id = ?", (contact_id,)).fetchone()
        if existing is None:
            raise HTTPException(status_code=404, detail="联系人不存在")
        conn.execute(
            """
            UPDATE contacts SET
                nickname = ?,
                city = ?,
                contact_info = ?,
                remark = ?
            WHERE id = ?
            """,
            (
                payload.nickname,
                payload.city,
                payload.contact_info,
                payload.remark,
                contact_id,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM contacts WHERE id = ?", (contact_id,)).fetchone()
        return row_to_contact(row)
    finally:
        conn.close()


@app.delete("/api/contacts/{contact_id}", status_code=204)
def delete_contact(contact_id: int) -> None:
    """删除交换对象联系人。"""
    conn = get_connection()
    try:
        cursor = conn.execute("DELETE FROM contacts WHERE id = ?", (contact_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="联系人不存在")
    finally:
        conn.close()


@app.get("/api/series", response_model=List[SeriesResponse])
def list_series() -> List[SeriesResponse]:
    """获取全部徽章系列。"""
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM series ORDER BY id DESC").fetchall()
        return [row_to_series(row) for row in rows]
    finally:
        conn.close()


@app.get("/api/series/{series_id}", response_model=SeriesResponse)
def get_series(series_id: int) -> SeriesResponse:
    """获取单条徽章系列。"""
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM series WHERE id = ?", (series_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="系列不存在")
        return row_to_series(row)
    finally:
        conn.close()


@app.post("/api/series", response_model=SeriesResponse, status_code=201)
def create_series(payload: SeriesCreate) -> SeriesResponse:
    """新增徽章系列。"""
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO series (
                name, brand, description
            ) VALUES (?, ?, ?)
            """,
            (
                payload.name,
                payload.brand,
                payload.description,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM series WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return row_to_series(row)
    finally:
        conn.close()


@app.put("/api/series/{series_id}", response_model=SeriesResponse)
def update_series(series_id: int, payload: SeriesUpdate) -> SeriesResponse:
    """更新徽章系列。"""
    conn = get_connection()
    try:
        existing = conn.execute("SELECT id FROM series WHERE id = ?", (series_id,)).fetchone()
        if existing is None:
            raise HTTPException(status_code=404, detail="系列不存在")
        conn.execute(
            """
            UPDATE series SET
                name = ?,
                brand = ?,
                description = ?
            WHERE id = ?
            """,
            (
                payload.name,
                payload.brand,
                payload.description,
                series_id,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM series WHERE id = ?", (series_id,)).fetchone()
        return row_to_series(row)
    finally:
        conn.close()


@app.delete("/api/series/{series_id}", status_code=204)
def delete_series(series_id: int) -> None:
    """删除徽章系列。"""
    conn = get_connection()
    try:
        cursor = conn.execute("DELETE FROM series WHERE id = ?", (series_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="系列不存在")
    finally:
        conn.close()


@app.get("/api/pins/{pin_id}/wearing-history", response_model=List[WearingHistoryResponse])
def list_wearing_history(pin_id: int) -> List[WearingHistoryResponse]:
    """按徽章编号查询佩戴历史列表。"""
    conn = get_connection()
    try:
        existing = conn.execute("SELECT id FROM pins WHERE id = ?", (pin_id,)).fetchone()
        if existing is None:
            raise HTTPException(status_code=404, detail="徽章记录不存在")
        rows = conn.execute(
            "SELECT * FROM wearing_history WHERE pin_id = ? ORDER BY wear_date DESC, id DESC",
            (pin_id,),
        ).fetchall()
        return [row_to_wearing_history(row) for row in rows]
    finally:
        conn.close()


@app.post("/api/pins/{pin_id}/wearing-history", response_model=WearingHistoryResponse, status_code=201)
def create_wearing_history(pin_id: int, payload: WearingHistoryCreate) -> WearingHistoryResponse:
    """新增佩戴记录。"""
    conn = get_connection()
    try:
        existing = conn.execute("SELECT id FROM pins WHERE id = ?", (pin_id,)).fetchone()
        if existing is None:
            raise HTTPException(status_code=404, detail="徽章记录不存在")
        cursor = conn.execute(
            """
            INSERT INTO wearing_history (
                pin_id, wear_date, occasion, remarks
            ) VALUES (?, ?, ?, ?)
            """,
            (
                pin_id,
                payload.wear_date,
                payload.occasion,
                payload.remarks,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM wearing_history WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return row_to_wearing_history(row)
    finally:
        conn.close()


@app.delete("/api/wearing-history/{history_id}", status_code=204)
def delete_wearing_history(history_id: int) -> None:
    """删除佩戴记录。"""
    conn = get_connection()
    try:
        cursor = conn.execute("DELETE FROM wearing_history WHERE id = ?", (history_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="佩戴记录不存在")
    finally:
        conn.close()


@app.get("/api/wishes", response_model=List[WishResponse])
def list_wishes() -> List[WishResponse]:
    """获取全部愿望清单。"""
    conn = get_connection()
    try:
        rows = conn.execute(
            """
            SELECT * FROM wishes
            ORDER BY
                CASE priority
                    WHEN '高' THEN 1
                    WHEN '中' THEN 2
                    WHEN '低' THEN 3
                END,
                id DESC
            """
        ).fetchall()
        return [row_to_wish(row) for row in rows]
    finally:
        conn.close()


@app.get("/api/wishes/{wish_id}", response_model=WishResponse)
def get_wish(wish_id: int) -> WishResponse:
    """获取单条愿望。"""
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM wishes WHERE id = ?", (wish_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="愿望不存在")
        return row_to_wish(row)
    finally:
        conn.close()


@app.post("/api/wishes", response_model=WishResponse, status_code=201)
def create_wish(payload: WishCreate) -> WishResponse:
    """新增愿望。"""
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO wishes (
                pattern_description, expected_source, priority, achieved
            ) VALUES (?, ?, ?, ?)
            """,
            (
                payload.pattern_description,
                payload.expected_source,
                payload.priority,
                1 if payload.achieved else 0,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM wishes WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return row_to_wish(row)
    finally:
        conn.close()


@app.put("/api/wishes/{wish_id}", response_model=WishResponse)
def update_wish(wish_id: int, payload: WishUpdate) -> WishResponse:
    """更新愿望。"""
    conn = get_connection()
    try:
        existing = conn.execute("SELECT id FROM wishes WHERE id = ?", (wish_id,)).fetchone()
        if existing is None:
            raise HTTPException(status_code=404, detail="愿望不存在")
        conn.execute(
            """
            UPDATE wishes SET
                pattern_description = ?,
                expected_source = ?,
                priority = ?,
                achieved = ?
            WHERE id = ?
            """,
            (
                payload.pattern_description,
                payload.expected_source,
                payload.priority,
                1 if payload.achieved else 0,
                wish_id,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM wishes WHERE id = ?", (wish_id,)).fetchone()
        return row_to_wish(row)
    finally:
        conn.close()


@app.delete("/api/wishes/{wish_id}", status_code=204)
def delete_wish(wish_id: int) -> None:
    """删除愿望。"""
    conn = get_connection()
    try:
        cursor = conn.execute("DELETE FROM wishes WHERE id = ?", (wish_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="愿望不存在")
    finally:
        conn.close()


@app.get("/api/events", response_model=List[EventResponse])
def list_events() -> List[EventResponse]:
    """获取全部线下交换活动，按日期排序。"""
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM events ORDER BY event_date ASC, id DESC").fetchall()
        return [row_to_event(row) for row in rows]
    finally:
        conn.close()


@app.get("/api/events/{event_id}", response_model=EventResponse)
def get_event(event_id: int) -> EventResponse:
    """获取单条活动信息。"""
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM events WHERE id = ?", (event_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="活动不存在")
        return row_to_event(row)
    finally:
        conn.close()


@app.post("/api/events", response_model=EventResponse, status_code=201)
def create_event(payload: EventCreate) -> EventResponse:
    """新增线下交换活动。"""
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO events (
                name, event_date, location, max_attendees, remark
            ) VALUES (?, ?, ?, ?, ?)
            """,
            (
                payload.name,
                payload.event_date,
                payload.location,
                payload.max_attendees,
                payload.remark,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM events WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return row_to_event(row)
    finally:
        conn.close()


@app.put("/api/events/{event_id}", response_model=EventResponse)
def update_event(event_id: int, payload: EventUpdate) -> EventResponse:
    """更新线下交换活动。"""
    conn = get_connection()
    try:
        existing = conn.execute("SELECT id FROM events WHERE id = ?", (event_id,)).fetchone()
        if existing is None:
            raise HTTPException(status_code=404, detail="活动不存在")
        conn.execute(
            """
            UPDATE events SET
                name = ?,
                event_date = ?,
                location = ?,
                max_attendees = ?,
                remark = ?
            WHERE id = ?
            """,
            (
                payload.name,
                payload.event_date,
                payload.location,
                payload.max_attendees,
                payload.remark,
                event_id,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM events WHERE id = ?", (event_id,)).fetchone()
        return row_to_event(row)
    finally:
        conn.close()


@app.delete("/api/events/{event_id}", status_code=204)
def delete_event(event_id: int) -> None:
    """删除线下交换活动。"""
    conn = get_connection()
    try:
        cursor = conn.execute("DELETE FROM events WHERE id = ?", (event_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="活动不存在")
    finally:
        conn.close()
