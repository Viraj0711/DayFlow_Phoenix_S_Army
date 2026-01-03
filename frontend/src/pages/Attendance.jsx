import React, { useState, useEffect } from 'react';
import { FiClock, FiCheckCircle, FiXCircle, FiCalendar } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardBody, StatCard } from '../components/Card';
import Button from '../components/Button';
import { Alert } from '../components/Components';
import { attendanceAPI } from '../services/api';
import './Attendance.css';

const Attendance = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, percentage: 0 });
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendance();
    checkTodayStatus();
  }, [currentMonth]);

  const fetchAttendance = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const response = await attendanceAPI.getAttendanceByMonth(year, month);
      const data = response.data || [];
      
      setAttendanceData(data);
      calculateStats(data);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
      // Use mock data
      generateMockAttendance();
    }
  };

  const generateMockAttendance = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const mockData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      if (date.getDay() !== 0 && date.getDay() !== 6 && date <= new Date()) {
        const random = Math.random();
        mockData.push({
          date: date.toISOString().split('T')[0],
          status: random > 0.1 ? 'present' : random > 0.05 ? 'late' : 'absent',
          checkIn: random > 0.1 ? '09:00 AM' : null,
          checkOut: random > 0.1 ? '06:00 PM' : null,
        });
      }
    }

    setAttendanceData(mockData);
    calculateStats(mockData);
  };

  const calculateStats = (data) => {
    const present = data.filter(d => d.status === 'present').length;
    const absent = data.filter(d => d.status === 'absent').length;
    const late = data.filter(d => d.status === 'late').length;
    const total = data.length;

    setStats({
      present,
      absent,
      late,
      percentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0,
    });
  };

  const checkTodayStatus = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = attendanceData.find(a => a.date === today);
    if (todayRecord) {
      setCheckedIn(true);
      setCheckInTime(todayRecord.checkIn);
    }
  };

  const handleCheckIn = async () => {
    try {
      await attendanceAPI.checkIn();
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setCheckedIn(true);
      setCheckInTime(time);
      setSuccess('Checked in successfully!');
      fetchAttendance();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceAPI.checkOut();
      setSuccess('Checked out successfully!');
      fetchAttendance();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check out');
    }
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    if (next <= new Date()) {
      setCurrentMonth(next);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ empty: true });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const attendance = attendanceData.find(a => a.date === dateString);
      
      days.push({
        day,
        date: dateString,
        attendance,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isToday: dateString === new Date().toISOString().split('T')[0],
        isFuture: date > new Date(),
      });
    }

    return days;
  };

  return (
    <DashboardLayout>
      <div className="attendance-container">
        <div className="attendance-header">
          <div>
            <h1 className="attendance-title">Attendance</h1>
            <p className="attendance-subtitle">Track your daily attendance</p>
          </div>
          <div className="attendance-actions">
            {!checkedIn ? (
              <Button variant="primary" icon={FiClock} onClick={handleCheckIn}>
                Check In
              </Button>
            ) : (
              <Button variant="accent" icon={FiCheckCircle} onClick={handleCheckOut}>
                Check Out
              </Button>
            )}
          </div>
        </div>

        {success && <Alert variant="success" title="Success">{success}</Alert>}
        {error && <Alert variant="error" title="Error">{error}</Alert>}

        {checkedIn && checkInTime && (
          <Alert variant="info" title="Status">
            You checked in today at {checkInTime}
          </Alert>
        )}

        <div className="stats-grid">
          <StatCard
            label="Present Days"
            value={stats.present}
            gradient="success"
          />
          <StatCard
            label="Absent Days"
            value={stats.absent}
            gradient="error"
          />
          <StatCard
            label="Late Arrivals"
            value={stats.late}
            gradient="accent"
          />
          <StatCard
            label="Attendance Rate"
            value={`${stats.percentage}%`}
            trend={stats.percentage > 90 ? 'up' : 'down'}
            gradient="primary"
          />
        </div>

        <Card>
          <CardHeader>
            <div className="calendar-header">
              <CardTitle>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="calendar-nav">
                <Button variant="ghost" onClick={previousMonth}>
                  ←
                </Button>
                <Button variant="ghost" onClick={nextMonth}>
                  →
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="calendar">
              <div className="calendar-weekdays">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="calendar-weekday">
                    {day}
                  </div>
                ))}
              </div>
              <div className="calendar-days">
                {getDaysInMonth().map((dayData, index) => {
                  if (dayData.empty) {
                    return <div key={`empty-${index}`} className="calendar-day empty" />;
                  }

                  const statusClass = dayData.attendance?.status || 'none';
                  const isWeekend = dayData.isWeekend ? 'weekend' : '';
                  const isToday = dayData.isToday ? 'today' : '';
                  const isFuture = dayData.isFuture ? 'future' : '';

                  return (
                    <div
                      key={dayData.date}
                      className={`calendar-day ${statusClass} ${isWeekend} ${isToday} ${isFuture}`}
                    >
                      <span className="calendar-day-number">{dayData.day}</span>
                      {dayData.attendance && (
                        <div className="calendar-day-status">
                          {dayData.attendance.status === 'present' && <FiCheckCircle />}
                          {dayData.attendance.status === 'absent' && <FiXCircle />}
                          {dayData.attendance.status === 'late' && <FiClock />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="calendar-legend">
              <div className="legend-item">
                <span className="legend-dot present"></span>
                <span>Present</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot absent"></span>
                <span>Absent</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot late"></span>
                <span>Late</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot weekend"></span>
                <span>Weekend</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
