import { useState, useEffect } from "react";
import { Dropdown, Input, Modal, Button, Spin, message } from "antd";
import { Plus } from "lucide-react";
import { RiPieChart2Fill } from "react-icons/ri";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard,
} from "../../../api/services/boardService";

const LeadSide = ({ closeModal }) => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingBoard, setEditingBoard] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const res = await getBoards();
      setBoards(res.data);
    } catch (err) {
      console.error("❌ getBoards xatosi:", err);
      message.error("Boardlarni olishda xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBoard = async () => {
    if (!newName.trim()) return;
    try {
      const res = await createBoard(newName);
      setBoards((prev) => [...prev, res.data]);
      setNewName("");
      setAdding(false);
      message.success("Board muvaffaqiyatli yaratildi!");
    } catch (err) {
      console.error("❌ createBoard xatosi:", err);
      message.error("❌ Board yaratishda xatolik yuz berdi!");
    }
  };

  const handleDeleteBoard = (id) => {
    Modal.confirm({
      title: "Boardni o'chirishni xohlaysizmi?",
      okText: "Ha",
      cancelText: "Yo'q",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteBoard(id);
          setBoards((prev) => prev.filter((b) => b.id !== id));
          setDropdownOpenId(null);
          message.success("Board muvaffaqiyatli o'chirildi!");
        } catch (err) {
          console.error("❌ deleteBoard xatosi:", err);
          message.error("❌ Board o'chirishda xatolik yuz berdi!");
        }
      },
    });
  };

  const handleEditBoard = async (board) => {
    if (!board.name.trim()) return;
    try {
      const res = await updateBoard(board.id, { name: board.name });
      setBoards((prev) => prev.map((b) => (b.id === board.id ? res.data : b)));
      setEditingBoard(null);
      message.success("Board muvaffaqiyatli yangilandi!");
    } catch (err) {
      console.error("❌ updateBoard xatosi:", err);
      message.error("❌ Board yangilashda xatolik yuz berdi!");
    }
  };

  const handleBoardClick = (boardId) => {
    navigate(`/leads-right/${boardId}`);
    if (closeModal) closeModal(); // modalni yopish
  };

  const menuItems = (board) => [
    {
      key: "edit",
      label: (
        <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
          <EditOutlined />
          <span>Edit</span>
        </div>
      ),
      onClick: (info) => {
        info.domEvent.stopPropagation();
        setEditingBoard(board);
        setDropdownOpenId(null);
      },
    },
    {
      key: "delete",
      label: (
        <div className="flex items-center gap-2 cursor-pointer text-red-500 hover:text-red-700">
          <DeleteOutlined />
          <span>Delete</span>
        </div>
      ),
      onClick: (info) => {
        info.domEvent.stopPropagation();
        handleDeleteBoard(board.id);
      },
    },
  ];

  return (
    <div className="w-[300px] p-1">
      <div className="min-h-[640px] bg-[#F7F7F7] border border-gray-200 rounded-[16px] p-4 max-w-[320px] flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-[#0061FE] text-[16px] font-semibold flex gap-2 items-center">
            <RiPieChart2Fill size={20} /> Leads
          </h1>
          <div
            className="p-2 bg-[#0061FE] rounded-[8px] cursor-pointer hover:bg-[#3f7ee4] text-white"
            onClick={() => setAdding(true)}
          >
            <Plus size={20} />
          </div>
        </div>

        {/* Boards List */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : boards.length === 0 ? (
          <p className="text-gray-500">📭 Hali boardlar yo'q</p>
        ) : (
          boards.map((board) => (
            <div
              key={board.id}
              className="flex items-center justify-between pr-3 hover:bg-gray-100 rounded-md"
            >
              {/* Board name */}
              <span
                className="font-medium flex-1 cursor-pointer"
                onClick={() => handleBoardClick(board.id)}
              >
                {board.name}
              </span>

              {/* Dropdown */}
              <Dropdown
                menu={{ items: menuItems(board) }}
                trigger={["click"]}
                open={dropdownOpenId === board.id}
                onOpenChange={(open) =>
                  setDropdownOpenId(open ? board.id : null)
                }
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="cursor-pointer text-[25px] select-none"
                >
                  ...
                </div>
              </Dropdown>
            </div>
          ))
        )}

        {/* Add Board Modal */}
        <Modal
          title="Create New Board"
          open={adding}
          onCancel={() => setAdding(false)}
          centered
          style={{ borderRadius: "16px", maxWidth: "500px", width: "90%" }}
          footer={[
            <Button
              key="add"
              type="primary"
              onClick={handleAddBoard}
              style={{ width: "100px", height: "40px", borderRadius: "8px" }}
            >
              Create
            </Button>,
          ]}
        >
          <label className="block mb-2 text-[14px] text-[#7C7C7C] font-medium">
            Board name
          </label>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter board name"
            size="large"
            style={{ borderRadius: "8px", fontSize: "16px" }}
          />
        </Modal>

        {/* Edit Board Modal */}
        <Modal
          title="Edit Board"
          open={!!editingBoard}
          onCancel={() => setEditingBoard(null)}
          centered
          style={{ borderRadius: "16px", maxWidth: "500px", width: "90%" }}
          footer={[
            <Button
              key="save"
              type="primary"
              onClick={() => handleEditBoard(editingBoard)}
              style={{ width: "100px", height: "40px", borderRadius: "8px" }}
            >
              Save
            </Button>,
          ]}
        >
          <Input
            value={editingBoard?.name || ""}
            onChange={(e) =>
              setEditingBoard({ ...editingBoard, name: e.target.value })
            }
            size="large"
            style={{ borderRadius: "8px", fontSize: "16px" }}
          />
        </Modal>
      </div>
    </div>
  );
};

export default LeadSide;
