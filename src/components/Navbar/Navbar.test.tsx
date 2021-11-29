import React from 'react';
import { render } from '@testing-library/react';
import {IntlProvider} from "react-intl";
import en from "../../lang/en.json";
import Navbar from "./Navbar";

test('Succesful rendering', () => {
  const mockActiveTabIndexUpdateHandler = jest.fn((tabIndex: number) => {});

  const element = render(
      <IntlProvider locale="en" messages={en}>
        <Navbar
            activeTabIndex={0}
            activeTabIndexUpdateHandler={mockActiveTabIndexUpdateHandler}
        />
      </IntlProvider>
  );
  expect(element).toMatchSnapshot();
});
