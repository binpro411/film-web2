import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import SeriesDetailPage from './pages/SeriesDetailPage';
import EpisodePlayerPage from './pages/EpisodePlayerPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Trang chủ */}
          <Route path="/" element={<HomePage />} />
          
          {/* Chi tiết series: /series/series-id */}
          <Route path="/series/:seriesId" element={<SeriesDetailPage />} />
          
          {/* Xem episode: /series/series-id/episode/episode-number */}
          <Route path="/series/:seriesId/episode/:episodeNumber" element={<EpisodePlayerPage />} />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;