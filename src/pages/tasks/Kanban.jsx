import React, { useEffect, useState } from 'react';
import { FaFire } from 'react-icons/fa';
import { FiPlus, FiTrash } from 'react-icons/fi';
import { motion } from "framer-motion";
import assigned from "../../assets/icons/assigned.svg"
import acknowledged from "../../assets/icons/acknowledged.svg"
import inProgress from "../../assets/icons/inProgress.svg"
import completedIcon from "../../assets/icons/completed.svg"
import inReview from "../../assets/icons/inReview.svg"
import rework from "../../assets/icons/rework.svg"
import dropped from "../../assets/icons/dropped.svg"
import approved from "../../assets/icons/approved.svg"

const NotionKanban = () => {
    return (
        <div className='flex gap-5 sm:min-w-0 absolute top-0 right-0 left-0 pb-4 w-full overflow-x-auto'>
            <Board />
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

const Board = () => {
    const [cards, setCards] = useState([]);
    const [hasChecked, setHasChecked] = useState(false);

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
    console.log(localStorage.getItem("cards"));

    useEffect(() => {
        if (hasChecked) {
            localStorage.setItem("cards", JSON.stringify(cards));
        }
    }, [cards, hasChecked]);

    return (
        <div className='flex h-full w-full gap-3 overflow-scroll'>
            {taskColumns.map((col) => (
                <Column
                    key={col.id}
                    icon={col.icon}
                    title={col.title}
                    column={col.id}
                    backgroundColor={col.color}
                    cards={cards}
                    setCards={setCards}
                />
            ))}
            <BurnBarrel setCards={setCards} />
        </div>
    );
};

const Column = ({ icon, title, backgroundColor, column, cards, setCards }) => {
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
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`h-full w-full transition-colors ${active ? "bg-neutral-800/50 border-dashed" : "bg-neutral-800/0"}`}>
                {filteredCards.map((c) => (
                    <Card key={c.id} {...c} handleDragStart={handleDragStart} />
                ))}
                <DropIndicator beforeId="-1" column={column} />
                <AddCard column={column} setCards={setCards} />
            </div>
        </div>
    );
};

const Card = ({ title, id, column, handleDragStart }) => (
    <>
        <DropIndicator beforeId={id} column={column} />
        <motion.div
            layout
            layoutId={id}
            draggable="true"
            onDragStart={(e) => handleDragStart(e, { title, id, column })}
            className='cursor-grab rounded bg-white p-3 active:cursor-grabbing'>
            <p className='text-sm text-black'>{title}</p>
        </motion.div>
    </>
);

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

export default NotionKanban;