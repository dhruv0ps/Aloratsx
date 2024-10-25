import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Loading from '../../util/Loading';
import showConfirmationModal from '../../util/confirmationUtil';
import { Button, FloatingLabel, Table } from 'flowbite-react';
import { TaxFormData, taxSlab } from '../../config/models/taxslab';
import { commonApis } from '../../config/apiRoutes/commonRoutes';
import { FaChevronLeft } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

const TaxSlabManage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<TaxFormData>({
        name: "",
        gst: 0,
        hst: 0,
        qst: 0,
        pst: 0,
        status: "ACTIVE",
        submittedSlabs: [],
        deletedSlabs: []
    });
    const navigate = useNavigate()

    useEffect(() => {
        const fetchTaxSlabs = async () => {
            setLoading(true);
            try {
                const response = await commonApis.getAllTaxSlabs();
                setFormData((prevData) => ({
                    ...prevData,
                    submittedSlabs: response.data.filter((item: taxSlab) => item.status === "ACTIVE"),
                    deletedSlabs: response.data.filter((item: taxSlab) => item.status === "DELETED")
                }));
            } catch (error) {
                console.error('Error fetching tax slabs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTaxSlabs();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.gst === 0 && formData.hst === 0 && formData.qst === 0 && formData.pst === 0) {
            toast.error("At least one tax field must have a value.");
            return;
        }
        setLoading(true);
        const newSlab: taxSlab = {
            name: formData.name,
            gst: formData.gst,
            hst: formData.hst,
            qst: formData.qst,
            pst: formData.pst,
            status: "ACTIVE"
        };

        try {
            let res = await commonApis.createTaxSlab(newSlab);
            if (res.status)
                toast.success("Successfully added a new tax slab.");
            setFormData((prevData) => ({
                ...prevData,
                submittedSlabs: [...prevData.submittedSlabs, res.data],
                name: '',
                gst: 0,
                hst: 0,
                qst: 0,
                pst: 0,
            }));
            await commonApis.getAllTaxSlabs()
        } catch (error) {
            console.error('Error adding tax slab:', error);
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async (index: number) => {
        const confirmed = await showConfirmationModal("Are you sure you want to delete this tax slab?");
        if (!confirmed) return;
        const slabToDelete = formData.submittedSlabs[index];
        slabToDelete.status = "DELETED";
        try {
            let res = await commonApis.updateTaxSlab(slabToDelete._id ?? "", slabToDelete);  // Assuming an API exists for this
            if (res.status)
                toast.success("Tax slab successfully removed.");
            setFormData((prevData) => ({
                ...prevData,
                submittedSlabs: prevData.submittedSlabs.filter((_, i) => i !== index),
                deletedSlabs: [...prevData.deletedSlabs, res.data],
            }));
        } catch (error) {
            console.error('Error deleting tax slab:', error);
        }
    };

    const handleRestore = async (index: number) => {
        const slabToRestore = formData.deletedSlabs[index];
        slabToRestore.status = "ACTIVE";
        const confirmed = await showConfirmationModal("Are you sure you want to restore this tax slab?");
        if (!confirmed) return;
        try {
            const res = await commonApis.updateTaxSlab(slabToRestore._id ?? "", slabToRestore);  // Assuming an API exists for this
            if (res.status)
                toast.success("Tax slab successfully restored.");
            setFormData((prevData) => ({
                ...prevData,
                deletedSlabs: prevData.deletedSlabs.filter((_, i) => i !== index),
                submittedSlabs: [...prevData.submittedSlabs, res.data],
            }));
        } catch (error) {
            console.error('Error restoring tax slab:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const { name, value } = e.target;
            if (value !== '') {
                const floatValue = parseFloat(parseFloat(value).toFixed(3));
                setFormData(prev => ({
                    ...prev,
                    [name]: floatValue > 50 ? 50 : floatValue
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [name]: 0
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-5 rounded-lg">
            {loading ? <Loading /> : <>
                <div className="mx-auto my-8">
                    <div className='mb-12 flex items-center justify-between'>
                        <Button color='gray' onClick={() => navigate(-1)}>
                            <span className='flex gap-2 items-center'><FaChevronLeft />Back</span>
                        </Button>
                        <h2 className="text-2xl font-semibold ">Manage Tax Slabs</h2>
                        <p></p>
                    </div>
                    <form className="space-y-6 mb-8" onSubmit={handleSubmit}>
                        <div>
                            <FloatingLabel
                                variant='outlined'
                                label='Province'
                                type="text"
                                id="taxName"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value?.toUpperCase() })}
                                maxLength={24}
                                required
                                className="flex-1"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <FloatingLabel
                                    variant='outlined'
                                    label='GST (%)'
                                    type="number"
                                    step="0.001"
                                    id="gst"
                                    name="gst"
                                    value={formData.gst}
                                    onChange={handleInputChange}
                                    min={0}
                                    max={50}
                                />
                            </div>

                            <div>
                                <FloatingLabel
                                    variant='outlined'
                                    label='HST (%)'
                                    type="number"
                                    step="0.001"
                                    id="hst"
                                    name="hst"
                                    value={formData.hst}
                                    onChange={handleInputChange}
                                    min={0}
                                    max={50}
                                />
                            </div>

                            <div>
                                <FloatingLabel
                                    variant='outlined'
                                    label='QST (%)'
                                    type="number"
                                    step="0.001"
                                    id="qst"
                                    name="qst"
                                    value={formData.qst}
                                    onChange={handleInputChange}
                                    min={0}
                                    max={50}
                                />
                            </div>

                            <div>
                                <FloatingLabel
                                    variant='outlined'
                                    label='PST (%)'
                                    type="number"
                                    step="0.001"
                                    id="pst"
                                    name="pst"
                                    value={formData.pst}
                                    onChange={handleInputChange}
                                    min={0}
                                    max={50}
                                />
                            </div>
                        </div>

                        <Button className='w-full' type="submit" color={'success'}>
                            Submit
                        </Button>
                    </form>
                </div>

                <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-y-0">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Submitted Tax Slabs</h3>
                        <Table className="">
                            <Table.Head className="bg-gray-100 text-gray-700">
                                <Table.HeadCell>Name</Table.HeadCell>
                                <Table.HeadCell>GST (%)</Table.HeadCell>
                                <Table.HeadCell>HST (%)</Table.HeadCell>
                                <Table.HeadCell>QST (%)</Table.HeadCell>
                                <Table.HeadCell>PST (%)</Table.HeadCell>
                                <Table.HeadCell>Total Tax(%)</Table.HeadCell>
                                <Table.HeadCell>Action</Table.HeadCell>
                            </Table.Head>
                            <Table.Body>
                                {formData.submittedSlabs.length > 0 ? formData.submittedSlabs.map((slab, index) => (
                                    <Table.Row key={"existing" + index} className="border-t border-gray-200">
                                        <Table.Cell>{slab.name}</Table.Cell>
                                        <Table.Cell>{slab.gst}</Table.Cell>
                                        <Table.Cell>{slab.hst}</Table.Cell>
                                        <Table.Cell>{slab.qst}</Table.Cell>
                                        <Table.Cell>{slab.pst}</Table.Cell>
                                        <Table.Cell>{slab.pst + slab.gst + slab.qst + slab.hst}</Table.Cell>
                                        <Table.Cell className="p-3">
                                            <Button size="sm" color={'failure'} onClick={() => handleDelete(index)}>
                                                Delete
                                            </Button>
                                        </Table.Cell>
                                    </Table.Row>
                                )) : <></>}
                            </Table.Body>
                        </Table>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Deleted Tax Slabs</h3>
                        <Table className="">
                            <Table.Head>
                                <Table.HeadCell>Name</Table.HeadCell>
                                <Table.HeadCell>GST (%)</Table.HeadCell>
                                <Table.HeadCell>HST (%)</Table.HeadCell>
                                <Table.HeadCell>QST (%)</Table.HeadCell>
                                <Table.HeadCell>PST (%)</Table.HeadCell>
                                <Table.HeadCell>Total Tax(%)</Table.HeadCell>
                                <Table.HeadCell>Action</Table.HeadCell>
                            </Table.Head>
                            <Table.Body>
                                {formData.deletedSlabs.length > 0 ? formData.deletedSlabs.map((slab, index) => (
                                    <Table.Row key={"__deleted" + index} className="border-t border-gray-200">
                                        <Table.Cell>{slab.name}</Table.Cell>
                                        <Table.Cell>{slab.gst}</Table.Cell>
                                        <Table.Cell>{slab.hst}</Table.Cell>
                                        <Table.Cell>{slab.qst}</Table.Cell>
                                        <Table.Cell>{slab.pst}</Table.Cell>
                                        <Table.Cell>{slab.pst + slab.gst + slab.qst + slab.hst}</Table.Cell>
                                        <Table.Cell className="p-3">
                                            <Button size="sm" color={'blue'} onClick={() => handleRestore(index)}>
                                                Restore
                                            </Button>
                                        </Table.Cell>
                                    </Table.Row>
                                )) : <></>}
                            </Table.Body>
                        </Table>
                    </div>
                </div>
            </>}
        </div>
    );
};

export default TaxSlabManage;