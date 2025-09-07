import { FileDownIcon,Upload  } from "lucide-react";
import { User, Filter, Users } from "lucide-react";
import { useRef } from "react";
import { useParams } from "react-router-dom";
import { uploadExcelFile, exportBoardData  } from "../../../api/services/boardService";
import toast from "react-hot-toast";

const LeadNavbar = ({ onImportSuccess }) => {
  const fileInputRef = useRef(null);
  const { boardId } = useParams();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // YANGI: Board export funksiyasi
  const handleExportBoard = async () => {
    if (!boardId) {
      toast.error('Board ID topilmadi!');
      return;
    }

    try {
      toast.loading('Board ma\'lumotlari export qilinmoqda...', { id: 'board-export-loading' });
      
      const response = await exportBoardData(boardId);
      
      // Faylni download qilish
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Fayl nomini yaratish
      const fileName = `board_${boardId}_export_${new Date().toISOString().slice(0, 10)}.xlsx`;

      // Download qilish
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss('board-export-loading');
      toast.success('Board ma\'lumotlari muvaffaqiyatli export qilindi!');

    } catch (error) {
      toast.dismiss('board-export-loading');
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Board export qilishda xatolik yuz berdi';
      
      toast.error(errorMessage);
      
      console.error("Board export error:", error);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Fayl turini tekshirish
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xlsx', '.xls', '.ods'
    ];
    
    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (!['xlsx', 'xls', '.ods'].includes(fileExtension)) {
      toast.error('Faqat Excel fayllarini (.xlsx, .xls, .ods) yuklash mumkin!');
      return;
    }

    if (!boardId) {
      toast.error('Board ID topilmadi!');
      return;
    }

    try {
      toast.loading('Fayl yuklanmoqda...', { id: 'upload-loading' });
      
      const result = await uploadExcelFile(boardId, file);
      
      toast.dismiss('upload-loading');
      
      // Server javobidagi message ni ko'rsatish
      if (result.message) {
        toast.success(result.message);
      } else {
        toast.success('Fayl muvaffaqiyatli yuklandi!');
      }

      // Agar callback berilgan bo'lsa, uni chaqirish (refresh uchun)
      if (onImportSuccess) {
        onImportSuccess(result);
      }

    } catch (error) {
      toast.dismiss('upload-loading');
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Fayl yuklashda xatolik yuz berdi';
      
      toast.error(errorMessage);
    } finally {
      // File input ni tozalash (bir xil faylni qayta yuklash mumkin bo'lishi uchun)
      event.target.value = '';
    }
  };


  return (
    <div className="p-4 md:p-8 flex flex-col md:flex-row items-center gap-2 md:gap-4 bg-white rounded-t-[8px]">
      <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-[8px] flex items-center justify-center gap-1 font-semibold transition-colors text-center">
        New Item
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <button className="w-full md:w-auto bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 px-4 py-2 rounded-[8px] flex items-center justify-center gap-1 font-medium transition-colors text-center">
        <User className="w-5 h-5" />
        Person
      </button>

      <button className="w-full md:w-auto bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 px-4 py-2 rounded-[8px] flex items-center justify-center gap-1 font-medium transition-colors text-center">
        <Filter className="w-5 h-5" />
        Filter
      </button>

      {/* Import button */}
      <button 
        onClick={handleImportClick}
        className="w-full md:w-auto bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 px-4 py-2 rounded-[8px] flex items-center justify-center gap-1 font-medium transition-colors text-center"
      >
        <FileDownIcon className="w-5 h-5" />
        Import
      </button>

        {/* Export button */}
        <button 
        onClick={handleExportBoard}
        className="w-full md:w-auto bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 px-4 py-2 rounded-[8px] flex items-center justify-center gap-1 font-medium transition-colors text-center"
      >
        <Upload className="w-5 h-5" />
        Export
      </button>

      {/*  Yashirin file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.ods,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default LeadNavbar;