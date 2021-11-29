import dotenv from 'dotenv';
dotenv.config({ debug: true });
const REACT_APP_FHIR_CLIENT_ID = 'REACT_APP_FHIR_CLIENT_ID';
console.log(`${REACT_APP_FHIR_CLIENT_ID}: ${process.env[REACT_APP_FHIR_CLIENT_ID]}`);