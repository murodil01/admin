import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { X, Paperclip, Image as ImageIcon } from 'lucide-react';

const CreateCategoryModal = ({ isOpen, onClose, onCreateCategory }) => {
  const [categoryName, setCategoryName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (categoryName.trim() && selectedImage) {
      onCreateCategory(categoryName, selectedImage);
      setCategoryName('');
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handleClose = () => {
    setCategoryName('');
    setSelectedImage(null);
    setImagePreview(null);
    onClose();
  };

  const isFormValid = categoryName.trim() !== '' && selectedImage !== null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0D1B42]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-7 pb-5">
          <h2 className="text-xl font-semibold text-gray-900">Create New Category</h2>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-7 pb-16">
          {/* Category Name */}
          <div className="flex max-sm:block items-center mb-6">
            <label className="block w-36 max-w-full text-sm font-bold text-gray-600 max-sm:mb-3">
              Category name
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="max-w-full max-sm:w-full flex-1 px-4 py-3 max-sm:py-2 border border-gray-300 rounded-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter category name"
            />
          </div>

          {/* Category Image */}
          <div className="flex max-sm:block items-center mb-8">
            <label className="block w-36 text-sm font-bold text-gray-600 max-sm:mb-3">
              Category Image
            </label>

            {!selectedImage ? (
              <div className="flex items-center w-full">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-1 max-sm:w-full justify-between items-center ml-8 max-sm:ml-0 gap-3 px-4 py-3 max-sm:py-2 text-gray-500 hover:text-gray-600 bg-white border border-gray-300 rounded-[14px] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  Upload image
                  <Paperclip className="w-5 h-5"/>
                </button>
              
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Selected category"
                      className="w-52 h-auto max-sm:w-40 object-cover rounded-xl border border-gray-200"
                    />
                  ) : (
                    <div className="w-52 h-52 max-sm:size-40 bg-gray-200 rounded-xl flex items-center justify-center">
                      <ImageIcon className="w-24 h-24 max-sm:size-20 text-gray-400" />
                      <div className="w-10 h-10 bg-white rounded-full absolute translate-x-2 -translate-y-2 flex items-center justify-center border border-gray-200">
                        <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`px-8 py-4 max-sm:p-[8px_16px]  text-sm font-medium shadow-sm rounded-[14px] transition-all duration-200 ${
                isFormValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-400'
              }`}
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 🧾 PropTypes bilan prop tekshirish:
CreateCategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreateCategory: PropTypes.func.isRequired,
};

export default CreateCategoryModal;
