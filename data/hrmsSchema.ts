/** Real schema distilled from hrms_api/models (GORM). PK is always `id` via gorm.Model / AuditTrail. */

export type HrmsFk = {
  column: string;
  to: string;
  note?: string;
};

export type HrmsTable = {
  id: string;
  name: string; // DB table name
  icon: string;
  color: string;
  cluster: 'org' | 'leave' | 'time' | 'pay' | 'auth' | 'join';
  blurb: string;
  pk: string;
  fks: HrmsFk[];
  /** Real HRMS meaning when this is the parent (1→N) */
  oneToMany: string[];
  joinSql: string;
};

export type HrmsEdge = {
  from: string;
  to: string;
  label: string;
  /** cardinality label */
  card: string;
};

export type HrmsFlowStep = {
  n: number;
  title: string;
  table: string;
  op: 'SELECT' | 'INSERT' | 'UPDATE';
  sql: string;
  fkJump: string;
  why: string;
};

export type HrmsScene = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  tip: string;
  focus: string[]; // table ids to pulse
};

export const HRMS_COLORS = {
  org: '#4A9EFF',
  leave: '#8b7cff',
  time: '#e6a817',
  pay: '#7B2D8E',
  auth: '#3498db',
  join: '#10b981',
} as const;

export const hrmsTables: HrmsTable[] = [
  {
    id: 'departments',
    name: 'departments',
    icon: '🏢',
    color: HRMS_COLORS.org,
    cluster: 'org',
    blurb: 'Company divisions. Root org node — no FK out.',
    pk: 'id',
    fks: [],
    oneToMany: ['One department → many teams'],
    joinSql: `SELECT d.name, t.name AS team
FROM departments d
JOIN teams t ON t.department_id = d.id;`,
  },
  {
    id: 'teams',
    name: 'teams',
    icon: '👥',
    color: HRMS_COLORS.org,
    cluster: 'org',
    blurb: 'Teams live under a department. Employees hang off teams.',
    pk: 'id',
    fks: [{ column: 'department_id', to: 'departments' }],
    oneToMany: ['One team → many employees'],
    joinSql: `SELECT t.name, d.name AS department
FROM teams t
JOIN departments d ON d.id = t.department_id;`,
  },
  {
    id: 'employees',
    name: 'employees',
    icon: '👤',
    color: HRMS_COLORS.org,
    cluster: 'org',
    blurb: 'Hub table. Almost every HR workflow starts or ends here.',
    pk: 'id',
    fks: [{ column: 'team_id', to: 'teams' }],
    oneToMany: [
      'One employee → many leave_requests',
      'One employee → many attendances',
      'One employee → many payslips',
      'One employee → many overtime_requests',
      'One employee → many notifs',
    ],
    joinSql: `SELECT e.first_name, e.last_name, t.name AS team, d.name AS department
FROM employees e
JOIN teams t ON t.id = e.team_id
JOIN departments d ON d.id = t.department_id;`,
  },
  {
    id: 'offices',
    name: 'offices',
    icon: '📍',
    color: HRMS_COLORS.org,
    cluster: 'org',
    blurb: 'Geo fences for clock-in (lat/lng + radius).',
    pk: 'id',
    fks: [],
    oneToMany: ['One office ↔ many employees (via employee_offices)'],
    joinSql: `SELECT o.office_name, e.first_name
FROM offices o
JOIN employee_offices eo ON eo.office_id = o.id
JOIN employees e ON e.id = eo.employee_id;`,
  },
  {
    id: 'employee_offices',
    name: 'employee_offices',
    icon: '🔗',
    color: HRMS_COLORS.join,
    cluster: 'join',
    blurb: 'Join table: many-to-many employees ↔ offices.',
    pk: 'id',
    fks: [
      { column: 'employee_id', to: 'employees' },
      { column: 'office_id', to: 'offices' },
    ],
    oneToMany: [],
    joinSql: `SELECT employee_id, office_id FROM employee_offices
WHERE employee_id = ?;`,
  },
  {
    id: 'leave_types',
    name: 'leave_types',
    icon: '🏷️',
    color: HRMS_COLORS.leave,
    cluster: 'leave',
    blurb: 'Catalog: annual, sick, special…',
    pk: 'id',
    fks: [],
    oneToMany: ['One leave_type → many leave_requests'],
    joinSql: `SELECT lt.leave_type_name, COUNT(lr.id) AS requests
FROM leave_types lt
LEFT JOIN leave_requests lr ON lr.leave_type_id = lt.id
GROUP BY lt.id;`,
  },
  {
    id: 'leave_requests',
    name: 'leave_requests',
    icon: '📅',
    color: HRMS_COLORS.leave,
    cluster: 'leave',
    blurb: 'Time-off requests. Status: pending / approve / reject / cancel.',
    pk: 'id',
    fks: [
      { column: 'employee_id', to: 'employees' },
      { column: 'leave_type_id', to: 'leave_types' },
      { column: 'approved_by', to: 'sys_users', note: 'admin approver, not employee row' },
    ],
    oneToMany: [
      'One leave_request → optional attendance rows (leave day markers)',
      'One leave_request → leave_borrowing_details',
    ],
    joinSql: `SELECT lr.status, e.first_name, lt.leave_type_name, u.username AS approved_by
FROM leave_requests lr
JOIN employees e ON e.id = lr.employee_id
JOIN leave_types lt ON lt.id = lr.leave_type_id
LEFT JOIN sys_users u ON u.id = lr.approved_by
WHERE lr.id = ?;`,
  },
  {
    id: 'leave_remaining',
    name: 'leave_remaining',
    icon: '🧮',
    color: HRMS_COLORS.leave,
    cluster: 'leave',
    blurb: 'Balance per employee per year (available / borrowed / special).',
    pk: 'id',
    fks: [{ column: 'employee_id', to: 'employees' }],
    oneToMany: ['One leave_remaining → many leave_remaining_detail / accruals'],
    joinSql: `SELECT e.first_name, lr.year, lr.available_days, lr.borrowed_days
FROM leave_remaining lr
JOIN employees e ON e.id = lr.employee_id
WHERE lr.year = YEAR(CURDATE());`,
  },
  {
    id: 'attendances',
    name: 'attendances',
    icon: '⏰',
    color: HRMS_COLORS.time,
    cluster: 'time',
    blurb: 'Daily clock-in/out. May link to a leave_request for leave days.',
    pk: 'id',
    fks: [
      { column: 'employee_id', to: 'employees' },
      { column: 'leave_request_id', to: 'leave_requests', note: 'nullable' },
    ],
    oneToMany: ['One attendance → many clock_requests (fix requests)'],
    joinSql: `SELECT a.date, a.clock_in, a.clock_out, e.staff_id
FROM attendances a
JOIN employees e ON e.id = a.employee_id
WHERE a.date = CURDATE();`,
  },
  {
    id: 'clock_requests',
    name: 'clock_requests',
    icon: '🛎️',
    color: HRMS_COLORS.time,
    cluster: 'time',
    blurb: 'Request to fix / approve an in or out punch.',
    pk: 'id',
    fks: [{ column: 'attendance_id', to: 'attendances' }],
    oneToMany: [],
    joinSql: `SELECT cr.type, cr.status, a.date
FROM clock_requests cr
JOIN attendances a ON a.id = cr.attendance_id;`,
  },
  {
    id: 'overtime_requests',
    name: 'overtime_requests',
    icon: '⌛',
    color: HRMS_COLORS.time,
    cluster: 'time',
    blurb: 'OT hours waiting for admin approval → later feeds payslip OT fields.',
    pk: 'id',
    fks: [
      { column: 'employee_id', to: 'employees' },
      { column: 'approved_by', to: 'sys_users' },
    ],
    oneToMany: [],
    joinSql: `SELECT ot.overtime_amount_in_hour, ot.type, ot.status, e.first_name
FROM overtime_requests ot
JOIN employees e ON e.id = ot.employee_id
WHERE ot.status = 'approve';`,
  },
  {
    id: 'payslips',
    name: 'payslips',
    icon: '💰',
    color: HRMS_COLORS.pay,
    cluster: 'pay',
    blurb: 'Monthly snapshot: net pay, OT, leave/absent deductions.',
    pk: 'id',
    fks: [{ column: 'employee_id', to: 'employees' }],
    oneToMany: [],
    joinSql: `SELECT p.pay_period_month, p.pay_period_year, p.net_salary, e.staff_id
FROM payslips p
JOIN employees e ON e.id = p.employee_id
WHERE p.pay_period_year = ? AND p.pay_period_month = ?;`,
  },
  {
    id: 'sys_users',
    name: 'sys_users',
    icon: '🛡️',
    color: HRMS_COLORS.auth,
    cluster: 'auth',
    blurb: 'Admin portal users (approvers). Separate from employees.',
    pk: 'id',
    fks: [],
    oneToMany: [
      'One sys_user → many leave_requests.approved_by',
      'One sys_user → many approval_workflows.approver_id',
    ],
    joinSql: `SELECT u.username, r.role_name
FROM sys_users u
LEFT JOIN sys_user_roles sur ON sur.sys_user_id = u.id
LEFT JOIN roles r ON r.id = sur.role_id;`,
  },
  {
    id: 'roles',
    name: 'roles',
    icon: '🎭',
    color: HRMS_COLORS.auth,
    cluster: 'auth',
    blurb: 'RBAC roles for admin users.',
    pk: 'id',
    fks: [],
    oneToMany: ['roles ↔ sys_users via sys_user_roles', 'roles ↔ permissions via role_permissions'],
    joinSql: `SELECT role_name, status FROM roles WHERE status = 'Active';`,
  },
  {
    id: 'approval_workflows',
    name: 'approval_workflows',
    icon: '✅',
    color: HRMS_COLORS.auth,
    cluster: 'auth',
    blurb: 'Polymorphic steps: entity_type + entity_id (e.g. leave_request #42).',
    pk: 'id',
    fks: [{ column: 'approver_id', to: 'sys_users' }],
    oneToMany: [],
    joinSql: `SELECT aw.step_name, aw.status, aw.entity_type, aw.entity_id, u.username
FROM approval_workflows aw
LEFT JOIN sys_users u ON u.id = aw.approver_id
WHERE aw.entity_type = 'leave_request' AND aw.entity_id = ?;`,
  },
  {
    id: 'notifs',
    name: 'notifs',
    icon: '🔔',
    color: HRMS_COLORS.time,
    cluster: 'time',
    blurb: 'In-app notifications for leave / OT / post-clock events.',
    pk: 'id',
    fks: [{ column: 'employee_id', to: 'employees' }],
    oneToMany: [],
    joinSql: `SELECT type, url, \`read\` FROM notifs
WHERE employee_id = ? ORDER BY created_at DESC LIMIT 20;`,
  },
];

