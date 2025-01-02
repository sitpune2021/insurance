const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const ExcelJS = require("exceljs");

const app = express();
app.use(
  cors({
    origin: ["http://103.165.118.71:3000"],
    // origin: ["http://localhost:3000"],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "insuerence",
// });

const db = mysql.createConnection({
  host: "103.165.118.71",
  user: "sitsolutionsco_insurance_db",
  password: "insurance_db@2024#",
  database: "sitsolutionsco_insurance_db",
});


app.get("/getallappointment", (req, res) => {
  const sql = "SELECT * FROM appointment";
  db.query(sql, (err, data) => {
    if (err) {
      res.json("Fail to fetch");
    }
    return res.send(data);
  });
});

app.post("/checkLogin", (req, res) => {
  const sql = "SELECT * FROM admin_login WHERE `email` = ? AND `password` = ?";
  db.query(sql, [req.body.username, req.body.password], (err, data) => {
    if (err) {
      console.error("Login Error:", err);
      return res
        .status(500)
        .json({ status: "0", message: "Failed to fetch user data" });
    }

    if (data.length > 0) {
      const { post } = data[0]; // Get the 'post' value from the database
      return res.status(200).json({
        status: "1",
        message: "Login successful",
        post: post, // Send the user's role to the frontend
      });
    } else {
      return res.status(401).json({
        status: "0",
        message: "Invalid credentials",
      });
    }
  });
});

// Below code by Prajwal Punekar

app.get("/getallappointment", (req, res) => {
  const sql = "SELECT * FROM appointment";
  db.query(sql, (err, data) => {
    if (err) {
      res.json("Fail to fetch");
    }
    res.send(data);
  });
});

app.get("/getlatestappointments", (req, res) => {
  const sql = "SELECT * FROM appointment ORDER BY time DESC LIMIT 5";
  db.query(sql, (err, data) => {
    if (err) {
      res.status(500).json("Fail to fetch appointments");
    }
    return res.json(data); // Send the latest 5 appointments as JSON
  });
});

app.get("/getAppointmentCount", (req, res) => {
  const sql = "SELECT COUNT(*) AS count FROM appointment";
  db.query(sql, (err, data) => {
    if (err) {
      return res.status(500).json("Fail to fetch appointment count");
    }
    return res.json(data[0].count); // Send the count of appointments
  });
});

app.put("/updateAppointment/:id", (req, res) => {
  const { id } = req.params;
  const { time, treatment, message } = req.body;

  const sql =
    "UPDATE appointment SET time = ?, treatment = ?, message = ? WHERE appointment_id = ?";

  db.query(sql, [time, treatment, message, id], (err, result) => {
    if (err) {
      console.error("Database error:", err); // More detailed logging here
      return res.status(500).send("Update failed");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("Appointment not found");
    }
    res.status(200).send("Update successful");
  });
});

app.get("/getAppointmentById/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM appointment WHERE appointment_id = ?";
  db.query(sql, [id], (err, data) => {
    if (err) {
      console.error("Database error:", err); // Log the error for debugging
      return res.status(500).json("Failed to fetch appointment details");
    }
    if (data.length === 0) {
      return res.status(404).json("Appointment not found");
    }
    res.json(data[0]);
  });
});

//Excel appointments

app.get("/previewAppointments", (req, res) => {
  const sql = "SELECT * FROM appointment";
  db.query(sql, (err, data) => {
    if (err) {
      return res.status(500).json("Failed to fetch data");
    }
    return res.json(data); // Send data as JSON for preview
  });
});

app.get("/downloadAppointments", (req, res) => {
  const sql = "SELECT * FROM appointment";
  db.query(sql, async (err, data) => {
    if (err) {
      return res.status(500).json("Failed to fetch data");
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Appointments");

    // Define columns
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Client Name", key: "name", width: 30 },
      { header: "Medical Test", key: "treatment", width: 30 },
      { header: "Contact No", key: "mobileno", width: 20 },
      { header: "Proposal No", key: "appointment_no", width: 20 },
      { header: "Appointment Time", key: "time", width: 25 },
    ];

    // Add rows
    data.forEach((appointment) => {
      worksheet.addRow({
        id: appointment.id,
        name: appointment.name,
        treatment: appointment.treatment,
        mobileno: appointment.mobileno,
        appointment_no: appointment.appointment_no,
        time: new Date(appointment.time).toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
      });
    });

    // Set header for download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=appointments.xlsx"
    );

    // Write Excel to response
    await workbook.xlsx.write(res);
    res.end();
  });
});

// Add Reply to Appointment and Store in Another Table
app.post("/addReply", (req, res) => {
  const { appointment_no, name, mobileno, treatment, time, reply } = req.body;

  if (!appointment_no || !name || !mobileno || !treatment || !time || !reply) {
    return res.status(400).json("All fields are required!");
  }

  const sql = `
    INSERT INTO appointment_replies 
    (appointment_no, name, mobileno, treatment, time, reply) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [appointment_no, name, mobileno, treatment, time, reply],
    (err, result) => {
      if (err) {
        console.error("Error adding reply:", err);
        return res.status(500).json("Failed to add reply");
      }

      return res.status(200).json("Reply added successfully");
    }
  );
});

// Get Replies for an Appointment
app.get("/getReplies/:appointment_no", (req, res) => {
  const { appointment_no } = req.params;

  const sql = `
    SELECT * FROM appointment_replies 
    WHERE appointment_no = ?
  `;

  db.query(sql, [appointment_no], (err, data) => {
    if (err) {
      console.error("Error fetching replies:", err);
      return res.status(500).json("Failed to fetch replies");
    }

    if (data.length === 0) {
      return res.status(404).json("No replies found for this appointment");
    }

    return res.status(200).json(data);
  });
});

//Laboratory

// Get All Laboratories
app.get("/getAllLaboratories", (req, res) => {
  const sql = "SELECT * FROM laboratory";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching laboratories:", err);
      return res.status(500).json("Failed to fetch laboratories");
    }
    return res.status(200).json(data);
  });
});

// Get Laboratory by ID
app.get("/getLaboratoryById/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM laboratory WHERE lab_id = ?";
  db.query(sql, [id], (err, data) => {
    if (err) {
      console.error("Error fetching laboratory:", err);
      return res.status(500).json("Failed to fetch laboratory");
    }
    if (data.length === 0) {
      return res.status(404).json("Laboratory not found");
    }
    return res.status(200).json(data[0]);
  });
});

// Add New Laboratory
// app.post("/addLaboratory", (req, res) => {
//   const {
//     title,
//     country,
//     state,
//     city,
//     pincode,
//     address,
//     name,
//     mobileno,
//     email,
//     username,
//     password,
//   } = req.body;

//   if (
//     !title ||
//     !country ||
//     !state ||
//     !city ||
//     !pincode ||
//     !address ||
//     !name ||
//     !mobileno ||
//     !email ||
//     !username ||
//     !password
//   ) {
//     return res.status(400).json("All fields are required!");
//   }

//   const sql = `
//     INSERT INTO laboratory (title, country, state, city, pincode, address, name, mobileno, email, username, password)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `;
//   db.query(
//     sql,
//     [
//       title,
//       country,
//       state,
//       city,
//       pincode,
//       address,
//       name,
//       mobileno,
//       email,
//       username,
//       password,
//     ],
//     (err, result) => {
//       if (err) {
//         console.error("Error adding laboratory:", err);
//         return res.status(500).json("Failed to add laboratory");
//       }
//       return res.status(201).json("Laboratory added successfully");
//     }
//   );
// });

// Add New Laboratory
app.post("/addLaboratory", (req, res) => {
  const {
    title,
    country,
    state,
    city,
    pincode,
    address,
    name,
    mobileno,
    email,
    username,
    password,
  } = req.body;

  if (
    !title ||
    !country ||
    !state ||
    !city ||
    !pincode ||
    !address ||
    !name ||
    !mobileno ||
    !email ||
    !username ||
    !password
  ) {
    return res.status(400).json("All fields are required!");
  }

  const laboratorySql = `
    INSERT INTO laboratory (title, country, state, city, pincode, address, name, mobileno, email, username, password)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const adminLoginSql = `
    INSERT INTO admin_login (token_key, name, email, username, password, post)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  // Generate a random token_key
  const tokenKey = Math.random().toString(36).substr(2, 10);

  // Start a transaction to ensure data consistency
  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction Error:", err);
      return res.status(500).json("Transaction Error");
    }

    // Insert into the laboratory table
    db.query(
      laboratorySql,
      [
        title,
        country,
        state,
        city,
        pincode,
        address,
        name,
        mobileno,
        email,
        username,
        password,
      ],
      (err, labResult) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error adding laboratory:", err);
            res.status(500).json("Failed to add laboratory");
          });
        }

        // Insert into the admin_login table
        db.query(
          adminLoginSql,
          [tokenKey, name, email, username, password, "laboratory"],
          (err, adminResult) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error adding admin login:", err);
                res.status(500).json("Failed to add admin login");
              });
            }

            // Commit the transaction
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  console.error("Commit Error:", err);
                  res.status(500).json("Failed to commit transaction");
                });
              }

              res
                .status(201)
                .json("Laboratory and Admin Login added successfully");
            });
          }
        );
      }
    );
  });
});

