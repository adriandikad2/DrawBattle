import React, { useEffect, useState, useMemo } from "react";
import "./UserProfilePage.css";
import { useAuth } from "../contexts/AuthContext";
import { gameService } from "../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserProfilePage = () => {
  const { currentUser } = useAuth();
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, drawing: null });

  useEffect(() => {
    const fetchDrawings = async () => {
      try {
        setLoading(true);
        console.log("Fetching drawings for user:", currentUser.id);
        const res = await gameService.getUserDrawings(currentUser.id);
        setDrawings(res.data.drawings || []);
      } catch (err) {
        console.error("Error fetching drawings:", err);
        setError("Failed to load drawings");
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?.id) fetchDrawings();
  }, [currentUser]);

  // Generate a random but visually pleasing gradient for each card
  const getRandomGradient = (seed) => {
    // Use the drawing id as a seed for consistent color per drawing
    // Color theory: pick two hues 40-80deg apart, high saturation, mid-high lightness
    function seededRandom(s) {
      let x = Math.sin(s) * 10000; return x - Math.floor(x);
    }
    const h1 = Math.floor(seededRandom(seed) * 360);
    const h2 = (h1 + 40 + Math.floor(seededRandom(seed + 1) * 40)) % 360;
    const s1 = 65 + Math.floor(seededRandom(seed + 2) * 20); // 65-85%
    const s2 = 65 + Math.floor(seededRandom(seed + 3) * 20);
    const l1 = 55 + Math.floor(seededRandom(seed + 4) * 15); // 55-70%
    const l2 = 55 + Math.floor(seededRandom(seed + 5) * 15);
    return `linear-gradient(135deg, hsl(${h1},${s1}%,${l1}%) 0%, hsl(${h2},${s2}%,${l2}%) 100%)`;
  };

  // Group drawings into rows of 2
  const drawingRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < drawings.length; i += 2) {
      rows.push(drawings.slice(i, i + 2));
    }
    return rows;
  }, [drawings]);

  return (
    <div className="profile-page">
      <h1 className="colorful-title">Your Profile</h1>
      <h2 className="colorful-subtitle">Drawings</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="drawings-grid">
          {drawings.length === 0 ? (
            <p>No drawings found.</p>
          ) : (
            drawingRows.map((row, rowIdx) => (
              <div className="drawing-row" key={rowIdx}>
                {row.map((drawing) => (
                  <div
                    key={drawing.id}
                    className="drawing-card"
                    style={{ background: getRandomGradient(Number(drawing.id.toString().replace(/\D/g, '')) || rowIdx) }}
                  >
                    <img src={drawing.image_url} alt="drawing" className="drawing-img" />
                    <div className="drawing-meta">
                      <div><strong>Prompt:</strong> {drawing.prompt_text}</div>
                      <div><strong>Round:</strong> {drawing.round_number}</div>
                      <div><strong>Date:</strong> {new Date(drawing.created_at).toLocaleString()}</div>
                      <div><strong>Rating:</strong> {typeof drawing.average_rating === "number" && !isNaN(drawing.average_rating) ? Number(drawing.average_rating).toFixed(2) : "N/A"}</div>
                    </div>
                    <div className="drawing-actions">
                      <button
                        className="download-btn"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = drawing.image_url;
                          link.download = `drawing_${drawing.id}.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        Download
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => setConfirmDelete({ open: true, drawing })}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
          
          {confirmDelete.open && (
            <div className="modal-overlay">
              <div className="modal-popup">
                <h3 className="select-none pointer-events-none">Delete Drawing</h3>
                <p className="select-none pointer-events-none">Are you sure you want to delete this drawing? This action cannot be undone.</p>
                <div className="modal-actions">
                  <button
                    className="delete-btn"
                    onClick={async () => {
                      try {
await gameService.deleteDrawing(confirmDelete.drawing.id);
toast.success("Drawing deleted successfully!");
setConfirmDelete({ open: false, drawing: null });
setDrawings((prev) => prev.filter((d) => d.id !== confirmDelete.drawing.id));
                      } catch (err) {
toast.error("Failed to delete drawing.");
                      }
                    }}
                  >
                    Yes, Delete
                  </button>
                  <button
                    className="download-btn"
                    style={{ background: 'linear-gradient(90deg, #a1a1aa, #60a5fa)' }}
                    onClick={() => setConfirmDelete({ open: false, drawing: null })}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
