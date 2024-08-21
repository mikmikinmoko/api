export const checkPermission = (module, permissionType) => {
  return async (req, res, next) => {
    const hasPermission =
      req.currentUser.permissions.filter((o) => {
        if (o.module == module.module && o.submodule == module.submodule) {
          return o.permissions.split(";").includes(permissionType);
        }
      }).length > 0;

    if (hasPermission) {
      next();
    } else {
      res.status(403).json({
        error: 403,
        message:
          "Access failed. You do not have the necessary permissions to access this module.",
      });
    }
  };
};

export const checkDepartmentRole = (roleName) => {
  return async (req, res, next) => {
    console.log(req.currentUser.permissions);
    const hasAccess =
      req.currentUser.permissions.filter((o) => {
        return roleName == o.roleName;
      }).length > 0;

    if (hasAccess) {
      next();
    } else {
      res.status(403).json({
        error: 403,
        message:
          "Access failed. You do not have the necessary permissions to access this module.",
      });
    }
  };
};
