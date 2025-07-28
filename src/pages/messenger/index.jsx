import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Phone, 
  Video, 
  MoreHorizontal, 
  Send, 
  Paperclip, 
  Smile, 
  Image,
  Mic,
  Circle,
  Check,
  CheckCheck
} from 'lucide-react';

const Messenger = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const contacts = [
    {
      id: 1,
      name: 'Sarah Wilson',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      lastMessage: 'Hey! How are you doing today?',
      time: '2m ago',
      unread: 3,
      online: true,
      typing: false
    },
    {
      id: 2,
      name: 'Mike Johnson',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      lastMessage: 'The project looks great! 👍',
      time: '15m ago',
      unread: 0,
      online: true,
      typing: false
    },
    {
      id: 3,
      name: 'Emma Davis',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      lastMessage: 'Can we schedule a meeting for tomorrow?',
      time: '1h ago',
      unread: 1,
      online: false,
      typing: false
    },
    {
      id: 4,
      name: 'Alex Brown',
      avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
      lastMessage: 'Thanks for your help!',
      time: '2h ago',
      unread: 0,
      online: false,
      typing: false
    },
    {
      id: 5,
      name: 'Lisa Chen',
      avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
      lastMessage: 'See you later! 😊',
      time: '3h ago',
      unread: 0,
      online: true,
      typing: true
    },
    {
      id: 6,
      name: 'David Miller',
      avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
      lastMessage: 'Perfect! Let me know when you\'re ready.',
      time: '5h ago',
      unread: 0,
      online: false,
      typing: false
    }
  ];

  const [messages, setMessages] = useState({
    1: [
      {
        id: 1,
        text: 'Hey! How are you doing today?',
        sender: 'other',
        time: '10:30 AM',
        status: 'read'
      },
      {
        id: 2,
        text: 'I\'m doing great! Just working on some new projects. How about you?',
        sender: 'me',
        time: '10:32 AM',
        status: 'read'
      },
      {
        id: 3,
        text: 'That sounds exciting! I\'d love to hear more about it.',
        sender: 'other',
        time: '10:33 AM',
        status: 'read'
      },
      {
        id: 4,
        text: 'Sure! It\'s a new dashboard design for a project management tool. Very modern and clean interface.',
        sender: 'me',
        time: '10:35 AM',
        status: 'delivered'
      }
    ],
    2: [
      {
        id: 1,
        text: 'The project looks great! 👍',
        sender: 'other',
        time: '9:45 AM',
        status: 'read'
      },
      {
        id: 2,
        text: 'Thank you! I really appreciate your feedback.',
        sender: 'me',
        time: '9:47 AM',
        status: 'read'
      }
    ]
  });

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage]
    }));

    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageStatus = (status) => {
    switch (status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-scree flex">
      {/* Sidebar - Contacts List */}
      <div className="w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Messages</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedChat(contact)}
              className={`p-4 lg:p-6 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                selectedChat?.id === contact.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center gap-3 lg:gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover"
                  />
                  {contact.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate text-sm lg:text-base">
                      {contact.name}
                    </h3>
                    <span className="text-xs lg:text-sm text-gray-500 flex-shrink-0">
                      {contact.time}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {contact.typing ? (
                        <span className="text-blue-500 italic">typing...</span>
                      ) : (
                        contact.lastMessage
                      )}
                    </p>
                    {contact.unread > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center flex-shrink-0 ml-2">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${selectedChat ? 'block' : 'hidden md:flex'}`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="relative">
                    <img
                      src={selectedChat.avatar}
                      alt={selectedChat.name}
                      className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                    />
                    {selectedChat.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 text-base lg:text-lg">
                      {selectedChat.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedChat.online ? 'Active now' : 'Last seen 2h ago'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 lg:gap-4">
                  <button className="p-2 lg:p-3 hover:bg-gray-100 rounded-full transition-colors">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 lg:p-3 hover:bg-gray-100 rounded-full transition-colors">
                    <Video className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 lg:p-3 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
              {(messages[selectedChat.id] || []).map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${
                      msg.sender === 'me'
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-gray-200 text-gray-900 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm lg:text-base">{msg.text}</p>
                    <div className={`flex items-center gap-1 mt-1 ${
                      msg.sender === 'me' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span className={`text-xs ${
                        msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {msg.time}
                      </span>
                      {msg.sender === 'me' && getMessageStatus(msg.status)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4 lg:p-6">
              <div className="flex items-end gap-3 lg:gap-4">
                <button className="p-2 lg:p-3 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 lg:p-3 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                  <Image className="w-5 h-5 text-gray-600" />
                </button>
                
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    rows="1"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                </div>

                <button
                  className="p-2 lg:p-3 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="w-5 h-5 text-gray-600" />
                </button>

                {message.trim() ? (
                  <button
                    onClick={handleSendMessage}
                    className="p-2 lg:p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors flex-shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                ) : (
                  <button className="p-2 lg:p-3 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                    <Mic className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose from your existing conversations or start a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messenger;