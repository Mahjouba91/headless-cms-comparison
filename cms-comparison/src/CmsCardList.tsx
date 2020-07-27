import * as React from "react";
import Card from "react-bootstrap/Card";
import Alert from "react-bootstrap/Alert";
import CmsService from "./CmsService";
import FilterPanel from "./FilterPanel";

import {
  FiSlash,
  FiCheckCircle,
  FiAward,
  FiSmile,
  FiMeh,
} from "react-icons/fi";
import { FilterResult, AppState } from "./Cms";
import ProgressBar from "react-bootstrap/ProgressBar";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { AiFillSketchSquare } from "react-icons/ai";

export default function CardList() {
  const [appState, setAppState] = React.useState<AppState>();

  React.useEffect(() => {
    console.log("Fetching...");
    CmsService.getCmsData().then((appState) => {
      setAppState(appState);
    });
  }, []);

  const updateCardList = function (appState: AppState) {
    setAppState(appState);
  };

  if (appState) {
    return (
      <div>
        <FilterPanel appState={appState} updateCardList={updateCardList} />
        {appState.filterResults ? (
          <div className="d-flex flex-wrap justify-content-center">
            <Cards appState={appState} />
          </div>
        ) : (
          <span></span>
        )}
      </div>
    );
  } else {
    return <Alert variant="info">Fetching CMS-Data...</Alert>;
  }
}

function Cards(props: { appState: AppState }) {
  const filterResults = props.appState.filterResults;
  const cms = props.appState.cms;

  if (filterResults.filter((result) => result.satisfactory).length > 0) {
    let cards: JSX.Element[] = [];
    filterResults.forEach((result) => {
      cards.push(
        <CmsCard
          key={result.cmsKey}
          name={cms[result.cmsKey].name}
          filterResult={result}
        />
      );
    });
    return <>{cards}</>;
  } else {
    return <NoResultsCard />;
  }
}

function CmsCard(props: {
  key: string;
  name: string;
  filterResult: FilterResult;
}) {
  return (
    <div className={"my-2 mx-2"} key={props.name}>
      <Card
        style={{ width: "18rem" }}
        className={"cmsCard"}
        border={props.filterResult.satisfactory ? "info" : undefined}
        bg={props.filterResult.satisfactory ? undefined : "light"}
      >
        <Card.Body style={{ textAlign: "left" }}>
          <Card.Title>{props.name}</Card.Title>
          <Card.Text>
            <CmsCardText filterResult={props.filterResult} />
          </Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
}

function CmsCardText(props: { filterResult: FilterResult }) {
  let cardListElements: JSX.Element[] = [];

  if (props.filterResult.hasRequiredShare !== -1) {
    if (props.filterResult.hasRequiredShare === 1) {
      cardListElements.push(
        <li>
          <FiCheckCircle /> Fulfills all essential requirements
        </li>
      );
    } else if (props.filterResult.hasRequiredShare > 0) {
      cardListElements.push(
        <li>
          <FiMeh /> Fulfills only{" "}
          {(props.filterResult.hasRequiredShare * 100).toFixed(0)}% of the
          essential requirements
        </li>
      );
    } else {
      cardListElements.push(
        <li>
          <FiSlash /> Fulfils none of the essential requirements
        </li>
      );
    }
  }

  if (props.filterResult.hasNiceToHaveShare !== -1) {
    cardListElements.push(
      <li>
        <OverlayTrigger
        placement="bottom"
        delay={{ show: 100, hide: 200 }}
        overlay={renderNiceToHaveProgressBarTooltip(props.filterResult.cmsKey, props.filterResult.hasNiceToHaveShare)}
      >
        <div className="d-inline-flex w-100">
          <FiAward style={{marginRight: "0.5em"}}/>
          <ProgressBar
            style={{ width: "100%" }}
            animated
            now={props.filterResult.hasNiceToHaveShare * 100}
            variant="info"
          />
        </div>
        </OverlayTrigger>
      </li>
    );
  }

  return (
    <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
      {cardListElements}
    </ul>
  );
}

function renderNiceToHaveProgressBarTooltip(cmsKey: string, share: number) {
  let barText: string;
  if (share === 1) {
    barText = "Has all nice-to-have properties"
  } else if (share > 0) {
    barText = "Has " + (share*100).toFixed(0) + "% of nice-to-have properties"
  } else {
    barText = "Has no nice-to-have properties"
  }
  return <Tooltip id={`Tooltip_ProgressBar_${cmsKey}`}>{barText}</Tooltip>;
}


function NoResultsCard() {
  return (
    <div className={"my-2 mx-2 w-75"}>
      <Card bg="light" border="dark">
        <Card.Body>
          <Card.Title>
            <span role="img" aria-label="Not amused">
              😐
            </span>{" "}
            No CMS matches your requirements...
          </Card.Title>
          <Card.Text>
            Deselect some of the specified requirements and try again!
          </Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
}
