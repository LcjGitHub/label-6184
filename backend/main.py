"""金属徽章 pin 交换记录 API。"""

from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import get_connection, init_db
from schemas import ContactCreate, ContactResponse, ContactUpdate, PinCreate, PinResponse, PinUpdate

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
