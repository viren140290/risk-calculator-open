# ASCVD Secondary Prevention Risk Calculator
## 10-Year Risk Calculator for Established ASCVD (SMART-REACH)

A SMART on FHIR application designed to facilitate shared decision making between physicians and patients with established atherosclerotic cardiovascular disease (ASCVD). The tool provides estimated 10-year risk of cardiovascular events in patient with established cardiovascular disease based upon the model developed and published in the 2018 Journal of American Heart Association (JAHA) publication Estimated Life Expectancy Without Recurrent Cardiovascular Events in Patients With Vascular Disease: The SMART‐REACH Model. This application uses relative patient data to provide an estimated 10-year and/or lifetime risk score of a major cardiovascular event for patients with established ASCVD. Clinicians can simulate the impact of various therapies on 10-year risk based on established relative risk reductions of therapies in clinical trials. The risk score(s) are visually represented into a multi-faceted bar-graph that allows physicians to facilitate risk communication.
The tool is intended for patients between the age of 45-79 with at least one location of cardiovascular disease. The following factors are required to calculate an anticipated recurrent cardiovascular event:
* Age
* Sex
* Systolic Blood Pressure
* Cholesterol
* Creatinine
* LDL-Cholesterol
* Smoking
* Diabetes status
* Cardiovascular comorbidities
* Current Treatment

## Clinical

This application implements the risk determination model defined in the primary supporting research.  See "About the Calculator" in ./src/components/ForProviders/ForProviders.tsx for a full citation of the publication.

The original research identified model coefficients for regions of the world.  This implementation includes the North America region only.

Risk reduction values are taken from published research applicable to each intervention.  Those are also cited in ./src/components/ForProviders/ForProviders.tsx.

### Adaptation

Values for the coefficients and other parameters of the model are defined in ./src/data/calculationsData.json.

The application uses codes to determine whether various FHIR results relevant to the calculations are present for the patient, eg patient conditions, labs, medications.  The codesets and individual codes are defined in ./src/data/fhirCodes.json.

Both calculationsData and fhirCodes are entirely interdependent with program code.  They are provided for ease of discovery and modification.

This implementation is developed for English language users only.  Translations were anticipated to be taken from a json file, but this feature is not implemented.

The implementation does not include any accessibility accommodations; other adopters may wish to incorporate accommodations.

## Technical

This is a SMART-ON-FHIR application intended to be accessible from Cerner Millenium EMR.

Authentication with Cerner requires this app or your forked variant to be registered with code.cerner.com.  Provide your registered app's client id in the FHIR.oauth2.authenticate call in launch.ts.

The app works with Millenium 2018.01 Service Release and later releases.

The application may be also be launched from MPages.  MPages must be versions greater than 7.x, as only IE11 compatibility is incorporated, IE10 compatibility is not.

### Architecture

The implementation is a standard React web application, with javascript, html, and css files to be run in a web browser.  The application is coded to be compatible with Microsoft Internect Explorer version 11, as required by Cerner Millenium SMART App constraints.

The application is stateless; it retains no data between executions. (e.g. Patient data are retrieved fresh each time the application is invoked, and user supplied values are not retained.)

The application expects FHIR R4 resources.  It uses read scopes only, no data are modified.

The app authenticates to a single Millenium instance/Ignite R4 domain.  That is, it does not expect to acquire patient data from multiple health systems a patient may have interacted with, for example, but only that single Millenium instance from which the app is launched by the user/provider.

The application relies on code sets to select conditions, observations, and medications. Those values are specified in fhirCodes.json which can be modified by implementers and used at runtime. Each invocation freshly retrieves the fhirCodes.json file so changes are immediately available.  (see Adaptation, above)

Activity logging related to the execution of the app is provided by the host Millenium system.  No logging functionality is included in the app.

Printed output from the app is provided by the host Millenium system.  No additional printing functionality is provided in the app.  Styling does include formatting/arranging elements for printing.

## Entry points

The project uses the standard SMART-ON-FHIR launch.html and index.html callback URL for launching in an EMR context.

The project has also defined launch-open.html to provide an out-of-emr context for testing and development.  Launch-open expects a patientID parameter in the URL, and makes calls into Cerner's fhir sandbox endpoint.  Your forked variant may need to address other endpoints.

## Processing FHIR result data

./src/services/FHIRService.ts retrieves and prepares data from the EMR.  Data is conditioned appropriately for the specific risk calculations implemented in the app, eg interpreting Statin intensity.  FHIRService refers to fhirCodes.json, described in Adaptation above, to select appropriate results.

./src/services/CalculatorService.ts implements the risk calculation.  CalculatorService uses calculation parameters from calculationsData.json, described in Adaptation above.

## Deployment

The application is designed to be made available in Cerner SMART App Gallery.  Forked variants may require adaptation to support availability from other sources.

The application implementation is entirely static, a set of javascript, html, css, and json files, and as such may be served from any standard web server available in the target environment.

## Attribution

This application was developed by Bellwether Consulting LLC under contract to Cerner.


## Available Scripts
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
