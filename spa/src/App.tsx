import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Switch, Route, Redirect, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import deepcopy from "ts-deepcopy";

import "./css/style.scss";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./App.css";

import CmsList from "./CmsList";
import CmsCardList from "./CmsCardList";
import CmsDetailView from "./CmsDetailView";
import {
  AppState,
  Cms,
  FilterFieldSet,
  ReceivedCmsData,
  ActivePreset,
  SHOW_ALL,
} from "./Cms";
import CmsService from "./CmsService";
import FilterService from "./FilterService";
import Analytics from "./Analytics";
import About from "./About";
import { ErrorBoundary } from "./ErrorBoundary";
import Header from "./Header";
import SmallHeader from "./SmallHeader";
import Navigation from "./Navigation";
import Footer from "./Footer";
import FilterAside from "./FilterAside";
import FilterMenu from "./FilterMenu";

const ScrollToTop = (): null => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

type PropsType = {
  initialAppState?: AppState;
};

const App = ({ initialAppState }: PropsType): JSX.Element => {
  let [appState, setAppState] = React.useState<AppState>();

  React.useEffect(() => {
    if (initialAppState) {
      setAppState(initialAppState);
    } else {
      CmsService.getCmsData().then(
        (cmsData: ReceivedCmsData) => setAppState(constructAppState(cmsData)),
        (err) => {
          throw new Error(`Getting CMS data failed: ${err}`);
        }
      );
    }
  }, [initialAppState]);

  appState = appState || initialAppState;

  const updateFilterFields = (
    updatedFilterFields: FilterFieldSet,
    preset: ActivePreset
  ): void => {
    if (appState) {
      const updatedAppState = deepcopy<AppState>(appState);
      updatedAppState.filterResults = FilterService.filterCms(
        updatedFilterFields,
        appState.cms
      );
      const filterFields = updatedAppState.filterFields;
      filterFields.current = updatedFilterFields;
      filterFields.activePreset = preset;
      setAppState(updatedAppState);
    }
  };

  const toggleAside = (): void => {
    if (appState) {
      setAppState({ ...appState, showAside: !appState.showAside });
    }

    if (!appState?.showAside) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  };

  const setCookiesAccepted = (cookiesAccepted: boolean): void => {
    if (appState) {
      setAppState({ ...appState, cookiesAccepted });
    }
  };

  const githubUrl = "https://github.com/gentics/headless-cms-comparison";
  const genticsUrl = "https://www.gentics.com/genticscms/index.en.html";

  const content = appState ? (
    <>
      <Switch>
        <Route exact path="/">
          <Redirect to="/card" />
        </Route>

        <Route exact path="/card">
          <FilterAside
            filterFields={appState.filterFields}
            updateFilterFields={updateFilterFields}
            showAside={appState.showAside}
            toggleAside={toggleAside}
            cookiesAccepted={appState.cookiesAccepted}
          />
          <Header />
          <FilterMenu
            filterFields={appState.filterFields}
            updateFilterFields={updateFilterFields}
            toggleAside={toggleAside}
            cookiesAccepted={appState.cookiesAccepted}
          />
          <main>
            <CmsCardList
              filterResults={appState.filterResults}
              cms={appState.cms}
            />
          </main>
        </Route>

        <Route exact path="/list">
          <SmallHeader title="List view" />

          <main>
            <CmsList
              filterFields={appState.filterFields.current}
              cmsData={appState.cms}
            />
          </main>
        </Route>

        <Route path="/detail/:cmsKey">
          <SmallHeader title={appState.cms} />
          <main>
            <CmsDetailView
              filterFields={appState.filterFields.current}
              filterResults={appState.filterResults}
              cmsData={appState.cms}
            />
          </main>
        </Route>

        <Route exact path="/about">
          <SmallHeader title="About us" />
          <main>
            <About githubUrl={githubUrl} genticsUrl={genticsUrl} />
          </main>
        </Route>
      </Switch>
      <Analytics
        accepted={appState.cookiesAccepted}
        setAccepted={setCookiesAccepted}
      />
    </>
  ) : null;

  return (
    <div className="App">
      <Helmet
        defaultTitle="Headless CMS Comparison"
        titleTemplate="Headless CMS Comparison - %s"
      />
      <ScrollToTop />
      <Navigation />
      <ErrorBoundary>{content}</ErrorBoundary>
      <Footer genticsUrl={genticsUrl} />
    </div>
  );
};

export const constructAppState = (cmsData: {
  fields?: { [x: string]: any };
  cms: { [x: string]: Cms };
}): AppState => {
  const filterFields: FilterFieldSet = { basic: {}, special: {} };
  filterFields.basic = FilterService.initializeBasicFields(
    cmsData.fields?.properties
  );
  filterFields.special = FilterService.initializeSpecialFields();

  const untouchedFilterFields = deepcopy<FilterFieldSet>(filterFields);

  const appState: AppState = {
    cms: cmsData.cms,
    filterFields: {
      current: filterFields,
      untouched: untouchedFilterFields,
      activePreset: SHOW_ALL,
    },
    filterResults: FilterService.getUnfilteredCms(cmsData.cms),
    showAside: false,
    cookiesAccepted: false,
  };
  return appState;
};

export default App;
