import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import LoadingSpinner from '../LoadingSpinner';
import ProfilePicture from './ProfilePicture';
import { Trophy, Medal, Award, TrendingUp, Crown, Star, Target, Calendar } from 'lucide-react';

interface LeaderboardProps {
  profile: Doc<"userProfiles">;
  userRole?: 'student' | 'teacher' | 'admin';
}

const Leaderboard: React.FC<LeaderboardProps> = ({ profile, userRole = 'student' }) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'semester'>('month');
  const [category, setCategory] = useState<'attendance' | 'punctuality' | 'consistency'>('attendance');
  
  const leaderboardData = useQuery(api.attendance.getLeaderboard, {
    timeframe,
    category,
  });

  if (leaderboardData === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
    if (rank <= 10) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'attendance':
        return <Target className="w-5 h-5" />;
      case 'punctuality':
        return <Calendar className="w-5 h-5" />;
      case 'consistency':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const currentUserRank = leaderboardData.findIndex(item => item.userId === profile._id) + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Attendance Leaderboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              See how you rank among your peers
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            {getCategoryIcon()}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</span>
          </div>
          
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="attendance">Overall Attendance</option>
            <option value="punctuality">Punctuality</option>
            <option value="consistency">Consistency</option>
          </select>

          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="semester">This Semester</option>
          </select>
        </div>
      </div>

      {/* Your Rank Card */}
      {currentUserRank > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                {getRankIcon(currentUserRank)}
              </div>
              <div>
                <h3 className="text-xl font-bold">Your Rank</h3>
                <p className="text-blue-100">
                  #{currentUserRank} out of {leaderboardData.length} students
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {leaderboardData[currentUserRank - 1]?.score}%
              </p>
              <p className="text-blue-100 text-sm">
                {category === 'attendance' ? 'Attendance Rate' :
                 category === 'punctuality' ? 'On-time Rate' : 'Consistency Score'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {leaderboardData.length >= 3 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
            🏆 Top Performers 🏆
          </h3>
          
          <div className="flex items-end justify-center space-x-4">
            {/* 2nd Place */}
            <div className="text-center">
              <div className="w-20 h-16 bg-gradient-to-t from-gray-300 to-gray-500 rounded-t-lg flex items-end justify-center pb-2 mb-3">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <ProfilePicture
                storageId={leaderboardData[1]?.profilePicture}
                name={leaderboardData[1]?.name}
                size={48}
                className="mx-auto mb-2"
              />
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {leaderboardData[1]?.name}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                {leaderboardData[1]?.score}%
              </p>
            </div>

            {/* 1st Place */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-t from-yellow-400 to-yellow-600 rounded-t-lg flex items-end justify-center pb-2 mb-3">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <ProfilePicture
                storageId={leaderboardData[0]?.profilePicture}
                name={leaderboardData[0]?.name}
                size={56}
                className="mx-auto mb-2"
              />
              <p className="font-bold text-gray-900 dark:text-white">
                {leaderboardData[0]?.name}
              </p>
              <p className="text-yellow-600 dark:text-yellow-400 font-medium">
                {leaderboardData[0]?.score}%
              </p>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className="w-20 h-12 bg-gradient-to-t from-amber-400 to-amber-600 rounded-t-lg flex items-end justify-center pb-2 mb-3">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <ProfilePicture
                storageId={leaderboardData[2]?.profilePicture}
                name={leaderboardData[2]?.name}
                size={48}
                className="mx-auto mb-2"
              />
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {leaderboardData[2]?.name}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                {leaderboardData[2]?.score}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Complete Rankings
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {leaderboardData.map((student, index) => {
            const rank = index + 1;
            const isCurrentUser = student.userId === profile._id;
            
            return (
              <div
                key={student.userId}
                className={`p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(rank)}
                  </div>
                  
                  <ProfilePicture
                    storageId={student.profilePicture}
                    name={student.name}
                    size={40}
                  />
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className={`font-medium ${isCurrentUser ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                        {student.name}
                        {isCurrentUser && <span className="text-blue-600 dark:text-blue-400 text-sm ml-1">(You)</span>}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRankBadge(rank)}`}>
                        #{rank}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {student.department} • ID: {student.studentId}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {student.score}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {student.totalClasses} classes
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {leaderboardData.length === 0 && (
          <div className="p-8 text-center">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No leaderboard data available yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
