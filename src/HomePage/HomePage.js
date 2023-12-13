//modified homepage code
import "./HomePage.scss";
// HomePage.js
import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import LineGraph from "./LineGraph";
import { calculatePercentage } from "../utils";
// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement // Register PointElement
);

function HomePage() {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [usedBudget, setUsedBudget] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedYearTable, setSelectedYearTable] = useState(
    new Date().getFullYear()
  );
  const [usedselectedCategory, setUsedSelectedCategory] = useState("");
  const [usedselectedYear, setUsedSelectedYear] = useState(
    new Date().getFullYear()
  );
  const [usedselectedMonth, setUsedSelectedMonth] = useState("");
  const [userId, setUserId] = useState("");
  const [startYear, setStartYear] = useState("");
  const [startMonth, setStartMonth] = useState("January");
  const [endYear, setEndYear] = useState("");
  const [endMonth, setEndMonth] = useState("January");
  const [lineGraphData, setLineGraphData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [usedCategories, setUsedCategories] = useState([]);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedToken = localStorage.getItem("token");
    setUserId(storedUserId);
    fetchData(selectedYear, selectedMonth, storedUserId);
  }, [selectedYear, selectedMonth, selectedCategory, selectedYearTable]);

  useEffect(() => {
    fetchUsedCategories(); // Fetch used categories when the component mounts
  }, []);

  const fetchData = (year, month, userId) => {
    axios
      .get(`http://167.172.24.111/api/get-budgets/${year}/${month}/${userId}`)
      .then((response) => {
        setBudgets(response.data);
      })
      .catch((error) => {
        console.error("Error fetching budgets:", error);
      });
  };

  const fetchTableData = () => {
    const storedUserId = localStorage.getItem("userId");
    axios
      .get(
        `http://167.172.24.111/api/get-table-data/${selectedYearTable}/${storedUserId}`
      )
      .then((response) => {
        setTableData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching table data:", error);
      });
  };

  const fetchUsedCategories = () => {
    axios
      .get("http://167.172.24.111/api/get-all-categories")
      .then((response) => {
        setUsedCategories(response.data);
        // Assuming you want to select the first category by default
        setUsedSelectedCategory(response.data[0]);
      })
      .catch((error) => {
        console.error("Error fetching used categories:", error);
      });
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem("token");
    const expirationTime = localStorage.getItem("tokenExpiration");
    console.log("Token:", token);
    console.log("Expiration Time:", expirationTime);

    if (token && expirationTime) {
      const currentTime = new Date().getTime();
      const timeToExpire = expirationTime - currentTime;

      if (timeToExpire < 20000 && timeToExpire > 0) {
        // Show popup when token is about to expire in 20 seconds
        const extendSession = window.confirm(
          "Your session is about to expire. Do you want to extend it?"
        );
        if (extendSession) {
          const newExpirationTime = Date.now() + 60 * 1000; // Extend by 1 minutes
          localStorage.setItem("tokenExpiration", newExpirationTime);
        } else {
          // Redirect to root route if session is not extended
          localStorage.removeItem("username");
          localStorage.removeItem("token");
          localStorage.removeItem("password");
          localStorage.removeItem("userid");
          localStorage.removeItem("tokenExpiration");
          navigate("/");
        }
      }
    }
  };

  // Check token expiration on component mount and every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkTokenExpiration();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const totalBudget = budgets.reduce(
    (acc, budget) => acc + budget.allocated,
    0
  );

  const pieData = {
    labels: budgets.map((b) => b.category),
    datasets: [
      {
        data: budgets.map((b) => b.allocated),
        backgroundColor: ["red", "blue", "green", "yellow", "purple"],
      },
    ],
  };

  const pieOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const category = budgets[context.dataIndex].category;
            const allocated = budgets[context.dataIndex].allocated;
            const percentage = calculatePercentage(allocated, totalBudget);

            const additionalInfo = `${category} - ${allocated} (${percentage}% of total budget)`;

            return additionalInfo;
          },
        },
      },
    },
  };

  const barData = {
    labels: budgets.map((b) => b.category),
    datasets: [
      {
        label: "Allocated Budget",
        data: budgets.map((b) => b.allocated),
        backgroundColor: "rgba(0, 123, 255, 0.5)",
      },
      {
        label: "Used Budget",
        data: budgets.map((b) => b.used),
        backgroundColor: "rgba(255, 193, 7, 0.5)",
      },
    ],
  };

  const handleUsedBudgetSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    const usedBudgetNumber = parseFloat(usedBudget);

    const payload = {
      category: usedselectedCategory,
      used: usedBudgetNumber,
      month: usedselectedMonth,
      year: usedselectedYear,
      userId: userId,
    };

    try {
      await axios.post("http://167.172.24.111/api/enter-used-budget", payload);
      console.log("Used Budget update successful");
      fetchData(selectedMonth, userId);
    } catch (error) {
      console.error("Error entering used budget:", error);
      if (error.response && error.response.data) {
        console.error("Server error message:", error.response.data);
      }
    }
  };

  const fetchLineGraphData = () => {
    const storedUserId = localStorage.getItem("userId");

    // Ensure selectedCategory is defined
    if (usedselectedCategory) {
      // Format months with leading zeros
      const formattedStartMonth = startMonth.padStart(2, "0");
      const formattedEndMonth = endMonth.padStart(2, "0");

      // Make the API call
      fetchLineData(storedUserId, formattedStartMonth, formattedEndMonth);
    } else {
      console.error("Selected category is null or undefined.");
    }
  };

  const fetchLineData = (userId, formattedStartMonth, formattedEndMonth) => {
    axios
      .get(
        `http://167.172.24.111/api/get-line-graph-data-range/${usedselectedCategory}/${startYear}/${formattedStartMonth}/${endYear}/${formattedEndMonth}/${userId}`
      )
      .then((response) => {
        setLineGraphData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching line graph data:", error);
      });
  };

  useEffect(() => {
    if (selectedYearTable) {
      fetchTableData();
    }
  }, []);

  return (
    <div className="pagecontent" style={{ display: "flex" }}>
      <div className="homepage-container" style={{ paddingLeft: "25%" }}>
        <div className="tablecontent" style={{ width: "100%", paddingBottom: "4cm" }}>
          <div
            className="year-selector"
            style={{
              width: "100%",
              paddingTop: "30px",
              height: "80px",
              display: "flex",
              flexDirection: "row",
              gap: "10px",
              justifyItems: "center",
            }}
          >
            <label style={{ display: "flex", padding: "10px", width: "100%" }}>
              Select Table Year:
              <input
                type="number"
                value={selectedYearTable}
                onChange={(e) => setSelectedYearTable(e.target.value)}
              />
            </label>
            <button onClick={fetchTableData}>Get Table</button>
          </div>

          <div className="budget-table">
            <h2>Budget Analysis Table for Year {selectedYearTable}</h2>

            <table className="table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th scope="col">Budget Category</th>
                  <th scope="col">Month</th>
                  <th scope="col">Allocated Budget</th>
                  <th scope="col">Used budget</th>
                  <th scope="col">Summary</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((data, index) => (
                  <tr key={index} className="table-row">
                    <td>{data.category}</td>
                    <td>{data.month}</td>
                    <td>{data.allocated}</td>
                    <td>{data.used}</td>
                    <td>
                      {data.allocated - data.used > 0
                        ? `${data.allocated - data.used} can be used`
                        : `Exceeded by ${data.used - data.allocated}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="charts-container">
          {/* Month and Year Selection Form */}
          <form
            style={{
              width: "100%",
              height: "55px",
              display: "flex",
              flexDirection: "row",
              gap: "15px",
              justifyContent: "space-around",
              marginTop: "20px",
            }}
          >
            <label style={{ display: "flex", width: "50%" }}>
              Select Month:
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "flex", width: "50%" }}>
              Select Year:
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              />
            </label>
          </form>

          <div
            className="onlychart"
            style={{ width: "800px", height: "410px", display: "flex" }}
          >
            {/* Pie Chart */}
            <div
              className="chart-box pie-chart-box"
              style={{ width: "100%", height: "100%" }}
            >
              <h2>Budget Allocation</h2>
              {budgets.length > 0 ? (
                <Pie data={pieData} options={pieOptions} />
              ) : (
                <p>No data available</p>
              )}
            </div>

            {/* Bar Chart */}
            <div
              className="chart-box bar-chart-box"
              style={{ height: "409px", width: "638px" }}
            >
              <h2>Budget Usage</h2>
              {budgets.length > 0 ? (
                <Bar data={barData} />
              ) : (
                <p>No data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Linear Graph Form */}
        <div className="line-graph-container">
          <h2>Linear Graph Data</h2>
          <form
            style={{
              width: "auto",
              height: "170px",
              display: "flex",
              flexDirection: "row",
              gap: "15px",
              justifyContent: "space-around",
            }}
          >
            <label>
              Select Category:
              <select
                value={usedselectedCategory}
                onChange={(e) => setUsedSelectedCategory(e.target.value)}
              >
                {budgets.map((budget) => (
                  <option key={budget.category} value={budget.category}>
                    {budget.category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Start Year:
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
              />
            </label>
            <label>
              Start Month:
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
              >
                {Array.from({ length: 12 }, (_, index) => {
                  const monthValue = (index + 1).toString().padStart(2, "0");
                  const monthName = new Date(2022, index, 1).toLocaleString(
                    "default",
                    { month: "long" }
                  );

                  return (
                    <option key={monthValue} value={monthValue}>
                      {monthName}
                    </option>
                  );
                })}
              </select>
            </label>
            <label>
              End Year:
              <input
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
              />
            </label>

            <label>
              End Month:
              <select
                value={endMonth}
                onChange={(e) => setEndMonth(e.target.value)}
              >
                {Array.from({ length: 12 }, (_, index) => {
                  const monthValue = (index + 1).toString().padStart(2, "0");
                  const monthName = new Date(2022, index, 1).toLocaleString(
                    "default",
                    { month: "long" }
                  );

                  return (
                    <option key={monthValue} value={monthValue}>
                      {monthName}
                    </option>
                  );
                })}
              </select>
            </label>
            <button type="button" onClick={fetchLineGraphData}>
              Fetch Line Graph Data
            </button>
          </form>

          <LineGraph lineGraphData={lineGraphData} />
        </div>

        {/* Form for entering Used Budget */}
      </div>
    </div>
  );
}

export default HomePage;
