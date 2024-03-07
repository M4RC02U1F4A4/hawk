import React, { useState } from "react";

const SingleFileUploader = ({ title }) => {
  const [file, setFile] = useState();

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    console.log(e)
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
