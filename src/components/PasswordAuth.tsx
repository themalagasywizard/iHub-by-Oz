import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';

const PasswordAuth = ({ onAuthenticated }: { onAuthenticated: () => void }) => {
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const correctPassword = 'trumbletv25';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      localStorage.setItem('isAuthenticated', 'true');
      onAuthenticated();
    } else {
      toast({
        title: "Incorrect password",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-[#141414] flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] p-8 rounded-lg max-w-md w-full border border-[#2a2a2a] shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold text-[#ea384c] mb-4">iHub</h1>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-center">Enter password to access premium content</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-400"
            autoFocus
          />
          <Button 
            type="submit" 
            className="w-full bg-[#ea384c] hover:bg-[#ff4d63] text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Access iHub
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PasswordAuth;