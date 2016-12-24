import React from 'react'
import ReactDOM from 'react-dom'
import createBrowserHistory from 'history/lib/createBrowserHistory'
import { Router, Route, IndexRoute, useRouterHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { Provider } from 'react-redux'

import createStore from 'store/createStore'
import StatusPageLayout from 'layouts/StatusPageLayout'
import Statuses from 'containers/Statuses'
import History from 'containers/History'
import * as settings from 'utils/settings'

// ========================================================
// Browser History Setup
// ========================================================
const browserHistory = useRouterHistory(createBrowserHistory)({
  basename: __BASENAME__
})

// ========================================================
// Store and History Instantiation
// ========================================================
// Create redux store and sync with react-router-redux. We have installed the
// react-router-redux reducer under the routerKey "router" in src/routes/x.js,
// so we need to provide a custom `selectLocationState` to inform
// react-router-redux of its location.
const initialState = window.___INITIAL_STATE__
const store = createStore(initialState, browserHistory)
const history = syncHistoryWithStore(browserHistory, store, {
  selectLocationState: (state) => state.router
})

// ========================================================
// Developer Tools Setup
// ========================================================
if (__DEBUG__) {
  if (window.devToolsExtension) {
    window.devToolsExtension.open()
  }
}

// ========================================================
// Render Setup
// ========================================================
const MOUNT_NODE = document.getElementById('root')

let render = () => {
  const routes = (
    <Route path='/' component={StatusPageLayout}>
      <IndexRoute component={Statuses} />
      <Route path='statuses' component={Statuses} />
      <Route path='history' component={History} />
    </Route>
  )

  ReactDOM.render(
    <Provider store={store}>
      <div style={{ height: '100%' }}>
        <Router history={history} children={routes} />
      </div>
    </Provider>,
    MOUNT_NODE
  )
}

// This code is excluded from production bundle
if (__DEV__) {
  if (module.hot) {
    // Development render functions
    const renderApp = render
    const renderError = (error) => {
      const RedBox = require('redbox-react').default

      ReactDOM.render(<RedBox error={error} />, MOUNT_NODE)
    }

    // Wrap render in try/catch
    render = () => {
      try {
        renderApp()
      } catch (error) {
        renderError(error)
      }
    }

    // Setup hot module replacement
    /*
    module.hot.accept('./routes/status-page', () => {
      setTimeout(() => {
        ReactDOM.unmountComponentAtNode(MOUNT_NODE)
        render()
      })
    })
    */
  }
}

// ========================================================
// Wait until settings are loaded, then start rendering.
// ========================================================

let counter = 0
const timer = setInterval(() => {
  counter++
  if (typeof __LAMBSTATUS_API_URL__ !== 'undefined') {
    clearInterval(timer)

    settings.apiURL = __LAMBSTATUS_API_URL__
    settings.serviceName = __LAMBSTATUS_SERVICE_NAME__
    settings.statusPageURL = __LAMBSTATUS_STATUS_PAGE_URL__
    settings.userPoolId = __LAMBSTATUS_USER_POOL_ID__
    settings.clientId = __LAMBSTATUS_CLIENT_ID__
    render()
  }
  if (counter >= 6000) {
    // wait 1 minute
    console.error('failed to load settings')
    clearInterval(timer)
  }
}, 10)
