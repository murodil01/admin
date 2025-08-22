// components/TokenExpiredScreen.js
import { Card, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const TokenExpiredScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-red-50 z-50">
      <Card className="text-center py-10 shadow-lg border-red-200 bg-white">
        <div className="flex flex-col items-center space-y-4">
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 48, color: '#ef4444' }} spin />} 
          />
          <div className="text-xl text-red-600 font-semibold">Session Expired</div>
          <div className="text-lg text-gray-600">Redirecting to login page...</div>
        </div>
      </Card>
    </div>
  );
};

export default TokenExpiredScreen;