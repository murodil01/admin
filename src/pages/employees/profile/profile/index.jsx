import { Upload, Button } from "antd";
import { Download } from "lucide-react";

const Profiles = () => {
  return (
    <div className="w-full bg-white shadow rounded-[24px] py-10 px-6 md:px-10 mt-9">
      <h1 className="font-bold text-[18px] text-[#0061fe] mb-6">
        Control Data
      </h1>

      <div className="flex flex-col gap-6">
        {/* 3 Rows */}
        {[
          ["Acceptance Reason", "Expertise Level"],
          ["Strengths", "Weaknesses"],
          ["Biography Summary info", "Trial Period"],
          ["Work Hours", "Contract Type"],
          ["Assigned Device(s)/Tools", "Access Level"],
        ].map((row, idx) => (
          <div
            key={idx}
            className="flex flex-col md:flex-row gap-6 justify-between"
          >
            {row.map((label) => (
              <div key={label} className="flex flex-col w-full">
                <label className="text-[#7D8592] font-bold text-sm mb-1">
                  {label}:
                </label>
                <textarea
                  className="w-full h-[94px] rounded-[14px] border border-[#D8E0F0] px-4 pt-4 text-sm text-gray-800 resize-none placeholder:text-start placeholder:text-gray-400 focus:outline-none focus:border-[#D8E0F0]"
                  placeholder="(Skills, Loyalty, Opportunity, fit, etc.)"
                />
              </div>
            ))}
          </div>
        ))}

        {/* Passport Section */}
        <div>
          <h1 className="font-bold text-[18px] text-[#0061fe] mb-6">
            Passport Detail
          </h1>

          <div className="flex flex-col md:flex-row gap-6 mb-4">
            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm text-[#7D8592] font-bold">
                Serial Number
              </label>
              <input
                type="text"
                placeholder="AD1114567"
                className="px-4 border border-[#D8E0F0] h-[48px] rounded-[14px] w-full focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm text-[#7D8592] font-bold">PINFL</label>
              <input
                type="text"
                placeholder="45245875495734"
                className="px-4 border border-[#D8E0F0] h-[48px] rounded-[14px] w-full focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 text-center">
            <label className="text-sm text-[#7D8592] font-bold">
              Photo / File
            </label>
            <Upload>
              <Button
                type="primary"
                icon={<Download />}
                style={{
                  background: "#0061fe",
                  borderRadius: "14px",
                  padding: "20px 57px",
                  border: "none",
                  fontSize: "18px",
                  fontWeight: "500",
                }}
              >
                Download
              </Button>
            </Upload>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profiles;