export const hrmsEdges: HrmsEdge[] = [
  { from: 'teams', to: 'departments', label: 'department_id', card: 'N→1' },
  { from: 'employees', to: 'teams', label: 'team_id', card: 'N→1' },
  { from: 'employee_offices', to: 'employees', label: 'employee_id', card: 'N→1' },
  { from: 'employee_offices', to: 'offices', label: 'office_id', card: 'N→1' },
  { from: 'leave_requests', to: 'employees', label: 'employee_id', card: 'N→1' },
  { from: 'leave_requests', to: 'leave_types', label: 'leave_type_id', card: 'N→1' },
  { from: 'leave_requests', to: 'sys_users', label: 'approved_by', card: 'N→1' },
  { from: 'leave_remaining', to: 'employees', label: 'employee_id', card: 'N→1' },
  { from: 'attendances', to: 'employees', label: 'employee_id', card: 'N→1' },
  { from: 'attendances', to: 'leave_requests', label: 'leave_request_id', card: 'N→1?' },
  { from: 'clock_requests', to: 'attendances', label: 'attendance_id', card: 'N→1' },
  { from: 'overtime_requests', to: 'employees', label: 'employee_id', card: 'N→1' },
  { from: 'overtime_requests', to: 'sys_users', label: 'approved_by', card: 'N→1' },
  { from: 'payslips', to: 'employees', label: 'employee_id', card: 'N→1' },
  { from: 'approval_workflows', to: 'sys_users', label: 'approver_id', card: 'N→1' },
  { from: 'notifs', to: 'employees', label: 'employee_id', card: 'N→1' },
];

