-- Exercise Pattern Updates
-- Generated automatically
-- Date: 2026-01-15T09:15:42.304Z

-- High and Medium confidence updates
BEGIN;

-- Anti-Rotation Press – Kneeling Landmine (high confidence)
-- Old: "Accessory" -> New: "Anti-Rotation"
-- Reason: Anti-rotation core exercise
UPDATE exercises SET pattern = 'Anti-Rotation' WHERE id = '895076e8-56c1-4aac-91a6-5fa1212b431f';

-- Anti-Rotation Press – Pallof (Mid Height) (high confidence)
-- Old: "Vertical Pull" -> New: "Anti-Rotation"
-- Reason: Anti-rotation core exercise
UPDATE exercises SET pattern = 'Anti-Rotation' WHERE id = '1c043635-7574-42c2-a714-bd60f460de86';

-- Anti-Rotation Press – Standing Landmine (high confidence)
-- Old: "None of the provided categories are suitable for "Standing landmine anti-rotation"" -> New: "Anti-Rotation"
-- Reason: Anti-rotation core exercise
UPDATE exercises SET pattern = 'Anti-Rotation' WHERE id = 'b00884cd-f200-4624-9ff1-5794f76ca708';

-- Bench Press – Low Incline Dumbbell (Neutral Grip) (high confidence)
-- Old: "Vertical Push" -> New: "Horizontal Push"
-- Reason: Horizontal pressing angle
UPDATE exercises SET pattern = 'Horizontal Push' WHERE id = 'f15155cf-7fab-48ca-98a4-0a1a14d10096';

-- Bench Press – Low Incline Dumbbell (Semi-Pronated) (high confidence)
-- Old: "Vertical Push" -> New: "Horizontal Push"
-- Reason: Horizontal pressing angle
UPDATE exercises SET pattern = 'Horizontal Push' WHERE id = 'e8ea2cd5-29de-4be1-a643-179d964af074';

-- Biceps Curl – Cable (Bar) (high confidence)
-- Old: "Isolation" -> New: "Elbow Flexion"
-- Reason: Bicep curl variation
UPDATE exercises SET pattern = 'Elbow Flexion' WHERE id = '794bb736-9c36-4263-a0c6-d78fbf74e507';

-- Biceps Curl – Cable (Dual Arm) (high confidence)
-- Old: "To categorize this movement, I need more information about the exercise. Please provide the specific exercise to categorize it." -> New: "Elbow Flexion"
-- Reason: Bicep curl variation
UPDATE exercises SET pattern = 'Elbow Flexion' WHERE id = '9d376722-7b16-40ad-bd1f-31d86da25769';

-- Biceps Curl – Cable (Single Arm) (high confidence)
-- Old: "Isolation" -> New: "Elbow Flexion"
-- Reason: Bicep curl variation
UPDATE exercises SET pattern = 'Elbow Flexion' WHERE id = '64b0db3c-cf3c-4f79-8453-c21581a1eb47';

-- Biceps Curl – Dumbbell (Mechanical Drop Set) (high confidence)
-- Old: "None of the provided categories apply to "Isolation" as a movement type." -> New: "Elbow Flexion"
-- Reason: Bicep curl variation
UPDATE exercises SET pattern = 'Elbow Flexion' WHERE id = '6a57980a-7de4-4c78-b87a-0a825a1ab233';

-- Biceps Curl – Dumbbell (Supinated) (high confidence)
-- Old: "Isolation" -> New: "Elbow Flexion"
-- Reason: Bicep curl variation
UPDATE exercises SET pattern = 'Elbow Flexion' WHERE id = 'f9b0e200-b49b-4049-b85e-a003d7a232c0';

-- Biceps Curl – EZ-Bar (high confidence)
-- Old: "None" -> New: "Elbow Flexion"
-- Reason: Bicep curl variation
UPDATE exercises SET pattern = 'Elbow Flexion' WHERE id = '40cea566-6af0-4fb7-8126-865565dc7edd';

-- Biceps Curl – EZ-Bar Preacher (high confidence)
-- Old: "Isolation" -> New: "Elbow Flexion"
-- Reason: Bicep curl variation
UPDATE exercises SET pattern = 'Elbow Flexion' WHERE id = '5b5c93c4-096f-46b6-b65c-f12532efe59b';

-- Biceps Curl – Hammer Dumbbell (high confidence)
-- Old: "Vertical Pull" -> New: "Elbow Flexion"
-- Reason: Bicep curl variation
UPDATE exercises SET pattern = 'Elbow Flexion' WHERE id = '0711087c-d452-46bf-807c-f76fb30a916b';

-- Biceps Curl – Hammer Preacher Dumbbell (high confidence)
-- Old: "Vertical Pull" -> New: "Elbow Flexion"
-- Reason: Bicep curl variation
UPDATE exercises SET pattern = 'Elbow Flexion' WHERE id = '2b85eac2-9617-4ea1-aed3-60e3ab67f794';

-- Biceps Curl – Machine (high confidence)
-- Old: "Isolation" -> New: "Elbow Flexion"
-- Reason: Bicep curl variation
UPDATE exercises SET pattern = 'Elbow Flexion' WHERE id = 'cb0d19a6-1778-4a74-90d9-6e16fdb3c975';

-- Biceps Curl – Preacher Dumbbell (high confidence)
-- Old: "Isolation" -> New: "Elbow Flexion"
-- Reason: Bicep curl variation
UPDATE exercises SET pattern = 'Elbow Flexion' WHERE id = 'a8086b6d-b59f-440a-b10c-e68c7881c2b6';

-- Biceps Curl – Zottman Dumbbell (high confidence)
-- Old: "Isolation" -> New: "Elbow Flexion"
-- Reason: Bicep curl variation
UPDATE exercises SET pattern = 'Elbow Flexion' WHERE id = 'c87db44c-7053-434c-bb9b-98e907d2c54e';

