"""金属徽章 pin 交换记录 API。"""

from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import get_connection, init_db
from schemas import ContactCreate, ContactResponse, ContactUpdate, PinCreate, PinResponse, PinUpdate, SeriesCreate, SeriesResponse, SeriesUpdate, WearingHistoryCreate, WearingHistoryResponse

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


@app.get("/api/pins", response_model=List[PinResponse])
def list_pins() -> List[PinResponse]:
    """获取全部徽章交换记录。"""
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM pins ORDER BY exchange_date DESC, id DESC").fetchall()
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
                exchange_date, worn
            ) VALUES (?, ?, ?, ?, ?)
            """,
            (
                payload.pattern_description,
                payload.source,
                payload.exchange_partner,
                payload.exchange_date,
                1 if payload.worn else 0,
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
                worn = ?
            WHERE id = ?
            """,
            (
                payload.pattern_description,
                payload.source,
                payload.exchange_partner,
                payload.exchange_date,
                1 if payload.worn else 0,
                pin_id,
            ),
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
