import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "./api";  // Assuming your API instance is imported

const NewFournisseur = () => {
  const [nom, setNom] = useState("");
  const [contact, setContact] = useState("");
  const [adresse, setAdresse] = useState("");

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data to be sent
    const newFournisseur = {
      nom: nom.trim(),
      contact: contact.trim(),
      adresse: adresse.trim(),
    };

    // Validate the fields before submitting
    if (!newFournisseur.nom || !newFournisseur.contact || !newFournisseur.adresse) {
      toast.error("Tous les champs sont obligatoires !");
      return;
    }

    console.log("Sending data:", newFournisseur);  // Check the data being sent

    try {
      // Send the request to the backend API
      const response = await api.post("/add-fournisseurs", newFournisseur);

      if (response.status === 201) {
        toast.success("Fournisseur ajouté avec succès !");
        // Clear the form fields after successful submission
        setNom("");
        setContact("");
        setAdresse("");
      } else {
        toast.error("Échec de l'ajout du fournisseur.");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du fournisseur:", error);
      toast.error("Une erreur est survenue.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Ajouter un nouveau Fournisseur</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="text"
            name="contact"
            placeholder="Contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="text"
            name="adresse"
            placeholder="Adresse"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            required
            className="w-full p-3 border rounded-lg"
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600"
          >
            Ajouter Fournisseur
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewFournisseur;
