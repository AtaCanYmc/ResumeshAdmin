import { Cloud, Users, Star } from 'lucide-react';

interface Stats {
  resumesCount: number;
  usersCount: number;
  githubStars: number;
}

interface Props {
  stats: Stats;
}

export default function StatsCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-xl">
          <Cloud size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Resumes</p>
          <h4 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stats.resumesCount}</h4>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
        <div className="p-3.5 bg-green-50 dark:bg-green-950/20 text-green-500 rounded-xl">
          <Users size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
          <h4 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stats.usersCount}</h4>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-xl">
          <Star size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">GitHub Stars</p>
          <h4 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stats.githubStars}</h4>
        </div>
      </div>
    </div>
  );
}
