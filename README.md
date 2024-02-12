# Collaborative AI

## About
Dive into the future of AI with CollaborativeAi.Software, your solution for using OpenAI's API to power ChatGPT on your server. Our platform simplifies running your ChatGPT, managing access for unlimited employees, creating custom AI assistants with your API, organizing employee groups, and using custom templates for a tailored experience. With complete control over customization and data privacy, elevate your projects and transform how your team leverages AI. Join CollaborativeAi.Software and revolutionize your AI capabilities today. With over 50 deployments, our support structure includes both our dedicated team and an open-source community, ensuring you have all the help you need.

## CollaborativeAi.Software Features:
- **Self-Hosting on Your Cloud:** Gain full control by hosting the platform on your private cloud. Ensure data privacy by using your API codes, allowing for secure data handling.
- **Team Management:** Manage teams with private accounts, and customizable access levels (Departments).
- **Prompt Templates:** Utilize generic templates to streamline team usage.
- **Departmental Access & Assistant Assignment:** Assign AI assistants to specific departments for shared team access.
- **Customizable AI Assistants:** Create personalized AI assistants for users or organizations.
- **Tagging Feature in Chats:** Organize and retrieve chat data efficiently with custom tags.
- **Chat Storage and Retrieval:** Save all chats and replies for future analysis, with an option to restore accidentally deleted chats from Trash.
- **Optimized Performance:** Experience our high-speed, efficient platform. Our clients have been using it for over a year, with some spending $1500-$2000 per month on the API.
- **File Upload & GPT-4 Vision Integration:** Enhance interactions by uploading files for analysis and sending pictures for AI description.
- **Future Enhancements:** Anticipate new functionalities like API-based function calls, Python code execution, and integration with Gemini and other APIs.
- **Upcoming Free Mobile App:** Access CollaborativeAi.Software on the go with a soon-to-be-released app.

![image](https://github.com/sjinnovation/CollaborativeAI/assets/45666802/a14ca235-a3c9-45b3-9e91-85f0240af5f5) 
![image](https://github.com/sjinnovation/CollaborativeAI/assets/45666802/6b33f541-cb65-4383-83ef-136c9b51a4b0)
![image](https://github.com/sjinnovation/CollaborativeAI/assets/45666802/5657a1cf-9134-4e8b-ad2d-14459fb1023c)


## Folder Structure

### 1. Client
The `client` folder contains the React-based frontend code for the application. This includes JSX, CSS, and JavaScript files, as well as any additional assets such as images or fonts. Below is a brief overview of the main subdirectories within the `client` folder:

- **`src`**: This directory contains the React components, styles, and scripts for the frontend application.

- **`public`**: Static assets, such as images or favicon.ico, go here. This folder is served as-is and not processed by the build system.


### 2. Server
The `server` folder contains all the backend-related code for the application, following a Model-View-Controller (MVC) pattern. Here is a breakdown of the main subdirectories within the `server` folder:

- **`controllers`**: This directory holds the controller files responsible for handling requests, processing data, and interacting with models.

- **`models`**: Data models and database-related code are organized in this folder.

- **`config`**: Configuration files for the backend, such as database configuration or any other service configuration should be stored here, can be stored in this directory.


## Getting Started
Follow the steps below to get the project up and running.

### Prerequisites
- Node.js (Version: >=16.x)
- [MongoDB](https://www.mongodb.com/?ref=collaborativeai.software)
- NPM

## Development

### Setup
1. **Clone the Repository**
   ```bash
   https://github.com/sjinnovation/CollaborativeAI.git
   

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

Feel free to raise issues, suggest new features, or send pull requests to help improve the project. Your involvement is greatly appreciated!

Thank you for contributing to our project!

## License

[MIT](https://choosealicense.com/licenses/mit/)
