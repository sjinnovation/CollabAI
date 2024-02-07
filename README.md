# Collaborative-AI

## Description
This repository contains the source code for a web application with separate folders for the frontend (`client`) and backend (`server`) components.

## Folder Structure

### 1. Client
The `client` folder contains the React-based frontend code for the application. This includes JSX, CSS, and JavaScript files, as well as any additional assets such as images or fonts. Below is a brief overview of the main subdirectories within the `client` folder:

- **`src`**: This directory contains the React components, styles, and scripts for the frontend application.

- **`public`**: Static assets, such as images or favicon.ico, go here. This folder is served as-is and not processed by the build system.

- **`node_modules`**: This directory contains the third-party dependencies required for the frontend. It is typically generated and managed by npm.

- **`build`**: After building the frontend code, the resulting files are placed in this directory. This is the folder that is served to users when they access the application.


### 2. Server
The `server` folder contains all the backend-related code for the application, following a Model-View-Controller (MVC) pattern. Here is a breakdown of the main subdirectories within the `server` folder:

- **`controllers`**: This directory holds the controller files responsible for handling requests, processing data, and interacting with models.

- **`models`**: Data models and database-related code are organized in this folder.

- **`config`**: Configuration files for the backend, such as database configuration or any other service configuration should be stored here, can be stored in this directory.

- **`node_modules`**: Similar to the `client` folder, this directory contains the third-party dependencies required for the backend.


## Getting Started
Follow the steps below to get the project up and running on your local machine.

1. **Clone the Repository**
   ```bash
   https://github.com/sjinnovation/Collaborative-AI.git
   

2. **Navigate to the Client Folder**

    ```bash
    cd client

3. **Install Dependencies**

    ```bash
    npm install

4. **Navigate to the Server Folder**

    ```bash
    cd ../server

5. **Install Backend Dependencies**

    ```bash
    npm install

6. **Start Both Backend & Frontend Server**

    ```bash
    npm start

To initialize the application data and create a superadmin user, you can use either cURL or Postman:

   ### Using cURL

   If you prefer command-line tools, you can use curl to make a POST request to the /init-setup endpoint. Open your terminal and run the following command:

       curl -X POST http://localhost:8011/api/init -H "Content-Type: application/json" -d '{
       "fname": "Super",
       "lname": "Admin",
       "email": "superadmin@example.com",
       "password": "yourSecurePassword",
       "employeeCount": 100,
       "companyName": "INIT_COMPANY"
       }'

   ### Initializing Setup with Postman

   - **Open Postman**:  Launch the Postman application.

   - **Create a New Request**: Click on the '+' or 'New' button to create a new request.

   - **Set HTTP Method to POST**: Ensure that the HTTP method is set to POST.

   - **Enter URL**: Enter the URL `http://localhost:8011/api/init`.

   - **Set Headers**: 
       - Go to the 'Headers' tab.
       - Set `Content-Type` to `application/json`.

   - **Set Request Body**:
       - Switch to the 'Body' tab.
       - Select the 'raw' radio button.
       - Enter the JSON data for your superadmin user:

       ```json
       {
       "fname": "Super",
       "lname": "Admin",
       "email": "superadmin@example.com",
       "password": "securePassword",
       "employeeCount": 100,
       "companyName": "INIT_COMPANY"
       }
       ```

   - **Send Request**: Click the 'Send' button to make the request.

   This will send a POST request to `http://localhost:8011/api/init` with the provided JSON  payload, creating a superadmin user with the specified details.


## Reference

[CollaborativeAI Reference Guide](https://docs.google.com/document/d/1xOyvASQyss3ElNe3-pEpZMrQVFBjqqT4DLq96WtlCoU/edit#heading=h.tbh793g58rjf)

## Contributing

If you would like to contribute to the project, we welcome your contributions! Please follow the guidelines outlined in the [CONTRIBUTING.md](CONTRIBUTING.md) file.

Feel free to submit bug reports, suggest new features, or send pull requests to help improve the project. Your involvement is greatly appreciated!

Thank you for considering contributing to our project!

## License

[MIT](https://choosealicense.com/licenses/mit/)