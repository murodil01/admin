import React, { useEffect, useState } from 'react';
import { FaFire } from 'react-icons/fa';
import { FiPlus, FiTrash } from 'react-icons/fi';
import assigned from "../../assets/icons/assigned.svg";
import acknowledged from "../../assets/icons/acknowledged.svg";
import inProgress from "../../assets/icons/inProgress.svg";
import completedIcon from "../../assets/icons/completed.svg";
import inReview from "../../assets/icons/inReview.svg";
import rework from "../../assets/icons/rework.svg";
import dropped from "../../assets/icons/dropped.svg";
import approved from "../../assets/icons/approved.svg";
import descriptionIcon from "../../assets/icons/description.svg";
import comment from "../../assets/icons/comment.svg";
import checkList from "../../assets/icons/checklist.svg";
import { FiEdit } from 'react-icons/fi';
import clock from "../../assets/icons/clock.svg";
import dayjs from "dayjs";
import { DownloadOutlined } from "@ant-design/icons";
import pencil from "../../assets/icons/pencil.svg";

import { Modal, Input, Select, DatePicker, Upload, Button, Checkbox } from "antd";
import TextArea from "antd/es/input/TextArea";
import { motion } from 'framer-motion';

const NotionKanban = ({ cards, setCards }) => {

    return (
        <div className="flex gap-5 absolute top-0 right-0 left-0 pb-4 w-full overflow-x-auto hide-scrollbar">
            <Board cards={cards} setCards={setCards} />
        </div>
    );
};

const taskColumns = [
    { id: "assigned", title: "Assigned", color: "bg-[#DCE8FF]", icon: <img src={assigned} alt="" /> },
    { id: "acknowledged", title: "Acknowledged", color: "bg-[#D5F6D7]", icon: <img src={acknowledged} alt="" /> },
    { id: "inProgress", title: "In Progress", color: "bg-[#FAF6E1]", icon: <img src={inProgress} alt="" /> },
    { id: "completed", title: "Completed", color: "bg-[#F4EBF9]", icon: <img src={completedIcon} alt="" /> },
    { id: "inReview", title: "In Review", color: "bg-[#FFF0E0]", icon: <img src={inReview} alt="" /> },
    { id: "rework", title: "Rework", color: "bg-[#E2C7A9]", icon: <img src={rework} alt="" /> },
    { id: "dropped", title: "Dropped", color: "bg-[#FFDADA]", icon: <img src={dropped} alt="" /> },
    { id: "approved", title: "Approved", color: "bg-[#C2FFCF]", icon: <img src={approved} alt="" /> },
];

const DEFAULT_CARDS = [
    {
        id: "1",
        title: "UX sketches",
        time: "4d",
        assignee: { name: "John", avatar: "bg-red-500" },
        column: "assigned",
    },
    {
        id: "2",
        title: "Mind Map",
        time: "2d 4h",
        assignee: { name: "Mike", avatar: "bg-gray-800" },
        column: "acknowledged",
    },
    {
        id: "3",
        title: "Research reports",
        time: "2d",
        assignee: { name: "Sarah", avatar: "bg-yellow-600" },
        column: "inProgress",
    },
    {
        id: "4",
        title: "Research",
        time: "4d",
        assignee: { name: "Emma", avatar: "bg-red-500" },
        column: "completed",
    },
    {
        id: "5",
        title: "UX Login + Registration",
        time: "2d",
        assignee: { name: "John", avatar: "bg-red-500" },
        column: "inReview",
    },
    {
        id: "6",
        title: "Research reports (presentation for client)",
        time: "6h",
        assignee: { name: "Lisa", avatar: "bg-pink-500" },
        column: "rework",
    },
    {
        id: "7",
        title: "UI Login + Registration (+ other screens)",
        time: "1d 6h",
        assignee: { name: "John", avatar: "bg-red-500" },
        column: "dropped",
    },
];

