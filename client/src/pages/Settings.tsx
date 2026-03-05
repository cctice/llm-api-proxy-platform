import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export function Settings() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← 返回
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                系统设置
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              账户信息
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  邮箱
                </label>
                <div className="text-gray-900">{user?.email}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  用户名
                </label>
                <div className="text-gray-900">{user?.name || '未设置'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  角色
                </label>
                <div className="text-gray-900">{user?.role}</div>
              </div>
            </div>
          </div>

          {/* Platform Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              平台信息
            </h2>
            <div className="text-sm text-gray-600 space-y-2">
              <div>• LLM API统一代理平台 v1.0.0</div>
              <div>• 支持 OpenAI、Anthropic、智谱、通义千问</div>
              <div>• 实时用量监控与计费</div>
              <div>• API密钥管理与配额控制</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
