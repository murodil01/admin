import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { SendHorizontal, X, MoreVertical, Edit, Trash2, Clock } from "lucide-react";
import {
  createNote,
  updateNote,
  deleteNote,
  getUserNotes,
  getCurrentUser,
} from "../../../../api/services/notesService";
import { toast } from 'react-toastify';

const Notes = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const bottomRef = useRef(null);

  // Get user ID from URL parameters - matches the /profile/:id route structure
  const { id: targetUserId } = useParams();

  console.log('Notes component - Target User ID:', targetUserId); // Debug log

  // Get current user info on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        console.log('Current user fetched:', user); // Debug log
      } catch (error) {
        console.error('Error fetching current user:', error);
        toast.error("Error fetching user information");
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch notes for specific user
  useEffect(() => {
    const fetchNotes = async () => {
      if (!targetUserId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching notes for user:', targetUserId); // Debug log
        // Fetch notes for specific user
        const response = await getUserNotes(targetUserId);
        console.log('API Response:', response); // Debug log

        if (!response || !Array.isArray(response)) {
          setMessages([]);
          return;
        }

        // Format messages
        const formattedMessages = response.map(note => {
          console.log('Processing note:', note); // Debug log for each note
          
          return {
            id: note.id || Date.now(),
            text: note.message || 'No content', // Use message field
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
              id: note.user || note.user_id || note.author_id,
              email: note.user_email || note.author_email,
              avatar: note.author_profile_picture || note.profile_picture || '/default-avatar.png', // Fallback avatar
              author_full_name: note.author_full_name || note.full_name || 'Unknown User',
            },
            targetUserId: note.recipient || targetUserId // Use recipient field
          };
        });

        console.log('Formatted messages:', formattedMessages); // Debug log
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error fetching notes:', error);
        toast.error("Error during fetching messages");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [targetUserId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownButtons = document.querySelectorAll('[data-dropdown-button]');
      const dropdownMenus = document.querySelectorAll('[data-dropdown-menu]');

      let isClickInside = false;

      dropdownButtons.forEach(button => {
        if (button.contains(event.target)) {
          isClickInside = true;
        }
      });

      dropdownMenus.forEach(menu => {
        if (menu.contains(event.target)) {
          isClickInside = true;
        }
      });

      if (!isClickInside) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const deleteMessage = async (id) => {
    try {
      // Optimistically remove from UI first
      setMessages(prev => prev.filter(msg => msg.id !== id));
      setOpenDropdownId(null);

      // Then make the API call
      await deleteNote(id);

      toast.success("Successfully deleted");
    } catch (error) {
      console.error('Delete error:', error);

      // If delete fails, add the message back to the UI
      const deletedMessage = messages.find(msg => msg.id === id);
      if (deletedMessage) {
        setMessages(prev => [...prev, deletedMessage]);
      }

      let errorMessage = "Error during deletion";
      if (error.response?.status === 404) {
        errorMessage = "Message not found";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = typeof error.response.data === 'object'
          ? JSON.stringify(error.response.data)
          : error.response.data;
      }

      toast.error(errorMessage);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) {
      toast.warning("Cannot be empty");
      return;
    }

    if (!targetUserId) {
      toast.error("No target user selected");
      return;
    }

    setIsSending(true);

    // Define tempId here so it's accessible in the catch block
    let tempId = null;

    try {
      if (editingId) {
        // Edit mode
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
        // Create new note mode - OPTIMISTIC UPDATE
        // First add the note to UI immediately
        tempId = Date.now(); // Temporary ID for optimistic update
        const newNoteItem = {
          id: tempId,
          text: input.trim(),
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          }),
          date: new Date().toLocaleDateString(),
          user: {
            id: currentUser?.id,
            email: currentUser?.email,
            avatar: currentUser?.profile_picture || '/default-avatar.png', // Fallback avatar
            author_full_name: currentUser?.full_name || 'You',
          },
          targetUserId: targetUserId
        };

        console.log('Adding optimistic note:', newNoteItem); // Debug log

        // Optimistically update UI
        setMessages(prev => [newNoteItem, ...prev]);

        // Then make the API call
        const newNote = await createNote(input.trim(), targetUserId);
        console.log('API returned new note:', newNote); // Debug log

        if (newNote) {
          // Replace the temporary note with the real one from server
          setMessages(prev =>
            prev.map(msg =>
              msg.id === tempId
                ? {
                  ...msg,
                  id: newNote.id,
                  text: newNote.message || input.trim(),
                  time: new Date(newNote.created_at || new Date()).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  }),
                  date: new Date(newNote.created_at || new Date()).toLocaleDateString(),
                  user: {
                    id: newNote.user || newNote.user_id || currentUser?.id,
                    email: newNote.user_email || newNote.author_email || currentUser?.email,
                    avatar: newNote.author_profile_picture || newNote.profile_picture || currentUser?.profile_picture || '/default-avatar.png',
                    author_full_name: newNote.author_full_name || newNote.full_name || currentUser?.full_name || 'You',
                  },
                  targetUserId: newNote.recipient || targetUserId
                }
                : msg
            )
          );
          toast.success("Successfully added");
        } else {
          // If API call fails, remove the optimistic update
          setMessages(prev => prev.filter(msg => msg.id !== tempId));
          toast.warning("Couldn't add");
        }
      }

      setInput("");
      scrollToBottom();
    } catch (error) {
      console.error('Send message error details:', error.response?.data);

      // Remove the optimistic update on error (only for create mode)
      if (!editingId && tempId) {
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
      }

      let errorMessage = "Error sending message";
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMessage = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
        } else {
          errorMessage = error.response.data;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const startEditing = (id, text) => {
    setEditingId(id);
    setInput(text);
    setOpenDropdownId(null);
    setTimeout(() => {
      document.querySelector('textarea')?.focus();
    }, 0);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setInput("");
  };

  // Show message if no target user is selected
  if (!targetUserId) {
    return (
      <div className="w-full rounded-[24px] h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center text-gray-500">
          <Clock size={48} className="mb-4" />
          <p>Please select a user to view notes</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full rounded-[24px] h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[24px] h-screen flex flex-col bg-white relative overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Notes</h2>
        <p className="text-sm text-gray-500">{messages.length} messages</p>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col-reverse">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Clock size={48} className="mb-4" />
            <p>No notes for this user</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const showDate = index === 0 ||
              msg.date !== messages[index - 1].date;

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="text-center my-4">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-500">
                      {msg.date}
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-4 group relative">
                  <div className="w-9 h-9 rounded-full border-2 border-white shadow flex-shrink-0 overflow-hidden bg-gray-200">
                    <img
                      src={msg.user.avatar}
                      alt={`${msg.user.author_full_name || 'User'}'s avatar`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to a default avatar if image fails to load
                        e.target.src = '/default-avatar.png';
                        e.target.onerror = null; // Prevent infinite loop
                      }}
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="bg-[#E4EDFB] rounded-xl px-4 py-3 shadow relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-[14px] text-[#0A1629] mb-1">
                            {msg.user.author_full_name}
                          </p>
                          <p className="text-[14px] font-semibold text-[#7D8592] whitespace-pre-line break-words">
                            {msg.text}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-500">
                            {msg.time}
                          </span>

                          <button
                            data-dropdown-button
                            onClick={() => setOpenDropdownId(prev => prev === msg.id ? null : msg.id)}
                            className="p-1 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical size={16} className="text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {openDropdownId === msg.id && (
                      <div
                        data-dropdown-menu
                        className={`absolute right-4 w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden p-1
      ${index === 0 ? "bottom-8 mb-1" : "top-8 mt-1"}`}
                      >
                        <button
                          onClick={() => {
                            startEditing(msg.id, msg.text);
                            setOpenDropdownId(null);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-blue-50 flex items-center gap-2 cursor-pointer hover:text-blue-500 rounded-lg"
                        >
                          <Edit size={16} />
                          <span>Edit message</span>
                        </button>
                        <button
                          onClick={() => {
                            deleteMessage(msg.id);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-blue-50 hover:text-red-500 flex items-center gap-2 cursor-pointer rounded-lg"
                        >
                          <Trash2 size={16} />
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

      {/* Write Note Section */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="p-4">
          {/* Header for writing section */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingId ? "Edit Note" : "Write a New Note"}
            </h3>
            {editingId && (
              <button
                onClick={cancelEdit}
                className="text-gray-500 hover:text-red-500 transition-colors"
                title="Cancel editing"
                disabled={isSending}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Input Area */}
          <div className="space-y-3">
            <div className="relative">
              <textarea
                rows={3}
                placeholder={editingId ? "Edit your note here..." : "What would you like to note down?"}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="w-full px-4 py-3 border border-[#D8E0F0] rounded-[12px] outline-none resize-none placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 min-h-[80px] max-h-[120px]"
                disabled={isSending}
                style={{ height: 'auto' }}
              />

              {/* Character count */}
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {input.length} characters
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {editingId && (
                  <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    Editing mode
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  Press Enter to send, Shift+Enter for new line
                </span>
              </div>

              <div className="flex items-center gap-2">
                {editingId && (
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[10px] transition-colors text-sm font-medium"
                    disabled={isSending}
                  >
                    Cancel
                  </button>
                )}

                <button
                  onClick={sendMessage}
                  className={`px-6 py-2 rounded-[10px] transition-all duration-200 text-sm font-medium flex items-center gap-2 ${input.trim() && !isSending
                    ? editingId
                      ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  disabled={isSending || !input.trim()}
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <SendHorizontal size={16} />
                      <span>{editingId ? "Update Note" : "Send Note"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;