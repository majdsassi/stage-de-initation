import React, { useState, useEffect } from "react";
import { LayoutDashboard, Search, ChevronDown, ChevronUp , ReceiptText } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from './api';
import { Link, useNavigate } from "react-router-dom";
import "./index.css";

const year = new Date().getFullYear();

const Dashboard = () => {
  const [contracts, setContracts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const contractsPerPage = 100; // Number of contracts per page
  const [filters, setFilters] = useState({ type: "", fournisseur: "", etat: "" });

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/contracts/");
        const data = await response.json();
        setContracts(data);
        toast.success("Contracts loaded successfully!");
      } catch (error) {
        toast.error("Failed to load contracts.");
        console.error("Error fetching contracts:", error);
      }
    };

    fetchContracts();
  }, []);

  // Sorting function
  const sortedContracts = React.useMemo(() => {
    let sortableContracts = [...contracts];
    if (sortConfig.key !== null) {
      sortableContracts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableContracts;
  }, [contracts, sortConfig]);
  
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Filtering contracts
  const filteredContracts = sortedContracts
    .filter((contract) =>
      contract.objet.toLowerCase().includes(search.toLowerCase())
    )
    .filter((contract) => 
      (filters.type ? contract.type === filters.type : true) &&
      (filters.fournisseur ? contract.fournisseur_nom === filters.fournisseur : true) &&
      (filters.etat ? (filters.etat === "Active" ? new Date() < new Date(contract.date_fin) : new Date() > new Date(contract.date_fin)) : true)
    );

  // Pagination Logic
  const indexOfLastContract = currentPage * contractsPerPage;
  const indexOfFirstContract = indexOfLastContract - contractsPerPage;
  const currentContracts = filteredContracts.slice(indexOfFirstContract, indexOfLastContract);

  const totalPages = Math.ceil(filteredContracts.length / contractsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Dynamic styling based on dark mode
  const themeClasses = darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900";

  return (
    <>
      <div className={`min-h-screen p-6 ${themeClasses} transition-colors duration-300`}>
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <img
                src="https://raw.githubusercontent.com/majdsassi/aly/refs/heads/main/loGo-cni.png.pagespeed.ce.SP92KonlfD.png"
                alt="CNI Logo"
                className="h-12 w-auto"
              />
              <h1 className="text-3xl font-bold">Contracts Dashboard</h1>
            </div>

            {/* Dark Mode Toggle */}
            {/*<button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${
                darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
              } transition-colors`}
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>*/}
          </div>
          {/* Action Buttons */}
          <div className="flex space-x-4 mb-6">
            <Link
              to='/add-contract'
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Ajouter un contrat 
    </Link>
            <Link to="/add-supplier"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Ajouter un fournisseur
            </Link>
            <Link
              to="/stats"
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              Consulter Les Statistiques
            </Link>
          </div>
          {/* Filters */}
          <div className="flex space-x-4 mb-6">
            <select
              className="p-3 rounded-lg border"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">Tout type</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Travaux">Travaux</option>
              <option value="Étude">Étude</option>
              <option value="Acquisition">Acquisition</option>
            </select>
            <select
              className="p-3 rounded-lg border"
              value={filters.fournisseur}
              onChange={(e) => setFilters({ ...filters, fournisseur: e.target.value })}
            >
              <option value="">Tout  Fournisseurs</option>
              {Array.from(new Set(contracts.map((c) => c.fournisseur_nom))).map((f, idx) => (
                <option key={idx} value={f}>{f}</option>
              ))}
            </select>
            <select
              className="p-3 rounded-lg border"
              value={filters.etat}
              onChange={(e) => setFilters({ ...filters, etat: e.target.value })}
            >
              <option value="">Tout Etats</option>
              <option value="Active">Active</option>
              <option value="Terminé">Terminé</option>
            </select>
          </div>

          {/* Search */}
          <div className="mb-6 flex items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search contracts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full p-3 rounded-lg pl-10 ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 focus:ring-blue-600"
                    : "bg-white border-gray-300 focus:ring-blue-300"
                } border focus:outline-none focus:ring-2 transition-colors`}
              />
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
                size={20}
              />
            </div>
          </div>

          {/* Contracts Table */}
          <div className="overflow-x-auto">
            <table
              className={`w-full rounded-lg overflow-hidden ${
                darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
              }`}
            >
              <thead>
                <tr className={darkMode ? "bg-gray-700" : "bg-gray-100"}>
                  {["ID", "Objet", "Type", "Montant", "Fournisseur", "Etat","Actions"].map((header) => (
                    <th
                      key={header}
                      onClick={() => requestSort(header.toLowerCase())}
                      className="p-4 text-left cursor-pointer hover:bg-opacity-80 transition-colors"
                    >
                      <div className="flex items-center">
                        {header}
                        {sortConfig.key === header.toLowerCase() && (
                          sortConfig.direction === "ascending" ? (
                            <ChevronUp size={16} className="ml-2" />
                          ) : (
                            <ChevronDown size={16} className="ml-2" />
                          )
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentContracts.map((contract, index) => (
                  <tr
                    key={index}
                    className={`border-b ${
                      darkMode
                        ? "border-gray-700 hover:bg-gray-700"
                        : "border-gray-200 hover:bg-gray-100"
                    } transition-colors`}
                  >
                    <td className="p-4">{contract.id}</td>
                    <td className="p-4">{contract.objet}</td>
                    <td className="p-4">{contract.type}</td>
                    <td className="p-4">{contract.montant} TND</td>
                    <td className="p-4">{contract.fournisseur_nom}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          contract.etat_contrat ? contract.etat_contrat ==="suspendu" ? "bg-red-800 text-white" : "bg-yellow-800 text-white": new Date() > new Date(contract.date_fin)
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {contract.etat_contrat ?contract.etat_contrat : new Date() < new Date(contract.date_fin) ? "Active" : "Terminé"}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link to={`/edit-contract/${contract.id}`}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                      >
                        Modify Status
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <footer
          className={` ${
            darkMode
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-gray-200 hover:bg-gray-300"
          } rounded-lg shadow m-4`}
        >
          <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
            <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
              © {year} <a href="https://cni.tn" className="hover:underline">Centre national d'informatique </a>. All Rights Reserved.
            </span>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Dashboard;
