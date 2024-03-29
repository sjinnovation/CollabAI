import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Table, Spinner } from "react-bootstrap";
import { axiosOpen ,axiosSecure, axiosSecureInstance} from "../../../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Users = () => {
  const userID = (localStorage.userID && localStorage.getItem("userID")) || 0;
  const [startDate, setStartDate] = useState(new Date());
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  async function getUsers(date) {
    try {
      const dateString = date.toISOString().slice(0, 10);
      const { data } = await axiosSecureInstance.get(`api/user/get-all-user-prompts?userid=${userID}&date=${dateString}`);
      isMounted.current && setUsers(data?.users || []);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    isMounted.current = true;
    (async () => {
      await getUsers(startDate);
      return () => {
        isMounted.current = false;
      };
    })();
  }, []);

  return (
    <div className="wrapper">
      {loading ? (
        <div className="w-100 d-flex justify-content-center align-items-center h-100">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
          <Container style={{ backgroundColor: "#FFFFFF", borderRadius: "5px" }}>
          <Row className="align-items-center ">
            <Col sm={12} md={6} lg={6} xl={6} className="py-2">
              <h2>Users</h2>
            </Col>
            <Col sm={12} md={6} lg={6} xl={6} className="py-2">
                <div className="d-flex justify-content-end align-items-center" style={{ columnGap: "1rem" }}>
                <label className="font-text-bold">Filter By Date:</label>
                <DatePicker
                  className="w-auto"
                  selected={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    getUsers(date);
                  }}
                />
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <Table responsive striped bordered hover>
                                  <thead style={{ position: "sticky", top: -1, zIndex: 1, backgroundColor: "#f8f9fa", boxShadow: "0px 2px 2px -1px rgba(0,0,0,0.1)" }}>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Prompts</th>
                   
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 &&
                    users.map((company, index) => (
                      <tr key={index}>
                        <td className="text-capitalize">{company.name}</td>
                        <td>{company.email}</td>
                        <td className="text-capitalize">{company.status}</td>
                        <td>{company.prompts}</td>
                        
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
};

export default Users;
