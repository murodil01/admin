import { useState, useEffect, useRef } from "react";
import { SendHorizontal, X, MoreVertical, Edit, Trash2, Clock } from "lucide-react";
import {
  getNotesAll,
  createNote,
  updateNote,
  deleteNote
} from "../../../../api/services/notesService";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Notes = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);

  // Backenddan ma'lumotlarni olish va real vaqtda yangilash
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await getNotesAll();

        if (!response || !Array.isArray(response)) {
          setMessages([]);
          return;
        }

        // To'g'ri formatga o'tkazish
        const formattedMessages = response.map(note => ({
          id: note.id || Date.now(),
          text: note.message || 'No content', // message ni text ga o'zgartirish
          time: note.created_at
            ? new Date(note.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })
            : new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            }),
          date: note.created_at
            ? new Date(note.created_at).toLocaleDateString()
            : new Date().toLocaleDateString(),
          user: {
            id: note.user,
            email: note.user_email,
            avatar: note.profile_picture
          }
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Xatolik yuz berdi:', error);
        toast.error("Error during fetching messages");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Dropdown tugmasi va menyusini tekshirish
      const dropdownButtons = document.querySelectorAll('[data-dropdown-button]');
      const dropdownMenus = document.querySelectorAll('[data-dropdown-menu]');

      let isClickInside = false;

      // Tugma ichidami?
      dropdownButtons.forEach(button => {
        if (button.contains(event.target)) {
          isClickInside = true;
        }
      });

      // Menyu ichidami?
      dropdownMenus.forEach(menu => {
        if (menu.contains(event.target)) {
          isClickInside = true;
        }
      });

      // Agar tashqi joyga bosilsa
      if (!isClickInside) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Avtomatik scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const deleteMessage = async (id) => {
    try {
      const response = await deleteNote(id);

      // Agar backend faqat status code 204 qaytarsa (No Content)
      setMessages(prev => prev.filter(msg => msg.id !== id));
      setOpenDropdownId(null);
      toast.success("Successfully deleted");

    } catch (error) {
      console.error('Full error details:', error);
      console.log('Error response data:', error.response?.data);

      let errorMessage = "Error during fetching messages";
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "Message no found (don't exist in server)";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }

      toast.error(errorMessage);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) {
      toast.warning("Cannot be empty");
      return;
    }

    try {
      if (editingId) {
        // Tahrirlash rejimi
        const updatedNote = await updateNote(editingId, input.trim());

        if (updatedNote) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === editingId
                ? {
                  ...msg,
                  text: updatedNote.message || input.trim(),
                  time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  }),
                  date: new Date().toLocaleDateString()
                }
                : msg
            )
          );
          toast.success("Successfully updated");
        } else {
          toast.warning("Couldn't update");
        }
        setEditingId(null);
      } else {
        // Yangi xabar qo'shish rejimi
        const newNote = await createNote(input.trim());
        console.log('Create response:', newNote);

        if (newNote) {
          setMessages(prev => [
            ...prev,
            {
              id: newNote.id,
              text: newNote.message || input.trim(),
              time: new Date(newNote.created_at || new Date()).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              }),
              date: new Date(newNote.created_at || new Date()).toLocaleDateString(),
              user: {
                id: newNote.user,
                email: newNote.user_email,
                avatar: newNote.profile_picture
              }
            }
          ]);
          toast.success("Successfully added");
        } else {
          toast.warning("Couldn't add");
        }
      }

      setInput("");
      scrollToBottom();
    } catch (error) {
      console.error('Error:', error);
      toast.error("Error: " + error.message);
    }
  };

  // Tahrirlashni boshlash
  const startEditing = (id, text) => {
    setEditingId(id);
    setInput(text);
    setOpenDropdownId(null);
    // Inputga fokus qilish
    setTimeout(() => {
      document.querySelector('textarea')?.focus();
    }, 0);
  };

  // Tahrirlashni bekor qilish
  const cancelEdit = () => {
    setEditingId(null);
    setInput("");
  };

  if (loading) {
    return (
      <div className="w-full rounded-[24px] h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-500">Updating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[24px] h-screen flex flex-col bg-white relative overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Notes</h2>
        <p className="text-sm text-gray-500">{messages.length} messeges</p>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Clock size={48} className="mb-4" />
            <p>There is no note</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            // Agar oldingi xabar bilan bir kun bo'lsa, sana ko'rsatilmaydi
            const showDate = index === 0 ||
              msg.date !== messages[index - 1].date;

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="text-center my-4">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-500">
                      {msg.time}
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-4 group relative">
                  <img
                    src={msg.user.avatar}
                    alt="avatar"
                    className="w-9 h-9 rounded-full border-2 border-white shadow flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="bg-[#E4EDFB] rounded-xl px-4 py-3 shadow relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-[14px] text-[#0A1629] mb-1">Note:</p>
                          <p className="text-[14px] font-semibold text-[#7D8592] whitespace-pre-line break-words">
                            {msg.text}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-500">
                            {msg.time}
                          </span>

                          <button
                            onClick={() => setOpenDropdownId(prev => prev === msg.id ? null : msg.id)}
                            className="p-1 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical size={16} className="text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {openDropdownId === msg.id && (
                      <div className="absolute right-4 top-8 mt-1 w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                        <button
                          onClick={() => {
                            startEditing(msg.id, msg.text);
                            setOpenDropdownId(prev => prev === msg.id ? null : msg.id)
                          }}
                          onMouseDown={(e) => e.stopPropagation()} // Bubblingni to'xtatish
                          className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-blue-50 flex items-center gap-2 cursor-pointer hover:text-blue-500"
                        >
                          <span>Edit message</span>
                        </button>
                        <button
                          onClick={() => {
                            deleteMessage(msg.id);
                            setOpenDropdownId(prev => prev === msg.id ? null : msg.id)
                          }}
                          onMouseDown={(e) => e.stopPropagation()} // Bubblingni to'xtatish
                          className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-blue-50 hover:text-red-500 flex items-center gap-2 cursor-pointer"
                        >
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <textarea
            rows={1}
            placeholder={editingId ? "Editing a note..." : "Writing a new note..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-1 px-4 py-3 border border-[#D8E0F0] rounded-[14px] outline-none resize-none placeholder:text-gray-400 focus:border-blue-500 transition"
            disabled={isSending}
          />

          {editingId && (
            <button
              onClick={cancelEdit}
              className="p-2 text-gray-500 hover:text-red-500 transition"
              title="Cancel"
              disabled={isSending}
            >
              <X size={20} />
            </button>
          )}

          <button
            onClick={sendMessage}
            className={`p-2 rounded-[14px] transition ${editingId ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'} text-white`}
            disabled={isSending || !input.trim()}
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <SendHorizontal size={20} />
            )}
          </button>
        </div>

        {editingId && (
          <p className="text-xs text-gray-500 mt-1 ml-2">
            Editing a note
          </p>
        )}
      </div>
    </div>
  );
};

export default Notes;