export const hrmsScenes: HrmsScene[] = [
  {
    id: 'hub',
    kicker: 'Lesson 1 · Find the hub',
    title: 'Start from employees — the gravity well',
    body: 'In your real hrms_api, employees is the hub. Teams hang under departments. Leave, attendance, OT, payslips, and notifs all point at employee_id. Senior move: identify the hub before you draw anything else.',
    tip: 'Click employees on the map. Watch every child light up. Dimmed tables are farther from this click.',
    focus: ['employees', 'teams', 'departments'],
  },
  {
    id: 'org',
    kicker: 'Lesson 2 · Org tree',
    title: 'departments → teams → employees (and offices)',
    body: 'Org is a clean tree: department has teams; team has employees. Offices are separate places; employee_offices is the join table for many-to-many (one person can clock into multiple sites).',
    tip: 'Click employee_offices. Two FKs out = classic bridge table. Never put office_id arrays on employees.',
    focus: ['departments', 'teams', 'employees', 'offices', 'employee_offices'],
  },
  {
    id: 'leave',
    kicker: 'Lesson 3 · Leave domain',
    title: 'Requests, types, balances, approvers',
    body: 'leave_requests references employees + leave_types. approved_by points at sys_users (admin), not another employee — that is a deliberate design choice in your API. leave_remaining stores yearly balance so payroll and UI do not recompute history every time.',
    tip: 'Click leave_requests. Note three outbound FKs. Polymorphic approval_workflows track steps by entity_type + entity_id.',
    focus: ['leave_requests', 'leave_types', 'leave_remaining', 'sys_users', 'approval_workflows'],
  },
  {
    id: 'timepay',
    kicker: 'Lesson 4 · Time → money',
    title: 'Attendance and OT feed payslips',
    body: 'attendances are daily facts. overtime_requests become OT hours on payslips. Absent/unpaid leave days become deductions. Payslips denormalize some employee fields (name, position) as a snapshot — intentional for historical accuracy.',
    tip: 'Click payslips, then attendances. Ask: which facts must be frozen on the slip vs joined live?',
    focus: ['attendances', 'overtime_requests', 'payslips', 'leave_requests'],
  },
  {
    id: 'flow',
    kicker: 'Lesson 5 · Trace a workflow',
    title: 'Leave approve → balance → attendance → payslip → notif',
    body: 'Schemas exist to serve workflows. Play the tracer below. Each step names the table, the SQL verb, and the FK hop. This is how seniors debug production: follow keys, not vibes.',
    tip: 'Step through the tracer. Then re-click any table to reconnect the explain panel.',
    focus: [
      'leave_requests',
      'approval_workflows',
      'leave_remaining',
      'attendances',
      'payslips',
      'notifs',
    ],
  },
];

