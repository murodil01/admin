import MainLead from "../../../components/lead-parts/main-lead";
import LeadNavbar from "../../../components/lead-parts/navbar-lead";
// import Table from '../../../components/lead-parts/group-section/Table'
function LeadsRight() {
  const handleImportSuccess = (result) => {
    // Ma'lumotlarni qayta yuklash uchun MainLead componentiga signal berish
    // Bu yerda refresh funksiyasini chaqirish mumkin
    window.location.reload(); // Oddiy variant
    // yoki parent component orqali state yangilash
  };
  return (
    <div className=" border-gray-200 rounded-[8px]">
  <LeadNavbar onImportSuccess={handleImportSuccess} />
<MainLead />

    </div>
  );
}

export default LeadsRight;