// Update Laboratory by ID
app.put("/updateLaboratory/:id", (req, res) => {
  const { id } = req.params;
  const {
    title,
    country,
    state,
    city,
    pincode,
    address,
    name,
    mobileno,
    email,
    username,
    password,
  } = req.body;

  if (
    !title ||
    !country ||
    !state ||
    !city ||
    !pincode ||
    !address ||
    !name ||
    !mobileno ||
    !email ||
    !username ||
    !password
  ) {
    return res.status(400).json("All fields are required!");
  }

  const sql = `
    UPDATE laboratory
    SET title = ?, country = ?, state = ?, city = ?, pincode = ?, address = ?, name = ?, mobileno = ?, email = ?, username = ?, password = ?
    WHERE lab_id = ?
  `;
  db.query(
    sql,
    [
      title,
      country,
      state,
      city,
      pincode,
      address,
      name,
      mobileno,
      email,
      username,
      password,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating laboratory:", err);
        return res.status(500).json("Failed to update laboratory");
      }
      if (result.affectedRows === 0) {
        return res.status(404).json("Laboratory not found");
      }
      return res.status(200).json("Laboratory updated successfully");
    }
  );
});

// Delete Laboratory by ID
app.delete("/deleteLaboratory/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM laboratory WHERE lab_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting laboratory:", err);
      return res.status(500).json("Failed to delete laboratory");
    }
    if (result.affectedRows === 0) {
      return res.status(404).json("Laboratory not found");
    }
    return res.status(200).json("Laboratory deleted successfully");
  });
});

