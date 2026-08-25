const swagger = require("swagger-jsdoc");
module.exports = swagger({
	definition:{
		openapi:"3.0.0",
		info:{
			title:"Driver Center API",
			version:"2.0.0"
		},
		servers:[{
			url:"http://localhost:5000/api"
		}],
		components:{
			securitySchemes:{
				bearerAuth:{
					type:"http",
					scheme:"bearer",
					bearerFormat:"JWT"
				}
			}
		}
	},
	apis:['./src/routes/*.js']
});