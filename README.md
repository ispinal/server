# server

This Node.js application provides back-end functionality for ispinal.

## Run the app locally

1. Create a `.env` file in this project's root directory containing Cloudant `VCAP_SERVICES` [credentials](https://console.bluemix.net/docs/services/watson/getting-started-variables.html#vcapServices). This requires an [IBM Cloud](https://cloud.ibm.com) instance provisioned.
2. [Install Node.js](https://nodejs.org/en/)
3. cd into this project's root directory
4. Run `npm install` to install the app's dependencies
5. Run `npm start` to start the app


## API routes

Users
* HTTP POST `/api/users/register` - register a new user.
* HTTP POST `/api/users/login` - log in.
* HTTP POST `/api/users/logout` - log out.
* HTTP GET `/api/users/:email/:token/isLoggedIn` - determine if a given user is logged in.

Patients
* HTTP GET `/api/patients/:email/:token/:patient_id/summary` - retrieve a summary of a given patient.
* HTTP POST `/api/patients/create` - create a new patient.
* HTTP POST `/api/patients/addObservations` - add a new observation for a patient.

Parents
* HTTP POST `/api/parents/addCarer` - add a new carer for a given patient.

Carers
* HTTP POST `/api/carers/matchCarer` - perform the match of a new carer when they enter a verification code.
