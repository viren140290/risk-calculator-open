import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import FHIR from "fhirclient";

/* istanbul ignore file */
function getQueryStringValue (key: any) {
    return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[.+*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

/**
 * Additional entry point to be used for testing purposes.
 * It uses `fhir-open.cerner.com` endpoint which doesn't require any authorization.
 * In order to access specific patient one should hit `<host>/launch-open.html?patientID=<patientId>`
 * By default patientId 12724065 will be used.
 *
 * NOTE: When building the app with `npm run build` and then running it on a server e.g. `serve build` the resulting url
 * might slightly change i.e. you should drop the html extension as follows `<host>/launch-open?patientID=<patiendId>`
 */
FHIR.oauth2.authorize({
    fhirServiceUrl: "https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d",
    redirectUri: "./index.html",
    patientId: `${getQueryStringValue("patientID") || '12724065'}`, // emulating patient by parsing `patientID` query param
    // encounterId: "...", // include if you want to emulate selected encounter ID
    launch: "whatever",
    // fakeTokenResponse: { // include if you want to emulate current user
    //     id_token: "..."
    // }
});

(window as any).FHIR = FHIR;
