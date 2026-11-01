// Remaining mock data for screens not yet backed by the database
// (Progress, Classes, achievements, quotes). Real data comes from /api.

export const user = {
  membership: 'Pulse Elite',
  level: 14,
  xp: 7420,
  xpNext: 9000,
}

export const muscleGroups = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']

export const strengthHistory = [
  { month: 'May', bench: 55, squat: 80, deadlift: 100 },
  { month: 'Jun', bench: 57.5, squat: 85, deadlift: 107.5 },
  { month: 'Jul', bench: 60, squat: 90, deadlift: 112.5 },
  { month: 'Aug', bench: 62.5, squat: 92.5, deadlift: 120 },
  { month: 'Sep', bench: 65, squat: 100, deadlift: 125 },
  { month: 'Oct', bench: 70, squat: 105, deadlift: 135 },
]

export const personalRecords = [
  { lift: 'Deadlift', value: '135 kg', date: 'Oct 18', delta: '+10 kg', tier: 'gold' },
  { lift: 'Back Squat', value: '105 kg', date: 'Oct 12', delta: '+5 kg', tier: 'gold' },
  { lift: 'Bench Press', value: '70 kg', date: 'Oct 21', delta: '+5 kg', tier: 'silver' },
  { lift: '5K Run', value: '24:12', date: 'Sep 30', delta: '−48s', tier: 'silver' },
  { lift: 'Pull-Ups', value: '14 reps', date: 'Sep 22', delta: '+3', tier: 'bronze' },
  { lift: 'Plank', value: '3:30', date: 'Aug 27', delta: '+40s', tier: 'bronze' },
]

export const classTypes = {
  Yoga: { color: '#a78bfa', icon: 'Flower2' },
  HIIT: { color: '#ff6b3d', icon: 'Zap' },
  Spin: { color: '#22e4ff', icon: 'Bike' },
  Boxing: { color: '#c6ff3d', icon: 'Swords' },
}

export const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const classes = [
  { id: 1, type: 'HIIT', name: 'Metcon Blast', day: 'Mon', time: '06:30', duration: 45, coach: 'Jordan Reyes', spots: 4, capacity: 20 },
  { id: 2, type: 'Yoga', name: 'Sunrise Flow', day: 'Mon', time: '08:00', duration: 60, coach: 'Priya Nair', spots: 9, capacity: 18 },
  { id: 3, type: 'Spin', name: 'Climb & Sprint', day: 'Mon', time: '18:30', duration: 45, coach: 'Alex Kim', spots: 0, capacity: 24 },
  { id: 4, type: 'Boxing', name: 'Fight Club Basics', day: 'Tue', time: '07:00', duration: 50, coach: 'Marcus Bell', spots: 6, capacity: 16 },
  { id: 5, type: 'Spin', name: 'Rhythm Ride', day: 'Tue', time: '12:15', duration: 30, coach: 'Alex Kim', spots: 11, capacity: 24 },
  { id: 6, type: 'Yoga', name: 'Power Vinyasa', day: 'Tue', time: '19:00', duration: 60, coach: 'Priya Nair', spots: 2, capacity: 18 },
  { id: 7, type: 'HIIT', name: 'Tabata Torch', day: 'Wed', time: '06:30', duration: 30, coach: 'Jordan Reyes', spots: 7, capacity: 20 },
  { id: 8, type: 'Boxing', name: 'Heavy Bag Rounds', day: 'Wed', time: '18:00', duration: 45, coach: 'Marcus Bell', spots: 3, capacity: 16 },
  { id: 9, type: 'Yoga', name: 'Yin & Restore', day: 'Thu', time: '20:00', duration: 60, coach: 'Lena Ortiz', spots: 12, capacity: 18 },
  { id: 10, type: 'Spin', name: 'Hill Repeats', day: 'Thu', time: '07:00', duration: 45, coach: 'Sam Ito', spots: 5, capacity: 24 },
  { id: 11, type: 'HIIT', name: 'Engine Room', day: 'Fri', time: '17:30', duration: 45, coach: 'Jordan Reyes', spots: 1, capacity: 20 },
  { id: 12, type: 'Boxing', name: 'Friday Night Fights', day: 'Fri', time: '19:00', duration: 60, coach: 'Marcus Bell', spots: 8, capacity: 16 },
  { id: 13, type: 'Yoga', name: 'Weekend Unwind', day: 'Sat', time: '09:30', duration: 75, coach: 'Lena Ortiz', spots: 10, capacity: 18 },
  { id: 14, type: 'HIIT', name: 'Saturday Sweat', day: 'Sat', time: '10:00', duration: 45, coach: 'Jordan Reyes', spots: 0, capacity: 20 },
  { id: 15, type: 'Spin', name: 'Long Ride', day: 'Sat', time: '11:00', duration: 60, coach: 'Sam Ito', spots: 14, capacity: 24 },
  { id: 16, type: 'Yoga', name: 'Sunday Reset', day: 'Sun', time: '09:00', duration: 60, coach: 'Priya Nair', spots: 7, capacity: 18 },
  { id: 17, type: 'Spin', name: 'Sunday Sprint', day: 'Sun', time: '10:30', duration: 45, coach: 'Alex Kim', spots: 3, capacity: 24 },
  { id: 18, type: 'HIIT', name: 'Full Body Burn', day: 'Sun', time: '17:00', duration: 40, coach: 'Jordan Reyes', spots: 12, capacity: 20 },
]

