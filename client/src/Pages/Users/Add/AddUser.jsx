import React, { useEffect, useState } from "react";
import { addUser, getTeams } from "../../../api/user";
import "./AddUser.css";
import { compId } from "../../../constants/localStorage";
import FormComponent from "../../../component/common/FormComponent";
import { message, Select, Space } from "antd";

const AddUser = (props) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await getTeams();
        setTeams(response.data.teams);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTeams();
  }, []);

  const handleAddUser = (values) => {
    setLoading(true);
    const requestBody = {
      fname: values.firstname,
      lname: values.lastname,
      username: values.email,
      password: values.password,
      branch: "",
      email: values.email.toLowerCase(),
      status: values?.status,
      role: "user",
      companyId: compId,
      teams: values.teams,
    };


    (async () => {
      try {
        let res = await addUser(requestBody);
        setLoading(false);
        message.success(res.data.msg);
        props.setAddModal(false);
      } catch (err) {
        if (err && err.response?.status === 400) {
          alert("User already exists");
        }
        message.error(err)
        console.log(err);
      }
    })();
  };



  const formItems = [
    {
      name: "firstname",
      label: "First Name",
      type: "text",
      rules: [
        {
          required: true,
          message: "Please input your first name!",
        },
      ],
    },
    {
      name: "lastname",
      label: "Last Name",
      type: "text",
      rules: [
        {
          required: true,
          message: "Please input your last name!",
        },
      ],
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      rules: [
        {
          required: true,
          message: "Please input your email!",
        },
      ],
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      rules: [
        {
          required: true,
          message: "Please input your password!",
        },
      ],
    },

    {
      name: "teams",
      label: "Teams",
      type: "multiselect",

      style: {
        width: '100%',
      },
      placeholder: "Please select your team",
      options: teams?.map((team) => ({
        label: team.teamTitle,
        value: team._id,
      })),
      optionRender: (option) => (
        <Space>
          <span role="img" aria-label={option.label}>
            {option.label}
          </span>
        </Space>
      ),
    },

    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        {
          label: "Active",
          value: "active",
        },
        {
          label: "Inactive",
          value: "inactive",
        },
      ],
      rules: [
        {
          required: true,
          message: "Please select your team!",
        },
      ],
    },
    {
      name: "submitreset",
      submitlabel: "Submit",
      resetlabel: "Reset",
      type: "submitreset",
      className: "m-1",
      loading: loading
    },
  ];



  return (
    <>
      <FormComponent
        formItems={formItems}
        handleSubmit={handleAddUser}
        layout="vertical"
        className="form"
      />
    </>
  );
};

export default AddUser;
