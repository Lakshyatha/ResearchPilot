import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { Brain } from 'lucide-react';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <Brain className="w-10 h-10 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ResearchPilot AI</h1>
          <p className="text-sm text-gray-600">Autonomous Research Intelligence</p>
        </div>
      </div>

      {isLogin ? (
        <LoginForm onToggle={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onToggle={() => setIsLogin(true)} />
      )}
    </div>
  );
}
