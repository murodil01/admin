import { useState } from "react";
import axios from "axios";
import DepartmentCards from "./departments/Departments";
import ChiefOfficers from "./chief-officers/ChiefOfficers";
import Logo from "../../assets/mbc.jpg";

const AddMessageModal = ({ onClose }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        "https://prototype-production-2b67.up.railway.app/messenger/sos/",
        {
          name: reason,
          body: description,
        }
      );
      alert("SOS xabari muvaffaqiyatli yuborildi!");
      setReason("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("SOS yuborishda xatolik:", error.response?.data || error);
      alert("Xabar yuborishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="flex flex-col items-center gap-4 sm:gap-6 p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow-lg w-full max-w-md">
        <div className="w-full flex justify-between items-center">
          <b className="text-lg sm:text-xl md:text-2xl text-gray-800">Add Message</b>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg sm:text-xl"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 sm:gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700">
              Reason of Message
            </label>
            <input
              required
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="M tech"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add some description of the event"
              rows={4}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full sm:w-auto sm:min-w-[200px] ml-auto font-medium rounded-lg px-4 py-2 sm:px-5 sm:py-2.5 shadow transition text-sm sm:text-base
              ${loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-white hover:text-white hover:bg-blue-700 text-black"
              }`}
          >
            {loading ? "Sending..." : "Send SOS Message"}
          </button>
        </form>
      </div>
    </div>
  );
};
const Messenger = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("departments") || "list");
  const [showModal, setShowModal] = useState(false);
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("departments", tab);
  };
  return (
    <div className="flex flex-col gap-6 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Messenger</h2>
      </div>
      <div className="flex flex-col justify-center gap-6">
        <div className="flex flex-col items-center border rounded-2xl border-gray-200 bg-white gap-4 sm:gap-6 p-4 sm:p-6 shadow-sm w-full max-w-md mx-auto">
          <div className="w-full">
            <img src={Logo} alt="M company" className="w-full h-auto rounded-lg object-cover" />
          </div>
          <div className="flex flex-col gap-3 sm:gap-4 items-center text-center px-2 sm:px-4">
            <h5 className="text-xl sm:text-2xl font-bold text-gray-800">M Company Info</h5>
            <blockquote className="italic text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed line-clamp-4">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
            </blockquote>
            <a
              href="https://t.me/frontend_25"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 sm:px-5 sm:py-2.5 mt-4 sm:mt-5 bg-[#0061fe] text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition w-full max-w-xs text-sm sm:text-base"
            >
              Join Telegram Channel
            </a>
          </div>
        </div>
        <div className="flex flex-col items-center border rounded-2xl border-gray-200 bg-white gap-4 sm:gap-6 p-4 sm:p-6 shadow-sm w-full max-w-md mx-auto">
          <div className="flex-shrink-0">
            <img
              src="https://t3.ftcdn.net/jpg/02/43/12/34/360_F_243123463_zTooub557xEWABDLk0jJklDyLSGl2jrr.jpg"
              alt="Axrorov Bobirxo'ja"
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gray-100 object-cover shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-3 sm:gap-4 items-center text-center px-2 sm:px-4">
            <span className="flex flex-col items-center">
              <h6 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                Axrorov Bobirxo'ja
              </h6>
              <p className="text-sm sm:text-base text-gray-500">Founder</p>
            </span>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed line-clamp-4">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-2 sm:px-10 sm:py-2.5 md:px-12 md:py-3 mt-4 sm:mt-5 bg-[#0061fe] text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition w-full max-w-xs text-sm sm:text-base"
            >
              SOS
            </button>
          </div>
        </div>
      </div>

     <div className="bg-gray-200 rounded-2xl  sm:w-fit max-w-lg mx-auto flex flex-wrap justify-center gap-2 mt-4 sm:mt-6 md:mt-8">
  <button
    onClick={() => handleTabChange("list")}
    className={`rounded-full text-xs sm:text-sm md:text-base font-medium transition px-4 sm:px-6 md:px-8 py-2
      ${activeTab === "list" ? "bg-blue-600 text-white shadow-md" : "text-gray-700 hover:text-blue-600"}`}
  >
    Departments
  </button>
  <button
    onClick={() => handleTabChange("chief")}
    className={`rounded-full text-xs sm:text-sm md:text-base font-medium transition px-4 sm:px-6 md:px-8 py-2
      ${activeTab === "chief" ? "bg-blue-600 text-white shadow-md" : "text-gray-700 hover:text-blue-600"}`}
  >
    Chief Officers
  </button>
</div>


      <div className="mt-4 sm:mt-6 w-full">
        {activeTab === "list" ? <DepartmentCards /> : <ChiefOfficers />}
      </div>
      {showModal && <AddMessageModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Messenger;