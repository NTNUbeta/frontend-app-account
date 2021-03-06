import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render, cleanup, act, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { injectIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import { IdVerificationContext } from '../../IdVerificationContext';
import TakeIdPhotoPanel from '../../panels/TakeIdPhotoPanel';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

jest.mock('../../Camera');

const history = createMemoryHistory();

const IntlTakeIdPhotoPanel = injectIntl(TakeIdPhotoPanel);

describe('TakeIdPhotoPanel', () => {
  const defaultProps = {
    intl: {},
  };

  const contextValue = {
    facePhotoFile: 'test.jpg',
    idPhotoFile: null,
    setIdPhotoFile: jest.fn(),
  };

  afterEach(() => {
    cleanup();
  });

  it('doesn\'t show next button before photo is taken', async () => {
    await act(async () => render((
      <Router history={history}>
        <IntlProvider locale="en">
          <IdVerificationContext.Provider value={contextValue}>
            <IntlTakeIdPhotoPanel {...defaultProps} />
          </IdVerificationContext.Provider>
        </IntlProvider>
      </Router>
    )));
    const button = await screen.findByTestId('next-button');
    expect(button).not.toBeVisible();
  });

  it('shows next button after photo is taken and routes to GetNameIdPanel', async () => {
    contextValue.idPhotoFile = 'test.jpg';
    await act(async () => render((
      <Router history={history}>
        <IntlProvider locale="en">
          <IdVerificationContext.Provider value={contextValue}>
            <IntlTakeIdPhotoPanel {...defaultProps} />
          </IdVerificationContext.Provider>
        </IntlProvider>
      </Router>
    )));
    const button = await screen.findByTestId('next-button');
    expect(button).toBeVisible();
    fireEvent.click(button);
    expect(history.location.pathname).toEqual('/get-name-id');
  });

  it('routes back to SummaryPanel if that was the source', async () => {
    contextValue.idPhotoFile = 'test.jpg';
    history.location.state = { fromSummary: true };
    await act(async () => render((
      <Router history={history}>
        <IntlProvider locale="en">
          <IdVerificationContext.Provider value={contextValue}>
            <IntlTakeIdPhotoPanel {...defaultProps} />
          </IdVerificationContext.Provider>
        </IntlProvider>
      </Router>
    )));
    const button = await screen.findByTestId('next-button');
    fireEvent.click(button);
    expect(history.location.pathname).toEqual('/summary');
  });
});