/** Real workflow based on leave + approval + payslip models in hrms_api */
export const hrmsFlow: HrmsFlowStep[] = [
  {
    n: 1,
    title: 'Employee submits leave',
    table: 'leave_requests',
    op: 'INSERT',
    sql: `INSERT INTO leave_requests
  (employee_id, leave_type_id, start_date, end_date, status, …)
VALUES (?, ?, ?, ?, 'pending', …);`,
    fkJump: 'employee_id → employees.id',
    why: 'Create the request row owned by the staff member.',
  },
  {
    n: 2,
    title: 'Workflow steps created',
    table: 'approval_workflows',
    op: 'INSERT',
    sql: `INSERT INTO approval_workflows
  (entity_type, entity_id, step_name, step_order, status)
VALUES ('leave_request', :id, 'Manager Approve', 1, 'PENDING');`,
    fkJump: 'entity_id → leave_requests.id (polymorphic)',
    why: 'Track who must approve without hard-coding columns per entity.',
  },
  {
    n: 3,
    title: 'Admin approves',
    table: 'leave_requests',
    op: 'UPDATE',
    sql: `UPDATE leave_requests
SET status = 'approve', approved_by = :sys_user_id
WHERE id = :id;`,
    fkJump: 'approved_by → sys_users.id',
    why: 'Approver is a portal user; status becomes the source of truth.',
  },
  {
    n: 4,
    title: 'Deduct leave balance',
    table: 'leave_remaining',
    op: 'UPDATE',
    sql: `UPDATE leave_remaining
SET available_days = available_days - :days
WHERE employee_id = :emp AND year = :year;`,
    fkJump: 'employee_id → employees.id',
    why: 'Keep a running balance so UI and payroll stay fast.',
  },
  {
    n: 5,
    title: 'Mark leave on calendar days',
    table: 'attendances',
    op: 'INSERT',
    sql: `INSERT INTO attendances
  (employee_id, leave_request_id, date, status)
VALUES (?, ?, ?, /* leave marker */);`,
    fkJump: 'leave_request_id → leave_requests.id',
    why: 'Daily attendance reflects approved leave for reports & payslip absences.',
  },
  {
    n: 6,
    title: 'Notify the employee',
    table: 'notifs',
    op: 'INSERT',
    sql: `INSERT INTO notifs (employee_id, type, url, \`read\`)
VALUES (?, 'leave_request', '/leave/…', 0);`,
    fkJump: 'employee_id → employees.id',
    why: 'Close the loop in the mobile/admin UX.',
  },
  {
    n: 7,
    title: 'Month-end payslip uses the facts',
    table: 'payslips',
    op: 'INSERT',
    sql: `INSERT INTO payslips
  (employee_id, absent_unpaid_leave_days, net_salary, …)
SELECT … FROM employees / attendances / overtime_requests …;`,
    fkJump: 'employee_id → employees.id',
    why: 'Money is computed from time + leave facts already stored.',
  },
];

