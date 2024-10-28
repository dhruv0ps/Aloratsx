import React, { useState, useRef } from 'react';
import { Table, Button, Checkbox } from 'flowbite-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from "../../assets/alora.png"
import { PackingSlip } from '../../config/models/PackingSlip';

interface EnhancedPackingSlipProps {
    packingSlip: PackingSlip;
    onComplete: (packingSlipId: string) => void;
    onProductScanned: (sku: string) => void;
}

const EnhancedPackingSlip: React.FC<EnhancedPackingSlipProps> = ({
    packingSlip,
    onComplete,
    onProductScanned
}) => {
    const [scannedProducts, setScannedProducts] = useState<Set<string>>(new Set());
    const [barcodeInput, setBarcodeInput] = useState('');
    const pdfRef = useRef<HTMLDivElement>(null);

    const handleBarcodeScan = (event: React.ChangeEvent<HTMLInputElement>) => {
        const scannedSKU = event.target.value;
        setBarcodeInput(scannedSKU);

        if (packingSlip.orderDetails.products.some(product => product.childSKU === scannedSKU)) {
            setScannedProducts(prev => new Set(prev).add(scannedSKU));
            onProductScanned(scannedSKU);
        }

        setTimeout(() => setBarcodeInput(''), 100);
    };

    const handleComplete = () => {
        onComplete(packingSlip.packingID);
    };

    const generatePDF = () => {
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

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg">
            <div ref={pdfRef}>
                <div className="flex justify-between items-start mb-8">
                    <div className='text-xs'>
                        <h1 className="text-xl font-normal mb-2">LITTLESPILLS INC</h1>
                        <p>324 TRADERS BLVD EAST</p>
                        <p>MISSISSAUGA ON L4Z 1W7</p>
                        <p>647-227-2525</p>
                        <p>littlespills.001@gmail.com</p>
                        <p>www.littlespills.com</p>
                    </div>
                    <img src={logo} alt="LITTLE SPILLS INC" className="w-48 mb-4" />
                    <div className="text-right font-normal">
                        DATE: <span className="font-thin text-sm">{new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-light mb-4 text-gray-500">Packing Slip {packingSlip.packingID}</h2>
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

                <div className="mb-8">
                    <p className="font-normal">PURCHASE ORDER NO</p>
                    <p>{packingSlip.orderDetails.purchaseOrderNumber}</p>
                </div>

                <Table striped>
                    <Table.Head>
                        <Table.HeadCell>ITEM No.</Table.HeadCell>
                        <Table.HeadCell>ITEM</Table.HeadCell>
                        <Table.HeadCell>DESCRIPTION</Table.HeadCell>
                        <Table.HeadCell>QTY</Table.HeadCell>
                        <Table.HeadCell>SCANNED</Table.HeadCell>
                    </Table.Head>
                    <Table.Body>
                        {packingSlip.orderDetails.products.map((product, index) => (
                            <Table.Row key={index}>
                                <Table.Cell>{product.childSKU}</Table.Cell>
                                <Table.Cell>{product.parentName} {product.childName}</Table.Cell>
                                <Table.Cell>{product.description}</Table.Cell>
                                <Table.Cell>{product.quantity}</Table.Cell>
                                <Table.Cell>
                                    <Checkbox
                                        checked={scannedProducts.has(product.childSKU)}
                                        readOnly
                                    />
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>

            <div className="mt-8 space-y-4">
                <input
                    type="text"
                    value={barcodeInput}
                    onChange={handleBarcodeScan}
                    placeholder="Scan barcode"
                    className="w-full p-2 border rounded"
                    autoFocus
                />
                <div className="flex justify-between">
                    <Button onClick={generatePDF}>Save as PDF</Button>
                    <Button
                        onClick={handleComplete}
                        disabled={packingSlip.phase === 'Completed'}
                    >
                        Mark as Completed
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EnhancedPackingSlip;