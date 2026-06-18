"""Pydantic 请求/响应模型。"""

from pydantic import BaseModel, Field


class PinBase(BaseModel):
    """徽章交换记录公共字段。"""

    pattern_description: str = Field(..., min_length=1, description="图案描述")
    source: str = Field(..., min_length=1, description="来源")
    exchange_partner: str = Field(..., min_length=1, description="交换对象")
    exchange_date: str = Field(..., min_length=1, description="交换日期 YYYY-MM-DD")
    worn: bool = Field(default=False, description="是否佩戴过")


class PinCreate(PinBase):
    """创建徽章记录。"""


class PinUpdate(PinBase):
    """更新徽章记录。"""


class PinResponse(PinBase):
    """徽章记录响应。"""

    id: int

    model_config = {"from_attributes": True}
