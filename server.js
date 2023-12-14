require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const app = express();

const PORT = process.env.PORT || 3001;  // Updated the PORT to 3001
const compression = require('compression');

app.use(cors());
app.use(compression({ level: 7, threshold: 100 * 1000 }));

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'pbudget-do-user-14604868-0.c.db.ondigitalocean.com',
  user: process.env.DB_USER || 'doadmin',
  password: process.env.DB_PASSWORD || 'AVNS_GiaCnjwTspx8JW6tTHG',
  database: process.env.DB_DATABASE || 'defaultdb',
  port: process.env.DB_PORT || '25060',
});


// Create tables if they don't exist
const createTables = () => {
  // Create 'users' table
  db.query(`
    CREATE TABLE IF NOT EXISTS users (
      userid INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      firstname VARCHAR(255),
      lastname VARCHAR(255)
    );
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('Users table created or already exists');
    }
  });

  // Create 'budgets' table
  db.query(`
    CREATE TABLE IF NOT EXISTS budgets (
      budgetid INT PRIMARY KEY AUTO_INCREMENT,
      category VARCHAR(255) NOT NULL,
      allocated DECIMAL(10, 2),
      used DECIMAL(10, 2),
      month VARCHAR(255),
      year INT,
      userid INT,
      FOREIGN KEY (userid) REFERENCES users(userid)
    );
  `, (err) => {
    if (err) {
      console.error('Error creating budgets table:', err);
    } else {
      console.log('Budgets table created or already exists');
    }
  });

  // Create 'expenses' table
  db.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      expenseid INT PRIMARY KEY AUTO_INCREMENT,
      category VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2),
      description TEXT,
      date DATE,
      userid INT,
      FOREIGN KEY (userid) REFERENCES users(userid)
    );
  `, (err) => {
    if (err) {
      console.error('Error creating expenses table:', err);
    } else {
      console.log('Expenses table created or already exists');
    }
  });
};


db.connect((err) => {
  if (err) {
    console.error('MySQL connection failed:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});
const jwtSecretKey = process.env.JWT_SECRET_KEY || '1450';

// Middleware for JSON Web Token authentication
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (token == null) return res.sendStatus(401);
const jwtSecretKey = process.env.JWT_SECRET_KEY || '1450';

  jwt.verify(token, jwtSecretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};




// Add the login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Received credentials:', { username, password });

  db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err) {
      console.error('MySQL query error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length > 0) {
      const userId = results[0].userid;
      const firstname = results[0].firstname;

      // Set the expiration time to 1 min (or any other desired duration)
      const accessToken = jwt.sign({ userId }, jwtSecretKey, {
        expiresIn: '1m',
      });

      const user = {
        userId,
        firstname,
        accessToken,
      };

      res.json(user);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});









app.get('/api/get-all-categories', (req, res) => {
  db.query('SELECT DISTINCT category FROM budgets', (err, results) => {
    if (err) {
      console.error('MySQL query error:', err);
      res.status(500).send('Internal Server Error');
    } else {
      const categories = results.map((result) => result.category);
      res.json(categories);
    }
  });
});


// configure-budget endpoint
app.post('/api/configure-budget', (req, res) => {
  let { category, allocated, month, userId, year } = req.body;

  db.query(
    'SELECT * FROM budgets WHERE category = UPPER(?) AND month = ? AND year = ? AND userid = ?',
    [category, month, year, userId],
    (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        res.status(500).send('Internal Server Error');
      } else {
        if (results.length > 0) {
          db.query(
            'UPDATE budgets SET allocated = ? WHERE category = UPPER(?) AND month = ? AND year = ? AND userid = ?',
            [allocated, category, month, year, userId],
            (updateErr) => {
              if (updateErr) {
                console.error('MySQL update error:', updateErr);
                res.status(500).send('Internal Server Error');
              } else {
                res.send('Budget update successful');
              }
            }
          );
        } else {
          db.query(
            'INSERT INTO budgets (category, allocated, month, year, userid) VALUES (UPPER(?), ?, ?, ?, ?)',
            [category, allocated, month, year, userId],
            (insertErr) => {
              if (insertErr) {
                console.error('MySQL insert error:', insertErr);
                res.status(500).send('Internal Server Error');
              } else {
                res.send('Budget configuration successful');
              }
            }
          );
        }
      }
    }
  );
});
// Add a new endpoint to get data for the table with a specific year
app.get('/api/get-table-data/:year/:userId', (req, res) => {
  const { year, userId } = req.params;
  db.query(
    'SELECT * FROM budgets WHERE year = ? AND userid = ? ORDER BY year DESC, FIELD(month, "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December")',
    [year, userId],
    (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.json(results);
        console.log('Sending table data:', results);
      }
    }
  );
});



//for userdetails 
app.get('/api/users/:userId', (req, res) => {
  const userId = req.params.userId;

  // Query the database to get user details by ID
  db.query('SELECT * FROM users WHERE userid = ?', [userId], (err, results) => {
    if (err) {
      console.error('MySQL query error:', err);
      res.status(500).send('Internal Server Error');
    } else {
      if (results.length > 0) {
        const user = results[0];
        res.json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    }
  });
});


//for deallocating
app.post('/api/deallocation-budget', (req, res) => {
  const { category, month, year, userId } = req.body;

  console.log('Received deallocation request:', req.body);
  db.query(
    'DELETE FROM budgets WHERE category = UPPER(?) AND month = ? AND year = ? AND userid = ?',
    [category, month, year, userId],
    (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.json(results);
        console.log('Deallocated budget successfully:', results);
      }
    }
  );
});




// get-budgets endpoint
app.get('/api/get-budgets/:year/:month/:userId', (req, res) => {
  const { year, month, userId } = req.params;
  db.query(
    'SELECT * FROM budgets WHERE year = ? AND month = ? AND userid = ?',
    [year, month, userId],
    (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.json(results);
        console.log('Sending budgets data:', results);
      }
    }
  );
});


