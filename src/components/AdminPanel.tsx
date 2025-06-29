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
  Tag,
  Image,
  FileText,
  User,
  Building
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
  const [activeTab, setActiveTab] = useState<'overview' | 'series'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<SeriesData | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<EpisodeData | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isEditSeriesModalOpen, setIsEditSeriesModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<SeriesData | null>(null);
  const [isAddEpisodeModalOpen, setIsAddEpisodeModalOpen] = useState(false);

  // Data states
  const [seriesData, setSeriesData] = useState<SeriesData[]>([]);
  const [episodesData, setEpisodesData] = useState<EpisodeData[]>([]);
  const [videosData, setVideosData] = useState<VideoData[]>([]);

  // Form states for series
  const [seriesForm, setSeriesForm] = useState({
    title: '',
    titleVietnamese: '',
    description: '',
    year: new Date().getFullYear(),
    rating: 0,
    genre: [] as string[],
    director: '',
    studio: '',
    thumbnail: '',
    banner: '',
    trailer: '',
    featured: false,
    new: false,
    popular: false,
    totalDuration: '',
    status: 'ongoing' as 'ongoing' | 'completed' | 'upcoming',
    airDay: '',
    airTime: ''
  });

  // Episode form states
  const [episodeForm, setEpisodeForm] = useState({
    number: 1,
    title: '',
    titleVietnamese: '',
    description: '',
    duration: '',
    thumbnail: '',
    releaseDate: new Date().toISOString().split('T')[0],
    rating: 0
  });

  const genreOptions = [
    'Hành Động', 'Phiêu Lưu', 'Tu Tiên', 'Drama', 'Romance', 'Comedy', 
    'Siêu Nhiên', 'Mecha', 'Slice of Life', 'Thriller', 'Horror', 'Mystery'
  ];

  const weekDays = [
    { value: '', label: 'Không xác định' },
    { value: 'monday', label: 'Thứ Hai' },
    { value: 'tuesday', label: 'Thứ Ba' },
    { value: 'wednesday', label: 'Thứ Tư' },
    { value: 'thursday', label: 'Thứ Năm' },
    { value: 'friday', label: 'Thứ Sáu' },
    { value: 'saturday', label: 'Thứ Bảy' },
    { value: 'sunday', label: 'Chủ Nhật' }
  ];

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
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSeriesData();
      loadVideosData();
    }
  }, [isOpen]);

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
          // Reload episodes to update video status
          if (selectedSeries) {
            loadEpisodesData(selectedSeries.id);
          }
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

  const handleSaveSeries = async () => {
    setIsLoading(true);
    try {
      const url = editingSeries 
        ? `http://localhost:3001/api/series/${editingSeries.id}`
        : 'http://localhost:3001/api/series';
      
      const method = editingSeries ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seriesForm),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (editingSeries) {
            // Update existing series
            setSeriesData(prev => prev.map(s => 
              s.id === editingSeries.id ? { ...s, ...seriesForm } : s
            ));
          } else {
            // Add new series
            loadSeriesData(); // Reload to get the new series with proper ID
          }
          
          setIsEditSeriesModalOpen(false);
          setEditingSeries(null);
          resetSeriesForm();
          alert(editingSeries ? 'Series đã được cập nhật!' : 'Series mới đã được tạo!');
        } else {
          alert(`Lỗi: ${data.error}`);
        }
      } else {
        alert('Không thể lưu series. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Save series error:', error);
      alert('Có lỗi xảy ra khi lưu series.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEpisode = async () => {
    if (!selectedSeries) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/series/${selectedSeries.id}/episodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(episodeForm),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          loadEpisodesData(selectedSeries.id);
          setIsAddEpisodeModalOpen(false);
          resetEpisodeForm();
          alert('Episode mới đã được tạo!');
        } else {
          alert(`Lỗi: ${data.error}`);
        }
      } else {
        alert('Không thể tạo episode. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Save episode error:', error);
      alert('Có lỗi xảy ra khi tạo episode.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSeriesForm = () => {
    setSeriesForm({
      title: '',
      titleVietnamese: '',
      description: '',
      year: new Date().getFullYear(),
      rating: 0,
      genre: [],
      director: '',
      studio: '',
      thumbnail: '',
      banner: '',
      trailer: '',
      featured: false,
      new: false,
      popular: false,
      totalDuration: '',
      status: 'ongoing',
      airDay: '',
      airTime: ''
    });
  };

  const resetEpisodeForm = () => {
    setEpisodeForm({
      number: episodesData.length + 1,
      title: '',
      titleVietnamese: '',
      description: '',
      duration: '',
      thumbnail: '',
      releaseDate: new Date().toISOString().split('T')[0],
      rating: 0
    });
  };

  const openEditSeries = (series: SeriesData | null) => {
    if (series) {
      setEditingSeries(series);
      setSeriesForm({
        title: series.title,
        titleVietnamese: series.titleVietnamese,
        description: series.description,
        year: series.year,
        rating: series.rating,
        genre: series.genre,
        director: series.director,
        studio: series.studio,
        thumbnail: series.thumbnail,
        banner: series.banner,
        trailer: series.trailer,
        featured: series.featured,
        new: series.new,
        popular: series.popular,
        totalDuration: series.totalDuration,
        status: series.status,
        airDay: series.airDay,
        airTime: series.airTime
      });
    } else {
      setEditingSeries(null);
      resetSeriesForm();
    }
    setIsEditSeriesModalOpen(true);
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
          onClick={() => openEditSeries(null)}
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
                      onClick={() => openEditSeries(seriesItem)}
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
                        onClick={() => {
                          resetEpisodeForm();
                          setIsAddEpisodeModalOpen(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Thêm Tập</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {episodesData.map((episode) => {
                        const episodeVideos = videosData.filter(v => 
                          v.series_id === seriesItem.id && v.episode_number === episode.number
                        );
                        const hasVideo = episodeVideos.length > 0;
                        const videoStatus = hasVideo ? episodeVideos[0].status : null;
                        
                        return (
                          <div key={episode.id} className="bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-white font-medium">Tập {episode.number}</h5>
                              <div className="flex space-x-1">
                                {!hasVideo && (
                                  <button
                                    onClick={() => handleVideoUpload(seriesItem.id, episode.number)}
                                    className="bg-green-600 hover:bg-green-700 text-white p-1 rounded transition-colors"
                                    title="Upload Video"
                                  >
                                    <Upload className="h-3 w-3" />
                                  </button>
                                )}
                                {hasVideo && (
                                  <button
                                    onClick={() => handleDeleteVideo(episodeVideos[0].id)}
                                    className={`text-white p-1 rounded transition-colors ${
                                      deleteConfirm === episodeVideos[0].id 
                                        ? 'bg-red-700 hover:bg-red-800' 
                                        : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                    title={deleteConfirm === episodeVideos[0].id ? 'Click lại để xác nhận xóa' : 'Xóa video'}
                                  >
                                    {deleteConfirm === episodeVideos[0].id ? (
                                      <AlertTriangle className="h-3 w-3" />
                                    ) : (
                                      <Trash2 className="h-3 w-3" />
                                    )}
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
                                  hasVideo ? 
                                    (videoStatus === 'completed' ? 'bg-green-400' : 
                                     videoStatus === 'processing' ? 'bg-yellow-400' : 'bg-red-400') 
                                    : 'bg-gray-400'
                                }`} />
                                <span>
                                  {hasVideo ? 
                                    (videoStatus === 'completed' ? 'Hoàn thành' : 
                                     videoStatus === 'processing' ? 'Đang xử lý' : 'Lỗi') 
                                    : 'Chưa có video'}
                                </span>
                              </div>
                            </div>
                            {hasVideo && videoStatus === 'processing' && episodeVideos[0].processing_progress > 0 && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-600 rounded-full h-1">
                                  <div 
                                    className="bg-yellow-400 h-1 rounded-full transition-all"
                                    style={{ width: `${episodeVideos[0].processing_progress}%` }}
                                  />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{episodeVideos[0].processing_progress}%</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))
        )}
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
                  <span>Series & Videos ({seriesData.length})</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-8">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'series' && renderSeries()}
            </div>
          </div>
        </div>
      </div>

      {/* Series Edit/Create Modal */}
      {isEditSeriesModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {editingSeries ? 'Chỉnh Sửa Series' : 'Thêm Series Mới'}
                </h2>
                <button
                  onClick={() => setIsEditSeriesModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tên Series (Tiếng Anh) *
                  </label>
                  <input
                    type="text"
                    value={seriesForm.title}
                    onChange={(e) => setSeriesForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="A Record of Mortal's Journey to Immortality"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tên Series (Tiếng Việt) *
                  </label>
                  <input
                    type="text"
                    value={seriesForm.titleVietnamese}
                    onChange={(e) => setSeriesForm(prev => ({ ...prev, titleVietnamese: e.target.value }))}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Phàm Nhân Tu Tiên"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={seriesForm.description}
                  onChange={(e) => setSeriesForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả nội dung series..."
                />
              </div>

              {/* Year, Rating, Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Năm phát hành *
                  </label>
                  <input
                    type="number"
                    value={seriesForm.year}
                    onChange={(e) => setSeriesForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1900"
                    max="2030"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Đánh giá (0-10)
                  </label>
                  <input
                    type="number"
                    value={seriesForm.rating}
                    onChange={(e) => setSeriesForm(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="10"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={seriesForm.status}
                    onChange={(e) => setSeriesForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ongoing">Đang phát sóng</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="upcoming">Sắp ra mắt</option>
                  </select>
                </div>
              </div>

              {/* Director, Studio, Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Đạo diễn
                  </label>
                  <input
                    type="text"
                    value={seriesForm.director}
                    onChange={(e) => setSeriesForm(prev => ({ ...prev, director: e.target.value }))}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tên đạo diễn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Studio
                  </label>
                  <input
                    type="text"
                    value={seriesForm.studio}
                    onChange={(e) => setSeriesForm(prev => ({ ...prev, studio: e.target.value }))}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tên studio"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tổng thời lượng
                  </label>
                  <input
                    type="text"
                    value={seriesForm.totalDuration}
                    onChange={(e) => setSeriesForm(prev => ({ ...prev, totalDuration: e.target.value }))}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="24 phút/tập"
                  />
                </div>
              </div>

              {/* Genre Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Thể loại
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {genreOptions.map((genre) => (
                    <label key={genre} className="flex items-center space-x-2 text-gray-300">
                      <input
                        type="checkbox"
                        checked={seriesForm.genre.includes(genre)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSeriesForm(prev => ({ ...prev, genre: [...prev.genre, genre] }));
                          } else {
                            setSeriesForm(prev => ({ ...prev, genre: prev.genre.filter(g => g !== genre) }));
                          }
                        }}
                        className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={seriesForm.thumbnail}
                    onChange={(e) => setSeriesForm(prev => ({ ...prev, thumbnail: e.target.value }))}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Banner URL
                  </label>
                  <input
                    type="url"
                    value={seriesForm.banner}
                    onChange={(e) => setSeriesForm(prev => ({ ...prev, banner: e.target.value }))}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>
              </div>

              {/* Air Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ngày phát sóng
                  </label>
                  <select
                    value={seriesForm.airDay}
                    onChange={(e) => setSeriesForm(prev => ({ ...prev, airDay: e.target.value }))}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {weekDays.map((day) => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Giờ phát sóng
                  </label>
                  <input
                    type="time"
                    value={seriesForm.airTime}
                    onChange={(e) => setSeriesForm(prev => ({ ...prev, airTime: e.target.value }))}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Flags */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <label className="flex items-center space-x-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={seriesForm.featured}
                    onChange={(e) => setSeriesForm(prev => ({ ...prev, featured: e.target.checked }))}
                    className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Nổi bật</span>
                </label>

                <label className="flex items-center space-x-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={seriesForm.new}
                    onChange={(e) => setSeriesForm(prev => ({ ...prev, new: e.target.checked }))}
                    className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Mới</span>
                </label>

                <label className="flex items-center space-x-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={seriesForm.popular}
                    onChange={(e) => setSeriesForm(prev => ({ ...prev, popular: e.target.checked }))}
                    className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Phổ biến</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                <button
                  onClick={() => setIsEditSeriesModalOpen(false)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveSeries}
                  disabled={isLoading || !seriesForm.title || !seriesForm.titleVietnamese}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4" />
                  <span>{editingSeries ? 'Cập nhật' : 'Tạo mới'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Episode Add Modal */}
      {isAddEpisodeModalOpen && selectedSeries && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Thêm Episode Mới - {selectedSeries.title}
                </h2>
                <button
                  onClick={() => setIsAddEpisodeModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Số tập *
                  </label>
                  <input
                    type="number"
                    value={episodeForm.number}
                    onChange={(e) => setEpisodeForm(prev => ({ ...prev, number: parseInt(e.target.value) }))}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Thời lượng
                  </label>
                  <input
                    type="text"
                    value={episodeForm.duration}
                    onChange={(e) => setEpisodeForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="24:00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tên tập (Tiếng Anh) *
                  </label>
                  <input
                    type="text"
                    value={episodeForm.title}
                    onChange={(e) => setEpisodeForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Episode title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tên tập (Tiếng Việt) *
                  </label>
                  <input
                    type="text"
                    value={episodeForm.titleVietnamese}
                    onChange={(e) => setEpisodeForm(prev => ({ ...prev, titleVietnamese: e.target.value }))}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tên tập tiếng Việt"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mô tả tập
                </label>
                <textarea
                  value={episodeForm.description}
                  onChange={(e) => setEpisodeForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả nội dung tập phim..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={episodeForm.thumbnail}
                    onChange={(e) => setEpisodeForm(prev => ({ ...prev, thumbnail: e.target.value }))}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/episode-thumbnail.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ngày phát hành
                  </label>
                  <input
                    type="date"
                    value={episodeForm.releaseDate}
                    onChange={(e) => setEpisodeForm(prev => ({ ...prev, releaseDate: e.target.value }))}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Đánh giá (0-10)
                </label>
                <input
                  type="number"
                  value={episodeForm.rating}
                  onChange={(e) => setEpisodeForm(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                <button
                  onClick={() => setIsAddEpisodeModalOpen(false)}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveEpisode}
                  disabled={isLoading || !episodeForm.title || !episodeForm.titleVietnamese}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4" />
                  <span>Tạo Episode</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            loadEpisodesData(selectedSeries.id); // Reload episodes to update video status
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