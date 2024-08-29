# jobly

- Springboard Jobly Assignment
- This is the api project that allows users to update view companies, jobs and apply for those jobs.

## Features

- User authentication
- Return list of jobs
- Return list of companies

## Installation

1. Clone the repository to your local machine
2. Navigate to repository (must be inside folder with package.json file)
3. Install dependencies

```bash
npm install
```

4. Create local psql database called jobly

```bash
createdb jobly
```

5. After creating the database, create a .env file to set the following environment variables.
   - DB_USER = "add_your_psql_user_name_here" (required)
   - DB_PASS = "add_your_psql_user_password_here" (required)
   - DB_HOST = "add_host_name_here" (optional- default set in config.js file)
   - DB_PORT = add_port_number_here (optional- default set to 3000 in config.js file)
   - SECRET_KEY = "add_secret_key_here" (optional- defaults to "secret_dev" in config.js file)
6. Start the API

```bash
npm start
```

7. Navigate to http://localhost:3000/ to view api (http://localhost:3000/ returns an error message. Need to go to /companies, /jobs, etc to view return data)
