import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import clsx from 'clsx';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export const ChatPage = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Hello! I am your AI financial assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');

    const chatMutation = useMutation({
        mutationFn: async (message: string) => {
            const response = await api.post('/ai/chat', { message });
            return response.data.response;
        },
        onSuccess: (data) => {
            setMessages((prev) => [
                ...prev,
                { id: Date.now().toString(), role: 'assistant', content: data }
            ]);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input;
        setInput('');
        setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), role: 'user', content: userMessage }
        ]);
        chatMutation.mutate(userMessage);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={clsx(
                            'flex items-start gap-3 max-w-[80%]',
                            msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                        )}
                    >
                        <div className={clsx(
                            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                            msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                        )}>
                            {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={clsx(
                            'p-3 rounded-2xl text-sm',
                            msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-gray-800 text-gray-200 rounded-tl-none'
                        )}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {chatMutation.isPending && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                            <Bot size={16} />
                        </div>
                        <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none text-gray-400 text-sm">
                            Thinking...
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about your finances..."
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
                <button
                    type="submit"
                    disabled={chatMutation.isPending || !input.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};
