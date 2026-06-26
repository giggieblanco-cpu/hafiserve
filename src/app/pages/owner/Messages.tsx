import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, ArrowLeft, User, Home } from "lucide-react";
import { getConversations, getMessages, sendMessage, markConversationRead, createNotification } from "../../lib/api";
import { getCurrentUser } from "../../lib/storage";
import { useNavigate } from "react-router";

interface Conversation {
  id: string;
  customerEmail: string;
  customerName: string;
  hotelId: string;
  hotelName: string;
  hotelEmail: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderEmail: string;
  senderName: string;
  text: string;
  createdAt: string;
  customerEmail: string;
  customerName: string;
  hotelId: string;
  hotelName: string;
  hotelEmail: string;
  receiverEmail: string;
}

export default function OwnerMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
    // Poll every 10s for new messages
    const interval = setInterval(() => {
      loadConversations();
      if (selectedConv) loadMessages(selectedConv.id);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv.id);
      markConversationRead(user!.email, selectedConv.id);
    }
  }, [selectedConv?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;
    const data = await getConversations(user.email);
    setConversations(data);
  };

  const loadMessages = async (conversationId: string) => {
    setLoading(true);
    const data = await getMessages(conversationId);
    setMessages(data);
    setLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv || !user) return;

    const messageObj: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      conversationId: selectedConv.id,
      senderEmail: user.email,
      senderName: user.name,
      text: newMessage.trim(),
      createdAt: new Date().toISOString(),
      customerEmail: selectedConv.customerEmail,
      customerName: selectedConv.customerName,
      hotelId: selectedConv.hotelId,
      hotelName: selectedConv.hotelName,
      hotelEmail: selectedConv.hotelEmail,
      receiverEmail: selectedConv.customerEmail,
    };

    setMessages((prev) => [...prev, messageObj]);
    setNewMessage("");
    await sendMessage(messageObj);
    // Notify the customer
    createNotification({
      targetEmail: selectedConv.customerEmail,
      title: `Reply from ${selectedConv.hotelName}`,
      message: newMessage.trim(),
      type: "message",
      linkPath: "/customer/messages",
    });
    loadConversations();
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Please log in to view messages</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="size-6" />
                    <h1 className="text-lg font-bold">Customer Messages</h1>
                  </div>
                  <button
                    onClick={() => navigate("/owner/dashboard")}
                    className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg text-sm transition flex items-center gap-1"
                    title="Back to Dashboard"
                  >
                    <Home className="size-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </button>
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4 text-center">
                    <MessageCircle className="size-12 mb-2 opacity-30" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-1">Customers will reach out to you here</p>
                  </div>
                )}
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition ${
                      selectedConv?.id === conv.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <User className="size-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-gray-800 text-sm">{conv.customerName}</p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage || "New conversation"}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{timeAgo(conv.lastMessageAt)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConv ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-gray-50 border-b px-6 py-4 flex items-center gap-3">
                    <button
                      onClick={() => setSelectedConv(null)}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1.5 rounded-lg transition"
                      title="Back to conversations"
                    >
                      <ArrowLeft className="size-5" />
                    </button>
                    <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-800">{selectedConv.customerName}</h2>
                      <p className="text-xs text-gray-500">{selectedConv.customerEmail}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading && (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                      </div>
                    )}
                    {messages.map((msg) => {
                      const isMe = msg.senderEmail === user.email;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-xs ${isMe ? "order-2" : "order-1"}`}>
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isMe
                                  ? "bg-gradient-to-r from-green-600 to-blue-600 text-white"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              <p className="text-sm">{msg.text}</p>
                            </div>
                            <p className={`text-[10px] text-gray-400 mt-1 ${isMe ? "text-right" : "text-left"}`}>
                              {timeAgo(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSendMessage} className="border-t p-4 bg-gray-50">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send className="size-4" />
                        Send
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <MessageCircle className="size-16 mx-auto mb-4 opacity-20" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
