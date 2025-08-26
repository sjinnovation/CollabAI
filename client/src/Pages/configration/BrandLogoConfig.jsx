import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
 import { Avatar, Button, Card, Flex, Upload, message } from 'antd';
 import React, { useContext, useEffect, useState } from 'react'
 import loader from "../../assests/images/loader.svg";
 import { SidebarContext } from '../../contexts/SidebarContext';
 import { uploadBrandLogo, fetchCompanyInfo, deleteBrandLogo } from '../../api/settings';
 import ConfigurationHeader from '../../component/Configuration/ConfigurationHeader/ConfigurationHeader';
 import defaultLogo from "../../assests/images/brandLogo/logoIcon.svg";

 const BrandLogoConfig = () => {
   const [brandLogo, setBrandLogo] = useState(null);
   const [isLoading, setIsLoading] = useState(false);
   const [companyInfo, setCompanyInfo] = useState({});
   const { brandAvatar, setBrandAvatar } = useContext(SidebarContext);


   const getCompanyInfo = async () => {
     setIsLoading(true);
     const response = await fetchCompanyInfo();
     setCompanyInfo(response?.data?.company);
     setIsLoading(false);
   };

   useEffect(() => {
     getCompanyInfo();
   }, []);



   const handleImgMetaData = (info) => {
     if (info.file.status === "done") {
       const reader = new FileReader();
       reader.readAsDataURL(info.file.originFileObj);
       reader.onload = () => {
         setBrandLogo(reader.result);
       };
       reader.onerror = (error) => {
         message.error("Failed to read the image file");
       };
     } else if (info.file.status === "error") {
       message.error(`${info.file.name} file upload failed.`);
     }
   };

   const handleImgUpload = async () => {
     const formData = new FormData();
     setIsLoading(true);
     try {
       if (brandLogo) {
         formData.append("image", brandLogo);
       }

       const response = await uploadBrandLogo(formData);
       if (response?.status === 200) {
         message.success(response?.data?.message);
         setIsLoading(false);
         setCompanyInfo((prevState) => (
           {
             ...prevState,
             brandLogo: response?.data?.company?.brandLogo,
           }
         ));
         setBrandAvatar(response?.data?.company?.brandLogo);
         setBrandLogo(null);
       }
     } catch (error) {
       message.error("Failed to upload brand logo");
       setIsLoading(false);
     }
   };

   const removeProfileImg = () => {
     setBrandLogo(null);
   };

   const deletebrandLogo = async () => { 
     try {
       setIsLoading(true);
       const response = await deleteBrandLogo();
       setBrandLogo(null);

       if(response?.status === 200) {
         message.success(response?.data?.message);
         setBrandAvatar("");
         setCompanyInfo((prevState) => (
           {
             ...prevState,
             brandLogo: "",
           }
         ));
         setIsLoading(false);
       }

     } catch (error) {
       message.error("Failed to delete brand logo");
     }
   }
   return (
     <>
     <ConfigurationHeader title="Brand Logo Configuration" subHeading="Configure the brand logo for your company." />

     <Card title="Upload Brand Logo" className="profile-card__container upload-photo-container">
     <div className="profile-card__content">
       {brandLogo ? (
         <Avatar
           size={84}
           src={URL.createObjectURL(brandLogo)}
           shape="square"
           className="profile-card__avatar"
         />
       ) : companyInfo?.brandLogo ? (
         <Avatar
           size={84}
           src={companyInfo?.brandLogo}
           shape="square"
           className="profile-card__avatar"
         />
       ) : (
         <Avatar
           size={84}
           src={defaultLogo}
           shape="square"
           className="profile-card__avatar"
         />
       )}

       {brandLogo ? (
         <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
           <Button
             icon={<UploadOutlined />}
             style={{
               marginTop: 16,
               backgroundColor: "#2952BF",
               color: "#fff",
             }}
             onClick={handleImgUpload}
           >
             {isLoading ? (
               <img style={{ width: "22px" }} src={loader} alt="loader" />
             ) : (
               "Upload"
             )}
           </Button>
           <Button
             type="primary"
             danger
             icon={<DeleteOutlined />}
             style={{ marginTop: 16 }}
             onClick={removeProfileImg}
           >
             Cancel
           </Button>
         </div>
       ) : (
         <Flex gap="small" style={{ marginTop: "24px" }}>
           <Upload
             accept="image/*"
             showUploadList={false}
             customRequest={({ file, onSuccess }) => {
               setTimeout(() => {
                 onSuccess("ok");
               }, 0);
             }}
             beforeUpload={(file) => {
               const isImage = file.type.startsWith("image/");
               if (!isImage) {
                 return false;
               } else {
                 setBrandLogo(file);
               }
               return false;
             }}
             style={{ width: "100%" }}
           >
             <Button
               icon={<UploadOutlined />}
               style={{
                 fontSize: "12px",
                 boxShadow: "none",
                 backgroundColor: "#2952BF",
               }}
               onChange={handleImgMetaData}
               type="primary"
               block
             >
               Click to Upload
             </Button>
           </Upload>
           {companyInfo?.brandLogo && (
             <Button
               type="primary"
               danger
               block
               icon={<DeleteOutlined />}
               style={{ fontSize: `12px` }}
               onClick={deletebrandLogo}
             >
               {isLoading ? (
                 <img style={{ width: "22px" }} src={loader} alt="loader" />
               ) : (
                 " Delete Brand Logo"
               )}
             </Button>
           )}
         </Flex>
       )}
     </div>
    </Card>
   </>
   )
 }

 export default BrandLogoConfig 