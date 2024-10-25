const Permission = require('../config/models/permissionModel');

const createPermission = async (permissionData) => {
  const permission = new Permission(permissionData);
  return await permission.save();
};

const getPermissionById = async (id) => {
  return await Permission.findById(id);
};

const getAllPermissions = async () => {
    return await Permission.find({ name: { $ne: 'Admin' } });
  };
  
const getPermissionByArr = async (IDs) =>{
  // console.log(IDs,"here")
  return await Promise.all(IDs.map(async id=>await Permission.findById(id).catch(err=>console.log(err))))
}
const updatePermission = async (id, permissionData) => {
  return await Permission.findByIdAndUpdate(id, permissionData, { new: true });
};

const deletePermission = async (id) => {
  return await Permission.findByIdAndDelete(id);
};

module.exports = {
  createPermission,
  getPermissionById,
  updatePermission,
  getAllPermissions,
  deletePermission,
  getPermissionByArr
};