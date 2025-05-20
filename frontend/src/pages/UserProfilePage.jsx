import React, { useEffect, useState, useMemo } from "react";
import "./UserProfilePage.css";
import { useAuth } from "../contexts/AuthContext";
import { gameService } from "../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PasswordInput from "../components/PasswordInput";

const UserProfilePage = () => {
  const { currentUser, updateProfile, updatePassword } = useAuth();
  const [username, setUsername] = useState(currentUser?.username || "");
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, drawing: null });

  useEffect(() => {
    const fetchDrawings = async () => {
      try {
        setLoading(true);
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

  const getRandomGradient = (seed) => {
    function seededRandom(s) {
      let x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    }
    const h1 = Math.floor(seededRandom(seed) * 360);
    const h2 = (h1 + 40 + Math.floor(seededRandom(seed + 1) * 40)) % 360;
    const s1 = 65 + Math.floor(seededRandom(seed + 2) * 20);
    const s2 = 65 + Math.floor(seededRandom(seed + 3) * 20);
    const l1 = 55 + Math.floor(seededRandom(seed + 4) * 15);
    const l2 = 55 + Math.floor(seededRandom(seed + 5) * 15);
    return `linear-gradient(135deg, hsl(${h1},${s1}%,${l1}%) 0%, hsl(${h2},${s2}%,${l2}%) 100%)`;
  };

  const drawingRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < drawings.length; i += 2) {
      rows.push(drawings.slice(i, i + 2));
    }
    return rows;
  }, [drawings]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    let hasChanges = false;
    let hasErrors = false;

    // Validate username if changed
    if (username !== currentUser?.username) {
      if (!username.trim()) {
        toast.error("Username cannot be empty");
        hasErrors = true;
      }
      hasChanges = true;
    }

    // Validate password if new password is provided
    if (passwords.newPassword || passwords.confirmPassword) {
      if (!passwords.newPassword || !passwords.confirmPassword) {
        toast.error("Please fill in both password fields");
        hasErrors = true;
      } else if (passwords.newPassword.length < 6) {
        toast.error("New password must be at least 6 characters long");
        hasErrors = true;
      } else if (passwords.newPassword !== passwords.confirmPassword) {
        toast.error("Passwords don't match");
        hasErrors = true;
      }
      hasChanges = true;
    }

    if (!hasChanges) {
      toast.info("No changes to save");
      return;
    }

    if (hasErrors) return;

    try {
      let successCount = 0;

      // Update username if changed
      if (username !== currentUser?.username) {
        const updatedUser = await updateProfile({ username });
        if (updatedUser) {
          successCount++;
        }
      }

      // Update password if provided and valid
      if (passwords.newPassword && passwords.newPassword === passwords.confirmPassword) {
        const success = await updatePassword(passwords.newPassword);
        if (success) {
          successCount++;
          setPasswords({
            newPassword: "",
            confirmPassword: "",
          });
        }
      }

      if (successCount > 0) {
        toast.success(
          successCount === 2
            ? "Profile and password updated successfully!"
            : successCount === 1 && username !== currentUser?.username
            ? "Username updated successfully!"
            : "Password updated successfully!"
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-section">
          <h2 className="section-title">Profile Settings</h2>
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                placeholder="Enter new username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <PasswordInput
                id="newPassword"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                className="form-input"
                placeholder="Enter new password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <PasswordInput
                id="confirmPassword"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                className="form-input"
                placeholder="Confirm new password"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">
                Save Changes
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setUsername(currentUser?.username || "");
                  setPasswords({
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Your Drawings</h2>
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
                          <div>
                            <strong>Rating:</strong>{" "}
                            {typeof drawing.average_rating === "number" && !isNaN(drawing.average_rating)
                              ? Number(drawing.average_rating).toFixed(2)
                              : "N/A"}
                          </div>
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
                    <h3>Delete Drawing</h3>
                    <p>
                      Are you sure you want to delete this drawing? This action cannot be undone.
                    </p>
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
                        className="cancel-btn"
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
      </div>
    </div>
  );
};

export default UserProfilePage;