-- Calf Raise – Seated (high confidence)
-- Old: "None of the provided categories apply to a Seated Calf Raise" -> New: "Calf"
-- Reason: Calf exercise
UPDATE exercises SET pattern = 'Calf' WHERE id = '1fe898fe-767e-440d-a6e0-c47f8fd5caa9';

-- Calf Raise – Standing (high confidence)
-- Old: "Isolation" -> New: "Calf"
-- Reason: Calf exercise
UPDATE exercises SET pattern = 'Calf' WHERE id = '75a09df3-60a9-4e8a-ada5-5c171af80839';

-- Calf Raise – Standing (Single Leg) (high confidence)
-- Old: "Isolation" -> New: "Calf"
-- Reason: Calf exercise
UPDATE exercises SET pattern = 'Calf' WHERE id = '49beaae2-433c-448f-88e4-1a699230bc8a';

-- Carry – Farmer’s (high confidence)
-- Old: "Accessory" -> New: "Carry"
-- Reason: Loaded carry exercise
UPDATE exercises SET pattern = 'Carry' WHERE id = '06476c84-2c90-4114-a3ec-3bbb4bff7c97';

-- Carry – Kettlebell Front Rack (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Carry"
-- Reason: Loaded carry exercise
UPDATE exercises SET pattern = 'Carry' WHERE id = 'fc0d412d-ae63-4e59-ade5-0de6a21e8d5e';

-- Carry – Medicine Ball (high confidence)
-- Old: "Hinge" -> New: "Carry"
-- Reason: Loaded carry exercise
UPDATE exercises SET pattern = 'Carry' WHERE id = '3a8b443d-05f1-44e2-8e6b-7c82ba1955dd';

-- Carry – Offset Kettlebell (Shoulder) (high confidence)
-- Old: "Vertical Push" -> New: "Carry"
-- Reason: Loaded carry exercise
UPDATE exercises SET pattern = 'Carry' WHERE id = '7a6dbfa1-0cc0-4de6-b81f-95923027c72c';

-- Carry – Overhead Offset Kettlebell (high confidence)
-- Old: "Accessory" -> New: "Carry"
-- Reason: Loaded carry exercise
UPDATE exercises SET pattern = 'Carry' WHERE id = '4ade9366-9004-4831-a602-67fbb8e7ce9c';

-- Carry – Suitcase (high confidence)
-- Old: "Hinge" -> New: "Carry"
-- Reason: Loaded carry exercise
UPDATE exercises SET pattern = 'Carry' WHERE id = 'c4babd5d-04f1-43d3-9016-c8938c7d3c62';

-- Carry – Zercher Barbell (high confidence)
-- Old: "Accessory" -> New: "Carry"
-- Reason: Loaded carry exercise
UPDATE exercises SET pattern = 'Carry' WHERE id = '0db3b237-346f-49e1-b681-f28a3c1fc35a';

-- Chest Press – Decline (high confidence)
-- Old: "Horizontal push" -> New: "Horizontal Push"
-- Reason: Horizontal pressing angle
UPDATE exercises SET pattern = 'Horizontal Push' WHERE id = 'd7ea88b5-864b-4879-88f6-4370d595dc73';

-- Dead Bug – Alternating (high confidence)
-- Old: "Isolation" -> New: "Anti-Extension"
-- Reason: Anti-extension core exercise
UPDATE exercises SET pattern = 'Anti-Extension' WHERE id = 'cc7a68fb-0e1d-424a-bfbd-d6afc4fed8bc';

-- Dead Bug – Hip Flexor Emphasis (high confidence)
-- Old: "None of the provided categories directly apply" -> New: "Anti-Extension"
-- Reason: Anti-extension core exercise
UPDATE exercises SET pattern = 'Anti-Extension' WHERE id = '4ded1f94-8bed-4c1d-8d3f-b7f3567922f3';

-- Dead Bug – Isometric Hold (high confidence)
-- Old: "Vertical Push" -> New: "Anti-Extension"
-- Reason: Anti-extension core exercise
UPDATE exercises SET pattern = 'Anti-Extension' WHERE id = '99ae6bfa-cc7b-434a-bb8d-8e42f68e18f7';

-- Face Pull – Cable (Low to High) (high confidence)
-- Old: "Isolation" -> New: "Shoulder External Rotation"
-- Reason: Face pull - external rotation
UPDATE exercises SET pattern = 'Shoulder External Rotation' WHERE id = '17033006-2fc1-4bab-9153-d620723f895c';

-- Face Pull – Seated Cable (External Rotation) (high confidence)
-- Old: "Isolation" -> New: "Shoulder External Rotation"
-- Reason: Face pull - external rotation
UPDATE exercises SET pattern = 'Shoulder External Rotation' WHERE id = 'f98f307d-1749-490c-a4fc-b01b4eb0d868';

-- Face Pull – Seated Cable (Upper Back) (high confidence)
-- Old: "Isolation" -> New: "Shoulder External Rotation"
-- Reason: Face pull - external rotation
UPDATE exercises SET pattern = 'Shoulder External Rotation' WHERE id = 'ef416821-42d3-4404-bdf1-08de93d2440f';

-- Face Pull – Standing (high confidence)
-- Old: "Isolation" -> New: "Shoulder External Rotation"
-- Reason: Face pull - external rotation
UPDATE exercises SET pattern = 'Shoulder External Rotation' WHERE id = '866feddc-1b43-41d7-943e-be1fbb943735';

-- Hip Abduction – Seated (high confidence)
-- Old: "Isolation" -> New: "Hip Abduction"
-- Reason: Hip abduction exercise
UPDATE exercises SET pattern = 'Hip Abduction' WHERE id = '03655eb9-b8ef-42a6-9956-540a50a97b47';

-- Hip Abduction – Seated (Forward Lean) (high confidence)
-- Old: "Isolation" -> New: "Hip Abduction"
-- Reason: Hip abduction exercise
UPDATE exercises SET pattern = 'Hip Abduction' WHERE id = 'aa131590-11b2-4866-a9d6-c9753ace3e17';

-- Hip Abduction – Standing Machine (high confidence)
-- Old: "Isolation" -> New: "Hip Abduction"
-- Reason: Hip abduction exercise
UPDATE exercises SET pattern = 'Hip Abduction' WHERE id = '709e6a52-e7a9-4197-99d7-1ee2b4b1fc28';

-- Hip Adduction – Seated (high confidence)
-- Old: "Isolation" -> New: "Hip Adduction"
-- Reason: Hip adduction exercise
UPDATE exercises SET pattern = 'Hip Adduction' WHERE id = 'c1363aba-1193-4d00-a102-9b177d45fac7';

-- Lat Pulldown – Cable (Single Arm) (high confidence)
-- Old: "Isolation" -> New: "Vertical Pull"
-- Reason: Lat pulldown variation
UPDATE exercises SET pattern = 'Vertical Pull' WHERE id = '0587f415-57bb-463e-a20e-b7e3b9a10f9e';

-- Lateral Raise – Bench Supported (high confidence)
-- Old: "Vertical Push" -> New: "Shoulder Abduction"
-- Reason: Lateral raise - shoulder abduction
UPDATE exercises SET pattern = 'Shoulder Abduction' WHERE id = 'e363b9fb-3cf7-453a-841f-231a3889e16d';

-- Lateral Raise – Chest Supported Dumbbell (high confidence)
-- Old: "Vertical Push" -> New: "Shoulder Abduction"
-- Reason: Lateral raise - shoulder abduction
UPDATE exercises SET pattern = 'Shoulder Abduction' WHERE id = 'f1ac36a3-7089-4d02-8a22-ba40a10b2743';

-- Lateral Raise – Chest Supported Dumbbell (high confidence)
-- Old: "Vertical Pull" -> New: "Shoulder Abduction"
-- Reason: Lateral raise - shoulder abduction
UPDATE exercises SET pattern = 'Shoulder Abduction' WHERE id = '362d0996-32f5-4e60-bad9-daed2d9f581e';

-- Lateral Raise – Dumbbell (high confidence)
-- Old: "Isolation" -> New: "Shoulder Abduction"
-- Reason: Lateral raise - shoulder abduction
UPDATE exercises SET pattern = 'Shoulder Abduction' WHERE id = '303c94b3-8c7c-4175-bdfb-6e110537a0bd';

-- Lateral Raise – Machine (high confidence)
-- Old: "Isolation" -> New: "Shoulder Abduction"
-- Reason: Lateral raise - shoulder abduction
UPDATE exercises SET pattern = 'Shoulder Abduction' WHERE id = '854a163c-db42-46cb-87d8-0d20cd5b02e6';

-- Leg Curl – Lying (high confidence)
-- Old: "Knee Flexion (Hamstring)" -> New: "Knee Flexion"
-- Reason: Hamstring curl exercise
UPDATE exercises SET pattern = 'Knee Flexion' WHERE id = 'cd0aa30f-396b-4341-a100-545c9b836dea';

-- Leg Curl – Lying (Alternating, Eccentric) (high confidence)
-- Old: "Knee Flexion (Hamstring)" -> New: "Knee Flexion"
-- Reason: Hamstring curl exercise
UPDATE exercises SET pattern = 'Knee Flexion' WHERE id = '0f948f6c-3dc9-4d38-88cb-f012e2107155';

-- Leg Curl – Lying (Alternating) (high confidence)
-- Old: "Knee Flexion (Hamstring)" -> New: "Knee Flexion"
-- Reason: Hamstring curl exercise
UPDATE exercises SET pattern = 'Knee Flexion' WHERE id = '62d986b8-2157-4fe0-903c-19372fc9107d';

-- Leg Curl – Lying (Single Leg) (high confidence)
-- Old: "Knee Flexion (Hamstring)" -> New: "Knee Flexion"
-- Reason: Hamstring curl exercise
UPDATE exercises SET pattern = 'Knee Flexion' WHERE id = 'fc2e5602-3bd6-4806-93b3-9b84dbe019f0';

-- Leg Curl – Seated (high confidence)
-- Old: "Knee Flexion (Hamstring)" -> New: "Knee Flexion"
-- Reason: Hamstring curl exercise
UPDATE exercises SET pattern = 'Knee Flexion' WHERE id = '1e28b7e4-f216-47fe-9ff7-ceb45b5587b9';

-- Leg Curl – Seated (Single Leg) (high confidence)
-- Old: "Knee Flexion (Hamstring)" -> New: "Knee Flexion"
-- Reason: Hamstring curl exercise
UPDATE exercises SET pattern = 'Knee Flexion' WHERE id = 'ff707db9-e604-44a6-8c63-cb9b9c28d38f';

-- Leg Extension (high confidence)
-- Old: "Isolation" -> New: "Knee Extension"
-- Reason: Leg extension exercise
UPDATE exercises SET pattern = 'Knee Extension' WHERE id = 'ccbb88b3-a8bc-4b76-8a2b-65164691f0b9';

-- Leg Extension – Alternating (high confidence)
-- Old: "Isolation" -> New: "Knee Extension"
-- Reason: Leg extension exercise
UPDATE exercises SET pattern = 'Knee Extension' WHERE id = 'c94b2243-8cc1-4110-9288-f87a2b5d5745';

-- Leg Extension – Alternating (Eccentric) (high confidence)
-- Old: "Isolation" -> New: "Knee Extension"
-- Reason: Leg extension exercise
UPDATE exercises SET pattern = 'Knee Extension' WHERE id = 'ee5ca6fb-9e23-4daa-bb06-8901c2dc8c93';

-- Leg Extension – Rehabilitation (high confidence)
-- Old: "Isolation" -> New: "Knee Extension"
-- Reason: Leg extension exercise
UPDATE exercises SET pattern = 'Knee Extension' WHERE id = 'eeb1379b-db06-422d-b10b-5ed6bfb268c7';

-- Leg Extension – Single Leg (high confidence)
-- Old: "Isolation" -> New: "Knee Extension"
-- Reason: Leg extension exercise
UPDATE exercises SET pattern = 'Knee Extension' WHERE id = 'b85aaace-beda-4016-b10c-a6128c8086f7';

-- Leg Press – 45 Degree (High and Wide Stance) (high confidence)
-- Old: "Squat Hip Dominant" -> New: "Squat - Hip Dominant"
-- Reason: Hip-dominant leg press stance
UPDATE exercises SET pattern = 'Squat - Hip Dominant' WHERE id = 'c3a8d3fa-2ee0-46fc-a30a-b2ce49985961';

-- Leg Press – 45 Degree (High Close Stance) (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Squat - Quad Dominant"
-- Reason: Quad-dominant leg press stance
UPDATE exercises SET pattern = 'Squat - Quad Dominant' WHERE id = 'cac3a0ae-be45-4e96-bdb3-c0dc8120f34f';

-- Leg Press – 45 Degree (Low Close Stance) (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Squat - Quad Dominant"
-- Reason: Quad-dominant leg press stance
UPDATE exercises SET pattern = 'Squat - Quad Dominant' WHERE id = '72d0412f-11bd-4374-a93c-0529f62d1559';

-- Lunge – Forward (Alternating) (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Lunge/Split Stance"
-- Reason: Lunge/split stance exercise
UPDATE exercises SET pattern = 'Lunge/Split Stance' WHERE id = '7f4ade35-a951-45ab-9aff-190dc7b93ef4';

-- Lunge – Kettlebell Front Rack (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Lunge/Split Stance"
-- Reason: Lunge/split stance exercise
UPDATE exercises SET pattern = 'Lunge/Split Stance' WHERE id = '59247cad-7c16-47ef-b05c-b5dc720d0a9d';

-- Lunge – Reverse (Alternating) (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Lunge/Split Stance"
-- Reason: Lunge/split stance exercise
UPDATE exercises SET pattern = 'Lunge/Split Stance' WHERE id = 'cf15eae7-eb70-47ee-b997-0767de807a7d';

-- Lunge – Reverse Barbell (Deficit) (high confidence)
-- Old: "Squat Hip Dominant" -> New: "Lunge/Split Stance"
-- Reason: Reverse deficit lunge
UPDATE exercises SET pattern = 'Lunge/Split Stance' WHERE id = '688fe080-d9e3-4841-b3ce-1152244d09c0';

-- Lunge – Reverse Dumbbell (Deficit, Alternating) (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Squat - Hip Dominant"
-- Reason: Hip-dominant lunge with deficit
UPDATE exercises SET pattern = 'Squat - Hip Dominant' WHERE id = 'c2f2f724-f4dd-4f85-9064-94ec5568f712';

-- Lunge – Reverse Dumbbell (Deficit) (high confidence)
-- Old: "Squat Hip Dominant" -> New: "Squat - Hip Dominant"
-- Reason: Hip-dominant lunge with deficit
UPDATE exercises SET pattern = 'Squat - Hip Dominant' WHERE id = 'cde55183-1f88-4b6f-8c14-ed602496ea63';

-- Lunge – Reverse Safety Bar (Deficit) (high confidence)
-- Old: "Squat Hip Dominant" -> New: "Lunge/Split Stance"
-- Reason: Reverse deficit lunge
UPDATE exercises SET pattern = 'Lunge/Split Stance' WHERE id = 'cc58809e-c0bd-4133-b24c-23c3c30c25bc';

-- Lunge – Walking Barbell (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Lunge/Split Stance"
-- Reason: Lunge/split stance exercise
UPDATE exercises SET pattern = 'Lunge/Split Stance' WHERE id = 'e8116d24-e7fe-4b86-9609-15a6c2fc24cf';

-- Lunge – Walking Dumbbell (high confidence)
-- Old: "Squat Hip Dominant" -> New: "Lunge/Split Stance"
-- Reason: Lunge/split stance exercise
UPDATE exercises SET pattern = 'Lunge/Split Stance' WHERE id = '5f033c00-7d78-44c0-bec4-717ff1e2bc37';

-- Plank (high confidence)
-- Old: "None" -> New: "Anti-Extension"
-- Reason: Anti-extension core exercise
UPDATE exercises SET pattern = 'Anti-Extension' WHERE id = 'c3a019f2-874f-4437-9201-b3a4048c48c4';

-- Rotation – Kneeling Cable (Low to High) (high confidence)
-- Old: "Accessory" -> New: "Rotation"
-- Reason: Rotational core exercise
UPDATE exercises SET pattern = 'Rotation' WHERE id = '2e11a3d3-9e99-4983-b8e9-fb84ac67f0fa';

-- Rotation – Standing Cable (High to Low) (high confidence)
-- Old: "Vertical Pull" -> New: "Rotation"
-- Reason: Rotational core exercise
UPDATE exercises SET pattern = 'Rotation' WHERE id = 'ef30a7cf-7617-43f5-bc26-4ba9081026e2';

-- Rotation – Standing Cable (Low to High) (high confidence)
-- Old: "Hinge" -> New: "Rotation"
-- Reason: Rotational core exercise
UPDATE exercises SET pattern = 'Rotation' WHERE id = '1c787fca-44c6-4f87-93c9-576a0a1213da';

-- Rotation – Standing Cable (Mid Height) (high confidence)
-- Old: "Accessory" -> New: "Rotation"
-- Reason: Rotational core exercise
UPDATE exercises SET pattern = 'Rotation' WHERE id = '28f5f712-fe44-4f2d-90de-1a14feb69100';

-- Rotation – Standing Landmine (high confidence)
-- Old: "Accessory" -> New: "Anti-Rotation"
-- Reason: Anti-rotation core exercise
UPDATE exercises SET pattern = 'Anti-Rotation' WHERE id = '9720eeea-3d39-43aa-988c-0c996194d0a1';

-- Russian Twist – 45 Degree (Anti-Rotation) (high confidence)
-- Old: "Accessory" -> New: "Anti-Rotation"
-- Reason: Anti-rotation core exercise
UPDATE exercises SET pattern = 'Anti-Rotation' WHERE id = 'ff3f31c6-eb78-43ad-aa65-71cca9bf566d';

-- Skullcrusher – EZ-Bar (high confidence)
-- Old: "Vertical Push" -> New: "Elbow Extension"
-- Reason: Tricep isolation exercise
UPDATE exercises SET pattern = 'Elbow Extension' WHERE id = '9137a982-713e-4719-8cdc-a813bfdf64f9';

-- Skullcrusher – EZ-Bar (Rollback) (high confidence)
-- Old: "Isolation" -> New: "Elbow Extension"
-- Reason: Tricep isolation exercise
UPDATE exercises SET pattern = 'Elbow Extension' WHERE id = 'fe61a979-2ad5-4233-b2a1-a30e43c876cd';

-- Split Squat – Bulgarian (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Squat - Hip Dominant"
-- Reason: Hip-dominant squat variation
UPDATE exercises SET pattern = 'Squat - Hip Dominant' WHERE id = '26606e4d-83ac-4512-af28-ae4ef11fac48';

-- Split Squat – Bulgarian Dumbbell (Contralateral) (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Squat - Hip Dominant"
-- Reason: Hip-dominant squat variation
UPDATE exercises SET pattern = 'Squat - Hip Dominant' WHERE id = '3c161261-8e58-4fb0-bcb5-3567dc7b9916';

-- Split Squat – Bulgarian Dumbbell (Double) (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Squat - Hip Dominant"
-- Reason: Hip-dominant squat variation
UPDATE exercises SET pattern = 'Squat - Hip Dominant' WHERE id = '909edf6b-558a-4e5e-b416-a8baf3462f37';

-- Split Squat – Dumbbell (Hip Bias) (high confidence)
-- Old: "Squat Hip Dominant" -> New: "Squat - Hip Dominant"
-- Reason: Hip-dominant squat variation
UPDATE exercises SET pattern = 'Squat - Hip Dominant' WHERE id = 'af61f727-a84b-43ee-bf78-27688617a7f9';

-- Split Squat – Dumbbell (Quad Bias) (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Squat - Quad Dominant"
-- Reason: Quad-dominant squat variation
UPDATE exercises SET pattern = 'Squat - Quad Dominant' WHERE id = 'cde92ece-8e02-4f1b-a0c2-68f0b7e0f7c3';

-- Split Squat – Front Foot Elevated Dumbbell (Hip Bias) (high confidence)
-- Old: "Squat Hip Dominant" -> New: "Squat - Hip Dominant"
-- Reason: Hip-dominant squat variation
UPDATE exercises SET pattern = 'Squat - Hip Dominant' WHERE id = '0caf6ba1-5e98-4453-9a71-12063d7ee67c';

-- Split Squat – Front Foot Elevated Dumbbell (Quad Bias) (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Squat - Quad Dominant"
-- Reason: Quad-dominant squat variation
UPDATE exercises SET pattern = 'Squat - Quad Dominant' WHERE id = 'b44c0c8b-ec08-471b-924f-bfce51ad5101';

-- Split Squat – Smith Machine Front Foot Elevated (high confidence)
-- Old: "Squat Hip Dominant" -> New: "Squat - Quad Dominant"
-- Reason: Quad-dominant squat variation
UPDATE exercises SET pattern = 'Squat - Quad Dominant' WHERE id = 'f515fe8d-fa79-42df-a3e1-7be9b62d0257';

-- Squat – Back (High Bar) (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Squat - Quad Dominant"
-- Reason: Quad-dominant squat variation
UPDATE exercises SET pattern = 'Squat - Quad Dominant' WHERE id = 'c2ea45a7-6c8e-4ef1-b195-08f0b99179be';

-- Squat – Back (Low Bar) (high confidence)
-- Old: "Squat Hip Dominant" -> New: "Squat - Hip Dominant"
-- Reason: Hip-dominant squat variation
UPDATE exercises SET pattern = 'Squat - Hip Dominant' WHERE id = '5f7ba5a6-c299-4371-a06b-79deebd55be7';

-- Squat – Barbell Cyclist (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Squat - Quad Dominant"
-- Reason: Quad-dominant squat variation
UPDATE exercises SET pattern = 'Squat - Quad Dominant' WHERE id = '70c60f93-caae-4ff5-81db-ddf5f9099282';

-- Squat – Goblet (High Heel Elevated) (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Squat - Quad Dominant"
-- Reason: Quad-dominant squat variation
UPDATE exercises SET pattern = 'Squat - Quad Dominant' WHERE id = 'e9205a3d-814b-45b9-b99c-ed6928ae1928';

-- Squat – Goblet (Low Heel Elevated) (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Squat - Quad Dominant"
-- Reason: Quad-dominant squat variation
UPDATE exercises SET pattern = 'Squat - Quad Dominant' WHERE id = 'de6200db-a41a-4a7b-91a6-73104a6e2960';

-- Squat – Hack Machine (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Squat - Quad Dominant"
-- Reason: Quad-dominant squat variation
UPDATE exercises SET pattern = 'Squat - Quad Dominant' WHERE id = 'b23c40f3-9ecc-4086-aa60-6073374be0fc';

-- Squat – Hack Machine (Low Close Stance) (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Squat - Quad Dominant"
-- Reason: Quad-dominant squat variation
UPDATE exercises SET pattern = 'Squat - Quad Dominant' WHERE id = 'cca1d8f7-ca5c-4481-9cfe-a2c03a559b3a';

-- Squat – Safety Bar (high confidence)
-- Old: "Squat Quad Dominant" -> New: "Squat - Quad Dominant"
-- Reason: Quad-dominant squat variation
UPDATE exercises SET pattern = 'Squat - Quad Dominant' WHERE id = '8488debb-1bf3-45f8-8f48-967fb2c83444';

-- Triceps Extension – Dumbbell Rollback (high confidence)
-- Old: "Please specify which exercise you would like to categorize." -> New: "Elbow Extension"
-- Reason: Tricep isolation exercise
UPDATE exercises SET pattern = 'Elbow Extension' WHERE id = '8179fc26-2f07-4328-ae6c-436fe4305247';

-- Triceps Extension – Lying Dumbbell (high confidence)
-- Old: "Isolation" -> New: "Elbow Extension"
-- Reason: Tricep isolation exercise
UPDATE exercises SET pattern = 'Elbow Extension' WHERE id = 'f034739c-dda3-4c4f-a58d-839330b220c8';

-- Triceps Extension – Machine (high confidence)
-- Old: "Isolation" -> New: "Elbow Extension"
-- Reason: Tricep isolation exercise
UPDATE exercises SET pattern = 'Elbow Extension' WHERE id = 'fb7160aa-5570-4437-b3a7-6d17fdb789a1';

-- Triceps Extension – Overhead Cable (Single Arm, Rope) (high confidence)
-- Old: "Vertical Push" -> New: "Elbow Extension"
-- Reason: Tricep isolation exercise
UPDATE exercises SET pattern = 'Elbow Extension' WHERE id = '5cf5b2e4-885a-4f4c-ad46-b843d093f039';

-- Triceps Extension – Overhead Cable (Single Arm, V-Grip) (high confidence)
-- Old: "Vertical Push" -> New: "Elbow Extension"
-- Reason: Tricep isolation exercise
UPDATE exercises SET pattern = 'Elbow Extension' WHERE id = 'd87c8dd5-8b61-4ff3-a8f6-cc3540e761ab';

-- Triceps Extension – Vertical Overhead Cable (Single Arm, Rope) (high confidence)
-- Old: "Vertical Push" -> New: "Elbow Extension"
-- Reason: Tricep isolation exercise
UPDATE exercises SET pattern = 'Elbow Extension' WHERE id = 'a2c9cb82-c8af-4466-bc9a-853e4a9f18a8';

-- Triceps Kickback – Single Arm Cable (high confidence)
-- Old: "Isolation" -> New: "Elbow Extension"
-- Reason: Tricep isolation exercise
UPDATE exercises SET pattern = 'Elbow Extension' WHERE id = 'ab06542e-bae6-4b8a-9852-452ec99231be';

-- Triceps Pushdown – Cable (Bar, T-Rex) (high confidence)
-- Old: "Cannot categorize with the given options" -> New: "Elbow Extension"
-- Reason: Tricep isolation exercise
UPDATE exercises SET pattern = 'Elbow Extension' WHERE id = '54d90d4a-b7aa-4804-8af0-7f40b3d21583';

-- Triceps Pushdown – Cable (Bar) (high confidence)
-- Old: "Isolation" -> New: "Elbow Extension"
-- Reason: Tricep isolation exercise
UPDATE exercises SET pattern = 'Elbow Extension' WHERE id = 'fd4f2442-4cca-4684-a3f4-28c96444f46c';

-- Triceps Pushdown – Cable (V-Bar) (high confidence)
-- Old: "Isolation" -> New: "Elbow Extension"
-- Reason: Tricep isolation exercise
UPDATE exercises SET pattern = 'Elbow Extension' WHERE id = '12dc3b05-69e2-4384-b20a-4642b0964879';

-- Bench Press – Incline Barbell (Close Grip) (medium confidence)
-- Old: "Vertical Push" -> New: "Horizontal Push"
-- Reason: Incline press - horizontal default
UPDATE exercises SET pattern = 'Horizontal Push' WHERE id = 'e8c77ed3-ede2-4c3d-9728-5887d130e8b0';

-- Bench Press – Incline Dumbbell (45°, Neutral Grip) (medium confidence)
-- Old: "Horizontal Push" -> New: "Vertical Push"
-- Reason: Steep incline press - more vertical
UPDATE exercises SET pattern = 'Vertical Push' WHERE id = '9217c77b-8ee7-46fb-80e9-0cdaea3d5646';

-- Bench Press – Incline Dumbbell (45°, Rotating Grip) (medium confidence)
-- Old: "Horizontal Push" -> New: "Vertical Push"
-- Reason: Steep incline press - more vertical
UPDATE exercises SET pattern = 'Vertical Push' WHERE id = '1674ca80-e3d5-4053-b4a7-2f3ab0527564';

-- Bench Press – Incline Dumbbell (45°, Semi-Pronated Grip) (medium confidence)
-- Old: "Horizontal Push" -> New: "Vertical Push"
-- Reason: Steep incline press - more vertical
UPDATE exercises SET pattern = 'Vertical Push' WHERE id = 'cf56f608-8c89-4305-b512-da09d3f7d1ae';

-- Chest Fly – Dual Cable (High) (medium confidence)
-- Old: "Isolation" -> New: "Horizontal Push"
-- Reason: Chest fly - horizontal adduction
UPDATE exercises SET pattern = 'Horizontal Push' WHERE id = '627a39eb-a8ff-4e01-97e0-61be29758570';

-- Chest Fly – Dual Cable (Kneeling) (medium confidence)
-- Old: "Isolation" -> New: "Horizontal Push"
-- Reason: Chest fly - horizontal adduction
UPDATE exercises SET pattern = 'Horizontal Push' WHERE id = 'cced53ae-1bf6-45d5-bab2-18a06d8b4c73';

-- Chest Fly – Dual Cable (Low) (medium confidence)
-- Old: "Isolation" -> New: "Horizontal Push"
-- Reason: Chest fly - horizontal adduction
UPDATE exercises SET pattern = 'Horizontal Push' WHERE id = 'cfbf9b6a-00ed-43fa-904e-5ba2851a3921';

-- Chest Fly – Dual Cable (Mid) (medium confidence)
-- Old: "Isolation" -> New: "Horizontal Push"
-- Reason: Chest fly - horizontal adduction
UPDATE exercises SET pattern = 'Horizontal Push' WHERE id = '8551527b-462f-4640-ad57-6e014e1fe541';

-- Chest Fly – Machine (medium confidence)
-- Old: "Isolation" -> New: "Horizontal Push"
-- Reason: Chest fly - horizontal adduction
UPDATE exercises SET pattern = 'Horizontal Push' WHERE id = 'c2f84591-9891-45af-b890-99711bfdfc90';

-- Crunch – Weighted Machine (medium confidence)
-- Old: "Isolation" -> New: "Anti-Extension"
-- Reason: Flexion-based core exercise
UPDATE exercises SET pattern = 'Anti-Extension' WHERE id = 'f26ea4dc-1f04-40e1-8b33-08ffcb384b13';

-- Leg Press – 45 Degree (Bilateral) (medium confidence)
-- Old: "Squat Quad Dominant" -> New: "Squat - Quad Dominant"
-- Reason: Leg press - default quad dominant
UPDATE exercises SET pattern = 'Squat - Quad Dominant' WHERE id = '4c7aec9a-d4c3-4771-9ba0-476e80c42e78';

-- Leg Press – Horizontal (medium confidence)
-- Old: "Squat Hip Dominant" -> New: "Squat - Quad Dominant"
-- Reason: Leg press - default quad dominant
UPDATE exercises SET pattern = 'Squat - Quad Dominant' WHERE id = '31ee9890-960c-4576-9ff7-77976c3e53e3';

-- Leg Raise – Captain’s Chair (medium confidence)
-- Old: "Squat Quad Dominant" -> New: "Anti-Extension"
-- Reason: Hip flexion/anti-extension exercise
UPDATE exercises SET pattern = 'Anti-Extension' WHERE id = '2bddd99b-4406-4669-acb1-9667f3cc8116';

-- Rear Delt Fly – Chest Supported Dumbbell (medium confidence)
-- Old: "Isolation" -> New: "Shoulder External Rotation"
-- Reason: Rear delt isolation
UPDATE exercises SET pattern = 'Shoulder External Rotation' WHERE id = 'fa46bd1d-5fe8-451c-a725-4eeb74e8ec8a';

-- Rear Delt Fly – Dual Cable (medium confidence)
-- Old: "Isolation" -> New: "Shoulder External Rotation"
-- Reason: Rear delt isolation
UPDATE exercises SET pattern = 'Shoulder External Rotation' WHERE id = '6f1cb997-3ff2-45c2-a313-37990a472704';

-- Rear Delt Fly – Machine (Rear Delt) (medium confidence)
-- Old: "Please provide more information about the exercise "Machine rear fly (rd)" for a more accurate categorization." -> New: "Horizontal Pull"
-- Reason: Rear delt fly - horizontal abduction
UPDATE exercises SET pattern = 'Horizontal Pull' WHERE id = '40e6c5c0-81e4-4aa3-9e58-38489c583285';

-- Rear Delt Fly – Machine (Upper Back) (medium confidence)
-- Old: "Isolation" -> New: "Shoulder External Rotation"
-- Reason: Rear delt isolation
UPDATE exercises SET pattern = 'Shoulder External Rotation' WHERE id = '9f5e3ff5-01b9-4ff4-98f2-f70e1c45521b';

-- Rear Delt Fly – Seated Dumbbell (medium confidence)
-- Old: "Isolation" -> New: "Horizontal Pull"
-- Reason: Rear delt fly - horizontal abduction
UPDATE exercises SET pattern = 'Horizontal Pull' WHERE id = 'be235269-1c1c-4b08-8b35-beb7356e68f1';

-- Rear Delt Fly – Single Arm Cable (medium confidence)
-- Old: "Isolation" -> New: "Shoulder External Rotation"
-- Reason: Rear delt isolation
UPDATE exercises SET pattern = 'Shoulder External Rotation' WHERE id = '52757fcf-113e-4c6c-8167-3df42b405a69';

-- Reverse Fly – Dual Cable (medium confidence)
-- Old: "Isolation" -> New: "Horizontal Pull"
-- Reason: Rear delt fly - horizontal abduction
UPDATE exercises SET pattern = 'Horizontal Pull' WHERE id = '9ca4b5ab-80a4-4451-84e0-2e2b3a9ed921';

-- Sit-Up – Frog (medium confidence)
-- Old: "None of the above" -> New: "Anti-Extension"
-- Reason: Flexion-based core exercise
UPDATE exercises SET pattern = 'Anti-Extension' WHERE id = '1a449a20-3ec8-405b-a043-d0c2b62441e6';

-- Sit-Up – Half (medium confidence)
-- Old: "Isolation" -> New: "Anti-Extension"
-- Reason: Flexion-based core exercise
UPDATE exercises SET pattern = 'Anti-Extension' WHERE id = 'aeb61fba-0fef-40de-98b2-ed1accc6c6e8';

-- Exercises needing manual review (flagged with "?" suffix)
-- Ab Rollout – Kneeling - Could not auto-categorize
-- Old: "Isolation" -> New: "Isolation?" (flagged for review)
-- Reason: Uncertain - abdominals, isolation
UPDATE exercises SET pattern = 'Isolation?' WHERE id = '81e4fed8-9545-4cc8-86fc-90bba059d6c2';

-- Core Hold – Hollow Body - Could not auto-categorize
-- Old: "Isolation" -> New: "Isolation?" (flagged for review)
-- Reason: Uncertain - abdominals, isolation
UPDATE exercises SET pattern = 'Isolation?' WHERE id = '32f4b5be-82d6-4aaf-9738-c0fe46193f65';

-- Grip Hold – Plate Pinch - Could not auto-categorize
-- Old: "Vertical Pull" -> New: "Vertical Pull?" (flagged for review)
-- Reason: Uncertain - grip, isolation
UPDATE exercises SET pattern = 'Vertical Pull?' WHERE id = '39c4d942-20b3-48c6-9001-8b5591e3cb40';

-- Hip Extension – Multi-Hip Kickback - Could not auto-categorize
-- Old: "Isolation" -> New: "Isolation?" (flagged for review)
-- Reason: Uncertain - glutes, isolation
UPDATE exercises SET pattern = 'Isolation?' WHERE id = '4e345365-b6c3-4db1-9f93-07a68ad80eac';

-- Knee Raise – Captain’s Chair - Could not auto-categorize
-- Old: "Isolation" -> New: "Isolation?" (flagged for review)
-- Reason: Uncertain - abdominals, isolation
UPDATE exercises SET pattern = 'Isolation?' WHERE id = '1a518f27-9b29-4b18-b7f4-215672331883';

-- Lat Prayer – Single Arm Cable - Could not auto-categorize
-- Old: "Vertical Pull" -> New: "Vertical Pull?" (flagged for review)
-- Reason: Uncertain - lats, compound
UPDATE exercises SET pattern = 'Vertical Pull?' WHERE id = 'f471c4cf-8c74-472b-bfe1-d864c5b60186';

-- Press – Jammer (Plate Loaded) - Could not auto-categorize
-- Old: "Horizontal Push" -> New: "Horizontal Push?" (flagged for review)
-- Reason: Uncertain - shoulders, compound
UPDATE exercises SET pattern = 'Horizontal Push?' WHERE id = '342d5af9-ed19-432b-adca-7d7c35c8e286';

-- Push Press – Barbell - Could not auto-categorize
-- Old: "Vertical Push" -> New: "Vertical Push?" (flagged for review)
-- Reason: Uncertain - shoulders, compound
UPDATE exercises SET pattern = 'Vertical Push?' WHERE id = 'e312fb91-a0b8-4fcd-bc0b-79e283fcf360';

-- Russian Twist – 45 Degree - Could not auto-categorize
-- Old: "Accessory" -> New: "Accessory?" (flagged for review)
-- Reason: Uncertain - abdominals, compound
UPDATE exercises SET pattern = 'Accessory?' WHERE id = '75d07dfe-a6d8-46d5-9b54-aaa0916a9ef4';

-- Shoulder Rotation – Cable External - Could not auto-categorize
-- Old: "Vertical Pull" -> New: "Vertical Pull?" (flagged for review)
-- Reason: Uncertain - shoulders, isolation
UPDATE exercises SET pattern = 'Vertical Pull?' WHERE id = 'bac42059-07cd-4ffd-bd9b-aa6f079b709b';

-- Shoulder Rotation – Cable Internal - Could not auto-categorize
-- Old: "Hinge" -> New: "Hinge?" (flagged for review)
-- Reason: Uncertain - shoulders, isolation
UPDATE exercises SET pattern = 'Hinge?' WHERE id = 'c01b7a10-b1f3-483f-badb-b3e69dfc7123';

-- Shoulder Rotation – Seated Dumbbell External - Could not auto-categorize
-- Old: "Isolation" -> New: "Isolation?" (flagged for review)
-- Reason: Uncertain - shoulders, isolation
UPDATE exercises SET pattern = 'Isolation?' WHERE id = '2b41135d-8500-4a3f-8434-e16cc21cdd14';

-- Sled Pull - Could not auto-categorize
-- Old: "Accessory" -> New: "Accessory?" (flagged for review)
-- Reason: Uncertain - quads, compound
UPDATE exercises SET pattern = 'Accessory?' WHERE id = '59c4da9a-fb66-40a8-9503-cd80349f02de';

-- Sled Push - Could not auto-categorize
-- Old: "Accessory" -> New: "Accessory?" (flagged for review)
-- Reason: Uncertain - quads, compound
UPDATE exercises SET pattern = 'Accessory?' WHERE id = '798e3d33-d7b1-4697-a7b9-20312c7939d8';

-- Y-Raise – Chest Supported Dumbbell - Could not auto-categorize
-- Old: "Isolation" -> New: "Isolation?" (flagged for review)
-- Reason: Uncertain - upper back, isolation
UPDATE exercises SET pattern = 'Isolation?' WHERE id = 'b9fd9572-6cc4-4f2e-8b96-01e7c095bcba';

-- Y-Raise – Chest Supported Stick - Could not auto-categorize
-- Old: "Isolation" -> New: "Isolation?" (flagged for review)
-- Reason: Uncertain - upper back, isolation
UPDATE exercises SET pattern = 'Isolation?' WHERE id = 'db4e0065-5816-463c-80cd-4529e4ab64c5';

COMMIT;
