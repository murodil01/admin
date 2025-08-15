import MainLead from "../../components/lead-parts/main-lead";
import LeadNavbar from "../../components/lead-parts/navbar-lead";

function Leads() {
  return (
    <div className="min-h-screen bg-white  border border-gray-200 rounded-[8px]">
      <LeadNavbar />
      <MainLead />
    </div>
  );
}

export default Leads;
