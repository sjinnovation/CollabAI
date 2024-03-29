import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { Button } from "react-bootstrap";
import OrganizationTable from "./OrganizationTable";
import { axiosSecureInstance } from "../../../api/axios";
import { message, Typography } from "antd";
import CreateOrganizationModal from "./CreateOrganizationModal";
import { HiPlus } from "react-icons/hi";
import DebouncedSearchInput from "./DebouncedSearchInput";
const {Title} = Typography;

const initialLoaderState = {
    ORGANIZATION_LOADING: true,
    ORGANIZATION_UPDATING: false,
    ORGANIZATION_DELETING: false,
    ORGANIZATION_CREATING: false,
    ORGANIZATION_SEARCHING: false,
};

const initialOrganizationsState = {
    organizations: [],
    pagination: {},
};

const defaultLimit = 10;

const OrganizationsComponent = () => {
    // -------------------States-------------------
    const [organizations, setOrganizations] = useState({
        ...initialOrganizationsState,
    });
    const [openCreateOrgModal, setOpenCreateOrgModal] = useState(false);
    const [searchInputValue, setSearchInputValue] = useState("");
    const [loader, setLoader] = useState({ ...initialLoaderState });

    // -------------------Hook Variables-------------------

    // -------------------Side Effects-------------------
    useEffect(() => {
        fetchOrganizations({ page: 1, limit: organizations?.pagination?.pageSize || defaultLimit });
    }, [searchInputValue]);

    // -------------------API Calls-------------------
    //fetching all assistants
    const fetchOrganizations = async ({ page, limit }) => {
        try {
            setLoader((prevLoader) => ({
                ...prevLoader,
                ORGANIZATION_LOADING: true,
                ORGANIZATION_SEARCHING: searchInputValue ? true : false,
            }));

            const query = `?page=${page}&limit=${limit}${searchInputValue ? `&search=${searchInputValue}` : ""}`;
            const response = await axiosSecureInstance.get(
                `/api/organizations${query}`
            );

            const result = response?.data?.data?.organizations;
            const pagination = response?.data?.data?.pagination;

            setOrganizations(() => ({
                organizations: result,
                pagination: pagination,
            }));
        } catch (error) {
            console.log(error);
            handleShowErrorMessage(error?.response?.data?.message);
        } finally {
            setLoader((prevLoader) => ({
                ...prevLoader,
                ORGANIZATION_LOADING: false,
                ORGANIZATION_SEARCHING: false,
            }));
        }
    };

    const handleCreateOrganization = async (reqBody) => {
        try {
            setLoader((prevLoader) => ({
                ...prevLoader,
                ORGANIZATION_CREATING: true,
            }));
            const response = await axiosSecureInstance.post(
                `/api/organizations`,
                reqBody
            );

            if (response.data) {
                message.success("Success! Created The Organization.");
                setOpenCreateOrgModal(false);
                fetchOrganizations({
                    page: 1,
                    limit: defaultLimit,
                });
            }
        } catch (error) {
            console.log(error);
            handleShowErrorMessage(error?.response?.data?.message);
        } finally {
            setLoader((prevLoader) => ({
                ...prevLoader,
                ORGANIZATION_CREATING: false,
            }));
        }
    }

    const handleUpdateOrganization = async (organizationId, data) => {
        try {
            setLoader((prevLoader) => ({
                ...prevLoader,
                ORGANIZATION_UPDATING: organizationId,
            }));
            const response = await axiosSecureInstance.patch(
                `/api/organizations/${organizationId}`,
                { ...data }
            );

            if (response.data) {
                message.success("Success! Updated The Organization.");
                fetchOrganizations({
                    page: organizations?.pagination?.page || 1,
                    limit: organizations?.pagination?.pageSize || defaultLimit,
                });
            }
        } catch (error) {
            console.log(error);
            handleShowErrorMessage(error?.response?.data?.message);
        } finally {
            setLoader((prevLoader) => ({
                ...prevLoader,
                ORGANIZATION_UPDATING: false,
            }));
        }
    };

    const handleDeleteOrganization = async (organizationId) => {
        try {
            setLoader((prevLoader) => ({
                ...prevLoader,
                ORGANIZATION_DELETING: true,
            }));
            const response = await axiosSecureInstance.delete(
                `/api/organizations/${organizationId}`
            );

            if (response.data.success) {
                message.success("Success! Deleted The Organization.");
                fetchOrganizations({
                    page: organizations?.pagination?.page || 1,
                    limit: organizations?.pagination?.pageSize || defaultLimit,
                });
            }
        } catch (error) {
            console.log(error);
            handleShowErrorMessage(error?.response?.data?.message);
        } finally {
            setLoader((prevLoader) => ({
                ...prevLoader,
                ORGANIZATION_DELETING: false,
            }));
        }
    };

    // -------------------Local Functions-------------------
    const handleOpenCreateOrgModal = () => { 
        setOpenCreateOrgModal(true);
    }

    const handleShowErrorMessage = (error) => {
        error ? message.error(error) : message.error("Something went wrong!");
    }

    return (
        <>
            <div className="mt-5">
                <Toaster position="top-right" reverseOrder={false} />
                <div className="container">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="col-12 d-flex align-items-center justify-content-between">
                           
                            <Title level={2}>Organization List</Title>
                        </div>
                    </div>
                    <div className="col-12 d-flex justify-content-between py-4">
                            <DebouncedSearchInput data={{ search: searchInputValue, setSearch: setSearchInputValue, loading: loader.ORGANIZATION_SEARCHING, placeholder: "Search by organization name",  }} />
                            <Button onClick={handleOpenCreateOrgModal}>
                                + Organization
                            </Button>
                    </div>
                    <div>
                        <OrganizationTable
                            propsData={{
                                data: organizations.organizations,
                                pagination: organizations.pagination,
                                loader,
                                actions: {
                                    fetchOrganizations,
                                    handleUpdateOrganization,
                                    handleDeleteOrganization,
                                    handleOpenCreateOrgModal
                                },
                            }}
                        />
                        <CreateOrganizationModal
                            propsData={{
                                open: openCreateOrgModal,
                                setOpen: setOpenCreateOrgModal,
                                loading: loader.ORGANIZATION_CREATING,
                                actions: {
                                    handleOk: (values) => handleCreateOrganization(values),
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrganizationsComponent;
