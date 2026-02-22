export type Role = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  position: string;
  avatar: string;
  phone: string;
  joinDate: string;
  birthDate: string;   // MM-DD format for annual check
  status: 'active' | 'inactive';
  managerId?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  breakStart?: string;
  breakEnd?: string;
  status: 'present' | 'absent' | 'late' | 'wfh' | 'leave' | 'holiday';
  workHours?: number;
  overtime?: number;
  notes?: string;
  isWFH?: boolean;
  overtimeApproved?: boolean;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  department: string;
  type: 'vacation' | 'sick' | 'personal' | 'emergency';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedOn: string;
  reviewedBy?: string;
  reviewedOn?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'birthday' | 'anniversary';
  time: string;
  read: boolean;
}

export interface Department {
  id: string;
  name: string;
  managerId: string;
  headcount: number;
  presentToday: number;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  audience: 'all' | string; // 'all' or a specific department name
  authorId: string;
  authorName: string;
  authorRole: 'admin' | 'manager' | 'employee';
  createdAt: string; // ISO string
  updatedAt?: string;
  pinned?: boolean;
}

export interface GeofenceZone {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  radius: number; // meters
  active: boolean;
}

// Mock Users
export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@timetrack.com',
    role: 'admin',
    department: 'Human Resources',
    position: 'HR Director',
    avatar: 'SJ',
    phone: '+1 (555) 001-0001',
    joinDate: '2020-03-15',
    birthDate: '02-19', // Today! 🎂
    status: 'active',
  },
  {
    id: 'u2',
    name: 'Marcus Chen',
    email: 'marcus.chen@timetrack.com',
    role: 'manager',
    department: 'Engineering',
    position: 'Engineering Manager',
    avatar: 'MC',
    phone: '+1 (555) 001-0002',
    joinDate: '2019-07-01',
    birthDate: '07-01',
    status: 'active',
  },
  {
    id: 'u3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@timetrack.com',
    role: 'employee',
    department: 'Engineering',
    position: 'Senior Developer',
    avatar: 'ER',
    phone: '+1 (555) 001-0003',
    joinDate: '2021-01-20',
    birthDate: '02-22', // In 3 days
    status: 'active',
    managerId: 'u2',
  },
  {
    id: 'u4',
    name: 'James Wilson',
    email: 'james.wilson@timetrack.com',
    role: 'employee',
    department: 'Marketing',
    position: 'Marketing Specialist',
    avatar: 'JW',
    phone: '+1 (555) 001-0004',
    joinDate: '2022-05-10',
    birthDate: '05-10',
    status: 'active',
  },
  {
    id: 'u5',
    name: 'Priya Patel',
    email: 'priya.patel@timetrack.com',
    role: 'employee',
    department: 'Engineering',
    position: 'Frontend Developer',
    avatar: 'PP',
    phone: '+1 (555) 001-0005',
    joinDate: '2021-09-01',
    birthDate: '09-15',
    status: 'active',
    managerId: 'u2',
  },
  {
    id: 'u6',
    name: 'David Kim',
    email: 'david.kim@timetrack.com',
    role: 'employee',
    department: 'Design',
    position: 'UI/UX Designer',
    avatar: 'DK',
    phone: '+1 (555) 001-0006',
    joinDate: '2022-02-14',
    birthDate: '02-25', // In 6 days
    status: 'active',
  },
  {
    id: 'u7',
    name: 'Aisha Thompson',
    email: 'aisha.thompson@timetrack.com',
    role: 'manager',
    department: 'Design',
    position: 'Design Lead',
    avatar: 'AT',
    phone: '+1 (555) 001-0007',
    joinDate: '2020-11-01',
    birthDate: '11-01',
    status: 'active',
  },
  {
    id: 'u8',
    name: 'Robert Martinez',
    email: 'robert.martinez@timetrack.com',
    role: 'employee',
    department: 'Marketing',
    position: 'Content Writer',
    avatar: 'RM',
    phone: '+1 (555) 001-0008',
    joinDate: '2023-01-15',
    birthDate: '01-15',
    status: 'inactive',
  },
  {
    id: 'u9',
    name: 'Lisa Park',
    email: 'lisa.park@timetrack.com',
    role: 'employee',
    department: 'Finance',
    position: 'Financial Analyst',
    avatar: 'LP',
    phone: '+1 (555) 001-0009',
    joinDate: '2021-06-07',
    birthDate: '06-07',
    status: 'active',
  },
  {
    id: 'u10',
    name: 'Tom Anderson',
    email: 'tom.anderson@timetrack.com',
    role: 'employee',
    department: 'Engineering',
    position: 'Backend Developer',
    avatar: 'TA',
    phone: '+1 (555) 001-0010',
    joinDate: '2022-08-22',
    birthDate: '08-22',
    status: 'active',
    managerId: 'u2',
  },
];

