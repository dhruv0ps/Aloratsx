import React from 'react';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';
import { Button } from 'flowbite-react';

interface BarcodeGeneratorProps {
    children: Array<{ SKU: string; name: string }>;
    parentName:string
}

const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({ children, parentName }) => {
    const componentRef = React.useRef(null);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    return (
        <div>
            <div style={{ display: 'none' }}>
                <div ref={componentRef}>
                    {children.map((child) => (
                        <div key={child.SKU} style={{ 
                            pageBreakInside: 'avoid', 
                            marginBottom: '20px',
                            width: '288px',
                            height: '288px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center'}}>
                            <Barcode  
                            value={child.SKU} 
                            width={2.5}
                            height={60}
                            fontSize={12} />
                            <div style={{ fontSize: '12px', marginTop: '5px' }}>
                            <div> {parentName} - {child.name}</div>
                            {/* <div>Colour: {child.color.name}</div> */}
              </div>
                        </div>
                    ))}
                </div>
            </div>
            <Button color="blue" onClick={handlePrint}>
                Print Barcodes
            </Button>
        </div>
    );
};

export default BarcodeGenerator;