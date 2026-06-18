"""Pydantic 请求/响应模型。"""

from pydantic import BaseModel, Field


class PinBase(BaseModel):
    """徽章交换记录公共字段。"""

    pattern_description: str = Field(..., min_length=1, description="图案描述")
    source: str = Field(..., min_length=1, description="来源")
    exchange_partner: str = Field(..., min_length=1, description="交换对象")
    exchange_date: str = Field(..., min_length=1, description="交换日期 YYYY-MM-DD")
    worn: bool = Field(default=False, description="是否佩戴过")
    is_favorite: bool = Field(default=False, description="是否收藏")
    tags: str = Field(default="", description="标签，用逗号分隔多个标签")


class PinCreate(PinBase):
    """创建徽章记录。"""


class PinUpdate(PinBase):
    """更新徽章记录。"""


class PinResponse(PinBase):
    """徽章记录响应。"""

    id: int

    model_config = {"from_attributes": True}


class ContactBase(BaseModel):
    """交换对象联系人公共字段。"""

    nickname: str = Field(..., min_length=1, description="昵称")
    city: str = Field(..., min_length=1, description="所在城市")
    contact_info: str = Field(..., min_length=1, description="联系方式")
    remark: str = Field(default="", description="备注")


class ContactCreate(ContactBase):
    """新增联系人。"""


class ContactUpdate(ContactBase):
    """更新联系人。"""


class ContactResponse(ContactBase):
    """联系人响应。"""

    id: int

    model_config = {"from_attributes": True}


class SeriesBase(BaseModel):
    """徽章系列公共字段。"""

    name: str = Field(..., min_length=1, description="系列名称")
    brand: str = Field(..., min_length=1, description="所属品牌")
    description: str = Field(default="", description="系列简介")


class SeriesCreate(SeriesBase):
    """创建系列。"""


class SeriesUpdate(SeriesBase):
    """更新系列。"""


class SeriesResponse(SeriesBase):
    """系列响应。"""

    id: int

    model_config = {"from_attributes": True}


class WearingHistoryBase(BaseModel):
    """佩戴历史公共字段。"""

    wear_date: str = Field(..., min_length=1, description="佩戴日期 YYYY-MM-DD")
    occasion: str = Field(..., min_length=1, description="佩戴场合")
    remarks: str = Field(default="", description="备注")


class WearingHistoryCreate(WearingHistoryBase):
    """新增佩戴记录。"""


class WearingHistoryResponse(WearingHistoryBase):
    """佩戴记录响应。"""

    id: int
    pin_id: int

    model_config = {"from_attributes": True}


class WishBase(BaseModel):
    """愿望清单公共字段。"""

    pattern_description: str = Field(..., min_length=1, description="目标图案描述")
    expected_source: str = Field(..., min_length=1, description="期望来源")
    priority: str = Field(..., pattern="^(高|中|低)$", description="优先级：高/中/低")
    achieved: bool = Field(default=False, description="是否已达成")


class WishCreate(WishBase):
    """创建愿望。"""


class WishUpdate(WishBase):
    """更新愿望。"""


class WishResponse(WishBase):
    """愿望响应。"""

    id: int

    model_config = {"from_attributes": True}


class EventBase(BaseModel):
    """线下交换活动公共字段。"""

    name: str = Field(..., min_length=1, description="活动名称")
    event_date: str = Field(..., min_length=1, description="举办日期 YYYY-MM-DD")
    location: str = Field(..., min_length=1, description="举办地点")
    max_attendees: int = Field(..., gt=0, description="人数上限")
    remark: str = Field(default="", description="活动备注")


class EventCreate(EventBase):
    """创建活动。"""


class EventUpdate(EventBase):
    """更新活动。"""


class EventResponse(EventBase):
    """活动响应。"""

    id: int

    model_config = {"from_attributes": True}
