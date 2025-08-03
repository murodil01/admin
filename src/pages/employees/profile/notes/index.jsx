import { useState, useEffect, useRef } from "react";
import {
  Send,
  Trash2,
  Pencil,
  X,
  MoreVertical,
  SendHorizontal,
} from "lucide-react";

const Notes = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("notes-chat");
    if (saved) setMessages(JSON.parse(saved));
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem("notes-chat", JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages, hasLoaded]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    if (editingId) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === editingId ? { ...msg, text: input.trim() } : msg
        )
      );
      setEditingId(null);
    } else {
      const newMessage = {
        id: Date.now(),
        text: input.trim(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, newMessage]);
    }

    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteMessage = (id) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
    setOpenDropdownId(null);
  };

  const startEditing = (id, text) => {
    setEditingId(id);
    setInput(text);
    setOpenDropdownId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setInput("");
  };

  return (
    <div className="w-full rounded-[24px] h-screen flex flex-col bg-white relative">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="flex items-start justify-end relative mb-3"
          >
            <div className="max-w-[80%] bg-[#E4EDFB] rounded-xl px-4 py-3 shadow relative">
              <div className="flex justify-between">
                <div>
                  <p className="font-bold text-[14px] text-[#0A1629] mb-1">
                    Notes:
                  </p>
                  <p className="text-[14px] font-semibold text-[#7D8592] whitespace-pre-line">
                    {msg.text}
                  </p>
                  <p className="text-[10px] text-gray-500 text-right mt-1">
                    {msg.time}
                  </p>
                </div>
                <div className="relative ml-2">
                  <button
                    onClick={() =>
                      setOpenDropdownId((prev) =>
                        prev === msg.id ? null : msg.id
                      )
                    }
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <MoreVertical size={16} className="text-gray-500" />
                  </button>
                  {openDropdownId === msg.id && (
                    <div className="absolute right-0 mt-1 w-[90px] bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <button
                        onClick={() => startEditing(msg.id, msg.text)}
                        className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="w-full px-3 py-2 text-sm text-left text-red-500 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <img
              src="https://randomuser.me/api/portraits/men/10.jpg"
              alt="avatar"
              className="w-7 h-7 rounded-full border-2 border-white shadow ml-2 mt-auto"
            />
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Sticky Input Field */}
      <div className="sticky bottom-0 left-0 right-0 bg-white p-4  flex items-center gap-2">
        <textarea
          rows={1}
          placeholder={editingId ? "Editing note..." : "Type a note"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-4 py-2 border border-[#D8E0F0] rounded-[14px] outline-none resize-none placeholder:text-gray-400"
        />
        {editingId && (
          <button
            onClick={cancelEdit}
            className="p-2 text-gray-500 hover:text-red-500 transition"
            title="Cancel Edit"
          >
            <X size={20} />
          </button>
        )}
        <button
          onClick={sendMessage}
          className="p-2 bg-gray-500 rounded-[14px] text-white hover:bg-[D8E0F0] transition"
        >
          <SendHorizontal className="text-[D8E0F0]" size={20} />
        </button>
      </div>
    </div>
  );
};

export default Notes;
