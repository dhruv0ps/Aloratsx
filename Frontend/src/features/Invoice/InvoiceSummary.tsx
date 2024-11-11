import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { Table, Button, Select } from 'flowbite-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { FaChevronLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import logo from "../../assets/alora.png";
import { invoiceApis } from "../../config/apiRoutes/InvoiceRoutes";
import Loading from "../../util/Loading";
import { Invoice } from '../../config/models/Invoice';
import { commonApis } from '../../config/apiRoutes/commonRoutes';
import { taxSlab } from '../../config/models/taxslab';

const ViewInvoice: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const [taxSlabs, setTaxSlabs] = useState<taxSlab[]>([]);
  const [selectedTaxSlab, setSelectedTaxSlab] = useState<string>('');
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await invoiceApis.getInvoiceById(id);
        const newSubtotal = response.data.products.reduce((sum: number, product: any) =>
          sum + (product.quantity * product.price), 0);
        setInvoice({ ...response.data, subtotal: newSubtotal });

      } catch (error) {
        console.error("Error fetching invoice:", error);
        toast.error('Failed to fetch invoice. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const fetchTaxSlabs = async () => {
      try {
        const response = await commonApis.getAllTaxSlabs();
        handleTaxSlabChange(
          typeof invoice?.dealer?.dealer?.province === 'string'
            ? invoice.dealer.dealer.province
            : invoice?.dealer?.dealer?.province?.name || '' // Use the appropriate property of `taxSlab` that is a string
        );
        
        setTaxSlabs(response.data);
      } catch (error) {
        console.error("Error fetching tax slabs:", error);
        toast.error('Failed to fetch tax slabs. Please try again.');
      }
    };

    fetchInvoice();
    fetchTaxSlabs();

    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
    };
  }, [id]);

  const handleSave = async () => {
    if (!invoice) return;
    try {
      setLoading(true);
      await invoiceApis.updateInvoice(invoice._id, invoice);
      toast.success('Invoice updated successfully.');
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error('Failed to update invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!invoice || !pdfRef.current) return;
    html2canvas(pdfRef.current).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
    });
  };

  const handleProductChange = (index: number, field: string, value: string | number) => {
    if (!invoice) return;
    const updatedProducts = [...invoice.products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };

    const newSubtotal = updatedProducts.reduce((sum, product) =>
      sum + (product.quantity * product.price), 0);

    const newTotalAmount = calculateTotalAmount(newSubtotal, invoice.taxSlab);

    setInvoice({
      ...invoice,
      products: updatedProducts,
      subtotal: newSubtotal,
      totalAmount: newTotalAmount,
      dueAmount: newTotalAmount - (invoice.paidAmount || 0)
    });
  };

  const handleTaxChange = (field: string, value: number) => {
    if (!invoice) return;
    const newTaxSlab = { ...invoice.taxSlab, [field]: value };
    const newTotalAmount = calculateTotalAmount(invoice.subtotal || 0, newTaxSlab);

    setInvoice({
      ...invoice,
      taxSlab: newTaxSlab,
      totalAmount: newTotalAmount,
      dueAmount: newTotalAmount - (invoice.paidAmount || 0)
    });
  };

  const handleTaxSlabChange = (slabId: string) => {
    if (!invoice) return;
    const selectedSlab = taxSlabs.find(slab => slab._id === slabId);
    if (!selectedSlab) return;

    setSelectedTaxSlab(slabId);
    const newTaxSlab = {
      gst: selectedSlab.gst,
      hst: selectedSlab.hst,
      qst: selectedSlab.qst,
      pst: selectedSlab.pst
    };
    const newTotalAmount = calculateTotalAmount(invoice.subtotal || 0, newTaxSlab);

    setInvoice({
      ...invoice,
      taxSlab: newTaxSlab,
      totalAmount: newTotalAmount,
      dueAmount: newTotalAmount - (invoice.paidAmount || 0)
    });
  };

  const calculateTotalAmount = (subtotal: number, taxSlab: { gst: number, hst: number, qst: number, pst: number }) => {
    const taxAmount = (
      (taxSlab.gst / 100) +
      (taxSlab.hst / 100) +
      (taxSlab.qst / 100) +
      (taxSlab.pst / 100)
    ) * subtotal;
    return subtotal + taxAmount;
  };

  if (!isLandscape) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-2 text-center text-gray-500">
          <p className="text-xl mb-4">Please rotate your device to landscape mode to view invoice.</p>
          <svg className="mx-auto w-16 h-16 animate-spin" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z" />
          </svg>
        </div>
      </div>
    );
  }

  if (loading) return <Loading />;
  if (!invoice) return <div className='text-gray-500 text-lg mt-16 text-center'>No invoice data available.</div>;

  return (
    <div className="border-l -mt-5 border-gray-200 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <FaChevronLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="text-center mb-12">
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          View and edit your invoice details.
        </p>
      </div>

      <div className="my-8 space-y-4">
        <div className="flex items-center justify-center gap-x-2 lg:gap-x-5">
          <Button color={'dark'} onClick={generatePDF}>Save as PDF</Button>
          {invoice.invoiceStatus === "unpaid" && <Button color={'dark'} onClick={handleSave}>
            Save Changes
          </Button>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg tracking-widest font-thin" ref={pdfRef}>
        <div className="flex justify-between items-start mb-8">
          <div className='text-xs'>
          <h1 className="text-xl font-normal mb-2">ALORA BEDDING</h1>
            <p>1580 Trinity Dr. #6-8</p>
            <p>MISSISSAUGA </p>
            <p>9O5-458-9835</p>
            <p>info@alorabedding.com</p>
            <p>www.alorabedding.com</p>
          </div>
          <img src={logo} alt="ALORA BEDDING" className="w-48 mb-4" />
          <div className="text-right font-normal">
            DATE: <span className="font-thin text-sm">{new Date(invoice.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between">
            <h2 className="text-2xl font-light mb-4 text-gray-500">Invoice {invoice.invoiceNumber}</h2>
            <h2 className="font-light mb-4 text-gray-500 text-right">
              <span className="text-black">Purchase Order No</span><br /> {invoice.purchaseOrderNumber}
            </h2>
          </div>
          <div className="flex text-xs justify-between">
            <div>
              <h3 className="font-normal text-base mb-2">BILL TO:</h3>
              <p>{invoice.dealer.dealerName}</p>
              <p className='text-wrap'>{`${invoice.dealer.dealerAddress.buzz || ''} ${invoice.dealer.dealerAddress.unit || ''} ${invoice.dealer.dealerAddress.address}`}</p>
            </div>
          </div>
        </div>

        <Table striped>
          <Table.Head>
            <Table.HeadCell>ITEM No.</Table.HeadCell>
            <Table.HeadCell>ITEM</Table.HeadCell>
            <Table.HeadCell>DESCRIPTION</Table.HeadCell>
            <Table.HeadCell>QTY</Table.HeadCell>
            <Table.HeadCell>PRICE</Table.HeadCell>
            <Table.HeadCell>TOTAL</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {invoice.products.map((product, index) => (
              <Table.Row key={index}>
                <Table.Cell>{product.childSKU}</Table.Cell>
                <Table.Cell>{product.parentName} - {product.childName}</Table.Cell>
                <Table.Cell>{product.description}</Table.Cell>
                <Table.Cell>
                  {invoice.invoiceStatus === "unpaid" ? (
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value))}
                      className="w-full p-1 border rounded"
                    />
                  ) : (
                    product.quantity
                  )}
                </Table.Cell>
                <Table.Cell>
                  {invoice.invoiceStatus === "unpaid" ? (
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => handleProductChange(index, 'price', parseFloat(e.target.value))}
                      className="w-full p-1 border rounded"
                    />
                  ) : (
                    `$${product.price.toFixed(2)}`
                  )}
                </Table.Cell>
                <Table.Cell>${(product.quantity * product.price).toFixed(2)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        <div className="mt-8 flex justify-end">
          <div className="w-1/2">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>${invoice.subtotal?.toFixed(2)}</span>
            </div>
            {invoice.invoiceStatus === "unpaid" && (
              <div className="mb-4">
                <Select
                  id="taxSlab"
                  value={selectedTaxSlab}
                  onChange={(e) => handleTaxSlabChange(e.target.value)}
                >
                  <option value="">Select Tax Slab</option>
                  {taxSlabs.map((slab) => (
                    <option key={slab._id} value={slab._id}>{slab.name}</option>
                  ))}
                </Select>
              </div>
            )}
            <div className="flex justify-between mb-2">
              <span>GST {invoice.invoiceStatus === 'unpaid' ? <input
                type="number"
                min={0}
                max={100}

                value={invoice.taxSlab.gst || 0}
                onChange={(e) => handleTaxChange('gst', parseFloat(e.target.value))}
                className="w-20 p-1 mr-1 border border-gray-100 rounded"
              /> : <span>{invoice.taxSlab.gst || 0}</span>}%:</span>
              {invoice.invoiceStatus === "unpaid" ? (
                <div>
                  <span className="ml-2">
                    {(((invoice.taxSlab.gst || 0) * (invoice.subtotal || 0)) / 100).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span>{(((invoice.taxSlab.gst || 0) * (invoice.subtotal || 0)) / 100).toFixed(2)}</span>
              )}
            </div>

            <div className="flex justify-between mb-2">
              <span>HST {invoice.invoiceStatus === 'unpaid' ? <input
                type="number"
                min={0}
                max={100}

                value={invoice.taxSlab.hst || 0}
                onChange={(e) => handleTaxChange('hst', parseFloat(e.target.value))}
                className="w-20 p-1 mr-1 border border-gray-100 rounded"
              /> : <span>{invoice.taxSlab.hst || 0}</span>}%:</span>
              {invoice.invoiceStatus === "unpaid" ? (
                <div>

                  <span className="ml-2">
                    {(((invoice.taxSlab.hst || 0) * (invoice.subtotal || 0)) / 100).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span>{(((invoice.taxSlab.hst || 0) * (invoice.subtotal || 0)) / 100).toFixed(2)}</span>
              )}
            </div>

            <div className="flex justify-between mb-2">
              <span>QST {invoice.invoiceStatus === 'unpaid' ? <input
                type="number"
                min={0}
                max={100}

                value={invoice.taxSlab.qst || 0}
                onChange={(e) => handleTaxChange('qst', parseFloat(e.target.value))}
                className="w-20 p-1 mr-1 border border-gray-100 rounded"
              /> : <span>{invoice.taxSlab.qst || 0}</span>}%:</span>
              {invoice.invoiceStatus === "unpaid" ? (
                <div>

                  <span className="ml-2">
                    {(((invoice.taxSlab.qst || 0) * (invoice.subtotal || 0)) / 100).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span>{(((invoice.taxSlab.qst || 0) * (invoice.subtotal || 0)) / 100).toFixed(2)}</span>
              )}
            </div>

            <div className="flex justify-between mb-2">
              <span>PST {invoice.invoiceStatus === 'unpaid' ? <input
                type="number"
                min={0}
                max={100}

                value={invoice.taxSlab.pst || 0}
                onChange={(e) => handleTaxChange('pst', parseFloat(e.target.value))}
                className="w-20 p-1 mr-1 border border-gray-100 rounded"
              /> : <span>{invoice.taxSlab.pst || 0}</span>}%:</span>
              {invoice.invoiceStatus === "unpaid" ? (
                <div>

                  <span className="ml-2">
                    {(((invoice.taxSlab.pst || 0) * (invoice.subtotal || 0)) / 100).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span>{(((invoice.taxSlab.pst || 0) * (invoice.subtotal || 0)) / 100).toFixed(2)}</span>
              )}
            </div>
            <div className="flex justify-between font-bold mt-4">
              <span>Total:</span>
              <span>${invoice.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span>Paid Amount:</span>
              <span>${invoice.paidAmount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span>Due Amount:</span>
              <span>${invoice.dueAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 uppercase">
          <p className="text-sm text-gray-600">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
          <p className="text-sm text-gray-600">Invoice Status: {invoice.invoiceStatus}</p>
        </div>
      </div>
    </div>
  );
};

export default ViewInvoice;