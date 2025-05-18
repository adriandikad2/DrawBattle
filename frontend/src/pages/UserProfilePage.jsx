import React, { useEffect, useState, useContext } from "react";
import { useAuth } from "../contexts/AuthContext";
import { gameService } from "../services/api";

const UserProfilePage = () => {
  const { currentUser } = useAuth();
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDrawings = async () => {
      try {
        setLoading(true);
        const res = await gameService.getUserDrawings(currentUser.id);
        setDrawings(res.data.drawings || []);
      } catch (err) {
        setError("Failed to load drawings");
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?.id) fetchDrawings();
  }, [currentUser]);

  return (
    <div className="profile-page">
      <h1>Your Profile</h1>
      <h2>Drawings</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="drawings-list">
          {drawings.length === 0 ? (
            <p>No drawings found.</p>
          ) : (
            <ul>
              {drawings.map((drawing) => (
                <li key={drawing.id} className="drawing-item">
                  <img src={drawing.image_url} alt="drawing" style={{ maxWidth: 200, border: "1px solid #ccc" }} />
                  <div className="drawing-meta">
                    <div><strong>Prompt:</strong> {drawing.prompt_text}</div>
                    <div><strong>Room:</strong> {drawing.room_id}</div>
                    <div><strong>Round:</strong> {drawing.round_number}</div>
                    <div><strong>Date:</strong> {new Date(drawing.created_at).toLocaleString()}</div>
                    <div><strong>Rating:</strong> {drawing.average_rating !== undefined ? drawing.average_rating.toFixed(2) : "N/A"}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
