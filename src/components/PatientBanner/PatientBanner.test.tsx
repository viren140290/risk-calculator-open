import React from 'react';
import { render } from '@testing-library/react';
import {IntlProvider} from "react-intl";
import en from "../../lang/en.json";
import PatientBanner from "./PatientBanner";

test('Succesful rendering', () => {
  const element = render(
      <IntlProvider locale="en" messages={en}>
        <PatientBanner hidePatientData={true}/>
      </IntlProvider>
  );
  expect(element).toMatchSnapshot();
});
