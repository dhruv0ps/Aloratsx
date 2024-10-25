const permissionService = require("../services/permissionService")

const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        // console.log(req.user)
        const userPermissions = req.user?.role?.permissions || [];
        let userPermissionList = await permissionService.getPermissionByArr(userPermissions)
        const userPermissionName = userPermissionList.map(pm => pm.name)
        // console.log(userPermissionName,"here")
        if (userPermissionName.includes(requiredPermission) || userPermissionName.includes("Admin")) {
            next();
        } else {
            res.status(403).json({ status:false, err: `No Access to ${req.originalUrl.split("/")[1]}. Please contact Admin.`} );
        }
    };
};

module.exports = { checkPermission };