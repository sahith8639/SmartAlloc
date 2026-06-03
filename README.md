# Smart Resource Allocation System Using Machine Learning in Operating Systems

A real-time intelligent operating system resource allocation platform. The platform continuously monitors system resource allocations, processes workloads using a Random Forest machine learning regressor, forecasts future requirements, and provides interactive control panels for process scheduler queues, RAM mapping, and disk/network configurations.

---

## 🛠️ Technology Stack

* **Frontend**: React.js, Tailwind CSS, Material UI, Recharts, Axios, Socket.IO Client
* **Backend**: Node.js, Express.js, Socket.IO, Mongoose, JWT, Cryptography (bcryptjs)
* **Database**: MongoDB
* **Machine Learning**: Python, Scikit-Learn, Pandas, NumPy, Joblib

---

## 📂 Project Structure

```
c:\Users\SAHITHSAI PASUPULA\OneDrive\Desktop\OS1
├── backend/
│   ├── config/db.js                     # Database connection utility
│   ├── middleware/authMiddleware.js     # JWT validation and role guards
│   ├── models/                          # Mongoose database models (User, ResourceMetrics, etc.)
│   ├── routes/                          # REST API route controllers
│   ├── ml/
│   │   ├── ml_model.py                  # Python Random Forest regressor
│   │   └── seed_data.js                 # High-fidelity DB seeder
│   ├── package.json                     # Express dependencies
│   ├── server.js                        # Express app and Socket.IO server
│   └── Dockerfile                       # Backend container recipe
├── frontend/
│   ├── public/index.html                # Mobile-responsive HTML wrapper
│   ├── src/
│   │   ├── components/                  # Layout, Sidebar, Topbar
│   │   ├── pages/                       # Dashboard views
│   │   ├── App.js                       # React routes and state provider
│   │   ├── index.js                     # React entrypoint
│   │   ├── index.css                    # Tailwind CSS base and gradients
│   │   └── theme.js                     # Material UI palette customizer
│   ├── package.json                     # React dependencies
│   ├── tailwind.config.js               # Color palette config
│   └── Dockerfile                       # Client container recipe
├── docker-compose.yml                   # Master orchestration build
└── README.md                            # Documentation and Demo Guide
```

---

## 🚀 Installation & Setup

### Approach A: Using Docker Compose (Recommended)
Make sure you have Docker and Docker Desktop installed and running.
1. In the root project directory, run:
   ```bash
   docker-compose up --build
   ```