export const MOCK_CREDENTIALS = [
  { email: 'sarah.johnson@timetrack.com', password: 'admin123', userId: 'u1' },
  { email: 'marcus.chen@timetrack.com', password: 'manager123', userId: 'u2' },
  { email: 'emily.rodriguez@timetrack.com', password: 'emp123', userId: 'u3' },
];

// Attendance data for current month (Feb 2026)
export const generateAttendanceData = (userId: string): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const statuses: AttendanceRecord['status'][] = ['present', 'present', 'present', 'late', 'wfh', 'present', 'absent', 'present', 'wfh', 'present'];

  for (let day = 1; day <= 18; day++) {
    const date = `2026-02-${String(day).padStart(2, '0')}`;
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const status = statuses[(day - 1) % statuses.length];
    const checkIn = status === 'absent' ? undefined : status === 'late' ? '09:' + (15 + (day % 30)).toString().padStart(2, '0') : '08:' + String(45 + (day % 15)).padStart(2, '0');
    const checkOut = status === 'absent' ? undefined : '17:' + String(30 + (day % 20)).padStart(2, '0');
    const workHours = status === 'absent' ? undefined : 8 + (day % 3 === 0 ? 1.5 : 0);

    records.push({
      id: `att-${userId}-${day}`,
      userId,
      date,
      checkIn,
      checkOut,
      breakStart: status === 'absent' ? undefined : '12:00',
      breakEnd: status === 'absent' ? undefined : '13:00',
      status,
      workHours,
      overtime: workHours && workHours > 8 ? workHours - 8 : 0,
      notes: status === 'wfh' ? 'Working from home today' : undefined,
      isWFH: status === 'wfh',
      overtimeApproved: day % 3 === 0,
    });
  }

  return records;
};

export const LIVE_ATTENDANCE: Array<{
  userId: string;
  name: string;
  department: string;
  checkIn: string;
  status: 'in' | 'break' | 'wfh';
  duration: string;
  geofenceVerified: boolean;
  lat?: number;
  lng?: number;
}> = [
  { userId: 'u3', name: 'Emily Rodriguez', department: 'Engineering', checkIn: '08:47', status: 'in', duration: '4h 12m', geofenceVerified: true, lat: 37.7749, lng: -122.4194 },
  { userId: 'u5', name: 'Priya Patel', department: 'Engineering', checkIn: '08:52', status: 'in', duration: '4h 07m', geofenceVerified: true, lat: 37.7750, lng: -122.4193 },
  { userId: 'u6', name: 'David Kim', department: 'Design', checkIn: '09:03', status: 'break', duration: '3h 56m', geofenceVerified: false, lat: 37.7800, lng: -122.4300 },
  { userId: 'u9', name: 'Lisa Park', department: 'Finance', checkIn: '08:39', status: 'in', duration: '4h 20m', geofenceVerified: true, lat: 37.7748, lng: -122.4195 },
  { userId: 'u10', name: 'Tom Anderson', department: 'Engineering', checkIn: '08:58', status: 'wfh', duration: '4h 01m', geofenceVerified: false },
  { userId: 'u2', name: 'Marcus Chen', department: 'Engineering', checkIn: '09:00', status: 'in', duration: '3h 59m', geofenceVerified: true, lat: 37.7749, lng: -122.4192 },
  { userId: 'u7', name: 'Aisha Thompson', department: 'Design', checkIn: '08:45', status: 'in', duration: '4h 14m', geofenceVerified: true, lat: 37.7751, lng: -122.4194 },
];

