import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import logo1 from '../../assets/logo1.png'
import Loading from '../../util/Loading';
import { transactionApis } from '../../config/apiRoutes/TransactionRoutes';
import { Button } from 'flowbite-react';
import { FaChevronLeft } from 'react-icons/fa';
import { Transaction } from '../../config/models/Transaction';

const TransactionSummary: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { id } = useParams<{ id: string }>();
  const [transactionData, setTransactionData] = useState<Transaction | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTransactionData = async () => {
      if (id) {
        try {
          setLoading(true)
          const res = await transactionApis.getTransactionbyTransactionId({ transactionId: id });
          setTransactionData(res.data.transaction);


        } catch (error) {
          console.error('Error fetching transaction data:', error);
        } finally {
          setLoading(false)
        }
      }
    };
    loadTransactionData();
  }, [id]);



  return (
    loading ? <Loading /> : transactionData ? <div className="p-4 max-w-4xl mx-auto mt-6 relative" id="transaction">
      <div className='mb-12 flex items-center justify-between'>
        <Button color='gray' onClick={() => navigate(-1)}>
          <span className='flex gap-2 items-center'><FaChevronLeft />Back</span>
        </Button>
        <h2 className="text-2xl font-semibold flex-grow text-center">Order List</h2>
      </div>
      <div className="absolute top-4 right-4 text-gray-600 text-right flex flex-col items-end mt-24 mr-8">
        <div className="flex items-center">
          <p className="font-bold mr-2">Date:</p>
          <p>{new Date(transactionData.transactionDate).toLocaleDateString()}</p>
        </div>
        <img src={logo1} alt="Logo" className="my-8 w-36 h-auto" />
        <div className="flex gap-x-2 py-2 pl-2">
          <p className="font-bold">Transaction </p>{transactionData.transactionId}
        </div>
        {/* <div className="py-2 ml-auto pl-2">
          <p className="">
            <span className='font-bold'>DUE DATE </span>{new Date(transactionData.dueDate).toLocaleDateString()}
          </p>
        // </div>
      </div> */}
      </div>

      <h1 className="text-xl text-center font-bold mb-4 text-black-600">
        Transaction Summary for: {id}
      </h1>
      <div className="bg-gray-100 p-8 rounded-md shadow-md">
        <h2 className="text-lg font-semibold mb-2 mt-10 text-black-600">
          LITTLESPILLS INC
        </h2>
        <p className="text-gray-600">324 TRADERS BLVD EAST</p>
        <p className="text-gray-600">MISSISSAUGA ON L4Z 1W7</p>
        <p className="text-gray-600">+16472272525</p>
        <p className="text-gray-600">littlespills.001@gmail.com</p>
        <p className="text-gray-600">www.littlespills.com</p>

        <h2 className="text-lg font-semibold mb-2 mt-6 text-black-600">
          Transaction By
        </h2>
        <p className="text-gray-600">{transactionData?.dealer}</p>
        {/* <p className="text-gray-600">{transactionData?.dealer?.address.address}</p>
        <p className="text-gray-600">{transactionData?.dealer?.contactPersonCell}</p>
        <p className="text-gray-600">{transactionData?.dealer?.contactPersonEmail}</p> */}

        {/* Transaction Details Table */}
        <table className="mt-4 w-full overflow-x-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 text-left">Transaction ID</th>
              <th className="px-4 py-2 text-left">Invoice ID</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Invoice Total Amount</th>
              <th className="px-4 py-2 text-left">Invoice Due Amount</th>
              <th className="px-4 py-2 text-left">Capture Amount</th>
            </tr>
          </thead>
          <tbody>

            <tr >
              <td className="px-4 py-2">{transactionData.transactionId}</td>
              <td className="px-4 py-2">{transactionData.invoiceNumber}</td>
              <td className="px-4 py-2">{transactionData?.type}</td>
              <td className="px-4 py-2">{transactionData?.invoiceTotalAmount}</td>
              <td className="px-4 py-2">{transactionData?.invoiceDueAmount}</td>
              <td className="px-4 py-2">{transactionData?.capturedAmount}</td>
            </tr>
          </tbody>
        </table>

        {/* {/* Total Summary Section */}

        <hr className="text-black h-5 mt-10" />
        <p className="text-center">Thank you for your business!</p>
      </div>
    </div> : <p className='mt-52 text-center text-gray-500 text-xl font-medium'>Something went wrong while fetching Transaction data with number {id}</p>
  );
};

export default TransactionSummary;




