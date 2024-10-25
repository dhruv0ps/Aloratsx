import { useState } from "react";
import { toast } from "react-toastify";
import { Button, FileInput, Label } from "flowbite-react";
import { FaChevronLeft } from "react-icons/fa6";
import { productApis } from "../config/apiRoutes/productRoutes";
import { FaDownload } from "react-icons/fa";
import { UploadResult } from "../config/models/product";

interface BulkProps {
    uploadResult: UploadResult | null;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setUploadResult: React.Dispatch<React.SetStateAction<UploadResult | null>>
    setBulkUpload: React.Dispatch<React.SetStateAction<boolean>>
}
const BulkUpload = (props: BulkProps) => {
    const MAX_FILE_SIZE = 2 * 1024 * 1024
    const [file, setFile] = useState<File | null>(null);
    // const navigate = useNavigate();

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file && file.size > MAX_FILE_SIZE)
            toast.error("File size exceeds 2MB.")
        else if (file) {
            saveExcelFile(file);
        }
    };

    const saveExcelFile = (file: File) => {
        setFile(file)
    };
    const onFileSubmit = async () => {
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            props.setLoading(true)
            props.setUploadResult(null)
            try {
                const response = await productApis.bulkUpload(formData);
                props.setUploadResult(response.data)
                toast.success("File data uploaded successfully.")
            } catch (error) {
                // console.error('Error uploading file:', error);
                toast.error('Error uploading file');
            } finally {
                props.setLoading(false)
            }
        }
    };
    const generateSampleCSV = () => {
        const fileUrl = `spillingprods.xlsx`;
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = 'sampleProdList.xlsx'; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const downloadReport = () => {
        if (!props.uploadResult) return;

        const headers = ['Row', 'SKU', 'Error'];
        const rows = [headers];

        // Add error rows
        props.uploadResult.errors.forEach(error => {
            rows.push([error.row.toString(), error.sku, error.error]);
        });

        let csvContent = "";
        rows.forEach((rowArray) => {
            let row = rowArray.join(",");
            csvContent += row + "\r\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'upload_report.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    console.log(props.uploadResult)
    return (
        <div className="p-8 mx-auto">
            <div className="flex items-center justify-between  mb-8">
                <Button className='' color={'gray'} onClick={() => props.setBulkUpload(false)}>
                    <span className='flex gap-2 items-center'><FaChevronLeft />Back</span>
                </Button>
                <h1 className="text-xl text-center text-gray-500">{`Upload multiple products`}</h1>
                <p></p>
            </div>
            <Label
                htmlFor="dropzone-file"
                className="flex h-64 mt-8 w-full object-contain cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                onDragOver={(e) => {
                    e.preventDefault();
                    // Add styles to indicate hovering over drop zone
                    e.currentTarget.classList.add('border-blue-500'); // Example class for highlighting
                }}
                onDragLeave={(e) => {
                    // Remove styles when leaving drop zone
                    e.currentTarget.classList.remove('border-blue-500');
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files);
                    saveExcelFile(files[0]); // Implement this function to handle dropped files
                    // Remove styles after dropping
                    e.currentTarget.classList.remove('border-blue-500');
                }}
            >
                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <svg
                        className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Excel files only (MAX. 2MB)</p>
                    <p className="text-xs text-center mt-1 text-red-500">Products with duplicate SKU will be skipped.</p>
                </div>
                <FileInput accept='.csv, .xlsx, .xls' id="dropzone-file" className="hidden" onChange={handleFileInputChange} />
            </Label>
            {file ? <p className="text-sm my-4 text-gray-500">File Selected: {file?.name}</p> : <></>}

            {/* <p className="text-center mb-4 text-red-500">Please add the suppliers before adding the products. If the supplier has not been added, products will be assigned to a default supplier.</p> */}
            <div className="flex items-center justify-center gap-5 mt-5">
                <button onClick={generateSampleCSV} className=" bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200 flex items-center">
                    Get Sample File
                </button>
                <button onClick={async () => await onFileSubmit()} className=" bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center">
                    {"Add products"}
                </button>
            </div>
            {props.uploadResult && (
                <div className="mt-8 p-4 border rounded-lg">
                    <h2 className="text-lg font-semibold mb-4">Upload Results</h2>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="p-4 bg-green-100 rounded">
                            <p className="text-sm text-gray-600">Added Products</p>
                            <p className="text-2xl font-bold">{props.uploadResult.addedProducts}</p>
                        </div>
                        <div className="p-4 bg-yellow-100 rounded">
                            <p className="text-sm text-gray-600">Skipped Products</p>
                            <p className="text-2xl font-bold">{props.uploadResult.skippedProducts}</p>
                        </div>
                        <div className="p-4 bg-red-100 rounded">
                            <p className="text-sm text-gray-600">Errors</p>
                            <p className="text-2xl font-bold">{props.uploadResult.errors.length}</p>
                        </div>
                    </div>

                    {props.uploadResult.errors.length > 0 && (
                        <>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-md font-semibold">Error Details</h3>
                                <Button
                                    size="sm"
                                    onClick={downloadReport}
                                    className="flex items-center gap-2"
                                >
                                    <FaDownload /> Download Report
                                </Button>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-2 text-left">Row</th>
                                            <th className="p-2 text-left">SKU</th>
                                            <th className="p-2 text-left">Error</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {props.uploadResult.errors.map((error, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="p-2">{error.row}</td>
                                                <td className="p-2">{error.sku}</td>
                                                <td className="p-2 text-red-600">{error.error}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default BulkUpload