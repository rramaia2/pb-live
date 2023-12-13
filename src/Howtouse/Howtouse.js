import React from "react";
import "./Howtouse.scss";
function UserManual() {
  return (
    <div className="user-manual">

      <h1>How to use Personal Budget App</h1>

      <h2>Introduction</h2>
      <p>Welcome to the Personal Budget App! This user manual will guide you through the features and functionalities of the app to help you manage your budget effectively.</p>

      <h2>Table of Contents</h2>
      <ol>
        <li><a href="#getting-started">Getting Started</a></li>
        <li><a href="#dashboard">Dashboard</a></li>
        <li><a href="#entering-budget">Entering Budget</a></li>
        <li><a href="#viewing-reports">Viewing Reports</a></li>
      </ol>

      <h2 id="getting-started">1. Getting Started</h2>
      <p>To get started with the Personal Budget App, follow these steps:</p>
      <ul>
        <li>Sign up for an account if you are a new user.</li>
        <li>Log in with your credentials if you already have an account.</li>
        <li>Explore the app dashboard to view an overview of your budget.</li>
      </ul>

      <h2 id="dashboard">2. Dashboard</h2>
      <p>The dashboard provides a summary of your budget. It includes:</p>
      <ul>
        <li>Graphical representation of budget allocation.</li>
        <li>Details of allocated and used budget for each category.</li>
        <li>Quick access to enter used budget.</li>
      </ul>

      <h2 id="entering-budget">3. Entering Budget</h2>
      <p>To enter your budget:</p>
      <ol>
        <li>Go to the "Enter Used Budget" section.</li>
        <li>Select the category, month, and year.</li>
        <li>Enter the used budget amount.</li>
        <li>Submit the form to update your budget.</li>
      </ol>

      <h2 id="viewing-reports">4. Viewing Reports</h2>
      <p>Generate reports to track your budget over time:</p>
      <ol>
        <li>Explore the "Budget Analysis Table" for a detailed overview.</li>
        <li>View pie and bar charts to analyze budget allocation and usage.</li>
        <li>Use the linear graph to visualize budget trends.</li>
      </ol>

      <p>For any additional assistance, contact our support team at <a href="mailto:raghava@personalbudgetapp.com">support@personalbudgetapp.com</a>.</p>
    </div>
  );
}

export default UserManual;
