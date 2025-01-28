import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "./api"; // Import your Axios instance

const NewContract = () => {
  const [formData, setFormData] = useState({
    objet: "",
    type: "",
    modalite_paiement: "",
    montant: "",
    fournisseur_nom: "",
    date_debut: "",
    date_fin: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/contracts/", formData); // Use the axios instance
      if (response.status === 201) {
        toast.success("Le contrat a été ajouté avec succès !");
        setFormData({
          objet: "",
          type: "",
          modalite_paiement: "",
          montant: "",
          fournisseur_nom: "",
          date_debut: "",
          date_fin: "",
        });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.msg || "Une erreur est survenue.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Ajouter un nouveau contrat</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="objet"
            placeholder="Objet"
            value={formData.objet}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
          />
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Type de contrat</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Travaux">Travaux</option>
            <option value="Étude">Étude</option>
            <option value="Acquisition">Acquisition</option>
          </select>
          <input
            type="number"
            name="montant"
            placeholder="Montant"
            value={formData.montant}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
          />
          <select
            name="modalite_paiement"
            value={formData.modalite_paiement}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Modalité de paiement</option>
{
  ['Mensuel', 'Bimensuel', 'Trimestriel', 'Semestriel', 'Annuel', 'Par avance', 'Post-payé'].map((elem, index) => (
    <option key={index} value={elem}>{elem}</option>
  ))
}
          </select>
          <input
            type="text"
            name="fournisseur_nom"
            placeholder="Nom du fournisseur"
            value={formData.fournisseur_nom}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="date"
            name="date_debut"
            value={formData.date_debut}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="date"
            name="date_fin"
            value={formData.date_fin}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
          >
            Ajouter Contrat
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewContract;