export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lr1',
    userId: 'u3',
    userName: 'Emily Rodriguez',
    department: 'Engineering',
    type: 'vacation',
    startDate: '2026-02-25',
    endDate: '2026-02-27',
    days: 3,
    reason: 'Family vacation trip to the coast.',
    status: 'pending',
    requestedOn: '2026-02-15',
  },
  {
    id: 'lr2',
    userId: 'u5',
    userName: 'Priya Patel',
    department: 'Engineering',
    type: 'sick',
    startDate: '2026-02-19',
    endDate: '2026-02-19',
    days: 1,
    reason: 'Doctor appointment and feeling unwell.',
    status: 'approved',
    requestedOn: '2026-02-17',
    reviewedBy: 'Marcus Chen',
    reviewedOn: '2026-02-17',
  },
  {
    id: 'lr3',
    userId: 'u10',
    userName: 'Tom Anderson',
    department: 'Engineering',
    type: 'personal',
    startDate: '2026-03-05',
    endDate: '2026-03-07',
    days: 3,
    reason: 'Personal errands and home renovation.',
    status: 'pending',
    requestedOn: '2026-02-16',
  },
  {
    id: 'lr4',
    userId: 'u6',
    userName: 'David Kim',
    department: 'Design',
    type: 'vacation',
    startDate: '2026-03-10',
    endDate: '2026-03-14',
    days: 5,
    reason: 'Annual leave.',
    status: 'rejected',
    requestedOn: '2026-02-10',
    reviewedBy: 'Aisha Thompson',
    reviewedOn: '2026-02-12',
  },
  {
    id: 'lr5',
    userId: 'u9',
    userName: 'Lisa Park',
    department: 'Finance',
    type: 'emergency',
    startDate: '2026-02-20',
    endDate: '2026-02-20',
    days: 1,
    reason: 'Family emergency.',
    status: 'pending',
    requestedOn: '2026-02-18',
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  // Birthday & Anniversary — smart notifications
  {
    id: 'nb1',
    title: "🎂 It's Sarah Johnson's Birthday!",
    message: "Today is Sarah's birthday! Send her a warm wish to brighten her day.",
    type: 'birthday',
    time: 'Today',
    read: false,
  },
  {
    id: 'nb2',
    title: "🎉 Emily Rodriguez — Birthday in 3 days",
    message: "Emily's birthday is on Feb 22. Don't forget to wish her!",
    type: 'birthday',
    time: 'Upcoming',
    read: false,
  },
  {
    id: 'na1',
    title: "🏆 Marcus Chen — 7 Year Work Anniversary!",
    message: "Marcus joined TimeTrack on Jul 1, 2019. Celebrate 7 incredible years!",
    type: 'anniversary',
    time: 'This year',
    read: false,
  },
  {
    id: 'na2',
    title: "🌟 Emily Rodriguez — 5 Year Milestone",
    message: "Emily has been with the company for 5 years. A remarkable journey!",
    type: 'anniversary',
    time: 'Jan 20',
    read: true,
  },
  // Regular notifications
  {
    id: 'n1',
    title: 'Leave Request Pending',
    message: 'Emily Rodriguez submitted a vacation request for Feb 25-27.',
    type: 'info',
    time: '10 min ago',
    read: false,
  },
  {
    id: 'n2',
    title: 'Overtime Alert',
    message: 'Tom Anderson worked 2.5 hours overtime yesterday.',
    type: 'warning',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 'n3',
    title: 'Leave Approved',
    message: 'Your sick leave request for Feb 19 has been approved.',
    type: 'success',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'n4',
    title: 'Consecutive Absence Alert',
    message: 'Robert Martinez has been absent for 3 consecutive days.',
    type: 'error',
    time: '3 hours ago',
    read: true,
  },
  {
    id: 'n5',
    title: 'Checkout Reminder',
    message: "Don't forget to check out before leaving the office.",
    type: 'info',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'n6',
    title: 'Weekly Report Ready',
    message: 'Your weekly attendance summary for Feb 10-14 is ready.',
    type: 'success',
    time: 'Yesterday',
    read: true,
  },
];

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'Engineering', managerId: 'u2', headcount: 4, presentToday: 3 },
  { id: 'd2', name: 'Design', managerId: 'u7', headcount: 2, presentToday: 2 },
  { id: 'd3', name: 'Marketing', managerId: '', headcount: 2, presentToday: 1 },
  { id: 'd4', name: 'Finance', managerId: '', headcount: 1, presentToday: 1 },
  { id: 'd5', name: 'Human Resources', managerId: '', headcount: 1, presentToday: 1 },
];

export const GEOFENCE_ZONES: GeofenceZone[] = [
  {
    id: 'gz1',
    name: 'HQ — Main Office',
    address: '100 Market Street, Floor 3, San Francisco, CA',
    lat: 37.7749,
    lng: -122.4194,
    radius: 150,
    active: true,
  },
  {
    id: 'gz2',
    name: 'Branch — Downtown',
    address: '55 Second Street, San Francisco, CA',
    lat: 37.7880,
    lng: -122.3996,
    radius: 100,
    active: true,
  },
  {
    id: 'gz3',
    name: 'Co-working Space — SoMa',
    address: '901 Mission Street, San Francisco, CA',
    lat: 37.7825,
    lng: -122.4096,
    radius: 80,
    active: false,
  },
];

export const MONTHLY_STATS = {
  totalWorkDays: 20,
  presentDays: 13,
  absentDays: 1,
  lateDays: 2,
  wfhDays: 2,
  totalHours: 110.5,
  overtimeHours: 4.5,
  punctualityScore: 87,
  onTimeStreak: 5,
};

export const LEAVE_BALANCE = {
  vacation: { total: 15, used: 3, remaining: 12 },
  sick: { total: 10, used: 1, remaining: 9 },
  personal: { total: 5, used: 0, remaining: 5 },
};

