from pydantic import BaseModel
from typing import List, Optional

class TimingsModel(BaseModel):
    startTime: str
    endTime: str
    periodsPerDay: int
    periodDurationMinutes: int
    lunchAfterPeriod: int
    lunchDurationMinutes: int

class InstitutionConfigModel(BaseModel):
    collegeName: str
    academicYear: str
    semester: str
    department: str
    course: str
    workingDays: List[str]
    timings: TimingsModel

class TeacherModel(BaseModel):
    id: str
    name: str
    teacherId: str
    preferredTime: str
    maxHoursPerDay: int
    maxHoursPerWeek: int
    unavailableDays: List[str]
    unavailableSlots: List[str]

class SubjectModel(BaseModel):
    id: str
    name: str
    code: str
    weeklyHours: int
    type: str
    priority: str
    assignedTeacherId: str
    requiresLab: bool
    requiredEquipment: List[str]
    color: str

class RoomModel(BaseModel):
    id: str
    roomNumber: str
    capacity: int
    type: str
    availableEquipment: List[str]

class DivisionModel(BaseModel):
    id: str
    name: str
    semester: int
    strength: int
    defaultRoomId: Optional[str] = None

class ScheduleEntryModel(BaseModel):
    id: str
    subjectId: str
    teacherId: str
    roomId: str
    divisionId: str
    day: str
    period: int
    span: int
    isLocked: bool

class GenerateRequest(BaseModel):
    config: InstitutionConfigModel
    teachers: List[TeacherModel]
    subjects: List[SubjectModel]
    rooms: List[RoomModel]
    divisions: List[DivisionModel]
    existingSchedule: List[ScheduleEntryModel] = []
