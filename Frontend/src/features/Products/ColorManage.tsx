import React, { useState, useEffect } from 'react';
import { productApis } from '../../config/apiRoutes/productRoutes';
import { toast } from 'react-toastify';
import Loading from '../../util/Loading';
import showConfirmationModal from '../../util/confirmationUtil';
import { Button, Table, TextInput } from 'flowbite-react';
import { Color, FormData } from '../../config/models/color';



const AddColor: React.FC = () => {
    const [loading, setLoading] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [formData, setFormData] = useState<FormData>({
        colorName: '',
        colorValue: '#000000',
        submittedColors: [],
        deletedColors: [],
    });

    useEffect(() => {
        const fetchColors = async () => {
            setLoading(true)
            try {
                const response = await productApis.GetColors()
                // console.log(response)
                setFormData((prevData) => ({
                    ...prevData,
                    submittedColors: response.data.filter((item: Color) => item.status === "ACTIVE"),
                    deletedColors: response.data.filter((item: Color) => item.status === "DELETED")
                }));
            } catch (error) {
                console.error('Error fetching colors:', error);
            } finally {
                setLoading(false)
            }
        };
        fetchColors();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (editingIndex !== null) {
            // Handle edit
            const colorToUpdate = formData.submittedColors[editingIndex];
            const updatedColor: Color = {
                ...colorToUpdate,
                name: formData.colorName,
                hexCode: formData.colorValue,
            };

            try {
                const res = await productApis.UpdateColors(updatedColor._id ?? "", updatedColor);
                if (res.status) {
                    toast.success("Color successfully updated.");
                    setFormData((prevData) => ({
                        ...prevData,
                        submittedColors: prevData.submittedColors.map((color, index) =>
                            index === editingIndex ? updatedColor : color
                        ),
                        colorName: '',
                        colorValue: '#000000',
                    }));
                }
            } catch (error) {
                console.error('Error updating color:', error);
            } finally {
                setEditingIndex(null);
                setLoading(false);
            }
        } else {
            // Handle new color submission
            const newColor: Color = {
                name: formData.colorName,
                hexCode: formData.colorValue,
                status: "ACTIVE"
            };

            try {
                let res = await productApis.AddColor(newColor);
                if (res.status) {
                    toast.success("Successfully added a new color.");
                    setFormData((prevData) => ({
                        ...prevData,
                        submittedColors: [...prevData.submittedColors, res.data],
                        colorName: '',
                        colorValue: '#000000',
                    }));
                }
            } catch (error) {
                console.error('Error adding color:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDelete = async (index: number) => {
        const confirmed = await showConfirmationModal("Are you sure you want to delete this color?")
        if (!confirmed)
            return
        const colorToDelete = formData.submittedColors[index];
        colorToDelete.status = "DELETED"
        try {

            let res = await productApis.UpdateColors(colorToDelete._id ?? "", colorToDelete);
            if (res.status)
                toast.success("Color successfully removed.")
            setFormData((prevData) => ({
                ...prevData,
                submittedColors: prevData.submittedColors.filter((_, i) => i !== index),
                deletedColors: [...prevData.deletedColors, colorToDelete],
            }));
        } catch (error) {
            console.error('Error deleting color:', error);
        }
    };
    const handleEdit = (index: number) => {
        const colorToEdit = formData.submittedColors[index];
        setFormData((prevData) => ({
            ...prevData,
            colorName: colorToEdit.name,
            colorValue: colorToEdit.hexCode,
        }));
        setEditingIndex(index);
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setFormData((prevData) => ({
            ...prevData,
            colorName: '',
            colorValue: '#000000',
        }));
    };

    const handleRestore = async (index: number) => {
        const colorToRestore = formData.deletedColors[index];
        colorToRestore.status = "ACTIVE"
        const confirmed = await showConfirmationModal("Are you sure you want to restore this color?")
        if (!confirmed)
            return
        try {

            const res = await productApis.UpdateColors(colorToRestore._id ?? "", colorToRestore)
            if (res.status)
                toast.success("Color successfully restored.")
            setFormData((prevData) => ({
                ...prevData,
                deletedColors: prevData.deletedColors.filter((_, i) => i !== index),
                submittedColors: [...prevData.submittedColors, colorToRestore],
            }));
        } catch (error) {
            console.error('Error restoring color:', error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-5 rounded-lg">
            {loading ? <Loading /> : <>
                <div className="mx-auto my-8">
                    <h2 className="text-center text-3xl font-bold text-gray-800 mb-6">Manage Colors</h2>
                    <form className="space-y-6 mb-8" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="colorPicker"
                                className="block text-gray-700 font-medium mb-2"
                            >
                                {editingIndex !== null ? 'Edit Color:' : 'Select Color:'}
                            </label>
                            <div className="flex items-center gap-x-5">
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="color"
                                        id="colorPicker"
                                        value={formData.colorValue}
                                        onChange={(e) => setFormData({ ...formData, colorValue: e.target.value })}
                                        required
                                        className="w-14 h-14 p-0 border-0 rounded-lg cursor-pointer"
                                    />
                                    <span className="text-gray-700">{formData.colorValue}</span>
                                </div>
                                <TextInput
                                    type="text"
                                    id="colorName"
                                    value={formData.colorName}
                                    onChange={(e) => setFormData({ ...formData, colorName: e.target.value?.toUpperCase() })}
                                    placeholder="Enter color name"
                                    maxLength={24}
                                    required
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button className='flex-1' type="submit" color={editingIndex !== null ? 'warning' : 'success'}>
                                {editingIndex !== null ? 'Update Color' : 'Submit'}
                            </Button>
                            {editingIndex !== null && (
                                <Button className='flex-1' type="button" color='failure' onClick={handleCancelEdit}>
                                    Cancel Edit
                                </Button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-y-0">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Submitted Colors</h3>
                        <Table>
                            <Table.Head className="bg-gray-100 text-gray-700">
                                <Table.HeadCell style={{ width: '40px' }}></Table.HeadCell>
                                <Table.HeadCell>Name</Table.HeadCell>
                                <Table.HeadCell>Hex Code</Table.HeadCell>
                                <Table.HeadCell>Actions</Table.HeadCell>
                            </Table.Head>
                            <Table.Body>
                                {formData.submittedColors.length > 0 ? formData.submittedColors.map((color, index) => (
                                    <Table.Row key={"existing" + index} className="border-t border-gray-200">
                                        <Table.Cell className="p-3">
                                            <div
                                                className="w-6 h-6 rounded-full border border-gray-300"
                                                style={{ backgroundColor: color.hexCode }}
                                            ></div>
                                        </Table.Cell>
                                        <Table.Cell>{color.name}</Table.Cell>
                                        <Table.Cell>{color.hexCode}</Table.Cell>
                                        <Table.Cell className="p-3 space-x-2 flex">
                                            <Button size="sm"
                                                color={'warning'}
                                                onClick={() => handleEdit(index)}
                                            >
                                                Edit
                                            </Button>
                                            <Button size="sm"
                                                color={'failure'}
                                                onClick={() => handleDelete(index)}
                                            >
                                                Delete
                                            </Button>
                                        </Table.Cell>
                                    </Table.Row>
                                )) : <></>}
                            </Table.Body>
                        </Table>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Deleted Colors</h3>
                        <Table className="">
                            <Table.Head>
                                <Table.HeadCell style={{ width: '40px' }}></Table.HeadCell>
                                <Table.HeadCell>Name</Table.HeadCell>
                                <Table.HeadCell>Hex Code</Table.HeadCell>
                                <Table.HeadCell>Action</Table.HeadCell>
                            </Table.Head>
                            <Table.Body>
                                {formData.deletedColors.length > 0 ? formData.deletedColors.map((color, index) => (
                                    <Table.Row key={"__deleted" + index} className="border-t border-gray-200">
                                        <Table.Cell className="p-3">
                                            <div
                                                className="w-6 h-6 rounded-full border border-gray-300"
                                                style={{ backgroundColor: color.hexCode }}
                                            ></div>
                                        </Table.Cell>
                                        <Table.Cell>{color.name}</Table.Cell>
                                        <Table.Cell>{color.hexCode}</Table.Cell>
                                        <Table.Cell className="p-3">
                                            <Button size="sm"
                                                color={'blue'}
                                                onClick={() => handleRestore(index)}
                                            >
                                                Restore
                                            </Button>
                                        </Table.Cell>
                                    </Table.Row>
                                )) : <></>}
                            </Table.Body>
                        </Table>
                    </div>
                </div>
            </>
            }
        </div >
    );
};

export default AddColor;