// Assistant

// Get All Assistant
app.get("/getAllassistant", (req, res) => {
  const sql = "SELECT * FROM assistant";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching laboratories:", err);
      return res.status(500).json("Failed to fetch laboratories");
    }
    return res.status(200).json(data);
  });
});

// Get Assistant by ID
app.get("/getAssistantById/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM assistant WHERE assistant_id = ?";
  db.query(sql, [id], (err, data) => {
    if (err) {
      console.error("Error fetching assistant:", err);
      return res.status(500).json("Failed to fetch assistant");
    }
    if (data.length === 0) {
      return res.status(404).json("Assistant not found");
    }
    return res.status(200).json(data[0]);
  });
});

// Add New Assistant
// app.post("/addAssistant", (req, res) => {
//   const { name, mobileno, email, username, password } = req.body;

//   if (!name || !mobileno || !email || !username || !password) {
//     return res.status(400).json("All fields are required!");
//   }

//   const sql = `
//     INSERT INTO assistant (name, mobileno, email, username, password)
//     VALUES (?, ?, ?, ?, ?)
//   `;
//   db.query(sql, [name, mobileno, email, username, password], (err, result) => {
//     if (err) {
//       console.error("Error adding assistant:", err);
//       return res.status(500).json("Failed to add assistant");
//     }
//     return res.status(201).json("Assistant added successfully");
//   });
// });

// Add New Assistant
app.post("/addAssistant", (req, res) => {
  const { name, mobileno, email, username, password } = req.body;

  if (!name || !mobileno || !email || !username || !password) {
    return res.status(400).json("All fields are required!");
  }

  const assistantSql = `
    INSERT INTO assistant (name, mobileno, email, username, password)
    VALUES (?, ?, ?, ?, ?)
  `;

  const adminLoginSql = `
    INSERT INTO admin_login (token_key, name, email, username, password, post)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  // Generate a random token_key
  const tokenKey = Math.random().toString(36).substr(2, 10);

  // Start a transaction to ensure data consistency
  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction Error:", err);
      return res.status(500).json("Transaction Error");
    }

    // Insert into the assistant table
    db.query(
      assistantSql,
      [name, mobileno, email, username, password],
      (err, assistantResult) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error adding assistant:", err);
            res.status(500).json("Failed to add assistant");
          });
        }

        // Insert into the admin_login table
        db.query(
          adminLoginSql,
          [tokenKey, name, email, username, password, "assistant"],
          (err, adminResult) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error adding admin login:", err);
                res.status(500).json("Failed to add admin login");
              });
            }

            // Commit the transaction
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  console.error("Commit Error:", err);
                  res.status(500).json("Failed to commit transaction");
                });
              }

              res
                .status(201)
                .json("Assistant and Admin Login added successfully");
            });
          }
        );
      }
    );
  });
});

// Update Assistant by ID
app.put("/updateAssistant/:id", (req, res) => {
  const { id } = req.params;
  const { name, mobileno, email, username, password } = req.body;

  if (!name || !mobileno || !email || !username || !password) {
    return res.status(400).json("All fields are required!");
  }

  const sql = `
    UPDATE assistant
    SET name = ?, mobileno = ?, email = ?, username = ?, password = ?
    WHERE assistant_id = ?
  `;
  db.query(
    sql,
    [name, mobileno, email, username, password, id],
    (err, result) => {
      if (err) {
        console.error("Error updating assistant:", err);
        return res.status(500).json("Failed to update assistant");
      }
      if (result.affectedRows === 0) {
        return res.status(404).json("Assistant not found");
      }
      return res.status(200).json("Assistant updated successfully");
    }
  );
});

// Delete Assistant by ID
app.delete("/deleteAssistant/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM assistant WHERE assistant_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting assistant:", err);
      return res.status(500).json("Failed to delete assistant");
    }
    if (result.affectedRows === 0) {
      return res.status(404).json("Assistant not found");
    }
    return res.status(200).json("Assistant deleted successfully");
  });
});

app.get("/", (req, res) => {
  return res.json("From Backend");
});

app.listen(3005, () => {
  console.log("Listening");
});
