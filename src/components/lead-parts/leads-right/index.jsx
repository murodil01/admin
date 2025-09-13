import { useState } from "react";
import MainLead from "../../../components/lead-parts/main-lead";
import LeadNavbar from "../../../components/lead-parts/navbar-lead";
// import Table from '../../../components/lead-parts/group-section/Table'
function LeadsRight() {
  // Filter states
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [filterBy, setFilterBy] = useState({
    status: null,
    owner: null,
    source: null,
    dateRange: null
  });
  const handleImportSuccess = (result) => {
    // Ma'lumotlarni qayta yuklash uchun MainLead componentiga signal berish
    // Bu yerda refresh funksiyasini chaqirish mumkin
    window.location.reload(); // Oddiy variant
    // yoki parent component orqali state yangilash
  };

   // Active filters count
   const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (filterBy.status) count++;
    if (filterBy.owner) count++;
    if (filterBy.source) count++;
    if (filterBy.dateRange?.start || filterBy.dateRange?.end) count++;
    // if (selectedPersonId) count++;
    return count;
  };

  // Toggle functions
  const handleToggleFilter = () => {
    setShowFilterPanel(!showFilterPanel);
    setShowSearchPanel(false); // Boshqa panelni yopish
  };

  const handleToggleSearch = () => {
    setShowSearchPanel(!showSearchPanel);
    setShowFilterPanel(false); // Boshqa panelni yopish
  };
  // Person select handler
const handlePersonSelect = (person) => {
  setSelectedPersonId(person ? person.id : null);
};

  return (
    <div className="border-gray-200 rounded-[8px]">
      <LeadNavbar 
        onImportSuccess={handleImportSuccess} 
        onToggleFilter={handleToggleFilter}
        activeFiltersCount={getActiveFiltersCount()}
        onToggleSearch={handleToggleSearch}
        searchQuery={searchQuery}
        onPersonSelect={handlePersonSelect}
        selectedPersonId={selectedPersonId}
      />
      
      <MainLead 
        // Filter props
        showFilterPanel={showFilterPanel}
        setShowFilterPanel={setShowFilterPanel}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        showSearchPanel={showSearchPanel}
        setShowSearchPanel={setShowSearchPanel}
        selectedPersonId={selectedPersonId}
        setSelectedPersonId={setSelectedPersonId}
      />
    </div>
  );
}

export default LeadsRight;