// Add the registration route
app.post('/api/register', (req, res) => {
  const { username, password, firstName, lastName } = req.body;

  // Check if the username already exists
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error('MySQL query error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length > 0) {
      // Username already exists, send an error response
      res.status(409).json({ error: 'Username already exists' });
    } else {
      // Username doesn't exist, proceed with registration
      db.query(
        'INSERT INTO users (username, password, firstname, lastname) VALUES (?, ?, UPPER(?), UPPER(?))',
        [username, password, firstName, lastName],
        (insertErr) => {
          if (insertErr) {
            console.error('MySQL insert error:', insertErr);
            res.status(500).json({ error: 'Internal Server Error' });
          } else {
            res.send('Registration successful');
          }
        }
      );
    }
  });
});



// enter-used-budget endpoint
app.post('/api/enter-used-budget', (req, res) => {
  let { category, used, month, year } = req.body;
  const userId = req.body.userId;
  console.log('Received enter-used-budget request:', req.body);

  db.query(
    'SELECT * FROM budgets WHERE category = UPPER(?) AND month = ? AND year = ? AND userid = ?',
    [category, month, year, userId],
    (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (results.length > 0) {
        // Category exists, update the used value
        db.query(
          'UPDATE budgets SET used = ? WHERE category = UPPER(?) AND month = ? AND year = ? AND userid = ?',
          [used, category, month, year, userId],
          (updateErr) => {
            if (updateErr) {
              console.error('MySQL update error:', updateErr);
              return res.status(500).json({ error: 'Internal Server Error' });
            }
  
            res.json({ message: 'Used Budget update successful' });
          }
        );
      } else {
        // Category doesn't exist, insert a new row
        db.query(
          'INSERT INTO budgets (category, month, year, userid, allocated, used) VALUES (?, ?, ?, ?, 0, ?)',
          [category, month, year, userId, used],
          (insertErr) => {
            if (insertErr) {
              console.error('MySQL insert error:', insertErr);
              return res.status(500).json({ error: 'Internal Server Error' });
            }
  
            res.json({ message: 'New row inserted successfully' });
          }
        );
      }
    }
  );
  
});

//for deallocation
app.post('/api/deallocation-budget', (req, res) => {
  const { category, month, year, userId } = req.body;

  console.log('Received deallocation request:', req.body);
  db.query(
    'DELETE FROM budgets WHERE category = UPPER(?) AND month = ? AND year = ? AND userid = ?',
    [category, month, year, userId],
    (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.json(results);
        console.log('Deallocated budget successfully:', results);
      }
    }
  );
});





// Add a new endpoint to get data for the line graph with a range of years

app.get('/api/get-line-graph-data-range/:category/:startYear/:startMonth/:endYear/:endMonth/:userId', (req, res) => {
  const { category, startYear, startMonth, endYear, endMonth, userId } = req.params;

  // Validate input if needed

  // Construct the date range for the query
  const startDate = `${startYear}-${startMonth.padStart(2, '0')}`;
  const endDate = `${endYear}-${endMonth.padStart(2, '0')}`;

  // Perform the database query
  const query = `
    SELECT *
    FROM budgets
    WHERE userid = ? AND category = ? 
      AND CONCAT(year, '-', LPAD(month, 2, '0')) BETWEEN ? AND ?;
  `;
  db.query(query, [userId, category, startDate, endDate], (error, result) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      // Send the result as JSON
      res.json(result);
    }
  });
});



app.post("/user/generateToken", (req, res) => { 
  // Validate User Here 
  // Then generate JWT Token 
console.log('JWT_SECRET_KEY:', process.env.JWT_SECRET_KEY);

const jwtSecretKey = process.env.JWT_SECRET_KEY || '1260';

  let data = { 
      time: Date(), 
      userId: 12, 
  } 

  const token = jwt.sign(data, jwtSecretKey); 

  res.send(token); 
});


app.get("/user/validateToken", (req, res) => { 
        // Tokens are generally passed in the header of the request 
        // Due to security reasons. 

        let tokenHeaderKey = process.env.TOKEN_HEADER_KEY || '1260'; 
        const jwtSecretKey = process.env.JWT_SECRET_KEY || '1260';

        try { 
                const token = req.header(tokenHeaderKey); 

                const verified = jwt.verify(token, jwtSecretKey); 
                if(verified){ 
                        return res.send("Successfully Verified"); 
                }else{ 
                        // Access Denied 
                        return res.status(401).send(error); 
                } 
        } catch (error) { 
                // Access Denied 
                return res.status(401).send(error); 
        } 
});



app.listen(PORT, () => {
  console.log(`Server is running at https://167.172.24.111:${PORT}`);
});