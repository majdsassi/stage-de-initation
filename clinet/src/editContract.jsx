import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "./api"; // Import your axios instance

const EditContract = () => {
  const { id } = useParams(); // Get contract ID from the URL
  const navigate = useNavigate(); // For navigation after submission
  const [status, setStatus] = useState(""); // Current contract status
  const [loading, setLoading] = useState(false); // Loading state for API calls

  // Handle status update submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Use the axios instance for API call
      const response = await api.patch("/patch-contract", {
        id, // Send contract ID in the body
        etat_contrat: status, // New status
      });

      if (response.status === 200) {
        toast.success("Statut du contrat mis à jour avec succès !");
        navigate("/dashboard"); // Redirect to the dashboard
      } else {
        toast.error("Échec de la mise à jour du statut du contrat.");
      }
    } catch (error) {
      console.error("Error updating contract status:", error);
      toast.error("Une erreur s'est produite lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Modifier statut du contrat</h1>
        {loading ? (
          <p className="text-center text-gray-500">Chargement...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Statut du contrat : {id}
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Changer le Statut du contrat</option>
                <option value="suspendu">Suspendu</option>
                <option value="résilé">Résilié</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              disabled={!status || loading}
            >
              {loading ? "Mise à jour..." : "Enregistrer les modifications"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditContract;
