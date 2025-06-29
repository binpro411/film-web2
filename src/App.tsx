import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import MovieGrid from './components/MovieGrid';
import WeeklySchedule from './components/WeeklySchedule';
import MovieModal from './components/MovieModal';
import VideoPlayer from './components/VideoPlayer';
import SeriesDetailPage from './components/SeriesDetailPage';
import EpisodePlayer from './components/EpisodePlayer';
import AuthModal from './components/AuthModal';
import VipModal from './components/VipModal';
import PaymentModal from './components/PaymentModal';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import { movies } from './data/movies';
import { series } from './data/series';
import { Movie, Series, Episode, VipPlan } from './types';

function AppContent() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isSeriesDetailOpen, setIsSeriesDetailOpen] = useState(false);
  const [isEpisodePlayerOpen, setIsEpisodePlayerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [selectedVipPlan, setSelectedVipPlan] = useState<VipPlan | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Database series state
  const [dbSeries, setDbSeries] = useState<any[]>([]);
  const [isLoadingSeries, setIsLoadingSeries] = useState(true);

  // Load series from database
  useEffect(() => {
    loadSeriesFromDB();
  }, []);

  const loadSeriesFromDB = async () => {
    try {
      setIsLoadingSeries(true);
      const response = await fetch('http://localhost:3001/api/series');
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Loaded series from database:', data.series);
        setDbSeries(data.series);
      } else {
        console.error('❌ Failed to load series:', data.error);
      }
    } catch (error) {
      console.error('❌ Error loading series:', error);
    } finally {
      setIsLoadingSeries(false);
    }
  };

  // Convert database series to Movie format for compatibility
  const convertDbSeriesToMovies = (dbSeriesData: any[]): Movie[] => {
    return dbSeriesData.map(series => ({
      id: series.id,
      title: series.title,
      titleVietnamese: series.titleVietnamese || series.title,
      description: series.description || '',
      year: series.year,
      duration: series.totalDuration || '24 phút/tập',
      rating: series.rating,
      genre: series.genre || [],
      director: series.director || '',
      studio: series.studio || '',
      thumbnail: series.thumbnail || 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400',
      banner: series.banner || 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1200',
      trailer: series.trailer || '',
      featured: series.featured || false,
      new: series.new || false,
      popular: series.popular || false,
      type: 'series' as const,
      episodeCount: series.episodeCount || 0,
      airDay: series.airDay as any,
      airTime: series.airTime
    }));
  };

  // Convert database series to Series format for detailed view
  const convertDbSeriesToSeriesFormat = async (dbSeriesData: any): Promise<Series> => {
    // Load episodes for this series
    const episodesResponse = await fetch(`http://localhost:3001/api/series/${dbSeriesData.id}/episodes`);
    const episodesData = await episodesResponse.json();
    
    const episodes: Episode[] = episodesData.success ? episodesData.episodes.map((ep: any) => ({
      id: ep.id,
      number: ep.number,
      title: ep.title,
      titleVietnamese: ep.titleVietnamese || ep.title,
      description: ep.description || '',
      duration: ep.duration || '24:00',
      thumbnail: ep.thumbnail || dbSeriesData.thumbnail || 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400',
      releaseDate: ep.releaseDate || new Date().toISOString(),
      rating: ep.rating || 0,
      watched: ep.watched || false,
      watchProgress: ep.watchProgress || 0,
      lastWatchedAt: ep.lastWatchedAt,
      guestCast: ep.guestCast || [],
      directorNotes: ep.directorNotes,
      hasBehindScenes: ep.hasBehindScenes || false,
      hasCommentary: ep.hasCommentary || false,
      sourceUrl: ep.sourceUrl,
      videoUrl: ep.hlsUrl,
      hlsUrl: ep.hlsUrl
    })) : [];

    return {
      id: dbSeriesData.id,
      title: dbSeriesData.title,
      titleVietnamese: dbSeriesData.titleVietnamese || dbSeriesData.title,
      description: dbSeriesData.description || '',
      year: dbSeriesData.year,
      rating: dbSeriesData.rating,
      genre: dbSeriesData.genre || [],
      director: dbSeriesData.director || '',
      studio: dbSeriesData.studio || '',
      thumbnail: dbSeriesData.thumbnail || 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400',
      banner: dbSeriesData.banner || 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1200',
      trailer: dbSeriesData.trailer || '',
      featured: dbSeriesData.featured || false,
      new: dbSeriesData.new || false,
      popular: dbSeriesData.popular || false,
      episodeCount: episodes.length,
      episodes: episodes,
      totalDuration: dbSeriesData.totalDuration || '24 phút/tập',
      status: dbSeriesData.status || 'ongoing',
      comments: [], // Mock comments for now
      similarSeries: [], // Mock similar series for now
      topEpisodes: episodes.slice(0, 3).map(ep => ep.id) // Top 3 episodes
    };
  };

  // Use database series instead of static data
  const allMovies = convertDbSeriesToMovies(dbSeries);

  // Filter movies based on search query
  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return allMovies;
    
    const query = searchQuery.toLowerCase();
    return allMovies.filter(movie => 
      movie.title.toLowerCase().includes(query) ||
      movie.titleVietnamese.includes(query) ||
      movie.genre.some(g => g.toLowerCase().includes(query)) ||
      movie.director.toLowerCase().includes(query)
    );
  }, [searchQuery, allMovies]);

  // Categorize movies
  const featuredMovies = filteredMovies.filter(movie => movie.featured);
  const newMovies = filteredMovies.filter(movie => movie.new);
  const scheduledMovies = filteredMovies.filter(movie => movie.airDay); // Movies with air schedule

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handlePlayMovie = async (movie: Movie) => {
    if (movie.type === 'series') {
      // Find the corresponding series from database and convert to Series format
      const dbSeriesItem = dbSeries.find(s => s.id === movie.id);
      if (dbSeriesItem) {
        try {
          const seriesData = await convertDbSeriesToSeriesFormat(dbSeriesItem);
          if (seriesData.episodes.length > 0) {
            setSelectedSeries(seriesData);
            setSelectedEpisode(seriesData.episodes[0]);
            setIsEpisodePlayerOpen(true);
          } else {
            // No episodes available, show series detail instead
            setSelectedSeries(seriesData);
            setIsSeriesDetailOpen(true);
          }
        } catch (error) {
          console.error('Error loading series data:', error);
          // Fallback to series detail
          const seriesData = await convertDbSeriesToSeriesFormat(dbSeriesItem);
          setSelectedSeries(seriesData);
          setIsSeriesDetailOpen(true);
        }
      }
    } else {
      setSelectedMovie(movie);
      setIsPlayerOpen(true);
    }
    setIsModalOpen(false);
    setIsSeriesDetailOpen(false);
  };

  const handleShowDetails = async (movie: Movie) => {
    if (movie.type === 'series') {
      const dbSeriesItem = dbSeries.find(s => s.id === movie.id);
      if (dbSeriesItem) {
        try {
          const seriesData = await convertDbSeriesToSeriesFormat(dbSeriesItem);
          setSelectedSeries(seriesData);
          setIsSeriesDetailOpen(true);
        } catch (error) {
          console.error('Error loading series details:', error);
        }
      }
    } else {
      setSelectedMovie(movie);
      setIsModalOpen(true);
    }
  };

  const handlePlayEpisode = (seriesData: Series, episode: Episode) => {
    setSelectedSeries(seriesData);
    setSelectedEpisode(episode);
    setIsEpisodePlayerOpen(true);
    setIsSeriesDetailOpen(false);
  };

  const handleEpisodeChange = (episode: Episode) => {
    setSelectedEpisode(episode);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedMovie(null);
  };

  const handleCloseSeriesDetail = () => {
    setIsSeriesDetailOpen(false);
    setSelectedSeries(null);
  };

  const handleCloseEpisodePlayer = () => {
    setIsEpisodePlayerOpen(false);
    setSelectedSeries(null);
    setSelectedEpisode(null);
  };

  const handleOpenAuth = () => {
    setIsAuthModalOpen(true);
  };

  const handleOpenVip = () => {
    setIsVipModalOpen(true);
  };

  const handleOpenAdmin = () => {
    setIsAdminPanelOpen(true);
  };

  const handleSelectVipPlan = (plan: VipPlan) => {
    setSelectedVipPlan(plan);
    setIsVipModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handleClosePayment = () => {
    setIsPaymentModalOpen(false);
    setSelectedVipPlan(null);
  };

  const handleAdminPanelClose = () => {
    setIsAdminPanelOpen(false);
    // Reload series data when admin panel closes
    loadSeriesFromDB();
  };

  if (isLoadingSeries) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Đang tải dữ liệu từ database...</p>
          <p className="text-gray-400 text-sm mt-2">Kết nối với PostgreSQL...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header 
        onSearch={handleSearch} 
        onOpenAuth={handleOpenAuth} 
        onOpenVip={handleOpenVip}
        onOpenAdmin={handleOpenAdmin}
      />
      
      <main className="pt-16">
        {/* Hero Section - only show if no search query */}
        {!searchQuery && featuredMovies.length > 0 && (
          <Hero
            featuredMovies={featuredMovies}
            onPlayMovie={handlePlayMovie}
            onShowDetails={handleShowDetails}
          />
        )}

        {/* Content Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {searchQuery ? (
            <MovieGrid
              title={`Kết quả tìm kiếm: "${searchQuery}" (${filteredMovies.length} kết quả)`}
              movies={filteredMovies}
              onPlayMovie={handlePlayMovie}
              onShowDetails={handleShowDetails}
            />
          ) : (
            <>
              {newMovies.length > 0 && (
                <MovieGrid
                  title="Mới Nhất 🔥"
                  movies={newMovies}
                  onPlayMovie={handlePlayMovie}
                  onShowDetails={handleShowDetails}
                />
              )}

              {scheduledMovies.length > 0 && (
                <WeeklySchedule
                  movies={scheduledMovies}
                  onPlayMovie={handlePlayMovie}
                  onShowDetails={handleShowDetails}
                />
              )}

              <MovieGrid
                title="Tất Cả Phim Hoạt Hình"
                movies={allMovies}
                onPlayMovie={handlePlayMovie}
                onShowDetails={handleShowDetails}
              />
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* Modals and Players */}
      <MovieModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPlay={handlePlayMovie}
      />

      <VideoPlayer
        movie={selectedMovie}
        isOpen={isPlayerOpen}
        onClose={handleClosePlayer}
      />

      <SeriesDetailPage
        series={selectedSeries}
        isOpen={isSeriesDetailOpen}
        onClose={handleCloseSeriesDetail}
        onPlayEpisode={handlePlayEpisode}
        allSeries={dbSeries.map(s => convertDbSeriesToMovies([s])[0])} // Convert for compatibility
      />

      <EpisodePlayer
        series={selectedSeries}
        currentEpisode={selectedEpisode}
        isOpen={isEpisodePlayerOpen}
        onClose={handleCloseEpisodePlayer}
        onEpisodeChange={handleEpisodeChange}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <VipModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        onSelectPlan={handleSelectVipPlan}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePayment}
        selectedPlan={selectedVipPlan}
      />

      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={handleAdminPanelClose}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;