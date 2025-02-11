import React, { useState } from "react";
import "../style/AddEventModal.css";

const AddEventModal = ({ onClose, onAddEvent }) => {
    const [eventName, setEventName] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");
    const [capacity, setCapacity] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!eventName || !time || !location || !capacity || !description) {
            alert("Please fill in all fields.");
            return;
        }

        // Fix payload: use keys that backend expects.
        const newEvent = {
            title: eventName,            // used to be 'name'
            description,
            venue: location,             // used to be 'location'
            time,
            capacity,
            date: new Date().toISOString(), // Use ISO for proper parsing
        };

        onAddEvent(newEvent);
    };

    return (
        <div className="full-page-modal">
            <div className="modal-form-container2">
                <div className="modal-header2">
                    <h2>Add Event</h2>
                    <button className="close-btn" onClick={onClose}>✖</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form2">
                    <div className="input-row">
                        <div className="input-group">
                            <label>Event Name:</label>
                            <input
                                type="text"
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <label>Time:</label>
                    <input
                        type="text"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        placeholder="E.g., 10:00 AM - 12:00 PM"
                        required
                    />

                    <label>Location:</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />

                    <label>Capacity:</label>
                    <input
                        type="number"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        required
                    />

                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />

                    <div className="modal-buttons2">
                        <button type="submit" className="save-btn">Save</button>
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEventModal;
