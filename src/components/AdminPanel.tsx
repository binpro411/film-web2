import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Play, 
  Eye, 
  Search, 
  Save,
  X,
  Calendar,
  Clock,
  Star,
  Users,
  Database,
  Settings,
  BarChart3,
  Video,
  AlertTriangle,
  CheckCircle,
  Loader2,
  FolderOpen,
  HardDrive,
  Film,
  Globe,
  Tag
} from 'lucide-react';
import VideoUploadModal from './VideoUploadModal';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SeriesData {
  id: string;
  title: string;
  titleVietnamese: string;
  description: string;
  year: number;
  rating: number;
  genre: string[];
  director: string;
  studio: string;
  thumbnail: string;
  banner: string;
  trailer: string;
  featured: boolean;
  new: boolean;
  popular: boolean;
  episodeCount: number;
  totalDuration: string;
  status: 'ongoing' | 'completed' | 'upcoming';
  airDay: string;
  airTime: string;
  videosCount: number;
  createdAt: string;
  updatedAt: string;
}

interface EpisodeData {
  id: string;
  seriesId: string;
  number: number;
  title: string;
  titleVietnamese: string;
  description: string;
  duration: string;
  thumbnail: string;
  releaseDate: string;
  rating: number;
  hasVideo: boolean;
  videoStatus: string;
  hlsUrl: string | null;
}

interface VideoData {
  id: string;
  title: string;
  series_id: string;
  episode_number: number;
  status: 'completed' | 'processing' | 'failed';
  duration: number;
  file_size: number;
  uploadedAt: string;
  hlsUrl: string | null;
  total_segments: number;
  processing_progress: number;
  original_filename: string;
  safe_filename: string;
  video_path: string;
  hls_manifest_path: string | null;
  seriesTitle: string;
  seriesTitleVietnamese: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'series' | 'videos'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<SeriesData | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<EpisodeData | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isEditSeriesModalOpen, setIsEditSeriesModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<SeriesData | null>(null);

