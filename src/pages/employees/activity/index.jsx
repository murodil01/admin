import React from "react";

const Activity = () => {
  return (
    <div className="w-full">
      <div className="max-w-[265px] w-full bg-white rounded-[24px] shadow-md px-[8px] py-[10px] flex flex-col gap-[16px] justify-center items-center">
        <div className="bg-[#EEEEEE] py-4 px-19 flex flex-col items-center gap-2 rounded-[24px]">
          <img className="w-[50px] h-[50px] rounded-full" src="https://static.tildacdn.com/tild3632-3266-4861-b266-333339353539/image.png" alt="Image" />
          <h1 className="font-bold text-[16px] text-[#0A1629]">Shawn Stone</h1>
          <p className="font-[400] text-[14px] text-[#0A1629]">UI/UX Designer</p>
          <span className="font-semibold text-[12px] text-[#7D8592] border border-[#7D8592] p-[2px] rounded-lg">Middle</span>
        </div>

        <div className="">
          <div className="flex items-center justify-between text-center w-full">
            <div>
              <p className="font-bold text-[26px] text-[#0A1629]">0</p>
              <h3 className="text-[#91929E] text-[14px] font-[400]">Backlog tasks</h3>
            </div>
            <div>
              <p className="font-bold text-[26px] text-[#0A1629]">16</p>
              <h3 className="text-[#91929E] text-[14px] font-[400]">Tasks In Progress</h3>
            </div>
            <div>
              <p className="font-bold text-[26px] text-[#0A1629]">6</p>
              <h3>Tasks In Review</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;
