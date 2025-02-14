import React, { useState } from "react";
import "../style/AddEventModal.css";

const AddEventModal = ({ onClose, onAddEvent }) => {
    const [eventName, setEventName] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");
    const [capacity, setCapacity] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!eventName || !date || !time || !location || !capacity) {
            alert("Please fill in all fields.");
            return;
        }

        // Format date and time for backend
        const formattedDate = new Date(date);
        formattedDate.setHours(0, 0, 0, 0);

        const newEvent = {
            title: eventName,
            venue: location,
            time: time,
            capacity: parseInt(capacity),
            date: formattedDate.toISOString(),
            description: `Event scheduled for ${date} at ${time}` // Add default description
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

                    <label>Date:</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                    />

                    <label>Time:</label>
                    <input
                        type="text"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        placeholder="e.g., 2:00 PM"
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
                        min="1"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
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
