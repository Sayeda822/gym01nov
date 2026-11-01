-- PulseFit sample data. Safe to run repeatedly (upserts, no duplicates).

INSERT INTO exercises (name, muscle_group, sets, reps, difficulty, rest_seconds, description) VALUES
  -- Chest
  ('Barbell Bench Press',     'Chest', 4, '6–8',   'Intermediate',  90, 'Lie flat, lower the bar to mid-chest with control, press back up explosively.'),
  ('Incline Dumbbell Press',  'Chest', 3, '8–10',  'Intermediate',  75, 'Bench at 30°. Press dumbbells up and slightly in to hit the upper chest.'),
  ('Tempo Push-Ups',          'Chest', 3, '15',    'Beginner',      45, 'Three seconds down, one second up. Keep a straight line from head to heels.'),
  ('Cable Crossover Fly',     'Chest', 3, '12',    'Beginner',      60, 'Slight bend in the elbows, hug the handles together at chest height.'),
  ('Weighted Chest Dips',     'Chest', 3, '8',     'Advanced',      90, 'Lean forward on the dip bars to bias the chest. Add weight with a belt.'),
  -- Back
  ('Conventional Deadlift',   'Back',  5, '5',     'Advanced',     150, 'Brace hard, push the floor away and lock out with your glutes, not your lower back.'),
  ('Weighted Pull-Ups',       'Back',  4, '6',     'Advanced',     120, 'Full hang at the bottom, chin over the bar at the top. Add weight once 10 reps is easy.'),
  ('Bent-Over Barbell Row',   'Back',  4, '8',     'Intermediate',  90, 'Hinge to about 45°, row the bar to your belly button and squeeze the shoulder blades.'),
  ('Lat Pulldown',            'Back',  3, '10–12', 'Beginner',      60, 'Pull the bar to your upper chest, leading with the elbows.'),
  ('Single-Arm Dumbbell Row', 'Back',  3, '10',    'Beginner',      60, 'One hand and knee on the bench. Pull the dumbbell to your hip, not your shoulder.'),
  -- Legs
  ('Back Squat',              'Legs',  5, '5',     'Advanced',     150, 'Bar on the upper back, sit between your hips to at least parallel, drive up through mid-foot.'),
  ('Romanian Deadlift',       'Legs',  4, '8',     'Intermediate',  90, 'Soft knees, push the hips back until you feel a deep hamstring stretch.'),
  ('Walking Lunges',          'Legs',  3, '12 / leg', 'Beginner',   60, 'Long steps, back knee kisses the floor, torso tall.'),
  ('Leg Press',               'Legs',  4, '10',    'Beginner',      75, 'Feet shoulder-width, lower until knees reach 90°, do not lock out hard.'),
  ('Bulgarian Split Squat',   'Legs',  3, '8 / leg', 'Intermediate', 75, 'Rear foot on a bench. Drop straight down and keep the front heel planted.'),
  -- Arms
  ('EZ-Bar Curl',             'Arms',  3, '10',    'Beginner',      60, 'Elbows pinned to your sides. No swinging, squeeze at the top.'),
  ('Parallel Bar Dips',       'Arms',  3, '8–12',  'Intermediate',  75, 'Stay upright to focus on the triceps. Lower until the elbows hit 90°.'),
  ('Skull Crushers',          'Arms',  3, '10',    'Intermediate',  60, 'Lower the EZ bar to just above your forehead, extend without flaring the elbows.'),
  ('Hammer Curls',            'Arms',  3, '12',    'Beginner',      45, 'Neutral grip, curl with control to build the forearms and brachialis.'),
  ('Close-Grip Bench Press',  'Arms',  4, '6–8',   'Advanced',      90, 'Hands shoulder-width, elbows tucked. A heavy triceps builder.'),
  -- Core
  ('Plank Hold',              'Core',  3, '60s',   'Beginner',      30, 'Forearms down, squeeze glutes and abs. Do not let the hips sag.'),
  ('Hanging Leg Raise',       'Core',  3, '12',    'Intermediate',  60, 'Hang from a bar and raise straight legs to hip height without swinging.'),
  ('Ab Wheel Rollout',        'Core',  3, '10',    'Advanced',      60, 'Roll out as far as you can while keeping a flat back, then pull back with the abs.'),
  ('Dead Bug',                'Core',  3, '10 / side', 'Beginner',  30, 'Lower back pressed into the floor, extend opposite arm and leg slowly.'),
  ('Cable Woodchop',          'Core',  3, '12 / side', 'Intermediate', 45, 'Rotate through the torso, not the arms. Pivot the back foot.'),
  -- Cardio
  ('Rower Intervals',         'Cardio', 6, '500m', 'Intermediate',  90, 'Legs, then body, then arms. Aim for a steady split you can hold every round.'),
  ('Assault Bike Sprints',    'Cardio', 8, '20s',  'Advanced',      40, 'All-out effort for 20 seconds. Push and pull with the arms too.'),
  ('Jump Rope',               'Cardio', 5, '2 min', 'Beginner',     45, 'Light on the balls of your feet, wrists do the work.'),
  ('Burpees',                 'Cardio', 4, '12',   'Intermediate',  60, 'Chest to floor, explosive jump with a clap overhead.'),
  ('Treadmill Incline Walk',  'Cardio', 3, '8 min', 'Beginner',     60, '10–12% incline at a brisk pace. Do not hold the rails.')
ON CONFLICT (name) DO UPDATE SET
  muscle_group = EXCLUDED.muscle_group,
  sets         = EXCLUDED.sets,
  reps         = EXCLUDED.reps,
  difficulty   = EXCLUDED.difficulty,
  rest_seconds = EXCLUDED.rest_seconds,
  description  = EXCLUDED.description;

-- 10 classes spread across the current week (Monday-based, UTC).
INSERT INTO classes (title, coach_name, start_time, duration_minutes, capacity, intensity)
SELECT c.title, c.coach_name, date_trunc('week', now()) + c.offset_from_monday, c.duration_minutes, c.capacity, c.intensity
FROM (VALUES
  ('HIIT Metcon Blast',     'Jordan Reyes', interval '0 days 06:30', 45, 20, 'High'),
  ('Sunrise Yoga Flow',     'Priya Nair',   interval '0 days 08:00', 60, 18, 'Low'),
  ('Spin: Climb & Sprint',  'Alex Kim',     interval '1 days 18:30', 45, 24, 'High'),
  ('Boxing Fundamentals',   'Marcus Bell',  interval '1 days 07:00', 50, 16, 'Medium'),
  ('Strength Club',         'Sofia Lund',   interval '2 days 17:30', 60, 14, 'Medium'),
  ('Power Vinyasa Yoga',    'Priya Nair',   interval '3 days 19:00', 60, 18, 'Medium'),
  ('HIIT Tabata Torch',     'Jordan Reyes', interval '4 days 06:30', 30, 20, 'High'),
  ('Friday Night Boxing',   'Marcus Bell',  interval '4 days 19:00', 60, 16, 'High'),
  ('Spin: Long Ride',       'Sam Ito',      interval '5 days 10:00', 60, 24, 'Medium'),
  ('Sunday Mobility & Core','Lena Ortiz',   interval '6 days 09:30', 45, 18, 'Low')
) AS c(title, coach_name, offset_from_monday, duration_minutes, capacity, intensity)
ON CONFLICT (title, start_time) DO UPDATE SET
  coach_name       = EXCLUDED.coach_name,
  duration_minutes = EXCLUDED.duration_minutes,
  capacity         = EXCLUDED.capacity,
  intensity        = EXCLUDED.intensity;
