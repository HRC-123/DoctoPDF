import React, { useState } from "react";
import axios from "axios";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setStatusMessage("Please select a file.");
      return;
    }

    setLoading(true);
    setStatusMessage("Uploading and converting...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Send the file to the backend for conversion
      const response = await axios.post(
        "http://localhost:5000/convert",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob", // Ensure we receive the file as a blob (binary data)
        }
      );

      // Create a link to download the converted file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "converted.pdf"); // File name when downloaded
      document.body.appendChild(link);
      link.click();

      setStatusMessage(
        "Conversion successful! Your file is ready to download."
      );
    } catch (error) {
      setStatusMessage("Conversion failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Convert DOCX to PDF
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".docx"
              className="file-input file:mr-2 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-lg file:text-white file:bg-blue-500 hover:file:bg-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:bg-blue-300"
          >
            {loading ? "Converting..." : "Upload and Convert"}
          </button>
        </form>

        <div className="mt-4 text-center text-xl font-medium text-green-500">
          {statusMessage}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