const Board = ({ cards, setCards}) => {
    const [hasChecked, setHasChecked] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);

    const handleEdit = (card) => {
        setSelectedCard(card);
        setEditModalVisible(true);
    };

    const handleSaveEdit = (updatedCard) => {
        setCards((prev) =>
            prev.map((c) => {
                // Agar updatedCard.id yo‘q bo‘lsa, eski id ishlatiladi
                const targetId = updatedCard.id ?? c.id;
                return c.id === targetId
                    ? { ...updatedCard, id: targetId } // id doim saqlanadi
                    : c;
            })
        );
    };

    useEffect(() => {
        const cardData = localStorage.getItem("cards");
        try {
            setCards(cardData ? JSON.parse(cardData) : DEFAULT_CARDS);
        } catch (error) {
            console.error("❌ Error parsing localStorage 'cards':", error);
            setCards(DEFAULT_CARDS);
        }
        setHasChecked(true);
    }, []);

    useEffect(() => {
        if (hasChecked) {
            localStorage.setItem("cards", JSON.stringify(cards));
        }
    }, [cards, hasChecked]);

    return (
        <div className='flex h-full w-full gap-3 overflow-scroll items-start'>
            {taskColumns.map((col) => (
                <Column
                    key={col.id}
                    icon={col.icon}
                    title={col.title}
                    column={col.id}
                    backgroundColor={col.color}
                    cards={cards}
                    setCards={setCards}
                    onEdit={handleEdit}
                />
            ))}
            <BurnBarrel setCards={setCards} />

            {/* Edit Modal */}
            <EditCardModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                cardData={selectedCard}
                onUpdate={handleSaveEdit}
            />
        </div>
    );
};

