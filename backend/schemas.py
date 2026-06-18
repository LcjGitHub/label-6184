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
