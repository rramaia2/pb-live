import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ConfigurePage({ updateHomePageData }) {
  const [categoryAllocation, setCategoryAllocation] = useState('');
  const [allocated, setAllocated] = useState('');
  const [selectedMonthAllocation, setSelectedMonthAllocation] = useState('January');
  const [selectedYearAllocation, setSelectedYearAllocation] = useState(new Date().getFullYear());
  const [allCategories, setAllCategories] = useState([]);
  const [allCategoriesList, setAllCategoriesList] = useState([]);
  const [categoryDeallocation, setCategoryDeallocation] = useState('');
  const [categoryDeallocationList, setCategoryDeallocationList] = useState([]);
  const [selectedMonthDeallocation, setSelectedMonthDeallocation] = useState('January');
  const [selectedYearDeallocation, setSelectedYearDeallocation] = useState(new Date().getFullYear());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const response = await axios.get('https://167.172.24.111/api/get-all-categories');
        setAllCategories(response.data);
        const storedUserId = localStorage.getItem("userId");

        fetchDelocatedCategories(selectedYearDeallocation, selectedMonthDeallocation, storedUserId);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchAllCategories();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchDelocatedCategories = (year, month, userId) => {
    axios
      .get(`https://167.172.24.111/api/get-budgets/${year}/${month}/${userId}`)
      .then((response) => {
        setCategoryDeallocationList(response.data);
      })
      .catch((error) => {
        console.error("Error fetching budgets:", error);
      });
  };

  const handleAllocationSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem('userId');
    const allocatedValue = parseFloat(allocated);

    if (isNaN(allocatedValue)) {
      console.error('Invalid value for allocated:', allocated);
      toast.error('Invalid value for allocated. Please enter a valid number.');
      return;
    }

    const budgetData = {
      category: categoryAllocation,
      allocated: allocatedValue,
      month: selectedMonthAllocation,
      year: selectedYearAllocation,
      userId,
    };

    try {
      const response = await axios.post('https://167.172.24.111/api/configure-budget', budgetData);
      console.log(response.data);
      toast.success('Budget Allocated Successfully!');
      if (typeof updateHomePageData === 'function') {
        updateHomePageData();
      }
    } catch (error) {
      console.error('Error configuring budget:', error);
      toast.error('Error configuring budget. Please try again or contact the admin.');
    }

    setCategoryAllocation('');
    setAllocated('');
  };

  const handleDeallocationSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem('userId');
    const deallocateData = {
      category: categoryDeallocation,
      month: selectedMonthDeallocation,
      year: selectedYearDeallocation,
      userId,
    };

    try {
      const response = await axios.post('https://167.172.24.111/api/deallocation-budget', deallocateData);
      console.log(response.data);
      toast.success('Budget Deallocated Successfully!');
      if (typeof updateHomePageData === 'function') {
        updateHomePageData();
      }
    } catch (error) {
      console.error('Error deallocating budget:', error);
      toast.error('Error deallocating budget. Please try again or contact the admin.');
    }

    setCategoryDeallocation('');
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div style={{ margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
      <ToastContainer />
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Configure Budget</h2>
      <div style={{ width: '80%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Add Budget Form */}
          <form
            style={{
              width: '48%',
              margin: '0 auto',  // Center the form horizontally
              padding: '20px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              background: '#3498db',
            }}
            onSubmit={handleAllocationSubmit}
          >
            <label>
              <span>Budget Category:</span>
              <input
                type="text"
                list='categoriesAllocatedList'
                value={categoryAllocation}
                onChange={(e) => setCategoryAllocation(e.target.value)}
              />
              <datalist id="categoriesAllocatedList">
                {allCategories.length > 0 && allCategories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </label>
            <label>
              <span>Add Budget:</span>
              <input
                type="number"
                value={allocated}
                onChange={(e) => setAllocated(e.target.value)}
              />
            </label>
            <label>
              <span>Month:</span>
              <select
                value={selectedMonthAllocation}
                onChange={(e) => setSelectedMonthAllocation(e.target.value)}
              >
                {months.map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Year:</span>
              <input
                type="number"
                value={selectedYearAllocation}
                onChange={(e) => setSelectedYearAllocation(e.target.value)}
              />
            </label>
            <button type="submit">Add Budget</button>
          </form>

          {/* Delete Budget Form */}
          <form
            style={{
              width: '48%',
              margin: '0 auto',  // Center the form horizontally
              padding: '20px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              background: '#3498db',
            }}
            onSubmit={handleDeallocationSubmit}
          >
            <label>
              <span>Budget Category to Delete:</span>
              <input
                type="text"
                list="categoriesList"
                value={categoryDeallocation}
                onChange={(e) => setCategoryDeallocation(e.target.value)}
              />
              <datalist id="categoriesList">
                {categoryDeallocationList.length > 0 && categoryDeallocationList.map((category) => (
                  <option key={category.id} value={category.category} />
                ))}
              </datalist>
            </label>
            <label>
              <span>Month:</span>
              <select
                value={selectedMonthDeallocation}
                onChange={(e) => setSelectedMonthDeallocation(e.target.value)}
              >
                {months.map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Year:</span>
              <input
                type="number"
                value={selectedYearDeallocation}
                onChange={(e) => setSelectedYearDeallocation(e.target.value)}
              />
            </label>
            <button type="submit">Delete Budget</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ConfigurePage;