  // Data states
  const [seriesData, setSeriesData] = useState<SeriesData[]>([]);
  const [episodesData, setEpisodesData] = useState<EpisodeData[]>([]);
  const [videosData, setVideosData] = useState<VideoData[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Load series data
  const loadSeriesData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/series');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSeriesData(data.series);
        }
      }
    } catch (error) {
      console.error('Failed to load series:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load episodes for selected series
  const loadEpisodesData = async (seriesId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/series/${seriesId}/episodes`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEpisodesData(data.episodes);
        }
      }
    } catch (error) {
      console.error('Failed to load episodes:', error);
    }
  };

  // Load videos data
  const loadVideosData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/videos/all');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setVideosData(data.videos);
        }
      }
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'series' || activeTab === 'overview') {
        loadSeriesData();
      }
      if (activeTab === 'videos' || activeTab === 'overview') {
        loadVideosData();
      }
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (selectedSeries) {
      loadEpisodesData(selectedSeries.id);
    }
  }, [selectedSeries]);

  if (!isOpen) return null;

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoUpload = (seriesId: string, episodeNumber: number) => {
    const targetSeries = seriesData.find(s => s.id === seriesId);
    if (targetSeries) {
      setSelectedSeries(targetSeries);
      const targetEpisode = episodesData.find(ep => ep.number === episodeNumber);
      if (targetEpisode) {
        setSelectedEpisode(targetEpisode);
        setIsUploadModalOpen(true);
      }
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (deleteConfirm !== videoId) {
      setDeleteConfirm(videoId);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/video/${videoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setVideosData(prev => prev.filter(v => v.id !== videoId));
          setDeleteConfirm(null);
          alert('Video đã được xóa thành công!');
        } else {
          alert(`Lỗi xóa video: ${data.error}`);
        }
      } else {
        alert('Không thể xóa video. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Delete video error:', error);
      alert('Có lỗi xảy ra khi xóa video.');
    } finally {
      setIsLoading(false);
    }
  };

  const getVideoStatus = (video: VideoData) => {
    switch (video.status) {
      case 'completed':
        return { text: 'Hoàn thành', color: 'bg-green-500/20 text-green-400', icon: CheckCircle };
      case 'processing':
        return { text: 'Đang xử lý', color: 'bg-yellow-500/20 text-yellow-400', icon: Loader2 };
      case 'failed':
        return { text: 'Lỗi', color: 'bg-red-500/20 text-red-400', icon: AlertTriangle };
      default:
        return { text: 'Không xác định', color: 'bg-gray-500/20 text-gray-400', icon: AlertTriangle };
    }
  };

  const filteredVideos = videosData.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.series_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.seriesTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || video.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tổng Series</p>
              <p className="text-3xl font-bold">{seriesData.length}</p>
            </div>
            <Film className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Tổng Episodes</p>
              <p className="text-3xl font-bold">{seriesData.reduce((total, series) => total + series.episodeCount, 0)}</p>
            </div>
            <Video className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Videos Hoàn thành</p>
              <p className="text-3xl font-bold">{videosData.filter(v => v.status === 'completed').length}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Đang xử lý</p>
              <p className="text-3xl font-bold">{videosData.filter(v => v.status === 'processing').length}</p>
            </div>
            <Loader2 className="h-12 w-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Storage Info */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center space-x-2">
          <HardDrive className="h-5 w-5" />
          <span>Thông Tin Lưu Trữ</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Tổng dung lượng</p>
            <p className="text-white text-xl font-bold">
              {formatFileSize(videosData.reduce((total, video) => total + video.file_size, 0))}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Tổng segments</p>
            <p className="text-white text-xl font-bold">
              {videosData.reduce((total, video) => total + video.total_segments, 0)}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Thời lượng video</p>
            <p className="text-white text-xl font-bold">
              {formatDuration(videosData.reduce((total, video) => total + video.duration, 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Hoạt Động Gần Đây</span>
        </h3>
        <div className="space-y-3">
          {videosData.slice(0, 5).map((video) => {
            const status = getVideoStatus(video);
            const StatusIcon = status.icon;
            
            return (
              <div key={video.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <StatusIcon className={`w-5 h-5 ${video.status === 'processing' ? 'animate-spin' : ''} ${
                    video.status === 'completed' ? 'text-green-400' : 
                    video.status === 'processing' ? 'text-yellow-400' : 'text-red-400'
                  }`} />
                  <div>
                    <p className="text-white font-medium">{video.title}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(video.uploadedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                  {status.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSeries = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Quản Lý Series</h2>
        <button
          onClick={() => {
            setEditingSeries(null);
            setIsEditSeriesModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm Series Mới</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm series..."
          className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Series List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Đang tải dữ liệu...</p>
          </div>
        ) : (
          seriesData
            .filter(series => 
              series.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              series.titleVietnamese.includes(searchQuery)
            )
            .map((seriesItem) => (
              <div key={seriesItem.id} className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex space-x-4">
                    <img
                      src={seriesItem.thumbnail || 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={seriesItem.title}
                      className="w-24 h-36 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-white font-semibold text-xl mb-1">{seriesItem.title}</h3>
                      <p className="text-blue-300 mb-2">{seriesItem.titleVietnamese}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                        <span>{seriesItem.year}</span>
                        <span>{seriesItem.episodeCount} tập</span>
                        <span>{seriesItem.videosCount} videos</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span>{seriesItem.rating}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {seriesItem.genre.slice(0, 3).map((genre, index) => (
                          <span
                            key={index}
                            className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2">{seriesItem.description}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedSeries(selectedSeries?.id === seriesItem.id ? null : seriesItem)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>{selectedSeries?.id === seriesItem.id ? 'Ẩn' : 'Xem'} Tập</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingSeries(seriesItem);
                        setIsEditSeriesModalOpen(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Episodes Preview */}
                {selectedSeries?.id === seriesItem.id && (
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">Danh Sách Tập ({episodesData.length})</h4>
                      <button
                        onClick={() => {/* Add episode logic */}}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Thêm Tập</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {episodesData.map((episode) => (
                        <div key={episode.id} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-white font-medium">Tập {episode.number}</h5>
                            <div className="flex space-x-1">
                              {!episode.hasVideo && (
                                <button
                                  onClick={() => handleVideoUpload(seriesItem.id, episode.number)}
                                  className="bg-green-600 hover:bg-green-700 text-white p-1 rounded transition-colors"
                                  title="Upload Video"
                                >
                                  <Upload className="h-3 w-3" />
                                </button>
                              )}
                              <button
                                onClick={() => {/* Edit episode logic */}}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded transition-colors"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm mb-1">{episode.title}</p>
                          <p className="text-blue-300 text-xs mb-2">{episode.titleVietnamese}</p>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{episode.duration}</span>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                episode.hasVideo ? 'bg-green-400' : 'bg-red-400'
                              }`} />
                              <span>{episode.hasVideo ? 'Có video' : 'Chưa có video'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );

  const renderVideos = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Quản Lý Videos</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm video..."
              className="bg-gray-800 text-white border border-gray-600 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="completed">Hoàn thành</option>
            <option value="processing">Đang xử lý</option>
            <option value="failed">Lỗi</option>
          </select>
          <button
            onClick={loadVideosData}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            <span>Tải lại</span>
          </button>
        </div>
      </div>

      {/* Videos Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left text-white font-medium p-4">Video</th>
                <th className="text-left text-white font-medium p-4">Series</th>
                <th className="text-left text-white font-medium p-4">Tập</th>
                <th className="text-left text-white font-medium p-4">Trạng thái</th>
                <th className="text-left text-white font-medium p-4">Thời lượng</th>
                <th className="text-left text-white font-medium p-4">Kích thước</th>
                <th className="text-left text-white font-medium p-4">Segments</th>
                <th className="text-left text-white font-medium p-4">Upload</th>
                <th className="text-left text-white font-medium p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                      <span className="text-gray-400">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredVideos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center">
                    <div className="text-gray-400">
                      {videosData.length === 0 ? 'Chưa có video nào được tải lên' : 'Không tìm thấy video phù hợp'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVideos.map((video) => {
                  const status = getVideoStatus(video);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={video.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{video.title}</p>
                          <p className="text-gray-400 text-sm">ID: {video.id}</p>
                          <p className="text-gray-500 text-xs">{video.original_filename}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-300">{video.seriesTitle || 'N/A'}</p>
                        <p className="text-gray-500 text-sm">{video.seriesTitleVietnamese || ''}</p>
                      </td>
                      <td className="p-4">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                          Tập {video.episode_number}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`w-4 h-4 ${video.status === 'processing' ? 'animate-spin' : ''}`} />
                          <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                        {video.status === 'processing' && video.processing_progress > 0 && (
                          <div className="mt-1">
                            <div className="w-full bg-gray-600 rounded-full h-1">
                              <div 
                                className="bg-yellow-400 h-1 rounded-full transition-all"
                                style={{ width: `${video.processing_progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{video.processing_progress}%</p>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="text-gray-300">
                          {video.duration > 0 ? formatDuration(video.duration) : 'N/A'}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-300">
                          {video.file_size > 0 ? formatFileSize(video.file_size) : 'N/A'}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <FolderOpen className="h-4 w-4 text-blue-400" />
                          <span className="text-gray-300">{video.total_segments}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-400 text-sm">
                          {new Date(video.uploadedAt).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(video.uploadedAt).toLocaleTimeString('vi-VN')}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          {video.status === 'completed' && video.hlsUrl && (
                            <button
                              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors"
                              title="Xem video"
                              onClick={() => window.open(`http://localhost:3001${video.hlsUrl}`, '_blank')}
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteVideo(video.id)}
                            className={`text-white p-2 rounded transition-colors ${
                              deleteConfirm === video.id 
                                ? 'bg-red-700 hover:bg-red-800' 
                                : 'bg-red-600 hover:bg-red-700'
                            }`}
                            title={deleteConfirm === video.id ? 'Click lại để xác nhận xóa' : 'Xóa video'}
                          >
                            {deleteConfirm === video.id ? (
                              <AlertTriangle className="h-4 w-4" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {deleteConfirm === video.id && (
                          <p className="text-red-400 text-xs mt-1">Click lại để xác nhận</p>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Storage Path Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="text-blue-400 font-medium mb-2 flex items-center space-x-2">
          <FolderOpen className="h-4 w-4" />
          <span>Cấu trúc thư mục lưu trữ:</span>
        </h4>
        <div className="text-blue-300 text-sm space-y-1 font-mono">
          <div>📁 /server/videos/</div>
          <div className="ml-4">📁 /{'{series-name}'}/</div>
          <div className="ml-8">📁 /tap-{'{episode-number}'}/</div>
          <div className="ml-12">🎬 video.mp4</div>
          <div className="ml-12">📄 playlist.m3u8</div>
          <div className="ml-12">📦 segment_001.ts, segment_002.ts, ...</div>
        </div>
        <p className="text-blue-200 text-xs mt-2">
          Khi xóa video, toàn bộ thư mục tập phim sẽ được xóa khỏi hệ thống file
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'overview' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Tổng Quan</span>
                </button>

                <button
                  onClick={() => setActiveTab('series')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'series' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Video className="h-5 w-5" />
                  <span>Series ({seriesData.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('videos')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'videos' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Database className="h-5 w-5" />
                  <span>Videos ({videosData.length})</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-8">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'series' && renderSeries()}
              {activeTab === 'videos' && renderVideos()}
            </div>
          </div>
        </div>
      </div>

      {/* Video Upload Modal */}
      {selectedSeries && selectedEpisode && (
        <VideoUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedSeries(null);
            setSelectedEpisode(null);
          }}
          onVideoUploaded={(videoData) => {
            // Add to videos data
            const newVideo: VideoData = {
              id: videoData.id,
              title: videoData.title,
              series_id: selectedSeries.id,
              episode_number: selectedEpisode.number,
              status: 'completed',
              duration: videoData.duration || 0,
              file_size: videoData.fileSize || 0,
              uploadedAt: videoData.uploadedAt || new Date().toISOString(),
              hlsUrl: videoData.hlsUrl,
              total_segments: videoData.totalSegments || 0,
              processing_progress: 100,
              original_filename: videoData.originalFilename || '',
              safe_filename: videoData.safeFilename || '',
              video_path: videoData.videoPath || '',
              hls_manifest_path: videoData.hlsManifestPath || null,
              seriesTitle: selectedSeries.title,
              seriesTitleVietnamese: selectedSeries.titleVietnamese
            };
            
            setVideosData(prev => [...prev, newVideo]);
            setIsUploadModalOpen(false);
            setSelectedSeries(null);
            setSelectedEpisode(null);
          }}
          episodeNumber={selectedEpisode.number}
          seriesTitle={selectedSeries.title}
          seriesId={selectedSeries.id}
        />
      )}
    </>
  );
};

export default AdminPanel;