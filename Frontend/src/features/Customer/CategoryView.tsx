import { useEffect, useState } from 'react';
import { Button, Table, Modal, TextInput, Label } from 'flowbite-react';
import { MdEdit } from 'react-icons/md';
import { FaCheck, FaTimes, FaChevronLeft } from 'react-icons/fa';
import { customerCategoryApi } from '../../config/apiRoutes/customerCategoryApi';
import { toast } from 'react-toastify';
import showConfirmationModal from '../../util/confirmationUtil';

export default function CategoryView() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editCategory, setEditCategory] = useState<any>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await customerCategoryApi.getCustomercategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async () => {
    setLoading(true);
    try {
      await customerCategoryApi.updateCustomercateory(editCategory._id, editCategory);
      toast.success('Category updated successfully');
      setShowEditModal(false);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateDeactivate = async (id: string, isActive: boolean) => {
    const confirmMessage = isActive
      ? 'Are you sure you want to deactivate this category?'
      : 'Are you sure you want to activate this category?';

    const confirm = await showConfirmationModal(confirmMessage);
    if (!confirm) return;

    try {
      await customerCategoryApi.updateCustomercateory(id, { isActive: !isActive });
      toast.success(isActive ? 'Category deactivated successfully' : 'Category activated successfully');
      fetchCategories();
    } catch (error) {
      console.error(`Error ${isActive ? 'deactivating' : 'activating'} category:`, error);
      toast.error(`Failed to ${isActive ? 'deactivate' : 'activate'} category`);
    }
  };

  if (loading) {
    return <p>Loading categories...</p>;
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] border-l border-gray-200 bg-gray-50 -mt-5 py-12 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => window.history.back()}
        className="sm:flex items-center text-gray-600 hover:text-gray-900 hidden mb-5"
      >
        <FaChevronLeft className="w-5 h-5 mr-2" />
        Back
      </button>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Category Management</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Manage categories for your system.</p>
        </div>

        {/* Category Table */}
        <div className="bg-white rounded-lg shadow-lg p-8 overflow-x-auto">
          <Table className="w-full">
            <Table.Head>
              <Table.HeadCell>Category Id</Table.HeadCell>
              <Table.HeadCell>Category Name</Table.HeadCell>
              <Table.HeadCell>Description</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell className="text-center">Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="text-gray-700">
              {categories.map((category: any) => (
                <Table.Row key={category._id} className="border-t border-gray-200">
                  <Table.Cell>{category.customercategoryId}</Table.Cell>
                  <Table.Cell>{category.customercategoryName}</Table.Cell>
                  <Table.Cell>{category.customercategoryDescription}</Table.Cell>
                  <Table.Cell>
                    {category.isActive ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Active</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Inactive</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2 items-center justify-center">
                      <Button
                        size="sm"
                        color="warning"
                        onClick={() => {
                          setEditCategory(category);
                          setShowEditModal(true);
                        }}
                      >
                        <MdEdit className="h-5 w-5" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        color={category.isActive ? 'red' : 'green'}
                        onClick={() => handleActivateDeactivate(category._id, category.isActive)}
                      >
                        {category.isActive ? <FaTimes className="h-5 w-5" /> : <FaCheck className="h-5 w-5" />}
                        {category.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>

        {/* Edit Category Modal */}
        {editCategory && (
          <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
            <Modal.Header>Edit Category</Modal.Header>
            <Modal.Body>
              <div>
                <Label htmlFor="categoryId">Category Id (Read-only)</Label>
                <TextInput
                  id="categoryId"
                  name="customercategoryId"
                  value={editCategory.customercategoryId}
                  readOnly
                />
              </div>
              <div className="mt-4">
                <Label htmlFor="editName">Category Name</Label>
                <TextInput
                  id="editName"
                  name="customercategoryName"
                  value={editCategory.customercategoryName}
                  onChange={(e) => setEditCategory({ ...editCategory, customercategoryName: e.target.value })}
                />
              </div>
              <div className="mt-4">
                <Label htmlFor="editDescription">Description</Label>
                <TextInput
                  id="editDescription"
                  name="customercategoryDescription"
                  value={editCategory.customercategoryDescription}
                  onChange={(e) => setEditCategory({ ...editCategory, customercategoryDescription: e.target.value })}
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={handleEditCategory}>Save Changes</Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    </div>
  );
}
