from ortools.sat.python import cp_model
from models import GenerateRequest, ScheduleEntryModel
import time
import math

class ORToolsTimetableSolver:
    @staticmethod
    def solve(request: GenerateRequest) -> list[ScheduleEntryModel]:
        model = cp_model.CpModel()
        
        days = request.config.workingDays
        periods = list(range(1, request.config.timings.periodsPerDay + 1))
        
        # Build session list from subjects and divisions
        sessions = []
        # First check locked entries
        locked_map = {e.id: e for e in request.existingSchedule if e.isLocked}
        
        # We need to schedule enough sessions for each division and subject
        counter = 0
        for div in request.divisions:
            for sub in request.subjects:
                total_hrs = sub.weeklyHours
                span = 2 if sub.type == 'Practical' else 1
                num_sessions = math.ceil(total_hrs / span)
                
                for i in range(num_sessions):
                    counter += 1
                    session_id = f"gen-{div.id}-{sub.id}-{i}"
                    # check if there is a matching locked entry for this division and subject
                    # For simplicity, we create variables for all required sessions and lock variables if matched
                    sessions.append({
                        'id': session_id,
                        'subject': sub,
                        'division': div,
                        'span': span,
                        'requiresLab': sub.requiresLab or span > 1
                    })

        # Decision variables: x[session_idx, day, period, room_id] -> bool
        x = {}
        for idx, s in enumerate(sessions):
            sub = s['subject']
            span = s['span']
            for day in days:
                for period in periods:
                    if period + span - 1 > len(periods):
                        continue
                    for room in request.rooms:
                        # Hard Lab check early pruning
                        if s['requiresLab'] and room.type != 'Laboratory':
                            continue
                        x[(idx, day, period, room.id)] = model.NewBoolVar(f"x_{idx}_{day}_{period}_{room.id}")

        # 1. Each session assigned exactly once
        for idx, s in enumerate(sessions):
            valid_vars = [x[(idx, d, p, r.id)] for (i, d, p, r_id), var in x.items() if i == idx for r in request.rooms if (idx, d, p, r.id) in x]
            if valid_vars:
                model.AddExactlyOne(valid_vars)

        # Helper to check coverage across span periods
        def covers_period(p_start, span, p_target):
            return p_start <= p_target < p_start + span

        # 2. Room capacity/double-booking constraint
        for day in days:
            for period in periods:
                for room in request.rooms:
                    room_vars = []
                    for (idx, d, p, r_id), var in x.items():
                        if d == day and r_id == room.id and covers_period(p, sessions[idx]['span'], period):
                            room_vars.append(var)
                    if room_vars:
                        model.AddAtMostOne(room_vars)

        # 3. Teacher double-booking constraint
        for teacher in request.teachers:
            for day in days:
                for period in periods:
                    t_vars = []
                    for (idx, d, p, r_id), var in x.items():
                        if sessions[idx]['subject'].assignedTeacherId == teacher.id and d == day and covers_period(p, sessions[idx]['span'], period):
                            t_vars.append(var)
                    if t_vars:
                        model.AddAtMostOne(t_vars)

        # 4. Division double-booking constraint
        for div in request.divisions:
            for day in days:
                for period in periods:
                    div_vars = []
                    for (idx, d, p, r_id), var in x.items():
                        if sessions[idx]['division'].id == div.id and d == day and covers_period(p, sessions[idx]['span'], period):
                            div_vars.append(var)
                    if div_vars:
                        model.AddAtMostOne(div_vars)

        # 5. Teacher unavailable days & slots + daily limits
        for teacher in request.teachers:
            # Unavailable Days & Slots
            for (idx, d, p, r_id), var in x.items():
                if sessions[idx]['subject'].assignedTeacherId == teacher.id:
                    if d in teacher.unavailableDays:
                        model.Add(var == 0)
                    for span_idx in range(sessions[idx]['span']):
                        slot_str = f"{d}-P{p + span_idx}"
                        if slot_str in teacher.unavailableSlots:
                            model.Add(var == 0)
            
            # Daily limits
            for day in days:
                day_vars_and_spans = [(var, sessions[idx]['span']) for (idx, d, p, r_id), var in x.items() if d == day and sessions[idx]['subject'].assignedTeacherId == teacher.id]
                if day_vars_and_spans:
                    model.Add(sum(v * sp for v, sp in day_vars_and_spans) <= teacher.maxHoursPerDay)

            # Weekly limits
            week_vars_and_spans = [(var, sessions[idx]['span']) for (idx, d, p, r_id), var in x.items() if sessions[idx]['subject'].assignedTeacherId == teacher.id]
            if week_vars_and_spans:
                model.Add(sum(v * sp for v, sp in week_vars_and_spans) <= teacher.maxHoursPerWeek)

        # 6. Lock preserved entries
        for locked_e in locked_map.values():
            for idx, s in enumerate(sessions):
                if s['subject'].id == locked_e.subjectId and s['division'].id == locked_e.divisionId:
                    key = (idx, locked_e.day, locked_e.period, locked_e.roomId)
                    if key in x:
                        model.Add(x[key] == 1)
                        break

        # Objective Function: Maximize Teacher preferred times and lab usage
        objective_terms = []
        lunch_after = request.config.timings.lunchAfterPeriod
        for (idx, d, p, r_id), var in x.items():
            t_id = sessions[idx]['subject'].assignedTeacherId
            teacher = next((t for t in request.teachers if t.id == t_id), None)
            weight = 10
            if teacher:
                if teacher.preferredTime == 'Morning' and p <= lunch_after:
                    weight += 25
                elif teacher.preferredTime == 'Afternoon' and p > lunch_after:
                    weight += 25
            if sessions[idx]['requiresLab']:
                weight += 40
            objective_terms.append(var * weight)

        if objective_terms:
            model.Maximize(sum(objective_terms))

        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 3.5 # Fast 3.5s industrial solver budget
        status = solver.Solve(model)

        result_schedule = []
        if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
            for (idx, d, p, r_id), var in x.items():
                if solver.Value(var) == 1:
                    s = sessions[idx]
                    result_schedule.append(ScheduleEntryModel(
                        id=f"se-cp-{idx}",
                        subjectId=s['subject'].id,
                        teacherId=s['subject'].assignedTeacherId,
                        roomId=r_id,
                        divisionId=s['division'].id,
                        day=d,
                        period=p,
                        span=s['span'],
                        isLocked=False
                    ))
            # Include locked entries that weren't overridden
            return result_schedule
        else:
            return request.existingSchedule
