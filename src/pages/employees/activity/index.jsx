import React from "react";

const activity = [
  {
    id: 1,
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    fullname: "Murodil Nurmamatov",
    role: "Frontend Developer",
    positionRole: "Middle",
    tasks: "5",
    tasksInProgress: "3",
    tasksInReview: "2",
  },
  {
    id: 2,
    image: "https://randomuser.me/api/portraits/women/2.jpg",
    fullname: "Dilnoza Karimova",
    role: "UI/UX Designer",
    positionRole: "Senior",
    tasks: "8",
    tasksInProgress: "2",
    tasksInReview: "5",
  },
  {
    id: 3,
    image: "https://randomuser.me/api/portraits/men/3.jpg",
    fullname: "Javohir Asadov",
    role: "Backend Developer",
    positionRole: "Junior",
    tasks: "4",
    tasksInProgress: "1",
    tasksInReview: "1",
  },
  {
    id: 4,
    image: "https://randomuser.me/api/portraits/women/4.jpg",
    fullname: "Nodira Yusupova",
    role: "QA Engineer",
    positionRole: "Middle",
    tasks: "6",
    tasksInProgress: "3",
    tasksInReview: "2",
  },
  {
    id: 5,
    image: "https://randomuser.me/api/portraits/men/5.jpg",
    fullname: "Bekzod Toirov",
    role: "Mobile Developer",
    positionRole: "Senior",
    tasks: "10",
    tasksInProgress: "5",
    tasksInReview: "3",
  },
  {
    id: 6,
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    fullname: "Shahnoza Ermatova",
    role: "Project Manager",
    positionRole: "Senior",
    tasks: "12",
    tasksInProgress: "4",
    tasksInReview: "6",
  },
  {
    id: 7,
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    fullname: "Oybek Rasulov",
    role: "DevOps Engineer",
    positionRole: "Middle",
    tasks: "7",
    tasksInProgress: "2",
    tasksInReview: "3",
  },
  {
    id: 8,
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    fullname: "Gulbahor Maxmudova",
    role: "Data Analyst",
    positionRole: "Junior",
    tasks: "3",
    tasksInProgress: "2",
    tasksInReview: "1",
  },
  {
    id: 9,
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    fullname: "Sherzod Qodirov",
    role: "Full Stack Developer",
    positionRole: "Middle",
    tasks: "9",
    tasksInProgress: "6",
    tasksInReview: "2",
  },
  {
    id: 10,
    image: "https://randomuser.me/api/portraits/women/10.jpg",
    fullname: "Malika Islomova",
    role: "Scrum Master",
    positionRole: "Middle",
    tasks: "5",
    tasksInProgress: "1",
    tasksInReview: "4",
  },
];

const Activity = () => {
  return (
    <div className="w-full flex justify-center md:justify-start gap-[25px] items-center py-6 flex-wrap">
      {activity.map((user) => (
        <div
          key={user.id}
          className="md:w-[280px] w-full bg-white rounded-[24px] shadow-md px-[8px] pt-[10px] md:pb-[10px] pb-[25px] flex flex-col gap-[16px] justify-center items-center"
        >
          {/* User Info */}
          <div className="bg-[#EEEEEE] py-4 px-4 flex flex-col items-center gap-2 rounded-[24px] w-full">
            <img
              className="w-[50px] h-[50px] rounded-full object-cover"
              src={user.image}
              alt={user.fullname}
            />
            <h1 className="font-bold text-[16px] text-[#0A1629]">
              {user.fullname}
            </h1>
            <p className="font-[400] text-[14px] text-[#0A1629]">{user.role}</p>
            <span className="font-semibold text-[12px] text-[#7D8592] border border-[#7D8592] px-2 py-[2px] rounded-lg">
              {user.positionRole}
            </span>
          </div>

          {/* Task Stats */}
          <div className="w-full">
            <div className="flex items-center justify-between text-center w-full">
              <div>
                <p className="font-bold text-[26px] text-[#0A1629]">
                  {user.tasks}
                </p>
                <h3 className="text-[#91929E] text-[14px] font-[400]">
                  Backlog tasks
                </h3>
              </div>
              <div>
                <p className="font-bold text-[26px] text-[#0A1629]">
                  {user.tasksInProgress}
                </p>
                <h3 className="text-[#91929E] text-[14px] font-[400]">
                  Tasks In Progress
                </h3>
              </div>
              <div>
                <p className="font-bold text-[26px] text-[#0A1629]">
                  {user.tasksInReview}
                </p>
                <h3 className="text-[#91929E] text-[14px] font-[400]">
                  Tasks In Review
                </h3>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Activity;
