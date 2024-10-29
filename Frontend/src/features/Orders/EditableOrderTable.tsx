// import React, { useState, useEffect } from 'react';
// import { Modal, Button, Table, TextInput } from 'flowbite-react';
// import { FaUser, FaFileInvoice, FaBox, FaMapMarkerAlt } from 'react-icons/fa';
// import { OrderWithData } from '../../config/models/order';
// import { toast } from 'react-toastify';
// import { orderApis } from '../../config/apiRoutes/orderRoutes';

// interface EditableOrderModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   order: OrderWithData;
//   onOrderUpdate: (updatedOrder: OrderWithData) => void;
// }

// const EditableOrderModal: React.FC<EditableOrderModalProps> = ({ isOpen, onClose, order, onOrderUpdate }) => {
//   const [editableOrder, setEditableOrder] = useState<OrderWithData>(order);

//   useEffect(() => {
//     setEditableOrder(order);
//     console.log(order,"...............order details")
//   }, [order]);

//   const handlePriceChange = (index: number, newPrice: string) => {
//     const updatedProducts = editableOrder.products.map((product, idx) =>
//       idx === index ? { ...product, price: parseFloat(newPrice) || 0 } : product
//     );
  
//     const totalBeforeTax = updatedProducts.reduce(
//       (total, product) => total + product.quantity * product.price, 0
//     );
  
//     const taxRate = editableOrder.taxSlab && !(editableOrder.checkboxState ?? false)
//   ? ((editableOrder.taxSlab.gst ?? 0) + (editableOrder.taxSlab.hst ?? 0)) / 100
//   : 0;

//     const taxAmount = totalBeforeTax * taxRate;
//     const grandTotal = totalBeforeTax + taxAmount;
    
//     setEditableOrder(prevOrder => ({
//       ...prevOrder,
//       products: updatedProducts,
//       grandTotal
//     }));
//   };
  

//   const handleSave = async () => {
//     try {
//       console.log(editableOrder,".............editable order")
    
//       const response = await orderApis.updateOrder(editableOrder?._id, editableOrder);
//       if (response.status) {
//         onOrderUpdate(editableOrder);
//         toast.success('Order updated successfully');
//         onClose();
//       } else {
//         toast.error('Failed to update order');
//       }
//     } catch (error) {
//       console.error('Error updating order:', error);
//       toast.error('An error occurred while updating the order');
//     }
//   };

//   return (
//     <Modal show={isOpen} onClose={onClose} size="xl">
//       <Modal.Header className="border-b border-gray-200 !p-6 !m-0">
//         <h3 className="text-xl font-semibold text-gray-700">Order Details</h3>
//       </Modal.Header>
//       <Modal.Body className="!p-6">
//         <div className="space-y-6 text-gray-500">
//           {/* Order ID and Date section */}
//           <div className="flex justify-between items-center">
//             <div>
//               <p className="text-sm text-gray-500">Order ID</p>
//               <p className="text-lg font-semibold">{editableOrder?.purchaseOrderNumber}</p>
//             </div>
//             <div className="text-right">
//               <p className="text-sm text-gray-500">Order Date</p>
//               <p className="text-lg">{new Date(editableOrder?.date).toLocaleDateString()}</p>
//             </div>
//           </div>

//           {/* Dealer Information and Order Status section */}
//           <div className="grid grid-cols-2 gap-4">
//             <div className="col-span-1">
//               <h4 className="text-lg font-semibold flex items-center mb-4">
//                 <FaUser className="mr-2" /> Dealer Information
//               </h4>
//               <p><span className="font-medium">Name:</span> {editableOrder?.dealer.contactPersonName}</p>
//               <p><span className="font-medium">Company:</span> {editableOrder?.dealer.companyName}</p>
//             </div>
//             <div className="col-span-1">
//               <h4 className="text-lg font-semibold flex items-center mb-4">
//                 <FaFileInvoice className="mr-2" /> Order Status
//               </h4>
//               <p><span className="font-medium">Order Status:</span> {editableOrder?.status}</p>
//               <p><span className="font-medium">Invoice Status:</span> {editableOrder?.invoiceStatus || 'Pending'}</p>
//             </div>
//           </div>

//           {/* Products section */}
//           <div>
//             <h4 className="text-lg font-semibold flex items-center mb-4">
//               <FaBox className="mr-2" /> Products
//             </h4>
//             <Table>
//               <Table.Head>
//                 <Table.HeadCell>Product Name</Table.HeadCell>
//                 <Table.HeadCell>Quantity</Table.HeadCell>
//                 <Table.HeadCell>Price</Table.HeadCell>
//                 <Table.HeadCell>Total</Table.HeadCell>
//               </Table.Head>
//               <Table.Body>
//                 {editableOrder?.products.map((product, index) => (
//                   <Table.Row key={index} className="bg-white">
//                     <Table.Cell>{product.product.name}</Table.Cell>
//                     <Table.Cell>{product.quantity}</Table.Cell>
//                     <Table.Cell>
//                       <TextInput
//                         type="number"
//                         value={product.price.toFixed(2)}
//                         onChange={(e) => handlePriceChange(index, e.target.value)}
                        
//                       />
//                     </Table.Cell>
//                     <Table.Cell>${(product.quantity * product.price).toFixed(2)}</Table.Cell>
//                   </Table.Row>
//                 ))}
//               </Table.Body>
//             </Table>
//             <div className="text-right mt-4">
//               <p className="text-lg font-semibold">Grand Total: ${editableOrder?.grandTotal.toFixed(2)}</p>
//             </div>
//           </div>

//           {/* Billing Address section */}
//           <div>
//             <h4 className="text-lg font-semibold flex items-center mb-2">
//               <FaMapMarkerAlt className="mr-2" /> Billing Address
//             </h4>
//             <p>{editableOrder?.billTo.companyName}</p>
//             <p>{editableOrder?.billTo.address.address}</p>
//           </div>
//         </div>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button color="green" onClick={handleSave}>Save Changes</Button>
//         <Button color="gray" onClick={onClose}>Close</Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default EditableOrderModal;