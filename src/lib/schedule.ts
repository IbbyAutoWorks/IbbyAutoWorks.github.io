export type AppointmentWindow = {
  date: string;
  label: string;
  booked: boolean;
  reason: string;
};

export const businessSchedule = {
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  hours: "8:00 AM - 5:00 PM",
  serviceArea: "Auburn/Lewiston and surrounding Maine towns",
  baseLocation: "Auburn, ME",
  includedRadiusMiles: 25,
  outsideRadiusFee: "$2.50 per mile after included radius",
  googleCalendarStatus: "Not connected yet"
};

export const appointmentWindows: AppointmentWindow[] = [
  { date: "2026-06-08", label: "Monday, June 8 - Morning", booked: false, reason: "Open mobile service window" },
  { date: "2026-06-08", label: "Monday, June 8 - Afternoon", booked: true, reason: "Already booked" },
  { date: "2026-06-09", label: "Tuesday, June 9 - Morning", booked: false, reason: "Open mobile service window" },
  { date: "2026-06-09", label: "Tuesday, June 9 - Afternoon", booked: false, reason: "Open mobile service window" },
  { date: "2026-06-10", label: "Wednesday, June 10 - Morning", booked: true, reason: "Already booked" },
  { date: "2026-06-10", label: "Wednesday, June 10 - Afternoon", booked: false, reason: "Open mobile service window" },
  { date: "2026-06-12", label: "Friday, June 12", booked: true, reason: "Blocked by admin" }
];

export function findAppointmentWindow(label: string) {
  return appointmentWindows.find((window) => window.label === label);
}
