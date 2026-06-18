"""SQLite 数据库连接与初始化。"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "data" / "pins.db"

SEED_PINS = [
    {
        "pattern_description": "迪士尼米奇头像珐琅徽章",
        "source": "上海迪士尼园区商店",
        "exchange_partner": "来自东京的交换者 Ken",
        "exchange_date": "2025-03-15",
        "worn": True,
        "is_favorite": False,
    },
    {
        "pattern_description": "哈利波特霍格沃茨校徽金属 pin",
        "source": "环球影城限定款",
        "exchange_partner": "北京 pin 爱好者 @小鹿",
        "exchange_date": "2025-04-02",
        "worn": False,
        "is_favorite": False,
    },
    {
        "pattern_description": "2024 奥运会五环纪念徽章",
        "source": "奥运官方授权经销商",
        "exchange_partner": "法国交换者 Marie",
        "exchange_date": "2024-08-10",
        "worn": True,
        "is_favorite": False,
    },
    {
        "pattern_description": "宝可梦皮卡丘渐变烤漆 pin",
        "source": "任天堂旗舰店",
        "exchange_partner": "成都漫展现场交换",
        "exchange_date": "2025-01-20",
        "worn": False,
        "is_favorite": False,
    },
    {
        "pattern_description": "故宫博物院千里江山图系列",
        "source": "故宫文创官方",
        "exchange_partner": "杭州收藏家阿明",
        "exchange_date": "2025-05-08",
        "worn": True,
        "is_favorite": False,
    },
]

SEED_CONTACTS = [
    {
        "nickname": "Ken",
        "city": "东京",
        "contact_info": "ken_pin@example.jp",
        "remark": "迪士尼徽章收藏家，已交换多次",
    },
    {
        "nickname": "小鹿",
        "city": "北京",
        "contact_info": "xiaolu_wechat_2024",
        "remark": "哈利波特主题 pin 爱好者",
    },
    {
        "nickname": "Marie",
        "city": "巴黎",
        "contact_info": "marie.collect@example.fr",
        "remark": "奥运纪念徽章系列交换伙伴",
    },
]

SEED_SERIES = [
    {
        "name": "迪士尼经典系列",
        "brand": "Disney",
        "description": "包含米奇、米妮、唐老鸭等经典迪士尼角色的徽章系列，是迪士尼乐园最受欢迎的收藏系列之一。",
    },
    {
        "name": "哈利波特魔法系列",
        "brand": "Warner Bros.",
        "description": "以哈利波特电影为主题的徽章系列，涵盖霍格沃茨校徽、学院徽章、死亡圣器等经典元素。",
    },
    {
        "name": "故宫文创系列",
        "brand": "故宫博物院",
        "description": "故宫博物院官方推出的文创徽章，融合千里江山图、瑞兽、龙凤等传统中国文化元素。",
    },
]


SEED_WEARING_HISTORY = [
    {
        "pin_id": 1,
        "wear_date": "2025-03-20",
        "occasion": "上海迪士尼乐园游玩",
        "remarks": "别在帆布包上，非常显眼",
    },
    {
        "pin_id": 1,
        "wear_date": "2025-04-01",
        "occasion": "公司团建活动",
        "remarks": "搭配迪士尼主题T恤",
    },
    {
        "pin_id": 3,
        "wear_date": "2024-08-12",
        "occasion": "奥运观赛派对",
        "remarks": "佩戴在运动帽上",
    },
]

SEED_WISHES = [
    {
        "pattern_description": "星黛露春日限定珐琅徽章",
        "expected_source": "上海迪士尼乐园2026春季新品",
        "priority": "高",
        "achieved": False,
    },
    {
        "pattern_description": "漫威钢铁侠反应堆发光pin",
        "expected_source": "漫威官方旗舰店限定款",
        "priority": "中",
        "achieved": False,
    },
    {
        "pattern_description": "宫崎骏龙猫橡子共和国徽章",
        "expected_source": "日本三鹰之森吉卜力美术馆",
        "priority": "低",
        "achieved": True,
    },
]

SEED_EVENTS = [
    {
        "name": "2026上海徽章交换大会",
        "event_date": "2026-07-15",
        "location": "上海国际会展中心B馆",
        "max_attendees": 200,
        "remark": "本次大会将有来自全国各地的徽章收藏家参与，现场设有迪士尼、漫威、哈利波特等主题专区。",
    },
    {
        "name": "北京pin爱好者线下交流会",
        "event_date": "2026-08-02",
        "location": "北京市朝阳区三里屯SOHO多功能厅",
        "max_attendees": 50,
        "remark": "小型精品交换会，仅限提前报名。主要交换哈利波特、故宫文创等热门系列。",
    },
]


def get_connection() -> sqlite3.Connection:
    """获取 SQLite 连接，启用 Row 工厂便于字典访问。"""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """创建表并在空库时写入 seed 数据。"""
    conn = get_connection()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS pins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pattern_description TEXT NOT NULL,
                source TEXT NOT NULL,
                exchange_partner TEXT NOT NULL,
                exchange_date TEXT NOT NULL,
                worn INTEGER NOT NULL DEFAULT 0,
                is_favorite INTEGER NOT NULL DEFAULT 0
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nickname TEXT NOT NULL,
                city TEXT NOT NULL,
                contact_info TEXT NOT NULL,
                remark TEXT NOT NULL DEFAULT ''
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS series (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                brand TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT ''
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS wearing_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pin_id INTEGER NOT NULL,
                wear_date TEXT NOT NULL,
                occasion TEXT NOT NULL,
                remarks TEXT NOT NULL DEFAULT '',
                FOREIGN KEY (pin_id) REFERENCES pins(id) ON DELETE CASCADE
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS wishes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pattern_description TEXT NOT NULL,
                expected_source TEXT NOT NULL,
                priority TEXT NOT NULL DEFAULT '中',
                achieved INTEGER NOT NULL DEFAULT 0
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                event_date TEXT NOT NULL,
                location TEXT NOT NULL,
                max_attendees INTEGER NOT NULL,
                remark TEXT NOT NULL DEFAULT ''
            )
            """
        )
        pin_count = conn.execute("SELECT COUNT(*) FROM pins").fetchone()[0]
        if pin_count == 0:
            for pin in SEED_PINS:
                conn.execute(
                    """
                    INSERT INTO pins (
                        pattern_description, source, exchange_partner,
                        exchange_date, worn, is_favorite
                    ) VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        pin["pattern_description"],
                        pin["source"],
                        pin["exchange_partner"],
                        pin["exchange_date"],
                        1 if pin["worn"] else 0,
                        1 if pin["is_favorite"] else 0,
                    ),
                )
        contact_count = conn.execute("SELECT COUNT(*) FROM contacts").fetchone()[0]
        if contact_count == 0:
            for contact in SEED_CONTACTS:
                conn.execute(
                    """
                    INSERT INTO contacts (
                        nickname, city, contact_info, remark
                    ) VALUES (?, ?, ?, ?)
                    """,
                    (
                        contact["nickname"],
                        contact["city"],
                        contact["contact_info"],
                        contact["remark"],
                    ),
                )
        series_count = conn.execute("SELECT COUNT(*) FROM series").fetchone()[0]
        if series_count == 0:
            for series in SEED_SERIES:
                conn.execute(
                    """
                    INSERT INTO series (
                        name, brand, description
                    ) VALUES (?, ?, ?)
                    """,
                    (
                        series["name"],
                        series["brand"],
                        series["description"],
                    ),
                )
        wearing_count = conn.execute("SELECT COUNT(*) FROM wearing_history").fetchone()[0]
        if wearing_count == 0:
            for wh in SEED_WEARING_HISTORY:
                conn.execute(
                    """
                    INSERT INTO wearing_history (
                        pin_id, wear_date, occasion, remarks
                    ) VALUES (?, ?, ?, ?)
                    """,
                    (
                        wh["pin_id"],
                        wh["wear_date"],
                        wh["occasion"],
                        wh["remarks"],
                    ),
                )
        wish_count = conn.execute("SELECT COUNT(*) FROM wishes").fetchone()[0]
        if wish_count == 0:
            for wish in SEED_WISHES:
                conn.execute(
                    """
                    INSERT INTO wishes (
                        pattern_description, expected_source, priority, achieved
                    ) VALUES (?, ?, ?, ?)
                    """,
                    (
                        wish["pattern_description"],
                        wish["expected_source"],
                        wish["priority"],
                        1 if wish["achieved"] else 0,
                    ),
                )
        event_count = conn.execute("SELECT COUNT(*) FROM events").fetchone()[0]
        if event_count == 0:
            for event in SEED_EVENTS:
                conn.execute(
                    """
                    INSERT INTO events (
                        name, event_date, location, max_attendees, remark
                    ) VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        event["name"],
                        event["event_date"],
                        event["location"],
                        event["max_attendees"],
                        event["remark"],
                    ),
                )
        conn.commit()
    finally:
        conn.close()
