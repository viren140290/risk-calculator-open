import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import FHIR from "fhirclient";

/* istanbul ignore file */
FHIR.oauth2.authorize({
    // local -> 'client_id': '1c652be5-6c5c-4844-a038-1efd6cd9c3dd',
    'client_id': '610bf39e-e89f-4a6b-b675-1015516d6f7d',
    'scope': 'patient/Condition.read patient/Patient.read patient/Observation.read patient/MedicationRequest.read launch online_access openid profile',
    'redirectUri': './'
});

(window as any).FHIR = FHIR;
