import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Paperclip } from 'lucide-react';

const CreateCategoryModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [categoryName, setCategoryName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setCategoryName(initialData.name || '');
      setImagePreview(initialData.image || null);
      setSelectedImage(null); 
    } else {
      setCategoryName('');
      setSelectedImage(null);
      setImagePreview(null);
    }
  }, [initialData, isOpen]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result);
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoryName.trim() || (!selectedImage && !imagePreview)) return;

    onSave({
      name: categoryName,
      file: selectedImage || null
    });

    handleClose();
  };

  const handleClose = () => {
    setCategoryName('');
    setSelectedImage(null);
    setImagePreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0D1B42]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">

        <div className="flex justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Edit Category' : 'Create New Category'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Category Name</label>
            <input
              required
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category name"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Category Image</label>
            {!imagePreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-gray-500 border border-gray-300 rounded-[14px] hover:bg-gray-50"
              >
                Upload image
                <Paperclip className="w-5 h-5" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-52 h-auto object-cover rounded-xl border"
                />
                <button
                  type="button"
                  className="text-red-500 text-sm"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!categoryName.trim() || !imagePreview}
            className="w-full py-3 bg-blue-600 text-white rounded-[14px] hover:bg-blue-700 disabled:opacity-50"
          >
            {initialData ? 'Update Category' : 'Add Category'}
          </button>
        </form>
      </div>
    </div>
  );
};

CreateCategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialData: PropTypes.object, 
};

export default CreateCategoryModal;
