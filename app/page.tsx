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

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <Link href="/templates" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg active:shadow active:scale-[0.98] transition-all cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                Templates
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Create and manage workout templates for quick workout planning.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-95 transition-all text-white rounded-md text-sm font-medium">
                View Templates
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
        </div>
      </div>
    </div>
  );
};

export default Home;
