import type { GuardDataJSON, HereticDataJSON, OccultistDataJSON, SoldierDataJSON } from "../../../types";

import soldierDataJSON from "./soldier-data.json";
import occultistDataJSON from "./occultist-data.json";
import guardDataJSON from "./guard-data.json";

import hereticDataJSON from "./heretic-data.json";

const soldierData: SoldierDataJSON = soldierDataJSON;
const occultistData: OccultistDataJSON = occultistDataJSON;
const guardData: GuardDataJSON = guardDataJSON;

const hereticData: HereticDataJSON = hereticDataJSON;

export { soldierData, occultistData, guardData, hereticData };