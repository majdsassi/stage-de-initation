import React, { useState, useEffect } from 'react';
import api from "./api"; // Importing the Axios instance configured with authentication

function Stat() {
  // State for managing the year and image data
  const [year, setYear] = useState(new Date().getFullYear());
  const [changed, setChanged] = useState(false);
  const [yearStatImage, setYearStatImage] = useState(null);
  const [contractTypeImage, setContractTypeImage] = useState(null);
  const [contractPaymentImage, setContractPaymentImage] = useState(null);
  const [performanceImage, setPerformanceImage] = useState(null);

  // Function to fetch the images from the backend
  const fetchData = async (year) => {
    try {
      // Fetching Year Stats
      const yearStatResponse = await api.get(`stats/years/${year}`, { responseType: 'blob' });
      const yearStatData = await blobToBase64(yearStatResponse.data);

      // Fetching Contract Type Stats
      const contractTypeResponse = await api.get(
        !changed ? '/stats/type-contrat' : `/stats/type-contrat?year=${year}`,
        { responseType: 'blob' }
      );
      const contractTypeData = await blobToBase64(contractTypeResponse.data);

      // Fetching Contract Payment Stats
      const contractPaymentResponse = await api.get(
        !changed ? '/stats/type-paiment' : `/stats/type-paiment?year=${year}`,
        { responseType: 'blob' }
      );
      const contractPaymentData = await blobToBase64(contractPaymentResponse.data);

      // Fetching Performance Stats
      const performanceResponse = await api.get(
        !changed ? '/stats/performance' : `/stats/performance?year=${year}`,
        { responseType: 'blob' }
      );
      const performanceData = await blobToBase64(performanceResponse.data);

      // Setting the fetched data to state
      setYearStatImage(yearStatData);
      setContractTypeImage(contractTypeData);
      setContractPaymentImage(contractPaymentData);
      setPerformanceImage(performanceData);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques :", error);
    }
  };

  // Function to convert Blob to base64 string
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]); // Removing 'data:image/png;base64,' prefix
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Effect hook to fetch data when the year changes
  useEffect(() => {
    fetchData(year);
  }, [year]);

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    let years = [];
    for (let i = currentYear; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">Tableau de bord des statistiques</h1>

        {/* Year selector */}
        <div className="mb-6 flex justify-center">
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setChanged(true);
            }}
            className="p-2 border rounded-md text-gray-700"
          >
            {generateYearOptions().map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        {/* Year Stats */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Statistiques annuelles pour {year}</h2>
          {yearStatImage ? (
            <img src={`data:image/png;base64,${yearStatImage}`} alt="Statistiques annuelles" className="w-full rounded-lg shadow-md" />
          ) : (
            <p>Chargement des statistiques annuelles...</p>
          )}
        </div>

        {/* Contract Type Stats */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Statistiques par type de contrat</h2>
          {contractTypeImage ? (
            <img src={`data:image/png;base64,${contractTypeImage}`} alt="Statistiques type de contrat" className="w-full rounded-lg shadow-md" />
          ) : (
            <p>Chargement des statistiques par type de contrat...</p>
          )}
        </div>

        {/* Contract Payment Stats */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Statistiques des paiements de contrat</h2>
          {contractPaymentImage ? (
            <img src={`data:image/png;base64,${contractPaymentImage}`} alt="Statistiques des paiements de contrat" className="w-full rounded-lg shadow-md" />
          ) : (
            <p>Chargement des statistiques des paiements de contrat...</p>
          )}
        </div>

        {/* Performance Stats */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Performance des fournisseurs</h2>
          {performanceImage ? (
            <img src={`data:image/png;base64,${performanceImage}`} alt="Statistiques de performance" className="w-full rounded-lg shadow-md" />
          ) : (
            <p>Chargement des statistiques de performance...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Stat;