const Column = ({ icon, title, backgroundColor, column, cards, setCards, onEdit }) => {
    const [active, setActive] = useState(false);

    const handleDragStart = (e, card) => {
        e.dataTransfer.setData("cardId", card.id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        highlightIndicator(e);
        setActive(true);
    };

    const highlightIndicator = (e) => {
        const indicators = getIndicators();
        clearHighlights(indicators);
        const el = getNearestIndicator(e, indicators);
        if (el?.element) el.element.style.opacity = "1";
    };

    const clearHighlights = (els) => {
        const indicators = els || getIndicators();
        indicators.forEach((i) => (i.style.opacity = "0"));
    };

    const getNearestIndicator = (e, indicators) => {
        const DISTANCE_OFFSET = 50;

        return indicators.reduce(
            (closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = e.clientY - (box.top + DISTANCE_OFFSET);

                if (offset < 0 && offset > closest.offset) {
                    return { offset, element: child };
                } else {
                    return closest;
                }
            },
            {
                offset: Number.NEGATIVE_INFINITY,
                element: indicators[indicators.length - 1],
            }
        );
    };

    const getIndicators = () =>
        Array.from(document.querySelectorAll(`[data-column="${column}"]`));

    const handleDragLeave = () => setActive(false);

    const handleDrop = (e) => {
        setActive(false);
        clearHighlights();

        const cardId = e.dataTransfer.getData("cardId");
        const indicators = getIndicators();
        const { element } = getNearestIndicator(e, indicators);
        const before = element?.dataset.before || "-1";

        if (before !== cardId) {
            let copy = [...cards];
            let cardToTransfer = copy.find((c) => c.id === cardId);
            if (!cardToTransfer) return;

            cardToTransfer = { ...cardToTransfer, column };
            copy = copy.filter((c) => c.id !== cardId);

            if (before === "-1") {
                copy.push(cardToTransfer);
            } else {
                const insertAt = copy.findIndex((c) => c.id === before);
                if (insertAt === -1) return;
                copy.splice(insertAt, 0, cardToTransfer);
            }

            setCards(copy);
        }
    };

    const filteredCards = cards.filter((c) => c.column === column);

    return (
        <div className={`max-w-[270px] min-w-[260px] sm:max-w-[270px]  rounded-xl p-4 ${backgroundColor} shadow-sm flex flex-col my-1`}>
            <div className='border-b border-gray-300 pb-2 mb-3 z-10 flex items-center gap-2'>
                <span>{icon}</span>
                <h3 className={`font-semibold text-lg text-gray-800`}>{title}</h3>
                <span className='rounded text-sm text-black'>{filteredCards.length}</span>
            </div>
            <AddCard column={column} setCards={setCards} />
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full transition-colors ${active ? "bg-neutral-800/50 border-dashed" : "bg-neutral-800/0"}`}>
                {filteredCards.map((c) => (
                    <Card
                        key={c.id}
                        {...c}
                        handleDragStart={handleDragStart}
                        onEdit={onEdit}
                        image={c.image}
                        />
                ))}
                <DropIndicator beforeId="-1" column={column} />
            </div>
        </div>
    );
};

const Card = ({ title, id, column, time, description, checklistProgress, handleDragStart, onEdit, image }) => {
    const [hovered, setHovered] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [selectedCard, setSelectedCard] = useState(null);

    // "Got it" modal ochilganda card ma'lumotlarini saqlash
    const openViewModal = (card) => {
        setSelectedCard(card);
        setIsModalOpen(true);
    };

    // Edit qilishni saqlash
    const handleUpdateCard = (updatedCard) => {
        console.log("Updated card: ", updatedCard);
        // bu yerda serverga yoki local state'ga saqlash kodini yozasan
        setIsEditModalOpen(false);
    };
    const [comments, setComments] = useState([
        {
            // name: "Botirov Shaxobiddin",
            // text: "We need to design and develop a responsive user profile page for the web application."
        }
    ]);
    const [newComment, setNewComment] = useState("");
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        if (!image) return;

        // Agar File obyekt bo‘lsa
        if (image instanceof File) {
            const url = URL.createObjectURL(image);
            setImageUrl(url);

            // Cleanup qilish — memory leak oldini olish
            return () => {
                URL.revokeObjectURL(url);
            };
        }

        // Agar string bo‘lsa (URL yoki base64)
        setImageUrl(image);
    }, [image]);

    const handleAddComment = () => {
        if (!newComment.trim()) return; // bo‘sh comment qo‘shmaslik

        const updatedComments = [
            ...comments,
            { name: "Botirov Shaxobiddin", text: newComment }
        ];
        setComments(updatedComments);
        setNewComment(""); // inputni tozalash
    };

    return (
        <>
            <DropIndicator beforeId={id} column={column}/>
            <motion.div
                layout
                layoutId={id}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, { title, id, column })}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="cursor-grab rounded-lg bg-white p-3 shadow-sm active:cursor-grabbing border border-gray-100 hover:shadow-md transition relative"
            >
                {/* Edit Icon */}
                {hovered && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit({ id, title, time, description, column });
                        }}
                        className="absolute top-2 right-2 p-1 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                    >
                        <FiEdit className="text-gray-600" />
                    </button>
                )}

                {/* Agar image mavjud bo'lsa */}
                {imageUrl && (
                    <div className="w-[100px] h-[100px] rounded overflow-hidden">
                        <img
                            src={typeof imageUrl === "string" ? imageUrl : URL.createObjectURL(imageUrl)}
                            alt="card"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Title */}
                <button
                    className="text-sm font-semibold text-gray-900 mb-3 cursor-pointer"
                    onClick={() => setIsModalOpen(true)}
                >
                    {title}
                </button>

                <Modal
                    title={`Column ${title}`}
                    open={isModalOpen}
                    onOk={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                    okText="Got it"
                    cancelText="Edit"
                    width={1000}
                    style={{
                        top: 30 // px qiymati, modal yuqoriga yaqinlashadi
                      }}
                    footer={
                        [
                        <Button
                            key="edit"
                            onClick={() => {
                                setIsModalOpen(false); // eski modal yopiladi
                                setIsEditModalOpen(true); // edit modal ochiladi
                            }}
                            style={{borderRadius:'14px', padding: '18px 16px', fontSize: '14px', fontWeight: 'bolder'}}
                        >
                            <span className="text-gray-500">Edit</span>{" "}
                            <img src={pencil} className="w-[14px]" alt="pencil" />
                        </Button>,
                        <Button key="gotit" type="primary"
                         style={{
                            borderRadius:'14px', padding: '18px 24px', fontSize: '14px', fontWeight: 'bolder'

                            
                          }} onClick={() => setIsModalOpen(false)}>
                            Got it
                        </Button>
                    ]}
                >
                    <div className="grid grid-cols-1 md:grid-cols-10 gap-6 md:gap-10">
                        {/* Left section */}
                        <div className="md:col-span-6 space-y-6">
                            {/* Top section */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="w-full sm:w-[140px] h-[140px] bg-gray-200 flex items-center justify-center rounded">
                                    <span role="img" aria-label="image" className="text-4xl">🖼️</span>
                                </div>
                                <div className="flex-1 text-sm text-gray-700 leading-6">
                                    We need to design and develop a responsive user profile page for the
                                    web application. This page will display key user information including
                                    avatar, full name, email address, phone number, and account status.
                                    The layout should follow our current design system and ensure
                                    consistency with other pages. The page must support both view and edit
                                    modes.
                                </div>
                            </div>

                            {/* Files */}
                            <div>
                                <h4 className="font-semibold text-sm mb-3">Files</h4>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { name: "Design_Document.pdf", url: "/files/Design_Document.pdf" },
                                        { name: "User_Guide.docx", url: "/files/User_Guide.docx" },
                                        { name: "Wireframe.png", url: "/files/Wireframe.png" },
                                        { name: "API_Specs.txt", url: "/files/API_Specs.txt" }
                                    ].map((file, i) => (
                                        <a
                                            key={i}
                                            href={file.url}
                                            download
                                            className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition"
                                        >
                                            <DownloadOutlined />
                                            {file.name}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Checklist */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-sm">Check list</h4>
                                    <span className="text-xs text-gray-500">Show</span>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-2 w-full border p-2 rounded-md border-gray-200 justify-between">
                                        <span className="line-through">All documentation is attached</span>
                                        <Checkbox defaultChecked />
                                    </label>
                                    <label className="flex items-center gap-2 w-full border p-2 rounded-md border-gray-200 justify-between">
                                        <span>User instructions are included</span>
                                        <Checkbox />
                                    </label>
                                </div>
                            </div>

                            {/* Comments */}
                            <div>
                                <h4 className="font-semibold text-sm mb-3">Comments</h4>
                                <div className='p-4 bg-blue-50 rounded-xl'>
                                {comments.map((c, i) => (
                                    <div key={i} className="rounded-lg bg-blue-50 mb-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                                                👤
                                            </div>
                                            <span className="text-sm">Ibrohim</span>
                                        </div>
                                        <div>
                                            <div className='bg-white p-1 rounded-sm'><p className="text-sm  text-gray-700">salom}</p></div>
                                      
                                        </div>
                                    </div>
                                ))}

                                {/* Add new comment */}
                                <div className="mt-3 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add a comment"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="flex-1 border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none"
                                    />
                                    <button
                                        onClick={handleAddComment}
                                        className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-600"
                                    >
                                        ➤
                                    </button>
                                </div>
                                </div>
                            </div>
                        </div>

                        {/* Right section */}
                        <div className="md:col-span-4 space-y-4 text-sm">
                            <div>
                                <p className="text-gray-400">Assigned by</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                        👤
                                    </div>
                                    <span>Botirov Shaxobiddin</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-400">Assignee</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                        👤
                                    </div>
                                    <span>Botirov Shaxobiddin</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-400">Date</p>
                                <p className="mt-1">16 March</p>
                            </div>

                            <div>
                                <p className="text-gray-400">Notification</p>
                                <p className="mt-1">On</p>
                            </div>

                            <div>
                                <p className="text-gray-400">Status</p>
                                <p className="mt-1">In progress</p>
                            </div>

                            <div>
                                <p className="text-gray-400">Type</p>
                                <p className="mt-1">Service work</p>
                            </div>
                        </div>
                    </div>
                </Modal>

                <EditCardModal
                    visible={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    cardData={selectedCard}
                    onUpdate={handleUpdateCard}
                    assignees={[
                        { value: "user1", label: "Botirov Shaxobiddin" },
                        { value: "user2", label: "John Doe" },
                    ]}
                />

                {/* Bottom Row */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                    {/* Deadline */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
                        <img src={clock} alt="" />
                        <span>{time || "No due date"}</span>
                    </div>

                    {
                        description && (
                            <div>
                                <img src={descriptionIcon} alt="" />
                            </div>
                        )
                    }
                    <div>
                        <img src={comment} alt="" />
                    </div>

                    {/* Right Side: Avatar + Checklist */}
                    <div className="flex items-center gap-2">
                        {checklistProgress && (
                            <span className="bg-[#64C064] text-white text-[11px] px-2 py-0.5 rounded flex items-center gap-1">
                                <img src={checkList} alt="" />
                                {checklistProgress}
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    );
};

const DropIndicator = ({ beforeId, column }) => (
    <div
        data-before={beforeId || "-1"}
        data-column={column}
        className='my-0.5 h-0.5 w-full bg-violet-400 opacity-0'
    />
);

const BurnBarrel = ({ setCards }) => {
    const [active, setActive] = useState(false);

    const handleDrop = (e) => {
        const cardId = e.dataTransfer.getData("cardId");
        setCards((prev) => prev.filter((c) => c.id !== cardId));
        setActive(false);
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={(e) => {
                e.preventDefault();
                setActive(true);
            }}
            onDragLeave={() => setActive(false)}
            className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl
                ${active
                    ? "border-red-800 bg-red-800/20 text-red-500"
                    : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
                }`}
        >
            {active ? <FaFire className='animate-bounce' /> : <FiTrash />}
        </div>
    );
};

