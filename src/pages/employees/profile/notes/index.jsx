import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { SendHorizontal, X, MoreVertical, Edit, Trash2, Clock } from "lucide-react";
import {
  createNote,
  updateNote,
  deleteNote,
  getNotesAll, // Changed from getUserNotes to getNotesAll
  getCurrentUser,
} from "../../../../api/services/notesService";
import { toast } from 'react-toastify';

const Notes = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const bottomRef = useRef(null);

  // Get user ID from URL parameters - matches the /profile/:id route structure
  const { id: targetUserId } = useParams();

  // Role hierarchy definition
  const ROLES = {
    FOUNDER: 'founder',
    MANAGER: 'manager',
    EMPLOYEE: 'employee' // Add other roles as needed
  };

  // Role hierarchy levels (higher number = higher authority)
  const ROLE_LEVELS = {
    [ROLES.FOUNDER]: 3,
    [ROLES.MANAGER]: 2,
    [ROLES.EMPLOYEE]: 1
  };

  // Function to check if current user can see a note based on role-based access control
  const canViewNote = (note, currentUserRole, currentUserId, targetUserId) => {
    if (!note || !note.user) return false;

    const noteAuthorRole = note.user.role || ROLES.EMPLOYEE;
    const noteAuthorId = note.user.id;
    const noteRecipientId = note.targetUserId || note.recipient;

    // First check: Note must be written TO the target user we're viewing
    if (noteRecipientId != targetUserId) { // Use != for loose comparison
      return false;
    }

    // Rule 1: If current user is FOUNDER - can see ALL notes (regardless of author)
    if (currentUserRole === ROLES.FOUNDER) {
      return true;
    }

    // Rule 2: If current user is MANAGER - can only see his own notes (regardless of recipient)
    if (currentUserRole === ROLES.MANAGER) {
      if (noteAuthorId == currentUserId) { // Use == for loose comparison
        return true;
      }
      return false;
    }

    // Rule 3: If current user is EMPLOYEE or other role - can only see notes written BY founders and managers TO them
    if (targetUserId == currentUserId) { // Employee can only see notes TO themselves
      if (noteAuthorRole === ROLES.FOUNDER || noteAuthorRole === ROLES.MANAGER) {
        return true;
      }
    }

    // Employee cannot see notes written to other users, or notes from other employees
    return false;
  };

  // Function to check if current user can edit/delete a note
  const canModifyNote = (note, currentUserRole, currentUserId) => {
    if (!note || !note.user) return false;

    // User can modify their own notes
    if (note.user.id === currentUserId) return true;

    // Founders can modify any note they can see
    if (currentUserRole === ROLES.FOUNDER) return true;

    // Managers can modify notes from employees under them
    if (currentUserRole === ROLES.MANAGER && note.user.role === ROLES.EMPLOYEE) {
      return true;
    }

    return false;
  };

  // Filter messages based on role-based access control
  const filterMessagesByRole = (allMessages, currentUserRole, currentUserId, targetUserId) => {
    if (!currentUserRole || !currentUserId || !targetUserId) {
      return [];
    }

    const filtered = allMessages.filter(message =>
      canViewNote(message, currentUserRole, currentUserId, targetUserId)
    );

    return filtered;
  };

  // Get current user info on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
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
        setFilteredMessages([]);
        setLoading(false);
        return;
      }

      try {
        // Fetch ALL notes from the system
        const response = await getNotesAll();

        if (!response || !Array.isArray(response)) {
          setMessages([]);
          setFilteredMessages([]);
          return;
        }

        // Format ALL messages first
        const allFormattedMessages = response.map(note => {

          return {
            id: note.id || Date.now(),
            text: note.message || 'No content',
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
              id: note.author || note.user_id || note.author_id,
              email: note.user_email || note.author_email,
              avatar: note.author_profile_picture || note.profile_picture || '/default-avatar.png',
              author_full_name: note.author_full_name || note.full_name || 'Unknown User',
              role: note.author_role || note.user_role || ROLES.EMPLOYEE,
            },
            targetUserId: note.recipient || note.target_user_id,
            recipient: note.recipient || note.target_user_id
          };
        });

        // Filter messages to only show notes written TO the target user
        const notesForTargetUser = allFormattedMessages.filter(note => {
          const noteRecipient = note.targetUserId || note.recipient;
          const isForTargetUser = noteRecipient == targetUserId; // Use == for loose comparison
          return isForTargetUser;
        });

        setMessages(notesForTargetUser);

        // Apply role-based filtering if current user is available
        if (currentUser && currentUser.role && currentUser.id) {
          const filtered = filterMessagesByRole(notesForTargetUser, currentUser.role, currentUser.id, targetUserId);
          setFilteredMessages(filtered);
        } else {
          setFilteredMessages([]);
        }

      } catch (error) {
        console.error('Error fetching notes:', error);
        toast.error("Error during fetching messages");
        setMessages([]);
        setFilteredMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [targetUserId, currentUser]);

  // Re-filter messages when currentUser changes
  useEffect(() => {
    if (currentUser && currentUser.role && currentUser.id && targetUserId && messages.length > 0) {
      const filtered = filterMessagesByRole(messages, currentUser.role, currentUser.id, targetUserId);
      setFilteredMessages(filtered);
    } else if (currentUser) {
      setFilteredMessages([]);
    }
  }, [messages, currentUser, targetUserId]);

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
  }, [filteredMessages]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Open delete confirmation modal
  const confirmDelete = (message) => {
    // Check if user can modify this note
    if (!canModifyNote(message, currentUser?.role, currentUser?.id)) {
      toast.error("You don't have permission to delete this note");
      return;
    }

    setMessageToDelete(message);
    setShowDeleteModal(true);
    setOpenDropdownId(null);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };

  // Execute the delete operation
  const executeDelete = async () => {
    if (!messageToDelete) return;

    try {
      // Optimistically remove from UI first
      setFilteredMessages(prev => prev.filter(msg => msg.id !== messageToDelete.id));
      setMessages(prev => prev.filter(msg => msg.id !== messageToDelete.id));

      // Then make the API call
      await deleteNote(messageToDelete.id);

      toast.success("Successfully deleted");
    } catch (error) {
      console.error('Delete error:', error);

      // If delete fails, add the message back to the UI
      setMessages(prev => [...prev, messageToDelete]);
      if (canViewNote(messageToDelete, currentUser?.role, currentUser?.id, targetUserId)) {
        setFilteredMessages(prev => [...prev, messageToDelete]);
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
    } finally {
      closeDeleteModal();
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
        // Edit mode - check permissions
        const messageToEdit = filteredMessages.find(msg => msg.id === editingId);
        if (!canModifyNote(messageToEdit, currentUser?.role, currentUser?.id)) {
          toast.error("You don't have permission to edit this note");
          setEditingId(null);
          setInput("");
          return;
        }

        const updatedNote = await updateNote(editingId, input.trim());

        if (updatedNote) {
          // Update in both arrays
          const updateMessage = (msg) => msg.id === editingId
            ? {
              ...msg,
              text: updatedNote.message || input.trim(),
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              }),
              date: new Date().toLocaleDateString()
            }
            : msg;

          setMessages(prev => prev.map(updateMessage));
          setFilteredMessages(prev => prev.map(updateMessage));

          toast.success("Successfully updated");
        } else {
          toast.warning("Couldn't update");
        }
        setEditingId(null);
      } else {
        // Create new note mode - OPTIMISTIC UPDATE
        tempId = Date.now();
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
            avatar: currentUser?.profile_picture || '/default-avatar.png',
            author_full_name: currentUser?.full_name || 'You',
            role: currentUser?.role || ROLES.EMPLOYEE,
          },
          targetUserId: targetUserId
        };

        // Add to both arrays
        setMessages(prev => [newNoteItem, ...prev]);
        // Only add to filtered messages if current user can see the note
        if (canViewNote(newNoteItem, currentUser?.role, currentUser?.id, targetUserId)) {
          setFilteredMessages(prev => [newNoteItem, ...prev]);
        }

        // Then make the API call
        const newNote = await createNote(input.trim(), targetUserId);

        if (newNote) {
          // Replace the temporary note with the real one from server
          const updateWithRealNote = (msg) => msg.id === tempId
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
                role: newNote.author_role || newNote.user_role || currentUser?.role || ROLES.EMPLOYEE,
              },
              targetUserId: newNote.recipient || targetUserId
            }
            : msg;

          setMessages(prev => prev.map(updateWithRealNote));
          setFilteredMessages(prev => prev.map(updateWithRealNote));

          toast.success("Successfully added");
        } else {
          // If API call fails, remove the optimistic update
          setMessages(prev => prev.filter(msg => msg.id !== tempId));
          setFilteredMessages(prev => prev.filter(msg => msg.id !== tempId));
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
        setFilteredMessages(prev => prev.filter(msg => msg.id !== tempId));
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
    // Check permissions before allowing edit
    const messageToEdit = filteredMessages.find(msg => msg.id === id);
    if (!canModifyNote(messageToEdit, currentUser?.role, currentUser?.id)) {
      toast.error("You don't have permission to edit this note");
      return;
    }

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
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div
            className="bg-white rounded-xl max-w-md w-full mx-4 p-4 sm:p-6 shadow-2xl transform transition-all duration-300 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
              <button
                onClick={closeDeleteModal}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                aria-label="Close confirmation modal"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>

            {messageToDelete && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-6 border border-gray-200">
                <p className="text-sm text-gray-700 font-medium mb-1">
                  Note preview:
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-line break-words">
                  {messageToDelete.text.length > 120
                    ? `${messageToDelete.text.substring(0, 120)}...`
                    : messageToDelete.text}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 cursor-pointer order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50 cursor-pointer order-1 sm:order-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 bg-white z-10 p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Notes</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <p className="text-xs sm:text-sm text-gray-500">
                {filteredMessages.length} visible messages
              </p>
              {currentUser?.role && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize w-fit">
                  {currentUser.role}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 flex flex-col-reverse">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 px-4">
            <Clock size={48} className="mb-4" />
            <p className="text-center text-sm sm:text-base">
              {messages.length === 0
                ? "No notes for this user"
                : "No notes visible to your role"}
            </p>
            {messages.length > 0 && filteredMessages.length === 0 && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                Some notes exist but are not visible due to role restrictions
              </p>
            )}
          </div>
        ) : (
          filteredMessages.map((msg, index) => {
            const showDate = index === 0 ||
              msg.date !== filteredMessages[index - 1].date;

            // Check if user can modify this specific note
            const canModify = canModifyNote(msg, currentUser?.role, currentUser?.id);

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="text-center my-3 sm:my-4">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-500">
                      {msg.date}
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4 group relative">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white shadow flex-shrink-0 overflow-hidden bg-gray-200">
                    <img
                      src={msg.user.avatar}
                      alt={`${msg.user.author_full_name || 'User'}'s avatar`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                        e.target.onerror = null;
                      }}
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="bg-[#E4EDFB] rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow relative">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-bold text-sm text-[#0A1629] truncate">
                              {msg.user.author_full_name}
                            </p>
                            {msg.user.role && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full capitalize flex-shrink-0">
                                {msg.user.role}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-[#7D8592] whitespace-pre-line break-words">
                            {msg.text}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          <span className="text-xs text-gray-500 hidden sm:inline">
                            {msg.time}
                          </span>

                          {canModify && (
                            <button
                              data-dropdown-button
                              onClick={() => setOpenDropdownId(prev => prev === msg.id ? null : msg.id)}
                              className="p-1 rounded-full cursor-pointer opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical size={16} className="text-gray-500" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Mobile time display */}
                      <div className="sm:hidden mt-1 flex justify-end">
                        <span className="text-xs text-gray-500">
                          {msg.time}
                        </span>
                      </div>
                    </div>

                    {openDropdownId === msg.id && canModify && (
                      <div
                        data-dropdown-menu
                        className={`absolute right-2 sm:right-4 w-[160px] sm:w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden p-1
      ${index === 0 ? "bottom-8 mb-1" : "top-8 mt-1"}`}
                      >
                        <button
                          onClick={() => {
                            startEditing(msg.id, msg.text);
                            setOpenDropdownId(null);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="w-full px-3 sm:px-4 py-2 text-sm text-left text-gray-700 hover:bg-blue-50 flex items-center gap-2 cursor-pointer hover:text-blue-500 rounded-lg"
                        >
                          <Edit size={16} />
                          <span>Edit message</span>
                        </button>
                        <button
                          onClick={() => {
                            confirmDelete(msg);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="w-full px-3 sm:px-4 py-2 text-sm text-left text-gray-700 hover:bg-blue-50 hover:text-red-500 flex items-center gap-2 cursor-pointer rounded-lg"
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
        <div className="p-3 sm:p-4">
          {/* Header for writing section */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
              {editingId ? "Edit Note" : "Write a New Note"}
            </h3>
            {editingId && (
              <button
                onClick={cancelEdit}
                className="text-gray-500 hover:text-red-500 transition-colors p-1"
                title="Cancel editing"
                disabled={isSending}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Input Area */}
          <div className="flex items-center gap-3 w-full py-3 sm:py-4">
            {/* Input */}
            <div className="relative flex-1">
              <textarea
                placeholder={editingId ? "Edit your note..." : "Type a note ..."}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                disabled={isSending}
                className="w-full h-11 px-4 py-3 text-sm sm:text-base rounded-lg border border-gray-300
                        focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none outline-none
                        placeholder-gray-400 leading-none flex items-center"
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {editingId && (
                <button
                  onClick={cancelEdit}
                  disabled={isSending}
                  className="px-3 h-11 flex items-center justify-center rounded-lg
                            border border-gray-300 text-gray-600 hover:bg-gray-100
                            transition-all text-sm font-medium"
                >
                  Cancel
                </button>
              )}

              <button
                onClick={sendMessage}
                disabled={isSending || !input.trim()}
                className={`flex items-center justify-center gap-2 px-4 h-11 rounded-lg
                  font-medium text-sm transition-all shadow-sm ${input.trim() && !isSending
                    ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Sending...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <SendHorizontal size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;