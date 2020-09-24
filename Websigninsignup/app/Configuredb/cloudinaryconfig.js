const cloudinary = require( 'cloudinary' );

cloudinary.config({ 
  cloud_name: 'bparul', 
  api_key: '421933965643576', 
  api_secret: 'FzNpTyA2O3MXnutT8Q5eRU_I8sY' 
});
// const cloudinaryConfig = () => config({
// 	cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'bparul',
// 	api_key: process.env.CLOUDINARY_API_KEY || "",
// 	api_secret: process.env.CLOUDINARY_API_SECRET || "",
// });