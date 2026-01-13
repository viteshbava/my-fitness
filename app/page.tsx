import Link from 'next/link';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            My Fitness Tracker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your personal training companion
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              Welcome!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This is your personal fitness training application. Here you can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 mb-6">
              <li>Browse and search exercises from your exercise library</li>
              <li>Plan and schedule workouts on a calendar</li>
              <li>Log your sets, reps, and weights during workouts</li>
              <li>Track your progress over time with charts and history</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/exercises" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg active:shadow active:scale-[0.98] transition-all cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                Exercise Library
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Browse all available exercises with search and filtering capabilities.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-95 transition-all text-white rounded-md text-sm font-medium">
                Browse Exercises
              </div>
            </Link>

            <Link href="/workouts" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg active:shadow active:scale-[0.98] transition-all cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                Workouts
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Plan and manage your workout sessions on a calendar view.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-95 transition-all text-white rounded-md text-sm font-medium">
                View Calendar
              </div>
            </Link>
          </div>

          <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              Setup Status
            </h3>
            <p className="text-green-800 dark:text-green-200">
              Sprint 3 Complete: Workout management with calendar view and exercise assignment ready!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
