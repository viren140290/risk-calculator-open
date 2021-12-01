import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import FHIR from "fhirclient";

// const clientId: string = 'a9f3d781-004b-4e1a-9c1a-55875723438b';
const clientId: string | undefined = process.env.REACT_APP_FHIR_CLIENT_ID;
const scopes: string = 'patient/Condition.read patient/Patient.read patient/Observation.read patient/MedicationRequest.read launch online_access openid profile';
const redirectUri: string = './';

// new client id from registering in new domain @ https://riskcalculator.learning-registry.com/
// a9f3d781-004b-4e1a-9c1a-55875723438b

// local -> 'client_id': '1c652be5-6c5c-4844-a038-1efd6cd9c3dd',
// 'client_id': '610bf39e-e89f-4a6b-b675-1015516d6f7d',
// 'client_id': 'a9f3d781-004b-4e1a-9c1a-55875723438b',

/* istanbul ignore file */
FHIR.oauth2.authorize({
    'client_id': clientId,
    'scope': scopes,
    'redirectUri': redirectUri
});

console.log(clientId, scopes, redirectUri);

(window as any).FHIR = FHIR;
