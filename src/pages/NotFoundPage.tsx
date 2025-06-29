import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto p-8">
        <div className="text-blue-400 text-8xl mb-8">404</div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Trang không tồn tại
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Quay Lại</span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="h-5 w-5" />
            <span>Về Trang Chủ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;