import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Location as InvLocation } from '../../config/models/supplier';
import { toast } from 'react-toastify';
import Loading from '../../util/Loading';
import { Button } from 'flowbite-react';
import { FaChevronLeft } from 'react-icons/fa6';
import AutoCompleteAddress from '../../util/AutoCompleteGoogle';
import { Address } from '../../config/models/address';
import { inventoryApi } from '../../config/apiRoutes/inventoryApi';

type LocationWithoutAddress = Omit<InvLocation, 'address'>;
type LocationAddress = Pick<InvLocation, 'address' | 'pickupGoogleMapLink'>;

interface SupplierErrors {
  name?: string;
  phoneNumber1?: string;
  phoneNumber2?: string;
  emailID?: string;
  address?: string;
  pickupGoogleMapLink?: string;
}

const InvLocationForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<InvLocation>({
    name: '',
    emailID: '',
    address: {
      address: "",
      longitude: "",
      latitude: ""
    },
    pickupGoogleMapLink: '',
  });
  const [errors, setErrors] = useState<SupplierErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<LocationAddress>({
    address: {
      address: "",
      longitude: "",
      latitude: ""
    },
    pickupGoogleMapLink: ''
  })


  useEffect(() => {
    const fetchSupplier = async () => {
      if (id) {
        setLoading(true)
        try {
          const response = await inventoryApi.getInvLocationById(id);
          console.log(response)
          let location: InvLocation = response.data
          setFormData(location);
          setAddresses({ address: location.address, pickupGoogleMapLink: location.pickupGoogleMapLink })
        } catch (error) {
          console.error('Error:', error);
          // toast.error('Failed to fetch supplier details');
        } finally {
          setLoading(false)
        }
      }
    };

    fetchSupplier();
  }, [id]);

  const validate = (): boolean => {
    const newErrors: SupplierErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.emailID) newErrors.emailID = 'Email ID is required';
    if (!/\S+@\S+\.\S+/.test(formData.emailID)) newErrors.emailID = 'Email ID is invalid';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    let { name, value } = e.target;
    if (name === "name")
      value = value?.toLocaleUpperCase()
    else if (name === "initials") {
      value = value?.toLocaleUpperCase()
      if (value.length > 2)
        return;
    }
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleAddressChange = (address: Address, isUnitBuzz?: boolean) => {
    if (isUnitBuzz) {
      setAddresses(prev => ({ ...prev, address: address }))
    }
    else if (address.address) {
      setAddresses(prevAddresses => ({
        ...prevAddresses,
        address: {
          ...prevAddresses.address, longitude: address.longitude, latitude: address.latitude, address: address.address
        },
        pickupGoogleMapLink: `https://www.google.com/maps?q=${address.latitude},${address.longitude}`
      }))
    }
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;
    if (!addresses.address.address) {
      toast.info("Please select a pickup Location ")
      return;
    }
    setLoading(true)
    try {
      const response = id ? await inventoryApi.updateInvLocation(id, { ...formData, ...addresses }) : await inventoryApi.createInvLocations({ ...formData, ...addresses })
      if (response.status) {
        toast.success(`Successfully ${id ? " updated" : " added"} the Location.`)
        navigate('/inventory/location/view');
      } else {
        toast.error(response.err ?? "Something went wrong")
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.response.err ?? 'Failed to save supplier');
    } finally {
      setLoading(false)
    }
  };


  return (
    loading ? <Loading /> : <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg">
      <div className='mb-6 flex items-center justify-between'>
        <Button color='gray' onClick={() => navigate(-1)}>
          <span className='flex gap-2 items-center'><FaChevronLeft />Back</span>
        </Button>
        <h2 className="text-2xl font-semibold mb-4">{id ? `Edit Inventory Location` : `Add Inventory Location`}</h2>
        <p></p>
      </div>
      <form onSubmit={handleSubmit}>
        {[
          { label: 'Name', name: 'name', type: 'text' },
          { label: 'Email ID', name: 'emailID', type: 'email' },
        ].map((field) => (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}:
            </label>
            <input

              type={field.type}
              id={field.name}
              name={field.name}
              value={formData[field.name as keyof LocationWithoutAddress]} // Type assertion to satisfy TypeScript
              onChange={handleInputChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${errors[field.name as keyof SupplierErrors] ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors[field.name as keyof SupplierErrors] && (
              <p className="text-red-500 text-sm">{errors[field.name as keyof SupplierErrors]}</p>
            )}
          </div>
        ))}
        <div key={"address"} className="mb-4 space-y-2">
          <label htmlFor={"address"} className="block text-sm font-medium text-gray-700 mb-2">
            Address:
          </label>
          <div className="flex gap-x-5 items-center w-full">
            <input
              className='flex-[0.5] w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200'
              name="unit"
              placeholder='Unit'
              value={addresses.address.unit || ''}
              onChange={(e) => handleAddressChange({ ...addresses.address, unit: e.target.value }, true)}
            />
            <input
              className='flex-[0.5] w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-200'
              name="buzz"
              placeholder='Buzz Code'
              value={addresses.address.buzz || ''}
              onChange={(e) => handleAddressChange({ ...addresses.address, buzz: e.target.value }, true)}
            />
          </div>

          {/* {id ? <AutoCompleteAddress onChange={handleAddressChange} /> : <AutoCompleteAddress onChange={handleAddressChange} address={addresses.address.address} />} */}
          <AutoCompleteAddress onChange={handleAddressChange} />
          {addresses.address.address ? <p className='text-xs text-gray-500 my-2'><b>Selected Location :</b> {addresses.address.address}</p> : <></>}
        </div>
        <div key={"pickupGoogleMapLink"} className="mb-4">
          <label htmlFor={"pickupGoogleMapLink"} className="block text-sm font-medium text-gray-700 mb-2">
            Google Map Link:
          </label>
          <input

            type='text'
            id={"pickupGoogleMapLink"}
            name={"pickupGoogleMapLink"}
            value={addresses.pickupGoogleMapLink}
            placeholder='Automatically fetched upon selecting pickup location'
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${errors["pickupGoogleMapLink" as keyof SupplierErrors] ? 'border-red-500' : 'border-gray-300'
              }`}
          />
        </div>


        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-200"
        >
          {id ? `Update Location` : `Add Location`}
        </button>
      </form>
    </div>
  );
};

export default InvLocationForm;
