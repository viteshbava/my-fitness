export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            My Fitness Tracker
          </h1>
          <p className="text-lg text-gray-600">
            Your personal training companion
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Welcome!
            </h2>
            <p className="text-gray-600 mb-4">
              This is your personal fitness training application. Here you can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
              <li>Browse and search exercises from your exercise library</li>
              <li>Plan and schedule workouts on a calendar</li>
              <li>Log your sets, reps, and weights during workouts</li>
              <li>Track your progress over time with charts and history</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Exercise Library
              </h3>
              <p className="text-gray-600 mb-4">
                Browse all available exercises with search and filtering capabilities.
              </p>
              <div className="text-sm text-gray-500">
                Coming in Sprint 2
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Workouts
              </h3>
              <p className="text-gray-600 mb-4">
                Plan and manage your workout sessions on a calendar view.
              </p>
              <div className="text-sm text-gray-500">
                Coming in Sprint 3
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Setup Status
            </h3>
            <p className="text-blue-800">
              Sprint 1 Complete: Foundation and database setup ready!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