export const hrmsQuiz = [
  {
    q: 'In your HRMS, which table is the hub most FKs point at?',
    options: ['departments', 'employees', 'payslips', 'roles'],
    answer: 'employees',
    explain: 'Leave, attendance, OT, payslips, notifs all hang off employee_id.',
  },
  {
    q: 'Why does leave_requests.approved_by reference sys_users, not employees?',
    options: [
      'It is a bug',
      'Approvers are admin portal users in this architecture',
      'sys_users stores salaries',
      'Employees cannot have IDs',
    ],
    answer: 'Approvers are admin portal users in this architecture',
    explain: 'Your model wires ApprovedBy → SysUser. Staff and admins are separate identities.',
  },
  {
    q: 'What problem does employee_offices solve?',
    options: [
      'Storing passwords',
      'Many-to-many between employees and offices',
      'Faster SELECT *',
      'Replacing teams',
    ],
    answer: 'Many-to-many between employees and offices',
    explain: 'Bridge table with two FKs — classic schema pattern.',
  },
  {
    q: 'approval_workflows uses entity_type + entity_id. That pattern is called…',
    options: ['Primary key', 'Polymorphic association', 'Unique index only', 'Soft delete'],
    answer: 'Polymorphic association',
    explain: 'One workflow table can point at leave, OT, clock requests, etc.',
  },
];

export function hrmsTableById(id: string) {
  return hrmsTables.find((t) => t.id === id);
}

export function neighborsOf(id: string) {
  const out = new Set<string>([id]);
  for (const e of hrmsEdges) {
    if (e.from === id) out.add(e.to);
    if (e.to === id) out.add(e.from);
  }
  return out;
}

export function inboundOf(id: string) {
  return hrmsEdges.filter((e) => e.to === id);
}

export function outboundOf(id: string) {
  return hrmsEdges.filter((e) => e.from === id);
}