export const DEPARTMENT_STATS = [
  { name: 'Engineering', present: 75, absent: 5, late: 10, wfh: 10 },
  { name: 'Design', present: 85, absent: 5, late: 5, wfh: 5 },
  { name: 'Marketing', present: 70, absent: 15, late: 10, wfh: 5 },
  { name: 'Finance', present: 90, absent: 5, late: 5, wfh: 0 },
  { name: 'HR', present: 95, absent: 0, late: 5, wfh: 0 },
];

export const TOP_PUNCTUAL = [
  { name: 'Lisa Park', score: 98, dept: 'Finance', streak: 22 },
  { name: 'Aisha Thompson', score: 96, dept: 'Design', streak: 18 },
  { name: 'Marcus Chen', score: 94, dept: 'Engineering', streak: 15 },
];

export const AUDIT_LOG = [
  { id: 'a1', user: 'Sarah Johnson', action: 'Approved leave request', target: 'Priya Patel', time: '2026-02-17 14:32', type: 'leave' },
  { id: 'a2', user: 'Marcus Chen', action: 'Edited attendance record', target: 'Tom Anderson', time: '2026-02-16 11:05', type: 'attendance' },
  { id: 'a3', user: 'Sarah Johnson', action: 'Added new employee', target: 'Robert Martinez', time: '2026-02-10 09:00', type: 'employee' },
  { id: 'a4', user: 'Aisha Thompson', action: 'Rejected leave request', target: 'David Kim', time: '2026-02-12 16:20', type: 'leave' },
  { id: 'a5', user: 'Sarah Johnson', action: 'Updated working hours', target: 'System', time: '2026-02-01 08:30', type: 'settings' },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann1',
    title: '🏢 Office Closure — Feb 21 (Presidents\u2019 Day)',
    message: "The office will be closed on Friday, February 21st in observance of Presidents' Day. All employees are expected to resume work on Monday, February 24th. Enjoy the long weekend!",
    type: 'info',
    audience: 'all',
    authorId: 'u1',
    authorName: 'Sarah Johnson',
    authorRole: 'admin',
    createdAt: '2026-02-18T09:00:00Z',
    pinned: true,
  },
  {
    id: 'ann2',
    title: '\u26a0\ufe0f Mandatory Security Training',
    message: 'All staff must complete the annual cybersecurity training by March 1st. The training link has been sent to your company email. Failure to complete may result in temporary system access restrictions.',
    type: 'urgent',
    audience: 'all',
    authorId: 'u1',
    authorName: 'Sarah Johnson',
    authorRole: 'admin',
    createdAt: '2026-02-17T10:30:00Z',
    pinned: true,
  },
  {
    id: 'ann3',
    title: '\ud83d\ude80 Sprint Planning — Week of Feb 24',
    message: 'Engineering sprint planning is scheduled for Monday, Feb 24 at 10 AM in Conference Room B. Please review the backlog before the meeting and come prepared with capacity estimates for the upcoming two-week sprint.',
    type: 'info',
    audience: 'Engineering',
    authorId: 'u2',
    authorName: 'Marcus Chen',
    authorRole: 'manager',
    createdAt: '2026-02-17T14:00:00Z',
  },
  {
    id: 'ann4',
    title: '\ud83c\udfa8 Brand Refresh — Design Review Session',
    message: "We're hosting an internal brand refresh review next Wednesday at 2 PM. All Design team members are required to attend. Please bring your latest mockups for the new component library and share the Figma link in #design before the session.",
    type: 'success',
    audience: 'Design',
    authorId: 'u7',
    authorName: 'Aisha Thompson',
    authorRole: 'manager',
    createdAt: '2026-02-16T11:00:00Z',
  },
  {
    id: 'ann5',
    title: '\ud83d\udcca Q1 Performance Review Timeline',
    message: 'Q1 performance reviews will begin on March 10th. Managers should schedule 1:1s with their reports before March 7th. Self-assessment forms will be emailed to all employees by February 28th. Please complete them at least 48 hours before your scheduled review.',
    type: 'warning',
    audience: 'all',
    authorId: 'u1',
    authorName: 'Sarah Johnson',
    authorRole: 'admin',
    createdAt: '2026-02-14T08:00:00Z',
  },
  {
    id: 'ann6',
    title: '\ud83d\udd27 Deployment Freeze — Feb 20-21',
    message: 'There will be a code deployment freeze from Thursday Feb 20 EOD through Saturday Feb 22. No production deployments are permitted during this window. Emergency hotfixes must be approved by both Marcus Chen and Sarah Johnson.',
    type: 'urgent',
    audience: 'Engineering',
    authorId: 'u2',
    authorName: 'Marcus Chen',
    authorRole: 'manager',
    createdAt: '2026-02-13T16:45:00Z',
  },
];