2. Once the build completes:
   * **Frontend Client**: [http://localhost:3000](http://localhost:3000)
   * **Backend Express Server**: [http://localhost:5000](http://localhost:5000)

### Approach B: Run Manually (Local Node/MongoDB)
1. **Start MongoDB locally**: Ensure MongoDB is running on `mongodb://localhost:27017/smart_resource_allocator`.
2. **Launch Backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```
   *(This automatically seeds 100 historical telemetry points, configs, and default user accounts).*
3. **Launch Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm start
   ```
4. Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Operator Credentials
Two pre-configured accounts are seeded to facilitate immediate testing and demo separation:
1. **Administrator Profile (Full Access & ML Retraining)**
   * **Username**: `admin`
   * **Password**: `admin123`
2. **System Manager Profile (Read & Allocation Tuning)**
   * **Username**: `manager`
   * **Password**: `manager123`

---

## 📖 Core Pages: What They Do & How They Work

### 1. Dashboard (Operations Overview)
* **What it does**: Provides a high-level operational overview of the OS including CPU, Memory, Disk, and Network telemetry cards. It shows process queues, page mapping contexts, and the active ML recommendation alerts.
* **How it works**: Establishes a Socket.IO connection to receive broadcasted metrics every 2 seconds. On initial mount, it queries `/api/resources/history` to load historical line points so the chart displays immediately.

### 2. Resource Monitoring (Live Telemetry)
* **What it does**: Deep-dive tracking of system metrics split into four graphs: CPU Usage & Thermal Dynamics, Memory Address Mapping, Disk Volume, and Network Socket Bandwidth.
* **How it works**: Renders a sliding window of the last 30 data points using Recharts. As new Socket.IO events arrive, old coordinates slide left to show continuous metrics.

### 3. Workload Analysis (Module 2)
* **What it does**: Displays data cleaning summaries and workload classifications (Low, Medium, High, Critical) using pie charts, peak usage bars, and trends.
* **How it works**: Calculates an intensity score `(CPU + RAM% + Disk%) / 3`. If the average load breaches the threshold, it is stored as `Critical`. Growth rate is evaluated by dividing the dataset in half and comparing older averages against newer averages.

### 4. ML Prediction Forecasts (Module 3)
* **What it does**: Displays resource requirements forecast cards (Forecast CPU/RAM/Disk/Network), confidence score gauges, and a Future Trend Comparison Graph (Dotted Predicted line vs Solid Actual line).
* **How it works**: Spawns a Python child process to execute the `ml_model.py` script. The script uses Scikit-Learn's `RandomForestRegressor` to calculate future demands. If Python is missing, it falls back to an internal Node-side rule engine to prevent UI crashes.

### 5. Resource Manager (Simulated OS Controller)
* **What it does**: Interactive panel to start/suspend/kill process scheduler threads, allocate/free memory partitions, prioritize disk I/O requests, and slide hardware limits.
* **How it works**: Integrates state managers in React. Adjusting sliders and clicking **Apply Allocation** updates thresholds via POST requests to `/api/allocation/apply`.

### 6. Performance Monitoring (Feedback Loop)
* **What it does**: Tracks system Throughput (RPS) and latency response curves. Contains the **Retrain Regressor Model** trigger.
* **How it works**: The retraining button is role-restricted (only active for `admin`). On click, it triggers the python script to refit the Random Forest model on the updated MongoDB logs and outputs the updated R² accuracy.

### 7. Reports Center (Document Exporter)
* **What it does**: Compiles diagnostics audit sheets in PDF, CSV, and Excel formats.
* **How it works**: Streams structured CSV text strings for Excel/CSV formats, and returns a print-ready HTML dashboard for the PDF format, which can be printed/saved as a PDF directly from the browser.

### 8. Settings Configurator
* **What it does**: Configures warning limits (CPU, RAM, Disk, Net) and Socket refresh speeds.
* **How it works**: Read-only for `manager` role. Administrators can change thresholds and save them to MongoDB via a PUT request.

---

## 📋 Live Demo Script: Step-by-Step

Follow this script during your live demonstration:

### Step 1: Secure Entrance & Role Guarding
1. Open the browser to **[http://localhost:3000](http://localhost:3000)**.
2. Explain: *"The system features role-based access. I will log in as the **Administrator** using the quick-login helper button."* Click **admin**.

### Step 2: Show Real-Time Operations Center
1. Navigate to the **Dashboard**. Point out the CPU, Memory, Disk, and Network telemetry cards updating every 2 seconds.
2. Point to the **Resource Consumption Activity** graph and show the green status badge indicating the system's live health.

### Step 3: View Deep-Dive Telemetry
1. Go to **Resource Monitoring**. Show the four high-fidelity Recharts graphs plotting thermal profiles, RAM partitions, write speeds, and socket connections.

### Step 4: Run Machine Learning Predictions
1. Go to **ML Prediction**. Highlight the forecast values for CPU, RAM, and Disk.
2. Show the **Future Trend Comparison Graph** (Actual vs Predicted CPU) to prove model tracking.
3. Click **Execute Forecast Now** to show an on-demand regressor forecast.

### Step 5: Preprocessing & Classification
1. Go to **Workload Analysis**. Point out the preprocessing stats (nulls removed, MinMax scaling completed) and show the classified **Workload Distribution Pie Chart**.

### Step 6: Trigger OS Resource Allocation
1. Go to **Resource Allocation**.
2. Type `telemetry-daemon` in the process queue input, click **Execute**, and show that it appears in the running processes queue. Click **Pause** to suspend it, then **Delete** to kill it.
3. Under the **Dynamic Kernel Resource Controller** panel, slide the Max CPU Shares to **85%** and click **Apply Allocation**. Show the new entry appearing in the **Allocation Execution Logs** audit table.

### Step 7: Trigger Self-Learning Model Retraining
1. Go to **Performance Monitoring**. Highlight the throughput and latency charts.
2. Click **Retrain Regressor Model**. Point out the loading spinner and the success notification showing the updated model accuracy.
3. Explain: *"This retrains the Python Random Forest model dynamically on the live data points saved in MongoDB."*

### Step 8: Compile & Export Audits
1. Go to **Reports**. Select **PDF** or **Excel**, type a custom note, and click **Generate & Save**.
2. Click **Download** on the new entry to show the compiled log file.

---

## 💡 Key Architectural Highlights
* **WebSockets Ingestion**: Avoids HTTP polling overhead by using Socket.IO for real-time broadcasts.
* **MUI & Tailwind Dark Theme**: Premium ROG/Datadog-themed gradients with smooth dark-mode transitions.
* **Auto-Seeding**: Seeds MongoDB with 100 historical telemetry points, warning settings, and users on first run so the dashboard displays outputs immediately.
* **Node-Python Bridge**: Spawns Python scripts via child processes for model fitting and evaluation.
* **Robust Fallback Design**: If the target system doesn't have Python or Scikit-Learn libraries, the system falls back to an internal Node-side rule engine, keeping pages active.

---

## 🧑‍💻 Contributor
* Pasupula Sahith Sai
