const { Permission, RolePermission } = require("../models");

const seed = [
    ["dashboard.view","View dashboard","dashboard"],
    ["customers.view","View customers","customers"],
    ["customers.create","Create customers","customers"],
    ["customers.update","Update customers","customers"],
    ["customers.delete","Delete customers","customers"],
    ["drivers.view","View drivers","drivers"],
    ["drivers.create","Create drivers","drivers"],
    ["drivers.update","Update drivers","drivers"],
    ["drivers.delete","Delete drivers","drivers"],
    ["vehicles.view","View vehicles","vehicles"],
    ["vehicles.create","Create vehicles","vehicles"],
    ["vehicles.update","Update vehicles","vehicles"],
    ["vehicles.delete","Delete vehicles","vehicles"],
    ["bookings.view","View bookings","bookings"],
    ["bookings.create","Create bookings","bookings"],
    ["bookings.update","Update bookings","bookings"],
    ["bookings.assign","Assign drivers","bookings"],
    ["payments.view","View payments","payments"],
    ["payments.create","Create payments","payments"],
    ["reports.view","View reports","reports"],
    ["users.manage","Manage users","users"],
    ["acl.manage","Manage ACL","acl"]
];

async function seedAcl(){

    //console.log("Permission model:", Permission);
    //console.log("RolePermission model:", RolePermission);

    for(const [code,name,module] of seed) await Permission.findOrCreate({where:{code},defaults:{name,module}});

    const defaults = {
        ADMIN:seed.filter(x=>!["users.manage","acl.manage"].includes(x[0])).map(x=>x[0]),
        MANAGER:["dashboard.view","customers.view","customers.create","customers.update","drivers.view","drivers.create","drivers.update","vehicles.view","vehicles.create","vehicles.update","bookings.view","bookings.create","bookings.update","bookings.assign","payments.view","payments.create","reports.view"],
        STAFF:["dashboard.view","customers.view","customers.create","drivers.view","vehicles.view","bookings.view","bookings.create","payments.view"]
    };

    for(const [role,codes] of Object.entries(defaults)){ 
        for(const code of codes){ 
            const p=await Permission.findOne({where:{code}}); 
            if(p) await RolePermission.findOrCreate({where:{role,permissionId:p.id}}); 
        }
    }
}

module.exports={seedAcl};