const AddCard = ({ column, setCards }) => {
    const [text, setText] = useState("");
    const [adding, setAdding] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        const newCard = {
            column,
            title: text.trim(),
            id: Math.random().toString(),
            time: "",
            assignee: null,
        };

        setCards((prev) => [...prev, newCard]);
        setText("");
        setAdding(false);
    };

    return adding ? (
        <motion.form layout onSubmit={handleSubmit}>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
                placeholder='Add new task...'
                className='w-full rounded border border-violet-400 bg-white p-3 text-sm text-gray-700 placeholder-violet-300 focus:outline-0'
            />
            <div className='mt-1.5 flex items-center justify-end gap-1.5'>
                <button
                    type='button'
                    onClick={() => setAdding(false)}
                    className='px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-50'>
                    Close
                </button>
                <button
                    type='submit'
                    className='flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 hover:text-neutral-300'>
                    <span>Add</span>
                    <FiPlus />
                </button>
            </div>
        </motion.form>
    ) : (
        <motion.button
            layout
            onClick={() => setAdding(true)}
            className='flex w-full items-center gap-1.5 p-2 text-xs text-black font-semibold hover:bg-gray-400 hover:rounded cursor-pointer'>
            <FiPlus />
            <span>Add a card</span>
        </motion.button>
    );
};

