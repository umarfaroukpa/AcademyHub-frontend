import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Users, Clock, Video, MessageSquare, Plus, Calendar, CheckCircle, XCircle, AlertCircle, Search, Filter } from 'lucide-react';

interface StudyGroup {
  id: number;
  name: string;
  topic: string;
  members: number;
  meeting_time: string;
  platform: string;
  description?: string;
  max_members?: number;
}

interface AlertState {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface JoinStudyGroupResponse {
  message: string;
  group?: {
    id: number;
    name: string;
    next_meeting: string;
  };
}

export default function StudyGroups() {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);

  useEffect(() => {
    fetchStudyGroups();
  }, []);

  const fetchStudyGroups = async () => {
    try {
      const response = await api.get<StudyGroup[]>('/study-groups');
      setStudyGroups(response.data);
    } catch (error: any) {
      console.error('Failed to fetch study groups:', error);
      setAlert({
        type: 'error',
        message: 'Failed to load study groups'
      });
      setTimeout(() => setAlert(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const joinStudyGroup = async (groupId?: number) => {
    setJoiningGroupId(groupId || 0);
    try {
      const response = await api.post<JoinStudyGroupResponse>('/study-groups/join-recommended');
      
      setAlert({
        type: 'success',
        message: response.data.message || 'Successfully joined study group!'
      });
      
      // Show group details if available
      if (response.data.group) {
        const group = response.data.group;
        setTimeout(() => {
          setAlert({
            type: 'info',
            message: `📚 ${group.name} - Next meeting: ${group.next_meeting}`
          });
        }, 2000);
      }
      
      setTimeout(() => setAlert(null), 6000);
    } catch (error: any) {
      console.error('Failed to join study group:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.error || 'Failed to join study group'
      });
      setTimeout(() => setAlert(null), 4000);
    } finally {
      setJoiningGroupId(null);
    }
  };

  const filteredGroups = studyGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'discord':
        return <MessageSquare className="w-4 h-4" />;
      case 'zoom':
      case 'meet':
        return <Video className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'discord':
        return 'bg-indigo-100 text-indigo-700';
      case 'zoom':
        return 'bg-blue-100 text-blue-700';
      case 'meet':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Message */}
      {alert && (
        <div className={`border rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-300 ${
          alert.type === 'success' ? 'bg-green-50 border-green-200' :
          alert.type === 'error' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
          {alert.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
          {alert.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />}
          <p className={`font-medium flex-1 ${
            alert.type === 'success' ? 'text-green-700' :
            alert.type === 'error' ? 'text-red-700' :
            'text-blue-700'
          }`}>{alert.message}</p>
          <button 
            onClick={() => setAlert(null)}
            className="ml-auto hover:opacity-70 transition-opacity"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Study Groups</h1>
              <p className="text-gray-600">Connect with peers and learn together</p>
            </div>
          </div>
          <button
            onClick={() => joinStudyGroup()}
            disabled={joiningGroupId !== null}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {joiningGroupId === 0 ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Joining...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Quick Join
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search study groups by name or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading study groups...</p>
          </div>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No study groups found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'Try adjusting your search criteria' : 'Be the first to create a study group!'}
          </p>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold">
            <Plus className="w-5 h-5" />
            Create Study Group
          </button>
        </div>
      ) : (
        <>
          {/* Study Groups Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map(group => (
              <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all">
                {/* Group Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Users className="w-10 h-10 text-white/90" />
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getPlatformColor(group.platform)}`}>
                      {getPlatformIcon(group.platform)}
                      {group.platform}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{group.name}</h3>
                  <p className="text-purple-100 text-sm">{group.topic}</p>
                </div>

                {/* Group Details */}
                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">{group.members} members</span>
                      {group.max_members && (
                        <span className="text-gray-400">/ {group.max_members}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span>{group.meeting_time}</span>
                    </div>
                    {group.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
                    )}
                  </div>

                  <button
                    onClick={() => joinStudyGroup(group.id)}
                    disabled={joiningGroupId === group.id}
                    className={`w-full py-3 rounded-xl transition-colors font-semibold flex items-center justify-center gap-2 ${
                      joiningGroupId === group.id
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {joiningGroupId === group.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Joining...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Join Group
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Groups Overview</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600">{studyGroups.length}</div>
                <div className="text-sm text-gray-600">Active Groups</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600">
                  {studyGroups.reduce((sum, group) => sum + group.members, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Members</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600">
                  {Math.round(studyGroups.reduce((sum, group) => sum + group.members, 0) / studyGroups.length) || 0}
                </div>
                <div className="text-sm text-gray-600">Avg. Members/Group</div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-sm border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Study Group Tips
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Stay Consistent</h4>
                <p className="text-sm text-gray-600">Attend meetings regularly to get the most benefit from group study sessions.</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Participate Actively</h4>
                <p className="text-sm text-gray-600">Engage in discussions and share your knowledge with other members.</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Set Goals</h4>
                <p className="text-sm text-gray-600">Work with your group to set clear learning objectives for each session.</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Be Respectful</h4>
                <p className="text-sm text-gray-600">Create a supportive environment where everyone feels comfortable learning.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}