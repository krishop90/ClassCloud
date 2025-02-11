import React from "react";
import "../style/EditProfile.css";

const ForgetPassword = () => {
  return (
    <div className="edit-profile-page">
      <div className="edit-profile-form">
        <form>
          <div className="form-row">
            <input type="password" className="input2" placeholder="Password" />
          </div>
          <div className="form-row">
          <input type="password" className="input2" placeholder="Confirm Password" />
          </div>
          <button type="submit" className="edit-button">Edit</button>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;