const EditCardModal = ({
    visible,
    onClose,
    cardData,
    onUpdate,
    assignees,
    }) => {
    const [title, setTitle] = React.useState(cardData?.title || "");
    const [type, setType] = React.useState(cardData?.type || "");
    const [date, setDate] = React.useState(cardData?.date || "");
    const [notification, setNotification] = React.useState(cardData?.notification || "Off");
    const [selectedAssignee, setSelectedAssignee] = React.useState(cardData?.assignee || null);
    const [description, setDescription] = React.useState(cardData?.description || "");
    const [tags, setTags] = React.useState(cardData?.tags || []);
    const [files, setFiles] = React.useState(cardData?.files || []);
    const [checklist, setChecklist] = React.useState(cardData?.checklist || []);

    React.useEffect(() => {
        if (visible && cardData) {
            setTitle(cardData.title ?? "");
            setType(cardData.type ?? "");
            setDate(cardData.date ? dayjs(cardData.date) : null); // dayjs format
            setNotification(cardData.notification ?? "Off");
            setSelectedAssignee(cardData.assignee ?? null);
            setDescription(cardData.description ?? "");
            setTags(Array.isArray(cardData.tags) ? cardData.tags : []);
            setFiles(Array.isArray(cardData.files) ? cardData.files : []);
            setChecklist(Array.isArray(cardData.checklist) ? cardData.checklist : []);
        }
    }, [cardData, visible]);


    const tagOptions = [
        "service work",
        "training",
        "learning",
        "recruitment",
        "client support",
        "design",
        "planning",
        "event/PR",
        "maintenance",
        "blureaucracy",
        "R&D/Innovation",
        "internal systems",
        "marketing & sales",
    ];

    const toggleTag = (tag) => {
        setTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const toggleCheckDone = (index) => {
        setChecklist((prev) =>
            prev.map((c, i) => (i === index ? { ...c, done: !c.done } : c))
        );
    };

    const updateCheckText = (index, text) => {
        setChecklist((prev) =>
            prev.map((c, i) => (i === index ? { ...c, text } : c))
        );
    };

    const addCheckItem = () => {
        setChecklist((prev) => [...prev, { text: "", done: false }]);
    };

    const handleSave = () => {
        const updatedCard = {
            ...cardData,
            title,
            type,
            date,
            notification,
            assignee: selectedAssignee,
            description,
            tags,
            files,
            checklist
        };
        onUpdate(updatedCard);
        onClose();
    };

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            centered
            width={1000}
            title={<h2 className="px-10 text-2xl font-semibold text-[#1F2937]">Edit Card</h2>}
            bodyStyle={{ padding: 0 }}
        >
            <div className="px-6 sm:px-10 py-8">
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
                    {/* LEFT SIDE */}
                    <div className="xl:col-span-3 space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm text-gray-700 mb-2 font-bold">Column title</label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Type</label>
                            <Select
                                className="w-full"
                                value={type}
                                onChange={setType}
                                options={[
                                    { value: "assigned", label: "Assigned" },
                                    { value: "acknowledged", label: "Acknowledged" },
                                    { value: "inProgress", label: "In Progress" },
                                    { value: "completed", label: "Completed" },
                                    { value: "inReview", label: "In Review" },
                                    { value: "rework", label: "Rework" },
                                    { value: "dropped", label: "Dropped" },
                                    { value: "approved", label: "Approved" },
                                ]}
                            />
                        </div>

                        {/* Time, Notification, Assignee */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                            <div>
                                <label className="block text-sm text-gray-700 mb-2">Due time</label>
                                <DatePicker
                                    className="w-full"
                                    value={date ? dayjs(date) : null}
                                    onChange={(_, dateStr) => setDate(dateStr)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-2">Notification</label>
                                <Select
                                    value={notification}
                                    onChange={setNotification}
                                    options={[
                                        { value: "On", label: "On" },
                                        { value: "Off", label: "Off" },
                                    ]}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm text-gray-700 mb-2">Assignee</label>
                                <Select
                                    showSearch
                                    placeholder="Change assignee"
                                    optionFilterProp="label"
                                    value={selectedAssignee}
                                    onChange={setSelectedAssignee}
                                    options={assignees}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Description</label>
                            <TextArea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2 font-bold">Task tags</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {tagOptions.map((tag) => (
                                    <label key={tag} className="flex items-center gap-2 text-[12px] cursor-pointer capitalize font-semi-bold text-gray-400">
                                        <input
                                            type="checkbox"
                                            checked={tags.includes(tag)}
                                            onChange={() =>
                                                setTags((prev) =>
                                                    prev.includes(tag)
                                                        ? prev.filter((t) => t !== tag)
                                                        : [...prev, tag]
                                                )
                                            }
                                        />
                                        {tag}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="xl:col-span-2 space-y-6">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Image</label>
                            <Upload
                                defaultFileList={files.map((f, idx) => ({
                                    uid: idx,
                                    name: f.name || `file-${idx}`,
                                    status: 'done',
                                    url: f.url || '', // agar serverdan URL kelgan bo‘lsa
                                }))}
                                showUploadList={true}
                                beforeUpload={(file) => {
                                    setFiles(prev => [...prev, file]);
                                    return false;
                                }}
                            >
                                <Button>Change image</Button>
                            </Upload>

                        </div>

                        {/* Files */}
                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Files</label>
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                    <Input value={file.name} disabled className="flex-1" />
                                    <FiTrash
                                        className="text-gray-500 cursor-pointer hover:text-red-500"
                                        onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                                    />
                                </div>
                            ))}
                            <Upload
                                multiple
                                showUploadList={false}
                                beforeUpload={(file) => {
                                    setFiles((prev) => [...prev, file]);
                                    return false;
                                }}
                            >
                                <button className="text-blue-600 text-sm">+ add file</button>
                            </Upload>
                        </div>

                        {/* Checklist */}
                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Check list</label>
                            {checklist.map((check, index) => (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                    <input
                                        type="checkbox"
                                        checked={check.done}
                                        onChange={() => toggleCheckDone(index)}
                                    />
                                    <Input
                                        value={check.text}
                                        onChange={(e) => updateCheckText(index, e.target.value)}
                                        className="flex-1"
                                    />
                                    <FiTrash
                                        className="text-gray-500 cursor-pointer hover:text-red-500"
                                        onClick={() => setChecklist((prev) => prev.filter((_, i) => i !== index))}
                                    />
                                </div>
                            ))}
                            <button onClick={addCheckItem} className="text-blue-600 text-sm">+ add new check</button>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-5 pt-10">
                            <Button onClick={onClose}>Cancel</Button>
                            <Button onClick={handleSave} type="primary">Save</Button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default NotionKanban;