import { useState } from "react";
import api from "../../api/base";
import DepartmentCards from "./departments/Departments";
import ChiefOfficers from "./chief-officers/ChiefOfficers";
import logoM from "../../assets/logoM.png";
import iskandar from "../../assets/iskandar.jpg";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddMessageModal = ({ onClose }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/messenger/sos/", {
        name: reason,
        body: description,
      });

      // Success toast
      toast.success("SOS message sent successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setReason("");
      setDescription("");
      onClose();

    } catch (error) {
      console.error("Error sending SOS:", error.response?.data || error);

      // Error toast
      toast.error("There was an error sending the message.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="flex flex-col items-center gap-4 sm:gap-6 p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow-lg w-full max-w-md">
        <div className="w-full flex justify-between items-center">
          <b className="text-lg sm:text-xl md:text-2xl text-gray-800">
            Message Topic
          </b>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg sm:text-xl"
          >
            ✕
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-4 sm:gap-5"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700">
              Reason of Message
            </label>
            <input
              required
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder=""
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-gray-700">
              Message Box
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="This message goes directly to the Founder. Please use only when necessary."
              rows={4}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full sm:w-auto sm:min-w-[200px] mx-auto font-medium rounded-lg px-4 py-2 sm:px-5 sm:py-2.5 shadow transition text-sm sm:text-base
              ${loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-white hover:text-white hover:bg-blue-700 text-black"
              }`}
          >
            {loading ? "Sending..." : "Send Directly to Founder"}
          </button>
        </form>
      </div>
    </header>
  );
};

const Messenger = () => {
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("departments") || "list"
  );
  const [showModal, setShowModal] = useState(false);
  // Har bir card uchun alohida showMore state
  const [showMoreCompany, setShowMoreCompany] = useState(false);
  const [showMoreFounder, setShowMoreFounder] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("departments", tab);
  };

  return (
    <>
      <header className="flex flex-col gap-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Messenger</h2>
        </div>

        <div className="flex flex-col justify-center gap-6">
          <div className="flex flex-col items-center border rounded-2xl border-gray-200 bg-white gap-4 sm:gap-6 p-4 sm:p-6 shadow-sm w-full max-w-md mx-auto">
            <div className="w-full">
              <img
                src={logoM}
                alt="M company"
                className="w-full h-auto rounded-lg object-contain"
              />
            </div>
            <div className="flex flex-col gap-3 sm:gap-4 items-center text-center px-2 sm:px-4">
              <h5 className="text-xl sm:text-2xl font-bold text-gray-800">
                M Company
              </h5>
              <div>
                <blockquote className="text-xs sm:text-sm md:text-base text-left text-gray-600">
                  <span className="text-[20px] font-normal"></span>{" "}
                  {showMoreCompany ? (
                    <>
                      M Company is not just a workplace - it is a system. We build
                      automation, sales, and growth engines for businesses across
                      Uzbekistan. <br /> Our mission is clear: to become the #1
                      Sales, Marketing & Tech force in the country by combining
                      technology, talent, and strategy.
                      <br />
                      <br /> Our Philosophy.
                      <br />
                      <br /> We follow the vision of Abu Nasr Al-Farabi and his
                      idea of the Virtuous City - a society where every person
                      fulfills their role with excellence, and together they build
                      something greater than themselves. <br />
                      <br />
                      <span className="text-[16px] font-normal">
                        🔰
                      </span>
                      Every department has a clear purpose. <br />
                      <span className="text-[16px] font-normal">
                        🔰
                      </span>
                      Every member contributes to the whole. <br />
                      <span className="text-[16px]">
                        🔰
                      </span>
                      The company grows when each individual grows.
                      <br />
                      <br /> Here, you are not just "working" - you are part of
                      building the Perfect State of M. <br />
                      <br />
                      The Inner Circle.
                      <br /> It is the group where every member belongs - where
                      updates, decisions, and alignment happen.
                      <br />
                      <br />{" "}
                      <span className="text-[20px] font-normal not-italic">
                        🎯{" "}
                      </span>
                      All members must join this group.{" "}
                      <span
                        onClick={() => setShowMoreCompany(false)}
                        className="text-blue-600 hover:underline text-[16px] cursor-pointer"
                      >
                        Show Less
                      </span>
                    </>
                  ) : (
                    <>
                      M Company is not just a workplace — it is a system. We build
                      automation, sales, and growth engines for businesses across
                      Uzbekistan{" "}
                      <span
                        onClick={() => setShowMoreCompany(true)}
                        className="text-blue-600 text-[20px] cursor-pointer"
                      >
                        ....
                      </span>
                    </>
                  )}
                </blockquote>
              </div>

              <a
                href="https://t.me/+11Tug631E_40YTQy"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 sm:px-5 sm:py-2.5 mt-4 sm:mt-5 bg-[#0061fe] text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition w-full max-w-xs text-sm sm:text-base"
              >
                Join the Inner Circle
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center border rounded-2xl border-gray-200 bg-white gap-4 sm:gap-6 p-4 sm:p-6 shadow-sm w-full max-w-md mx-auto">
            <div className="flex-shrink-0">
              <img
                src={iskandar}
                alt="Hamrayev Iskandar"
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gray-100 object-cover shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-3 sm:gap-4 items-center text-center px-2 sm:px-4">
              <span className="flex flex-col items-center">
                <h6 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                  Founder
                </h6>
                <p className="text-sm sm:text-base text-gray-500">
                  Hamrayev Iskandar
                </p>
              </span>
              <p className="text-xs text-left sm:text-sm md:text-base text-gray-600 leading-relaxed">
                {showMoreFounder ? (
                  <>
                    Founder of M Company, Falco, and multiple other ventures.{" "}
                    <br />
                    <br />
                    🔰 Experience: 5+ years in Sales & Marketing. <br />
                    🔰 Achievements: Built and scaled multiple call centers and
                    high-performing teams. <br />
                    🔰Trained and led high-performing teams
                    <br />
                    <br />
                    Mission
                    <br />
                    <br /> My mission is to build Uzbekistan's most powerful
                    Automation Company, uniting Sales, Marketing, and Technology
                    into one system that transforms the way businesses grow.
                    <br />
                    <br /> Here, there are no "workers," only team members rowing
                    in the same boat. <br />
                    <br />
                    If we rise → We Rise Together. <br />
                    <br />
                    If we stumble → We Don't Fall, We Learn and Adapt. <br />
                    <br />
                    We may not all be equal in roles, but every role is vital and
                    irreplaceable. My responsibility as Founder is to lead with
                    justice and ensure fairness for every member of the team.{" "}
                    <br />
                    <br />
                    In a Virtuous City, leadership must remain accessible. If you
                    face a serious problem that cannot be solved by your
                    department, you may reach out directly.
                    <br />
                    <br />
                    "In this company, every person has a purpose. When each
                    fulfills their role with excellence, together we create
                    something far greater than ourselves." - H{" "}
                    <span
                      onClick={() => setShowMoreFounder(false)}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      Show Less
                    </span>
                  </>
                ) : (
                  <>
                    Founder of M Company, Falco, and multiple other ventures.{" "}
                    <br />
                    <br />
                    🔰 Experience: 5+ years in Sales & Marketing. <br />
                    🔰 Achievements: Built and scaled multiple call centers and
                    high-performing teams. <br />
                    🔰Trained and led high-performing teams
                    <br />
                    <br />
                    Mission
                    <br />
                    <br /> My mission is to build Uzbekistan's most powerful
                    Automation Company, uniting Sales, Marketing, and Technology
                    into one system that transforms the way businesses grow.{" "}
                    <span
                      onClick={() => setShowMoreFounder(true)}
                      className="text-blue-600 text-[20px] cursor-pointer"
                    >
                      ...
                    </span>
                  </>
                )}
              </p>

              <button
                onClick={() => setShowModal(true)}
                className="px-8 py-2 sm:px-10 sm:py-2.5 md:px-2 md:py-3 mt-4 sm:mt-5 bg-red-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:bg-red-500 transition w-full max-w-xs text-sm sm:text-base"
              >
                SOS - Contact Founder Directly
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-200 rounded-2xl sm:w-fit max-w-lg mx-auto flex flex-wrap justify-center gap-2 mt-4 sm:mt-6 md:mt-8">
          <button
            onClick={() => handleTabChange("list")}
            className={`rounded-full text-xs sm:text-sm md:text-base font-medium transition px-4 sm:px-6 md:px-8 py-2
              ${activeTab === "list"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 hover:text-blue-600"
              }`}
          >
            Departments
          </button>
          <button
            onClick={() => handleTabChange("chief")}
            className={`rounded-full text-xs sm:text-sm md:text-base font-medium transition px-4 sm:px-6 md:px-8 py-2
              ${activeTab === "chief"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 hover:text-blue-600"
              }`}
          >
            Chief Officers
          </button>
        </div>

        <div className="mt-4 sm:mt-6 w-full">
          {activeTab === "list" ? <DepartmentCards /> : <ChiefOfficers />}
        </div>

        {showModal && <AddMessageModal onClose={() => setShowModal(false)} />}
      </header>

      {/* ToastContainer - bu juda muhim! */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </>
  );
};

export default Messenger;

