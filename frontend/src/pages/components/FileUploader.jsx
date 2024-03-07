import React, { useState } from "react";

const SingleFileUploader = ({ title, onFileChange}) => {

  const handleFileChange = (e) => {
    if (e.target.files) {
       if (e.target.files) {
      const uploadedFile = e.target.files[0];
      // Pass the file state to the parent component
      onFileChange(uploadedFile);
    }
    }
  };

  return (
    <>
      <label>{title}</label>
      <input
        id="file"
        className="w-full text-sm text-gray-900 cursor-pointer file:rounded-xl rounded-xl file:bg-primary file:text-primary-foreground file:border-0 file:p-4 file:font-semibold dark:text-foreground focus:outline-none dark:bg-default-100 dark:placeholder-primary-50"
        type="file"
        onChange={handleFileChange}
      />
    </>
  );
};

export default SingleFileUploader;
