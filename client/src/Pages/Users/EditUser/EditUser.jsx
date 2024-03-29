import React, { useEffect, useReducer, useState } from "react";
import { Form, DropdownButton, Button, Dropdown } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { editUser, getTeams, getUser } from "../../../api/user";
import FormComponent from "../../../component/common/FormComponent";

// import "../Add/AddUser.css";
const reducer = (state, action) => {
  switch (action.type) {
    case "firstName":
      return { ...state, firstName: action.payload };
    case "lastName":
      return { ...state, lastName: action.payload };
    case "username":
      return { ...state, userName: action.payload };
    case "password":
      return { ...state, password: action.payload };
    case "branch":
      return { ...state, branch: action.payload };
    case "email":
      return { ...state, email: action.payload };
  }
};

const EditUser = (props) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    companyId: "",
    createdAt: "",
    currentusertokens: 0,
    email: "",
    fname: "",
    lname: "",
    maxusertokens: 0,
    password: "",
    role: "",
    status: "",
    updatedAt: "",
    username: "",
    __v: 0,
    _id: "",
  });
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  const [state, dispatch] = useReducer(reducer, {
    firstName: "",
    lastName: "",
    userName: "",
    password: "",
    branch: "",
    email: "",
  });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await getTeams();
        const result = response.data.teams;
        setTeams(result);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTeams();
  }, []);

  const fetchSingleUserById = async () => {
    const response = await getUser(props.id);
    setUserInfo(response?.data?.user);
  };

  useEffect(() => {
    fetchSingleUserById();
  }, [props.id]);

  // Update form state when userInfo changes
  useEffect(() => {
    // Update form state based on userInfo
    dispatch({
      type: "firstName",
      payload: userInfo?.fname || "",
    });
    dispatch({
      type: "lastName",
      payload: userInfo?.lname || "",
    });
    dispatch({
      type: "email",
      payload: userInfo?.email || "",
    });
  }, [userInfo]);

  const handleEditUser = (values) => {
    setLoading(true);
    const requestBody = {
      fname: values.firstname,
      lname: values.lastname,
      email: state.email.toLowerCase(),
    };
    if (values.teams) {
      requestBody.teams = values.teams;
    } else if (userInfo.teams) {
      requestBody.teams = userInfo?.teams?.map(team => team._id);
    }
    if (values.status) {
      requestBody.status = values.status;
    } else {
      requestBody.status = userInfo?.status;
    }

    (async () => {
      try {
        await editUser(props.id, requestBody);
        props.setEditModal(false);
        fetchSingleUserById();
        setLoading(false);
      } catch (err) {
        if (err && err?.response?.status == 400) {
          alert("User already exists");
          navigate("/users");
        }
        console.log(err);
        setLoading(false);
      }
    })();
  };

  const defaultValues = {
    currentteam: userInfo?.teams
      ? userInfo.teams?.map(team=> team.teamTitle)
      : "Not assigned",
    email: state.email,
    firstname: state.firstName,
    lastname: state.lastName,
    status: userInfo.status,
    teams: userInfo?.teams?.map(team=> team._id)
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
      name: "currentteam",
      label: "Current Team",
      type: "text",
      disabled: true,
    },
    {
      name: "teams",
      label: "Change Team",
      type: "multiselect",
      options: teams.map((team) => ({
        label: team.teamTitle,
        value: team._id,
      })),
      rules: [
        {
          required: true,
          message: "Please select your team!",
        },
      ],
    },
    {
      name: "email",
      label: "Email",
      type: "text",
      disabled: true,
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
      name: "submit",
      label: "Update",
      type: "submit",
      buttonType: "primary",
      className: "",
      loading: loading
    },
  ];

  return (
    <>
      <FormComponent
        formItems={formItems}
        handleSubmit={handleEditUser}
        layout="vertical"
        className="form"
        defaultValues={defaultValues}
      />
    </>
  );
};

export default EditUser;
