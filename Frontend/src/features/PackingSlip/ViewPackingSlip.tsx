import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { Table, Button, Checkbox } from 'flowbite-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import SignaturePad from "react-signature-canvas";
import logo from "../../assets/alora.png";
import { packingSlipApis } from "../../config/apiRoutes/PackingslipRoutes";
import Loading from "../../util/Loading";
import { toast } from 'react-toastify';
import { FaChevronLeft } from 'react-icons/fa';
import { PackingSlip } from '../../config/models/PackingSlip';
import showConfirmationModal from '../../util/confirmationUtil';

const ViewPackingSlip: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [packingSlip, setPackingSlip] = useState<PackingSlip>();
  const [scannedProducts, setScannedProducts] = useState<Set<string>>(new Set());
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isLandscape, setIsLandscape] = useState(false);
  const [manualSKU, setManualSKU] = useState('');
  const pdfRef = useRef<HTMLDivElement>(null);
  const signPadRef = useRef<SignaturePad>(null);

  useEffect(() => {
    const fetchPackingSlip = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await packingSlipApis.getPackingSlipBypackingId(id);
        setPackingSlip(response.data);
      } catch (error) {
        console.error("Error fetching packing slip:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackingSlip();

    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
    };
  }, [id]);

  const handleComplete = async () => {
    if (!packingSlip)
      return

    // console.log(signPadRef.current?.isEmpty())
    if (signPadRef.current?.isEmpty()) {
      toast.info('Please sign before marking as completed.');
      return;
    }
    const signature = signPadRef.current?.getTrimmedCanvas().toDataURL("image/png");


    const updatedProducts = packingSlip.orderDetails.products.map((product: any) => ({
      ...product,
      checked: scannedProducts.has(product.childSKU)
    }));

    try {
      let confirmed_complete = await showConfirmationModal("Are you sure you want to mark this packing slip as complete? This action cannot be undone.")
      if (!confirmed_complete)
        return

      let isPartial = packingSlip.orderDetails.products.every(item => item.checked)
      if (isPartial) {
        let confirmed_partial = await showConfirmationModal("Some products are not yet successfully marked as packed. Are you sure you would like to continue?")
        if (!confirmed_partial)
          return

      }
      setLoading(true);
      await packingSlipApis.updatePackingSlip(packingSlip._id, {
        orderDetails: {
          ...packingSlip.orderDetails,
          products: updatedProducts,
        },
        phase: "Completed",
        receivedSign: signature,
      });
      toast.success('Packing slip marked as completed successfully.');
      navigate(-1);
    } catch (error) {
      console.error("Error updating packing slip:", error);
      // toast.error('Failed to mark packing slip as completed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const generatePDF = () => {
    if (!packingSlip)
      return
    if (pdfRef.current) {
      html2canvas(pdfRef.current).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`packing-slip-${packingSlip.packingID}.pdf`);
      });
    }
  };

  const handleBarcodeScan = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!packingSlip)
      return;
    const scannedSKU = event.target.value;
    setBarcodeInput(scannedSKU);

    if (packingSlip.orderDetails.products.some((product: any) => product.childSKU === scannedSKU)) {
      setScannedProducts(prev => new Set(prev).add(scannedSKU));
      // console.log(`Product scanned: ${scannedSKU}`);
    }

    setTimeout(() => setBarcodeInput(''), 100);
  };

  const handleManualSKUChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setManualSKU(event.target.value?.toUpperCase());
  };

  const handleManualSKUSubmit = () => {
    if (!packingSlip)
      return;
    if (packingSlip.orderDetails.products.some((product: any) => product.childSKU === manualSKU)) {
      setScannedProducts(prev => new Set(prev).add(manualSKU));
      console.log(`Product manually entered: ${manualSKU}`);
      setManualSKU('');
    } else {
      toast.error('Invalid SKU. Please try again.');
    }
  };

  if (!isLandscape) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-2 text-center text-gray-500">
          <p className="text-xl mb-4">Please rotate your device to landscape mode to view packing slip.</p>
          <svg className="mx-auto w-16 h-16 animate-spin" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z" />
          </svg>
        </div>
      </div>
    );
  }
  if (loading) return <Loading />;

  if (!packingSlip) return <div className='text-gray-500 text-lg mt-16 text-center'>No packing slip data available.</div>;

  return (
    <div className=" border-l -mt-5 border-gray-200 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <FaChevronLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="text-center mb-12">

        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          View and manage your packing slip for order processing and tracking.
        </p>
      </div>

      <div className="my-8 space-y-4">
        {packingSlip.phase !== "Completed" &&
          <>
            <input
              type="text"
              value={barcodeInput}
              onChange={handleBarcodeScan}
              placeholder="Scan barcode"
              className="w-full p-2 border rounded"
              autoFocus
            />
            <div className="flex space-x-2">
              <input
                type="text"
                value={manualSKU}
                onChange={handleManualSKUChange}
                placeholder="Enter SKU manually"
                className="flex-grow p-2 border rounded"
              />
              <Button color={'dark'} onClick={handleManualSKUSubmit}>Submit SKU</Button>
            </div>
          </>
        }
        <div className="flex items-center justify-center gap-x-2 lg:gap-x-5">
          <Button color={'dark'} onClick={generatePDF}>Save as PDF</Button>
          <Button color={'dark'}
            onClick={handleComplete}
            disabled={packingSlip.phase === 'Completed'}
          >
            Mark as Completed
          </Button>
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
          <img src={logo} alt="LITTLE SPILLS INC" className="w-48 mb-4" />
          <div className="text-right font-normal">
            DATE: <span className="font-thin text-sm">{new Date(packingSlip.createdAt)?.toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between">
            <h2 className="text-2xl font-light mb-4 text-gray-500">Packing Slip {packingSlip.packingID}</h2>
            <h2 className="font-light mb-4 text-gray-500 text-right"><span className="text-black">Purchase Order No</span><br /> {packingSlip.orderDetails.purchaseOrderNumber}</h2>
          </div>
          <div className="flex text-xs justify-between">
            <div>
              <h3 className="font-normal text-base mb-2">BILL TO:</h3>
              <p>{packingSlip.orderDetails.dealerName}</p>
              <p className='text-wrap'>{`${packingSlip.order.billTo.address.buzz || ''} ${packingSlip.order.billTo.address.unit || ''} ${packingSlip.order.billTo.address.address}`}</p>
            </div>
            <div className="text-right">
              <h3 className="font-normal text-base mb-2">SHIP TO:</h3>
              <p>{packingSlip.orderDetails.dealerName}</p>
              <p className='text-wrap'>{`${packingSlip.order.shipTo.address.buzz || ''} ${packingSlip.order.shipTo.address.unit || ''} ${packingSlip.order.shipTo.address.address}`}</p>
            </div>
          </div>
        </div>

        <Table striped>
          <Table.Head>
            <Table.HeadCell>ITEM No.</Table.HeadCell>
            <Table.HeadCell>ITEM</Table.HeadCell>
            <Table.HeadCell>DESCRIPTION</Table.HeadCell>
            <Table.HeadCell>QTY</Table.HeadCell>
            <Table.HeadCell className='text-center'>SCANNED</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {packingSlip.orderDetails.products.map((product, index: number) => (
              <Table.Row key={index}>
                <Table.Cell>{product.childSKU}</Table.Cell>
                <Table.Cell>{product.parentName} - {product.childName}</Table.Cell>
                <Table.Cell>{product.description}</Table.Cell>
                <Table.Cell>{product.quantity}</Table.Cell>
                <Table.Cell className='text-center'>
                  <Checkbox
                    color={'dark'}
                    checked={scannedProducts.has(product.childSKU) || product.checked}
                    readOnly
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        <div className="flex justify-end mt-10">
          <div className="text-center">
            {packingSlip.phase === "Completed" ? <img className='object-contain border border-gray-200 p-2 w-[300px] h-[150px]' src={packingSlip.receivedSign} alt='Signee' /> : <SignaturePad
              ref={signPadRef}
              canvasProps={{
                className: "border border-gray-300",
                width: 300,
                height: 150,
              }}
            />}
            <p className="text-gray-500 mt-2">{packingSlip.phase === "Completed" ? "(Received by)" : "(Sign Here)"}</p>
          </div>
        </div>
      </div>


    </div>
    // </div >
  );
};

export default ViewPackingSlip;