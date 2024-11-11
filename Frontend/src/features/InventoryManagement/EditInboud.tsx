import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaChevronLeft } from 'react-icons/fa';
import { inventoryApi } from '../../config/apiRoutes/inventoryApi';
import AutocompleteProductInput from '../../util/AutoCompleteProductInput';
import { Button } from 'flowbite-react';
import Loading from '../../util/Loading';
import showConfirmationModal from '../../util/confirmationUtil';

interface ChildItem {
  sku: string;
  name: string;
}

// Define a type for the product item in the inbound list
interface InboundItem {
  product: string;
  parentName: string;
  child: ChildItem;
  quantity: number;
 
}

// Define a type for the inbound state
interface Inbound {
  items: InboundItem[];
  name? : string
  status: string;
  referenceNumber: string;
  image?: File | null;
}

const InboundCreation = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [inbound, setInbound] = useState<Inbound>({
    items: [],
    status: 'DRAFT',
    referenceNumber: '',
    image: null,
  });
  const [inputValue, setInputValue] = useState('');
//   const [imageFile, setImageFile] = useState<File | null>(null);
// console.log(imageFile);
  useEffect(() => {
    if (id) {
      const fetchInbound = async () => {
        setLoading(true);
        try {
          const res = await inventoryApi.getDraftById(id);
          setInbound(res.data as any);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchInbound();
    }
  }, [id]);
  console.log(id)
    
  const handleProductChange = (product: any & { parentName: string; parent_id: string }) => {
    console.log(inbound)
    setInbound((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          
          product: product.parent_id,
          parentName: product.parentName,
            parentId: product.parent_id, 
          child: {
            sku: product.SKU,
            name: product.name,
          },
          quantity: 1,
         
        },
      ],
    }));
    setInputValue('');
  };

  const handleComplete = async () => {
    if (!id) return;
    try {
      let confirmed = await showConfirmationModal(
        "Are you sure you would like to mark this inbound as completed? This action cannot be undone."
      );
      if (!confirmed) return;
      setLoading(true);
     let res = await inventoryApi.completeDraft(id);
      if (res.status) navigate('/yellowadmin/inventory/inbound');
      toast.success("Draft successfully completed.");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setInbound((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, quantity } : item
      ),
    }));
  };

  const handleRemoveItem = (index: number) => {
    setInbound((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(inbound)
    try {
      setLoading(true);
      let res;
      if (id) {
        res = await inventoryApi.updateDraft(id, inbound);
      } else {
        res = await inventoryApi.createDraft(inbound);
      }
      if (res.status) {
        toast.success(`Inbound ${id ? 'updated' : 'created'} successfully`);
        if(!id){
          navigate('/yellowadmin/inventory/inbound');
        }
       
      }
    } catch (error) {
      console.error(`Failed to ${id ? 'update' : 'create'} inbound`);
    } finally {
      setLoading(false);
    }
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files ? e.target.files[0] : null;
  //   setImageFile(file);
  //   setInbound((prev) => ({ ...prev, image: file }));
  // };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen border-l border-gray-200 bg-gray-50 -mt-5 py-12 px-4 sm:px-6 lg:px-8">
     
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate(-1)}
          className="sm:flex items-center text-gray-600 hover:text-gray-900 hidden"
        >
          <FaChevronLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        {id && inbound.status === "DRAFT" && (
          <Button onClick={handleComplete} color="dark">
            Mark as Complete
          </Button>
        )}
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {id ? `${inbound.name || 'Inbound Management'}` : "Inbound Management"}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create and manage inbound orders efficiently.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Number
              </label>
              <input
                type="text"
                value={inbound.referenceNumber}
                onChange={(e) =>
                  setInbound((prev) => ({
                    ...prev,
                    referenceNumber: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Products
              </label>
              <AutocompleteProductInput
                value={inputValue}
                onChange={handleProductChange}
                setInputValue={setInputValue}
              />
            </div>

            {/* <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div> */}

            <div className="bg-gray-100 rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Added Products
              </h2>
              <ul className="space-y-4">
                {inbound.items.map((item: any, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-white rounded-lg shadow-md p-4"
                  >
                    <div>
                      <h3 className="text-gray-900 font-medium">
                        {item.product.name
                          ? item.product.name
                          : `${item.parentName} | ${item.child.name}`}
                      </h3>
                      <p className="text-gray-600">SKU: {item.child.sku}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(index, parseInt(e.target.value))
                        }
                        className="w-20 px-2 py-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors"
                      />
                      <Button
                        color="failure"
                        outline
                        onClick={() => handleRemoveItem(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-x-5">
              <Button
                className="w-full"
                disabled={inbound.status !== "DRAFT"}
                type="submit"
                color="dark"
              >
                {id ? 'Update Draft' : 'Create Draft'}
              </Button>
              {id && inbound.status === "DRAFT" && (
                <Button className="w-full" color="failure">
                  Cancel Draft
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InboundCreation;