export const achievements = [
  { id: 'streak', title: 'On Fire', desc: '21-day streak', icon: 'Flame', unlocked: true, color: '#ff6b3d' },
  { id: '100', title: 'Centurion', desc: '100 workouts logged', icon: 'Dumbbell', unlocked: true, color: '#c6ff3d' },
  { id: 'early', title: 'Early Bird', desc: '10 workouts before 7am', icon: 'Sunrise', unlocked: true, color: '#fbbf24' },
  { id: 'pr', title: 'Record Breaker', desc: 'Set 5 PRs in a month', icon: 'Trophy', unlocked: true, color: '#22e4ff' },
  { id: 'classes', title: 'Social Sweat', desc: 'Attend 25 classes', icon: 'Users', unlocked: true, color: '#a78bfa' },
  { id: 'marathon', title: 'Iron Lungs', desc: 'Log 1,000 cardio minutes', icon: 'HeartPulse', unlocked: false, color: '#f472b6' },
  { id: 'deadlift', title: 'Double Bodyweight', desc: 'Deadlift 2× bodyweight', icon: 'Mountain', unlocked: false, color: '#34d399' },
  { id: 'year', title: 'Year One', desc: '365 days as a member', icon: 'Crown', unlocked: false, color: '#fde047' },
]

export const lifetimeStats = [
  { label: 'Workouts', value: 186 },
  { label: 'Hours trained', value: 142 },
  { label: 'Classes', value: 31 },
  { label: 'PRs set', value: 27 },
]

export const quotes = [
  { text: 'The only bad workout is the one that didn’t happen.', author: 'Unknown' },
  { text: 'Strength doesn’t come from what you can do. It comes from overcoming the things you once thought you couldn’t.', author: 'Rikki Rogers' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln (attributed)' },
  { text: 'Take care of your body. It’s the only place you have to live.', author: 'Jim Rohn' },
  { text: 'Success isn’t always about greatness. It’s about consistency.', author: 'Dwayne Johnson' },
  { text: 'You don’t have to be extreme, just consistent.', author: 'Unknown' },
  { text: 'Sweat is just fat crying.', author: 'Gym folklore' },
]

export function quoteOfTheDay() {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const day = Math.floor((Date.now() - start) / 86400000)
  return quotes[day % quotes.length]
}
