import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import { packingSlipApis } from '../../config/apiRoutes/PackingslipRoutes';
import Loading from '../../util/Loading';
import { PackingSlip } from '../../config/models/PackingSlip';


const PackingSlipList: React.FC = () => {
  const navigate = useNavigate();
  const [packingSlips, setPackingSlips] = useState<PackingSlip[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchPackingSlips = async () => {
      setLoading(true);
      try {
        const response = await packingSlipApis.getAllPackingSlips({ page: currentPage, limit: 10 });
        setPackingSlips(response.data.packingSlips);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching packing slips:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackingSlips();
  }, [currentPage]);

  const handleView = (id: string) => {
    navigate(`/yellowadmin/PackingSlip/${id}`);
  };

  if (loading) return <Loading />;

  return (
    <div className="h-full border-l -mt-5 border-gray-200 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <FaChevronLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Packing Slip Management
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            View and manage all packing slips for efficient order processing and tracking.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">Packing Slips</h2>
          </div> */}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Packing Slip ID
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dealer Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {packingSlips.map((slip) => (
                  <tr key={slip._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {slip.packingID}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {slip.phase}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {slip.orderDetails?.purchaseOrderNumber}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {slip.orderDetails?.dealerName}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">

                      <button
                        className=" bg-gray-900 text-white py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-sm"
                        onClick={() => handleView(slip._id)}>View</button>
                      {/* <Button onClick={() => handleView(slip._id)}>Download</Button> */}

                      {/* <button
                        className="text-green-600 hover:text-green-900"
                      >
                        <FaDownload className="w-5 h-5" />
                      </button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default PackingSlipList;