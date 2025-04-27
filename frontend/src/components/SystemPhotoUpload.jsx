import React from "react";

const SystemPhotoUpload = ({ label, itemName, photos, handlePhotoUpload, handlePhotoRemove }) => {
  const photoList = photos?.[itemName] || [];

  return (
    <div className="photo-upload-container">
      <strong>{label}:</strong>

      {/* Upload Button */}
      <div className="custom-file-upload">
        <button
          type="button"
          onClick={() => document.getElementById(`file-upload-${itemName}`).click()}
          className="upload-button"
        >
          Upload Photo(s)
        </button>
        <input
          id={`file-upload-${itemName}`}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => handlePhotoUpload(itemName, e)} // ✅ always pass correct itemName
        />
      </div>

      {/* Photo Previews */}
      <div className="photo-preview">
        {photoList.length > 0 ? (
          photoList.map((photo) => (
            <div key={photo.photo_id} className="photo-item">
              <img
                src={`http://localhost:8080${photo.photo_url}`}
                alt={`${itemName} Uploaded`}
              />
              <button
                type="button"
                onClick={() => handlePhotoRemove(itemName, photo.photo_id)}
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p></p>
        )}
      </div>
    </div>
  );
};

export default SystemPhotoUpload;
