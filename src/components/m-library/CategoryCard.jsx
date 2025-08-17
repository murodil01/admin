import React, { useEffect, useState } from 'react';
import { MdMoreVert } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const CategoryCard = () => {
  const { id } = useParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get(`https://prototype-production-2b67.up.railway.app/library/folders/${id}/`);
        setFiles(res?.data?.files || []); 
      } catch (error) {
        console.error("Fayllarni yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [id]);

  return (
    <section className="p-4 bg-white rounded-lg shadow">
      <div className='flex justify-between items-center mb-4'>
        <h5 className='text-lg font-semibold text-gray-700'>
          Files in Folder {id}
        </h5>
        <button className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors'>
          Add file
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading files...</p>
      ) : files.length === 0 ? (
        <p className="text-gray-500">No files found.</p>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500">Created by: {file.created_by}</p>
              </div>
              <MdMoreVert className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CategoryCard;
